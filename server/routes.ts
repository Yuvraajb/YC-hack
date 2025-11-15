import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertBidSchema, insertPaymentSchema, insertLogSchema, insertMarketplaceAgentSchema, insertDeveloperSchema } from "@shared/schema";
import { agents, generateBid, calculateBidScore, getAgentById, type Agent } from "./agents";
import { executeAgentTask } from "./agent-sdk";
import Anthropic from "@anthropic-ai/sdk";
import { randomUUID } from "crypto";

// Using Replit AI Integrations for Anthropic access
if (!process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || !process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL) {
  console.error("WARNING: Missing Anthropic AI Integration environment variables. Job execution will fail.");
  console.error("Please ensure the Anthropic integration is properly installed.");
}

const anthropic = new Anthropic({
  // Note: AI_INTEGRATIONS_ANTHROPIC_API_KEY is a dummy value required by the SDK
  // Actual authentication happens via AI_INTEGRATIONS_ANTHROPIC_BASE_URL
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || "dummy-key",
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });
}

async function addLog(jobId: string, level: string, message: string) {
  await storage.createLog({
    jobId,
    timestamp: formatTimestamp(),
    level,
    message,
  });
}

function analyzePromptForTools(prompt: string): string[] {
  const requiredTools: Set<string> = new Set();
  const lowerPrompt = prompt.toLowerCase();
  
  // Email sending - only trigger on explicit send intent
  if (lowerPrompt.match(/\b(send|compose|write)\b.*(email|mail|message)|email.*(send|compose|write)/)) {
    requiredTools.add("send_gmail");
  }
  
  // Email reading - trigger on read/check/summary/analyze intent
  if (lowerPrompt.match(/\b(read|check|show|get|fetch|view|see|summarize|analyze)\b.*(email|inbox|mail)|email.*(read|check|summary|list|analyze)|(email|inbox|mail).*(summary|analyze)/)) {
    requiredTools.add("read_gmail");
  }
  
  // Calendar-related keywords
  if (lowerPrompt.match(/\b(calendar|event|schedule|meeting|appointment|upcoming)\b/)) {
    requiredTools.add("read_calendar");
  }
  
  // Image generation keywords
  if (lowerPrompt.match(/\b(generate|create|make|draw)\b.*(image|picture|photo|visual|illustration)/)) {
    requiredTools.add("generate_image");
  }
  
  // Web search keywords - only explicit search intent, not generic recency terms
  if (lowerPrompt.match(/\b(search|research|google)\b/) || 
      lowerPrompt.includes("look up") || 
      lowerPrompt.includes("what is") || 
      lowerPrompt.includes("who is") ||
      lowerPrompt.match(/\bfind\b.*(information|about|news|price)/)) {
    requiredTools.add("WebSearch");
  }
  
  // AI model orchestration keywords (often used for analysis/summarization)
  // Note: We only check that agents have at least ONE OpenRouter tool, not both
  if (lowerPrompt.match(/\b(analyze|summarize|summary|compare|evaluate|explain)\b/)) {
    requiredTools.add("call_openrouter_model");
  }
  
  return Array.from(requiredTools);
}

