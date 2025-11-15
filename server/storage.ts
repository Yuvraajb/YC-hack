import { type Job, type InsertJob, type Bid, type InsertBid, type Payment, type InsertPayment, type Log, type InsertLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;

  // Bids
  createBid(bid: InsertBid): Promise<Bid>;
  getBidsByJobId(jobId: string): Promise<Bid[]>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByJobId(jobId: string): Promise<Payment | undefined>;
  getAllPayments(): Promise<Payment[]>;
  
  // Logs
  createLog(log: InsertLog): Promise<Log>;
  getLogsByJobId(jobId: string): Promise<Log[]>;
}

export class MemStorage implements IStorage {
  private jobs: Map<string, Job>;
  private bids: Map<string, Bid>;
  private payments: Map<string, Payment>;
  private logs: Map<string, Log>;

  constructor() {
    this.jobs = new Map();
    this.bids = new Map();
    this.payments = new Map();
    this.logs = new Map();
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      createdAt: new Date(),
      selectedAgentId: null,
      output: null,
      paymentId: null,
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updated = { ...job, ...updates };
    this.jobs.set(id, updated);
    return updated;
  }

  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = randomUUID();
    const bid: Bid = {
      ...insertBid,
      id,
      createdAt: new Date(),
      score: null,
    };
    this.bids.set(id, bid);
    return bid;
  }

  async getBidsByJobId(jobId: string): Promise<Bid[]> {
    return Array.from(this.bids.values())
      .filter(bid => bid.jobId === jobId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentByJobId(jobId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(p => p.jobId === jobId);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const id = randomUUID();
    const log: Log = {
      ...insertLog,
      id,
      createdAt: new Date(),
    };
    this.logs.set(id, log);
    return log;
  }

  async getLogsByJobId(jobId: string): Promise<Log[]> {
    return Array.from(this.logs.values())
      .filter(log => log.jobId === jobId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
