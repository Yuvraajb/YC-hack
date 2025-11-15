import type {
  Agent,
  InsertAgent,
  Job,
  InsertJob,
  Bid,
  InsertBid,
  Transaction,
  InsertTransaction,
  JobStatus,
  AgentStatus,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Agent operations
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentBalance(id: string, newBalance: string): Promise<void>;
  updateAgentStatus(id: string, status: AgentStatus): Promise<void>;
  incrementAgentStats(id: string, earned: string): Promise<void>;

  // Job operations
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByStatus(status: JobStatus): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJobStatus(id: string, status: JobStatus): Promise<void>;
  acceptBid(jobId: string, bid: { agentId: string; price: number; acceptedAt: string }): Promise<void>;
  setJobEscrow(jobId: string, escrowId: string): Promise<void>;
  submitJobWork(jobId: string, submission: { results: any; submittedAt: string }): Promise<void>;
  completeJob(jobId: string): Promise<void>;

  // Bid operations
  getBid(id: string): Promise<Bid | undefined>;
  getBidsByJob(jobId: string): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;

  // Transaction operations
  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Escrow operations
  getEscrowBalance(): Promise<string>;
}

export class MemStorage implements IStorage {
  private agents: Map<string, Agent>;
  private jobs: Map<string, Job>;
  private bids: Map<string, Bid>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.agents = new Map();
    this.jobs = new Map();
    this.bids = new Map();
    this.transactions = new Map();
  }

  // Agent operations
  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = insertAgent.name.toLowerCase().replace(/\s+/g, "-");
    const agent: Agent = {
      ...insertAgent,
      id,
      walletBalance: insertAgent.walletBalance || "0.00",
      reputationScore: "0.00",
      jobsCompleted: "0",
      totalEarned: "0.00",
      status: insertAgent.status || "available",
      createdAt: new Date(),
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgentBalance(id: string, newBalance: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      agent.walletBalance = newBalance;
      this.agents.set(id, agent);
    }
  }

  async updateAgentStatus(id: string, status: AgentStatus): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      this.agents.set(id, agent);
    }
  }

  async incrementAgentStats(id: string, earned: string): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      const currentJobs = parseInt(agent.jobsCompleted);
      const currentEarned = parseFloat(agent.totalEarned);
      const earnedAmount = parseFloat(earned);

      agent.jobsCompleted = (currentJobs + 1).toString();
      agent.totalEarned = (currentEarned + earnedAmount).toFixed(2);
      this.agents.set(id, agent);
    }
  }

  // Job operations
  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.postedAt.getTime() - a.postedAt.getTime()
    );
  }

  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = `job-${randomUUID().slice(0, 8)}`;
    const job: Job = {
      ...insertJob,
      id,
      status: "accepting_bids",
      acceptedBid: null,
      escrowId: null,
      submission: null,
      postedAt: new Date(),
      completedAt: null,
    };
    this.jobs.set(id, job);
    return job;
  }

  async updateJobStatus(id: string, status: JobStatus): Promise<void> {
    const job = this.jobs.get(id);
    if (job) {
      job.status = status;
      this.jobs.set(id, job);
    }
  }

  async acceptBid(
    jobId: string,
    bid: { agentId: string; price: number; acceptedAt: string }
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.acceptedBid = bid;
      job.status = "in_progress";
      this.jobs.set(jobId, job);
    }
  }

  async setJobEscrow(jobId: string, escrowId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.escrowId = escrowId;
      this.jobs.set(jobId, job);
    }
  }

  async submitJobWork(
    jobId: string,
    submission: { results: any; submittedAt: string }
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.submission = submission;
      this.jobs.set(jobId, job);
    }
  }

  async completeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "completed";
      job.completedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  // Bid operations
  async getBid(id: string): Promise<Bid | undefined> {
    return this.bids.get(id);
  }

  async getBidsByJob(jobId: string): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter((bid) => bid.jobId === jobId);
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = `bid-${randomUUID().slice(0, 8)}`;
    const bid: Bid = {
      ...insertBid,
      id,
      submittedAt: new Date(),
    };
    this.bids.set(id, bid);
    return bid;
  }

  // Transaction operations
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = `txn-${randomUUID().slice(0, 8)}`;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      status: "completed",
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getEscrowBalance(): Promise<string> {
    const escrowTransactions = Array.from(this.transactions.values()).filter(
      (t) => t.type === "escrow_create"
    );
    const total = escrowTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );
    return total.toFixed(2);
  }
}

export const storage = new MemStorage();
