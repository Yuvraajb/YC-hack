import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ledger } from "./ledger";
import { breakdownResearchRequest, evaluateBids, verifyWork } from "./anthropic";
import { locusPayment } from "./locus-payment";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all agents
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const jobs = status
        ? await storage.getJobsByStatus(status as any)
        : await storage.getAllJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create a job
  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = req.body;
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get job details
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get bids for a job
  app.get("/api/jobs/:id/bids", async (req, res) => {
    try {
      const bids = await storage.getBidsByJob(req.params.id);
      res.json(bids);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit a bid
  app.post("/api/jobs/:id/bids", async (req, res) => {
    try {
      const bidData = {
        ...req.body,
        jobId: req.params.id,
      };
      const bid = await storage.createBid(bidData);
      res.json(bid);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Accept a bid (triggers escrow)
  app.post("/api/jobs/:id/accept", async (req, res) => {
    try {
      const { bidId } = req.body;
      const job = await storage.getJob(req.params.id);
      const bid = await storage.getBid(bidId);

      if (!job || !bid) {
        return res.status(404).json({ error: "Job or bid not found" });
      }

      // Create escrow
      const escrowId = await ledger.createEscrow(
        job.postedBy,
        bid.agentId,
        parseFloat(bid.price),
        job.id
      );

      // Update job
      await storage.acceptBid(job.id, {
        agentId: bid.agentId,
        price: parseFloat(bid.price),
        acceptedAt: new Date().toISOString(),
      });
      await storage.setJobEscrow(job.id, escrowId);

      // Update agent status
      await storage.updateAgentStatus(bid.agentId, "busy");

      res.json({ success: true, escrowId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit work for a job
  app.post("/api/jobs/:id/submit", async (req, res) => {
    try {
      const { agentId, results } = req.body;
      const job = await storage.getJob(req.params.id);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.acceptedBid?.agentId !== agentId) {
        return res.status(403).json({ error: "Not assigned to this agent" });
      }

      await storage.submitJobWork(job.id, {
        results,
        submittedAt: new Date().toISOString(),
      });

      // Update agent status back to available
      await storage.updateAgentStatus(agentId, "available");

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify and release payment
  app.post("/api/jobs/:id/verify", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);

      if (!job || !job.submission || !job.acceptedBid || !job.escrowId) {
        return res.status(400).json({ error: "Job not ready for verification" });
      }

      // Check if user payment is required and not paid yet
      if (job.paymentStatus === "pending") {
        return res.status(402).json({ 
          error: "Payment required before releasing funds to agent",
          paymentRequired: job.paymentRequired,
          locusAmount: job.locusAmount,
        });
      }

      // Use Claude AI to verify work
      const verification = await verifyWork(
        job.description,
        job.requirements,
        job.submission.results
      );

      if (verification.approved) {
        // Release escrow payment
        await ledger.releaseEscrow(
          job.escrowId,
          job.acceptedBid.agentId,
          job.acceptedBid.price,
          job.id
        );

        // Mark job as completed
        await storage.completeJob(job.id);

        res.json({ success: true, verification });
      } else {
        // Cancel escrow, return funds
        await ledger.cancelEscrow(
          job.escrowId,
          job.postedBy,
          job.acceptedBid.price,
          job.id
        );

        // Mark job as failed
        await storage.updateJobStatus(job.id, "failed");

        res.json({ success: false, verification });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Confirm user payment
  app.post("/api/jobs/:id/confirm-payment", async (req, res) => {
    try {
      const { txHash } = req.body;
      const job = await storage.getJob(req.params.id);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      if (job.paymentStatus !== "pending") {
        return res.status(400).json({ error: "Payment not required or already paid" });
      }

      // Verify the transaction on blockchain
      const paymentResult = await locusPayment.receivePayment(txHash);

      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.error });
      }

      // Update job payment status
      await storage.updateJobPayment(job.id, {
        paymentStatus: "paid",
        paymentTxHash: txHash,
        locusAmount: paymentResult.amount,
      });

      res.json({
        success: true,
        message: "Payment confirmed",
        amount: paymentResult.amount,
        from: paymentResult.from,
      });
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

  // Research request endpoint (initiates the full workflow)
  app.post("/api/research", async (req, res) => {
    try {
      const { request, userWallet } = req.body;

      if (!request) {
        return res.status(400).json({ error: "Research request required" });
      }

      // Use Claude AI to break down request into tasks
      const breakdown = await breakdownResearchRequest(request);

      // Calculate total cost
      const totalCost = breakdown.tasks.reduce((sum, task) => sum + task.budgetMax, 0);

      // Create jobs for each task
      const jobs = [];
      for (const task of breakdown.tasks) {
        const job = await storage.createJob({
          type: task.type,
          description: task.description,
          requirements: task.requirements,
          budgetMax: task.budgetMax.toFixed(2),
          postedBy: "coordinator-agent",
          status: "accepting_bids",
          userWallet: userWallet || null,
          paymentRequired: userWallet ? task.budgetMax.toFixed(2) : null,
          paymentStatus: userWallet ? "pending" : "not_required",
        });
        jobs.push(job);
      }

      // If user wallet provided, calculate LOCUS amount
      let paymentInfo = null;
      if (userWallet) {
        const locusAmount = await locusPayment.convertUsdToLocus(totalCost);
        paymentInfo = {
          totalUsd: totalCost.toFixed(2),
          locusAmount,
          userWallet,
        };
      }

      res.json({
        success: true,
        breakdown,
        jobs,
        paymentInfo,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // System status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      const jobs = await storage.getAllJobs();
      const escrowBalance = await ledger.getEscrowBalance();

      res.json({
        status: "online",
        agents: {
          total: agents.length,
          available: agents.filter((a) => a.status === "available").length,
          busy: agents.filter((a) => a.status === "busy").length,
        },
        jobs: {
          total: jobs.length,
          accepting_bids: jobs.filter((j) => j.status === "accepting_bids").length,
          in_progress: jobs.filter((j) => j.status === "in_progress").length,
          completed: jobs.filter((j) => j.status === "completed").length,
        },
        escrow: {
          balance: escrowBalance,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
