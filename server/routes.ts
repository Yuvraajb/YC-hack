import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { locusPayment } from "./locus-payment";
import { matchAgentToRequest, executeAgentTask } from "./agent-matcher";
import { z } from "zod";

const PLATFORM_FEE_PERCENT = 0.10; // 10% platform fee

export async function registerRoutes(app: Express): Promise<Server> {
  // Register a new agent
  app.post("/api/agents", async (req, res) => {
    try {
      const { name, description, capabilities, creatorWallet, pricePerCall, apiEndpoint, apiKey } = req.body;

      if (!name || !description || !capabilities || !creatorWallet || !pricePerCall) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const agent = await storage.createAgent({
        name,
        description,
        capabilities: Array.isArray(capabilities) ? capabilities : [capabilities],
        creatorWallet,
        pricePerCall: parseFloat(pricePerCall).toFixed(2),
        apiEndpoint: apiEndpoint || null,
        apiKey: apiKey || null,
        status: "available",
        isActive: "true",
      });

      res.json(agent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit a task
  app.post("/api/tasks", async (req, res) => {
    try {
      const { request, userWallet } = req.body;

      if (!request || !userWallet) {
        return res.status(400).json({ error: "Request and userWallet are required" });
      }

      // Find the best agent for this task
      const availableAgents = await storage.getActiveAgents();
      
      if (availableAgents.length === 0) {
        return res.status(503).json({ error: "No agents available at the moment" });
      }

      const match = await matchAgentToRequest(request, availableAgents);

      if (match.confidence < 0.5) {
        return res.status(400).json({ 
          error: "No suitable agent found",
          reasoning: match.reasoning,
        });
      }

      const agent = availableAgents.find(a => a.id === match.agentId);
      if (!agent) {
        return res.status(500).json({ error: "Matched agent not found" });
      }

      // Calculate pricing
      const agentPrice = parseFloat(agent.pricePerCall);
      const platformFee = agentPrice * PLATFORM_FEE_PERCENT;
      const totalCost = agentPrice + platformFee;

      // Convert to LOCUS
      const locusAmount = await locusPayment.convertUsdToLocus(totalCost);

      // Create job
      const job = await storage.createJob({
        userRequest: request,
        userWallet,
        assignedAgentId: null,
        status: "pending",
        paymentStatus: "pending",
      });

      // Assign agent
      await storage.assignAgent(
        job.id,
        agent.id,
        agentPrice.toFixed(2),
        platformFee.toFixed(2),
        totalCost.toFixed(2),
        match.reasoning
      );

      // Execute task asynchronously
      executeAgentTask(agent, request)
        .then(async (result) => {
          await storage.submitJobResult(job.id, result);
        })
        .catch((error) => {
          console.error(`[TaskExecution] Failed:`, error);
          storage.updateJobStatus(job.id, "failed");
        });

      res.json({
        success: true,
        jobId: job.id,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
        },
        matchReasoning: match.reasoning,
        pricing: {
          agentPrice: agentPrice.toFixed(2),
          platformFee: platformFee.toFixed(2),
          totalCost: totalCost.toFixed(2),
          locusAmount,
        },
        message: "Task assigned. Agent is working on your request. You can pay after results are delivered.",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all tasks/jobs
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllJobs();
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getJob(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm payment for a task
  app.post("/api/tasks/:id/confirm-payment", async (req, res) => {
    try {
      const { txHash } = req.body;
      const job = await storage.getJob(req.params.id);

      if (!job) {
        return res.status(404).json({ error: "Task not found" });
      }

      if (job.paymentStatus !== "pending") {
        return res.status(400).json({ error: "Payment not required or already paid" });
      }

      if (!job.result) {
        return res.status(400).json({ error: "Task not completed yet. Please wait for results before paying." });
      }

      // Verify the transaction on blockchain
      const paymentResult = await locusPayment.receivePayment(txHash);

      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.error });
      }

      // Update payment status
      await storage.updateJobPayment(job.id, {
        paymentStatus: "paid",
        paymentTxHash: txHash,
        locusAmount: paymentResult.amount,
      });

      // Complete the job
      await storage.completeJob(job.id);

      // Get agent info for payment distribution
      const agent = await storage.getAgent(job.assignedAgentId!);
      if (!agent) {
        return res.status(500).json({ error: "Agent not found" });
      }

      // Record transactions
      const agentPrice = parseFloat(job.agentPrice!);
      const platformFee = parseFloat(job.platformFee!);

      // Platform fee transaction
      await storage.createTransaction({
        type: "platform_fee",
        fromWallet: job.userWallet,
        toWallet: process.env.LOCUS_OWNER_KEY!,
        amount: platformFee.toFixed(2),
        jobId: job.id,
        status: "completed",
      });

      // Creator earning transaction
      await storage.createTransaction({
        type: "creator_earning",
        fromWallet: job.userWallet,
        toWallet: agent.creatorWallet,
        amount: agentPrice.toFixed(2),
        jobId: job.id,
        status: "completed",
      });

      // Update agent stats
      await storage.incrementAgentStats(agent.id, agentPrice.toFixed(2));

      res.json({
        success: true,
        message: "Payment confirmed. Task completed!",
        distribution: {
          agentCreator: { wallet: agent.creatorWallet, amount: agentPrice.toFixed(2) },
          platform: { wallet: process.env.LOCUS_OWNER_KEY, amount: platformFee.toFixed(2) },
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get payment status
  app.get("/api/payment/status", async (req, res) => {
    try {
      const balance = await locusPayment.getOwnerBalance();
      const usdRate = await locusPayment.getUsdToLocusRate();
      
      res.json({
        ownerBalance: balance,
        locusUsdRate: usdRate,
        ownerAddress: process.env.LOCUS_OWNER_KEY,
        platformFeePercent: PLATFORM_FEE_PERCENT * 100,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // System status
  app.get("/api/status", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      const tasks = await storage.getAllJobs();

      res.json({
        status: "online",
        agents: {
          total: agents.length,
          active: agents.filter((a) => a.isActive === "true").length,
          available: agents.filter((a) => a.status === "available").length,
        },
        tasks: {
          total: tasks.length,
          pending: tasks.filter((j) => j.status === "pending").length,
          in_progress: tasks.filter((j) => j.status === "in_progress").length,
          completed: tasks.filter((j) => j.status === "completed").length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
