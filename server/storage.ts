import type {
  Agent,
  InsertAgent,
  Job,
  InsertJob,
  Transaction,
  InsertTransaction,
  JobStatus,
  AgentStatus,
} from "@shared/schema";
import { agents, jobs, transactions } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getAgent(id: string): Promise<Agent | undefined>;
  getAllAgents(): Promise<Agent[]>;
  getActiveAgents(): Promise<Agent[]>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentBalance(id: string, newBalance: string): Promise<void>;
  updateAgentStatus(id: string, status: AgentStatus): Promise<void>;
  incrementAgentStats(id: string, earned: string): Promise<void>;

  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getJobsByStatus(status: JobStatus): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJobStatus(id: string, status: JobStatus): Promise<void>;
  assignAgent(jobId: string, agentId: string, price: string, platformFee: string, total: string, reasoning: string): Promise<void>;
  submitJobResult(jobId: string, result: any): Promise<void>;
  completeJob(jobId: string): Promise<void>;
  updateJobPayment(jobId: string, payment: { paymentStatus: string; paymentTxHash?: string; locusAmount?: string }): Promise<void>;

  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class DbStorage implements IStorage {
  async getAgent(id: string): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.id, id));
    return result[0];
  }

  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getActiveAgents(): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.isActive, "true"));
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = `agent-${randomUUID().slice(0, 8)}`;
    const result = await db
      .insert(agents)
      .values({
        ...insertAgent,
        id,
        walletBalance: "0.00",
        reputationScore: "0.00",
        jobsCompleted: "0",
        totalEarned: "0.00",
        status: (insertAgent.status || "available") as AgentStatus,
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
        status: "pending" as JobStatus,
      })
      .returning();
    return result[0];
  }

  async updateJobStatus(id: string, status: JobStatus): Promise<void> {
    await db.update(jobs).set({ status }).where(eq(jobs.id, id));
  }

  async assignAgent(
    jobId: string,
    agentId: string,
    price: string,
    platformFee: string,
    total: string,
    reasoning: string
  ): Promise<void> {
    await db
      .update(jobs)
      .set({
        assignedAgentId: agentId,
        agentPrice: price,
        platformFee,
        totalCost: total,
        matchReasoning: reasoning,
        status: "assigned" as JobStatus,
      })
      .where(eq(jobs.id, jobId));
  }

  async submitJobResult(jobId: string, result: any): Promise<void> {
    await db.update(jobs).set({ result, status: "in_progress" as JobStatus }).where(eq(jobs.id, jobId));
  }

  async completeJob(jobId: string): Promise<void> {
    await db
      .update(jobs)
      .set({
        status: "completed" as JobStatus,
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
  }

  async updateJobPayment(
    jobId: string,
    payment: { paymentStatus: string; paymentTxHash?: string; locusAmount?: string }
  ): Promise<void> {
    await db
      .update(jobs)
      .set({
        paymentStatus: payment.paymentStatus as any,
        paymentTxHash: payment.paymentTxHash,
        locusAmount: payment.locusAmount,
      })
      .where(eq(jobs.id, jobId));
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
        status: "completed" as string,
      })
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
