import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Agent Types
export type AgentStatus = "available" | "busy" | "offline";

// Job Types
export type JobStatus = "pending" | "assigned" | "in_progress" | "completed" | "failed";

// Transaction Types
export type TransactionType = "payment" | "platform_fee" | "creator_earning";

// Agents
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  capabilities: jsonb("capabilities").$type<string[]>().notNull(),
  creatorWallet: text("creator_wallet").notNull(),
  pricePerCall: decimal("price_per_call", { precision: 10, scale: 2 }).notNull(),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  reputationScore: decimal("reputation_score", { precision: 3, scale: 2 }).default("0.00"),
  jobsCompleted: decimal("jobs_completed", { precision: 10, scale: 0 }).notNull().default("0"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().$type<AgentStatus>().default("available"),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Jobs (Tasks submitted by users)
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey(),
  userRequest: text("user_request").notNull(),
  userWallet: text("user_wallet").notNull(),
  assignedAgentId: text("assigned_agent_id"),
  status: text("status").notNull().$type<JobStatus>().default("pending"),
  matchReasoning: text("match_reasoning"),
  agentPrice: decimal("agent_price", { precision: 10, scale: 2 }),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  locusAmount: text("locus_amount"),
  paymentStatus: text("payment_status").$type<"pending" | "paid" | "not_required">().default("pending"),
  paymentTxHash: text("payment_tx_hash"),
  result: jsonb("result"),
  postedAt: timestamp("posted_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});


// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull().$type<TransactionType>(),
  fromWallet: text("from_wallet").notNull(),
  toWallet: text("to_wallet").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  jobId: text("job_id"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert Schemas
export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  walletBalance: true,
  reputationScore: true,
  jobsCompleted: true,
  totalEarned: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
  completedAt: true,
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

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
