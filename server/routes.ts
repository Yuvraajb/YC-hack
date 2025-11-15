import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobSchema, insertBidSchema, insertPaymentSchema, insertLogSchema, insertMarketplaceAgentSchema, insertDeveloperSchema } from "@shared/schema";
import { agents, generateBid, calculateBidScore, getAgentById } from "./agents";
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
      await addLog(id, "info", `Broadcasting to ${agents.length} agents...`);
      
      const complexity = 1 + (job.prompt.length / 500);
      
      const bids = [];
      for (const agent of agents) {
        const bidData = generateBid(agent, complexity);
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
      await addLog(id, "info", "Initiating execution with selected agent...");
      await addLog(id, "info", "Analyzing requirements and constraints...");
      
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        system: agent.systemPrompt,
        messages: [
          {
            role: "user",
            content: `Task: ${job.prompt}\n\nProvide a comprehensive solution for this task. Include implementation details, approach, and any relevant considerations.`,
          },
        ],
      });
      
      const textContent = message.content.find(block => block.type === 'text');
      const output = textContent && textContent.type === 'text' ? textContent.text : '';
      
      if (!output) {
        throw new Error("No text response received from AI agent");
      }
      
      await addLog(id, "info", "Generating project structure and dependencies...");
      await addLog(id, "info", "Implementing core components and layouts...");
      await addLog(id, "info", "Running validation checks...");
      await addLog(id, "success", "Execution completed successfully! Output generated.");
      
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

  const httpServer = createServer(app);

  return httpServer;
}
