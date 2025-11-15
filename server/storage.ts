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
import { agents, jobs, bids, transactions } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentBalance(id: string, newBalance: string): Promise<void>;
  updateAgentStatus(id: string, status: AgentStatus): Promise<void>;
  incrementAgentStats(id: string, earned: string): Promise<void>;

  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByStatus(status: JobStatus): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJobStatus(id: string, status: JobStatus): Promise<void>;
  acceptBid(jobId: string, bid: { agentId: string; price: number; acceptedAt: string }): Promise<void>;
  setJobEscrow(jobId: string, escrowId: string): Promise<void>;
  submitJobWork(jobId: string, submission: { results: any; submittedAt: string }): Promise<void>;
  completeJob(jobId: string): Promise<void>;

  getBid(id: string): Promise<Bid | undefined>;
  getBidsByJob(jobId: string): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;

  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  getEscrowBalance(): Promise<string>;
}

export class DbStorage implements IStorage {
  async getAgent(id: string): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.id, id));
    return result[0];
  }

  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = insertAgent.name.toLowerCase().replace(/\s+/g, "-");
    const result = await db
      .insert(agents)
      .values({
        ...insertAgent,
        id,
        walletBalance: insertAgent.walletBalance || "0.00",
        reputationScore: "0.00",
        jobsCompleted: "0",
        totalEarned: "0.00",
        status: insertAgent.status || "available",
      })
      .returning();
    return result[0];
  }

  async updateAgentBalance(id: string, newBalance: string): Promise<void> {
    await db.update(agents).set({ walletBalance: newBalance }).where(eq(agents.id, id));
  }

  async updateAgentStatus(id: string, status: AgentStatus): Promise<void> {
    await db.update(agents).set({ status }).where(eq(agents.id, id));
  }

  async incrementAgentStats(id: string, earned: string): Promise<void> {
    const agent = await this.getAgent(id);
    if (agent) {
      const currentJobs = parseInt(agent.jobsCompleted);
      const currentEarned = parseFloat(agent.totalEarned);
      const earnedAmount = parseFloat(earned);

      await db
        .update(agents)
        .set({
          jobsCompleted: (currentJobs + 1).toString(),
          totalEarned: (currentEarned + earnedAmount).toFixed(2),
        })
        .where(eq(agents.id, id));
    }
  }

  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.postedAt));
  }

  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.status, status));
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = `job-${randomUUID().slice(0, 8)}`;
    const result = await db
      .insert(jobs)
      .values({
        ...insertJob,
        id,
        status: "accepting_bids",
        acceptedBid: null,
        escrowId: null,
        submission: null,
      })
      .returning();
    return result[0];
  }

  async updateJobStatus(id: string, status: JobStatus): Promise<void> {
    await db.update(jobs).set({ status }).where(eq(jobs.id, id));
  }

  async acceptBid(
    jobId: string,
    bid: { agentId: string; price: number; acceptedAt: string }
  ): Promise<void> {
    await db
      .update(jobs)
      .set({
        acceptedBid: bid,
        status: "in_progress",
      })
      .where(eq(jobs.id, jobId));
  }

  async setJobEscrow(jobId: string, escrowId: string): Promise<void> {
    await db.update(jobs).set({ escrowId }).where(eq(jobs.id, jobId));
  }

  async submitJobWork(
    jobId: string,
    submission: { results: any; submittedAt: string }
  ): Promise<void> {
    await db.update(jobs).set({ submission }).where(eq(jobs.id, jobId));
  }

  async completeJob(jobId: string): Promise<void> {
    await db
      .update(jobs)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  }

  async getBid(id: string): Promise<Bid | undefined> {
    const result = await db.select().from(bids).where(eq(bids.id, id));
    return result[0];
  }

  async getBidsByJob(jobId: string): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.jobId, jobId));
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = `bid-${randomUUID().slice(0, 8)}`;
    const result = await db
      .insert(bids)
      .values({
        ...insertBid,
        id,
      })
      .returning();
    return result[0];
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = `txn-${randomUUID().slice(0, 8)}`;
    const result = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        id,
        status: "completed",
      })
      .returning();
    return result[0];
  }

  async getEscrowBalance(): Promise<string> {
    const result = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .where(eq(transactions.type, "escrow_create"));

    const total = parseFloat(result[0]?.total || "0");
    return total.toFixed(2);
  }
}

export const storage = new DbStorage();
