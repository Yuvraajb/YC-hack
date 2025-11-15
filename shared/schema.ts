import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Agent Types
export type AgentType = "coordinator" | "web_scraper" | "analysis" | "writer";
export type AgentStatus = "available" | "busy" | "offline";

// Job Types
export type JobType = "web_scraping" | "analysis" | "writing";
export type JobStatus = "accepting_bids" | "in_progress" | "completed" | "failed";

// Transaction Types
export type TransactionType = "escrow_create" | "escrow_release" | "escrow_cancel";

// Agents
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().$type<AgentType>(),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  reputationScore: decimal("reputation_score", { precision: 3, scale: 2 }).default("0.00"),
  jobsCompleted: decimal("jobs_completed", { precision: 10, scale: 0 }).notNull().default("0"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().$type<AgentStatus>().default("available"),
  pricingModel: jsonb("pricing_model").$type<{
    baseRate: number;
    complexityMultiplier: { simple: number; medium: number; complex: number };
  }>(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull().$type<JobType>(),
  description: text("description").notNull(),
  requirements: jsonb("requirements").notNull(),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().$type<JobStatus>().default("accepting_bids"),
  postedBy: text("posted_by").notNull(),
  acceptedBid: jsonb("accepted_bid").$type<{
    agentId: string;
    price: number;
    acceptedAt: string;
  }>(),
  escrowId: text("escrow_id"),
  submission: jsonb("submission").$type<{
    results: any;
    submittedAt: string;
  }>(),
  userWallet: text("user_wallet"),
  paymentRequired: decimal("payment_required", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status").$type<"pending" | "paid" | "not_required">().default("not_required"),
  paymentTxHash: text("payment_tx_hash"),
  locusAmount: text("locus_amount"),
  postedAt: timestamp("posted_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

// Bids
export const bids = pgTable("bids", {
  id: varchar("id").primaryKey(),
  jobId: text("job_id").notNull(),
  agentId: text("agent_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimatedTime: decimal("estimated_time", { precision: 10, scale: 0 }).notNull(),
  reasoning: text("reasoning").notNull(),
  submittedAt: timestamp("submitted_at").notNull().default(sql`now()`),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull().$type<TransactionType>(),
  fromWallet: text("from_wallet").notNull(),
  toWallet: text("to_wallet").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  jobId: text("job_id"),
  escrowId: text("escrow_id"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert Schemas
export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
  completedAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  submittedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bids.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