function agentHasRequiredTools(agentTools: string[], required: string[]): boolean {
  if (required.length === 0) return true; // No specific tools required, all agents can bid
  
  // Special handling: if call_openrouter_model is required, accept agents with EITHER
  // call_openrouter_model OR call_openrouter_chat (they're interchangeable for orchestration)
  const hasOpenRouterRequirement = required.includes("call_openrouter_model");
  const hasOpenRouterTool = agentTools.includes("call_openrouter_model") || 
                             agentTools.includes("call_openrouter_chat");
  
  return required.every(tool => {
    if (tool === "call_openrouter_model" && hasOpenRouterTool) {
      return true; // Agent has at least one OpenRouter tool
    }
    return agentTools.includes(tool);
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/jobs", async (req, res) => {
    try {
      const data = insertJobSchema.parse(req.body);
      
      const job = await storage.createJob({
        ...data,
        status: "pending",
      });
      
      await addLog(job.id, "info", `Job received: ${job.prompt}`);
      
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:id/bids", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      await storage.updateJob(id, { status: "bidding" });
      
      // Analyze prompt to determine required tools
      const requiredTools = analyzePromptForTools(job.prompt);
      
      // Get published marketplace agents
      const marketplaceAgents = await storage.getPublishedMarketplaceAgents();
      
      // Combine preset agents and marketplace agents
      const allAgents = [
        ...agents.map(a => ({ type: 'preset', agent: a })),
        ...marketplaceAgents.map(ma => ({ type: 'marketplace', agent: ma }))
      ];
      
      // Filter agents based on required tools
      const eligibleAgents = allAgents.filter(({ type, agent }) => {
        const tools = type === 'preset' 
          ? (agent as Agent).enabledTools 
          : (agent as typeof marketplaceAgents[0]).toolsEnabled || [];
        return agentHasRequiredTools(tools, requiredTools);
      });
      
      if (eligibleAgents.length === 0) {
        await addLog(id, "warning", "No agents available with the required capabilities for this task.");
        return res.json([]);
      }
      
      await addLog(id, "info", `Found ${eligibleAgents.length} agents with required capabilities${requiredTools.length > 0 ? ` (${requiredTools.join(', ')})` : ''}...`);
      
      const complexity = 1 + (job.prompt.length / 500);
      
      const bids = [];
      for (const { type, agent } of eligibleAgents) {
        let bidData;
        
        if (type === 'preset') {
          bidData = generateBid(agent as Agent, complexity);
        } else {
          // Generate bid for marketplace agent
          const ma = agent as typeof marketplaceAgents[0];
          const duration = Math.ceil(5 * complexity); // Default 5 min base
          const price = parseFloat((ma.basePrice * complexity).toFixed(2));
          const confidence = Math.floor(Math.random() * 11) + 85; // 85-95%
          
          bidData = {
            agentId: ma.id,
            agentName: ma.name,
            eta: duration === 1 ? "1 min" : `${duration} min`,
            price,
            confidence,
            plan: ma.description.substring(0, 150) + '...',
          };
        }
        
        const bid = await storage.createBid({
          jobId: id,
          ...bidData,
        });
        
        await addLog(
          id,
          "success",
          `Received bid from ${bidData.agentName}: $${bidData.price} (ETA: ${bidData.eta}, Confidence: ${bidData.confidence}%)`
        );
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        bids.push(bid);
      }
      
      res.json(bids);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:id/select", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      const bids = await storage.getBidsByJobId(id);
      
      if (bids.length === 0) {
        return res.status(400).json({ error: "No bids available" });
      }
      
      await addLog(id, "info", "Evaluating bids using weighted scoring algorithm...");
      
      let bestBid = bids[0];
      let bestScore = calculateBidScore(bids[0]);
      
      for (const bid of bids) {
        const score = calculateBidScore(bid);
        if (score > bestScore) {
          bestScore = score;
          bestBid = bid;
        }
      }
      
      await storage.updateJob(id, { 
        status: "selected",
        selectedAgentId: bestBid.agentId 
      });
      
      await addLog(
        id,
        "success",
        `Selected: ${bestBid.agentName} (final score: ${bestScore}/10)`
      );
      
      res.json({ selectedBid: bestBid, score: bestScore });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs/:id/execute", async (req, res) => {
    const { id } = req.params;
    try {
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      if (!job.selectedAgentId) {
        return res.status(400).json({ error: "No agent selected" });
      }
      
      const agent = getAgentById(job.selectedAgentId);
      if (!agent) {
        return res.status(400).json({ error: "Selected agent not found" });
      }
      
      await storage.updateJob(id, { status: "executing" });
      
      // Execute with Claude Agent SDK (supports web browsing and image generation)
      const result = await executeAgentTask({
        storage,
        jobId: id,
        prompt: job.prompt,
        systemPrompt: agent.systemPrompt,
        enabledTools: agent.enabledTools,
        maxSteps: 50
      });
      
      if (!result.success) {
        throw new Error(result.error || "Agent execution failed");
      }
      
      const output = result.result || "Task completed successfully";
      
      await storage.updateJob(id, { 
        status: "completed",
        output 
      });
      
      res.json({ output });
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      await addLog(id, "error", `Execution failed: ${errorMessage}`);
      await storage.updateJob(id, { status: "failed" });
      
      // Provide more context for common errors
      if (errorMessage.includes("Missing apiKey") || errorMessage.includes("401")) {
        res.status(500).json({ 
          error: "AI Integration not properly configured. Please check Anthropic integration setup.",
          details: errorMessage 
        });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  app.post("/api/jobs/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      const bids = await storage.getBidsByJobId(id);
      const selectedBid = bids.find(b => b.agentId === job.selectedAgentId);
      
      if (!selectedBid) {
        return res.status(400).json({ error: "Selected bid not found" });
      }
      
      await addLog(id, "info", "Processing payment transaction...");
      
      const txId = `tx_${randomUUID().replace(/-/g, '').substring(0, 16)}`;
      
      const payment = await storage.createPayment({
        jobId: id,
        txId,
        amount: selectedBid.price,
        status: "success",
      });
      
      await storage.updateJob(id, { 
        status: "paid",
        paymentId: payment.id 
      });
      
      await addLog(id, "success", `Payment successful: ${txId}`);
      
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      const bids = await storage.getBidsByJobId(id);
      const logs = await storage.getLogsByJobId(id);
      const payment = await storage.getPaymentByJobId(id);
      
      res.json({ job, bids, logs, payment });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs/:id/logs", async (req, res) => {
    try {
      const { id } = req.params;
      const logs = await storage.getLogsByJobId(id);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Marketplace Agent Routes
  app.get("/api/marketplace/agents", async (req, res) => {
    try {
      const agents = await storage.getPublishedMarketplaceAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/marketplace/agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const agent = await storage.getMarketplaceAgent(id);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      const reviews = await storage.getReviewsByAgent(id);
      res.json({ agent, reviews });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Developer Routes - Agent Creation & Management
  app.post("/api/dev/agents", async (req, res) => {
    try {
      const data = insertMarketplaceAgentSchema.parse(req.body);
      const agent = await storage.createMarketplaceAgent({
        ...data,
        status: "draft",
      });
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/dev/agents", async (req, res) => {
    try {
      const { developerId } = req.query;
      const agents = developerId 
        ? await storage.getAgentsByDeveloper(developerId as string)
        : await storage.getAllMarketplaceAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/dev/agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const agent = await storage.updateMarketplaceAgent(id, updates);
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      res.json(agent);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/dev/agents/:id/publish", async (req, res) => {
    try {
      const { id } = req.params;
      const agent = await storage.updateMarketplaceAgent(id, { status: "published" });
      
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/dev/agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMarketplaceAgent(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Agent not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Developer profile routes
  app.post("/api/dev/profile", async (req, res) => {
    try {
      const data = insertDeveloperSchema.parse(req.body);
      const developer = await storage.createDeveloper(data);
      res.json(developer);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Connector routes
  app.get("/api/connectors/status", async (req, res) => {
    try {
      const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
      const xReplitToken = process.env.REPL_IDENTITY 
        ? 'repl ' + process.env.REPL_IDENTITY 
        : process.env.WEB_REPL_RENEWAL 
        ? 'depl ' + process.env.WEB_REPL_RENEWAL 
        : null;

      if (!xReplitToken || !hostname) {
        return res.json({});
      }

      // Helper function to check connector status
      const checkConnector = async (connectorName: string): Promise<boolean> => {
        try {
          const response = await fetch(
            `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=${connectorName}`,
            {
              headers: {
                'Accept': 'application/json',
                'X_REPLIT_TOKEN': xReplitToken
              }
            }
          );
          const data = await response.json();
          const connection = data.items?.[0];
          return !!(connection?.settings?.access_token || connection?.settings?.oauth?.credentials?.access_token);
        } catch (error) {
          console.error(`Error checking ${connectorName} status:`, error);
          return false;
        }
      };

      // Map frontend connector IDs to Replit connector slugs
      const connectorMapping: Record<string, string> = {
        'google-mail': 'google-mail',
        'google-calendar': 'google-calendar',
        'google-sheets': 'google-sheet',  // Note: Replit uses singular "sheet"
        'github': 'github',
        'notion': 'notion',
        'hubspot': 'hubspot',
        'jira': 'jira',
        'linear': 'linear',
        'twilio': 'twilio',
        'stripe': 'stripe',
        'sendgrid': 'sendgrid',
        'resend': 'resend',
        'salesforce': 'salesforce',
        'zendesk': 'zendesk',
        'clickup': 'clickup',
        'onedrive': 'onedrive',
        'outlook': 'outlook',
        'sharepoint': 'sharepoint',
        'youtube': 'youtube'
      };

      const statuses = await Promise.all(
        Object.entries(connectorMapping).map(async ([frontendId, replitSlug]) => ({
          frontendId,
          connected: await checkConnector(replitSlug)
        }))
      );

      const statusMap: Record<string, boolean> = {};
      statuses.forEach(({ frontendId, connected }) => {
        statusMap[frontendId] = connected;
      });

      res.json(statusMap);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/connectors/:id/authorize", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Map connector ID to Replit connector name
      const connectorMap: Record<string, string> = {
        'google-mail': 'google-mail',
        'google-calendar': 'google-calendar'
      };

      const connectorName = connectorMap[id];
      if (!connectorName) {
        return res.status(400).json({ error: 'Unknown connector' });
      }

      // For Replit connectors, we need to direct users to the Replit Connectors UI
      // Since we can't programmatically trigger OAuth, provide instructions
      res.json({
        authUrl: null,
        message: 'Please authorize this connector through the Replit Connectors panel',
        instructions: [
          '1. Open the Connectors panel in your Replit workspace',
          `2. Find "${id.replace('-', ' ')}" and click Connect`,
          '3. Sign in with your Google account',
          '4. Return to this page and refresh'
        ]
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
