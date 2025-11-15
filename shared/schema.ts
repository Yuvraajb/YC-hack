import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey(),
  prompt: text("prompt").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  selectedAgentId: varchar("selected_agent_id"),
  output: text("output"),
  paymentId: varchar("payment_id"),
});

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey(),
  jobId: varchar("job_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  agentName: text("agent_name").notNull(),
  eta: varchar("eta", { length: 50 }).notNull(),
  price: real("price").notNull(),
  confidence: integer("confidence").notNull(),
  plan: text("plan").notNull(),
  score: real("score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey(),
  jobId: varchar("job_id").notNull(),
  txId: varchar("tx_id").notNull(),
  amount: real("amount").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const logs = pgTable("logs", {
  id: varchar("id").primaryKey(),
  jobId: varchar("job_id").notNull(),
  timestamp: varchar("timestamp", { length: 20 }).notNull(),
  level: varchar("level", { length: 20 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  createdAt: true,
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
