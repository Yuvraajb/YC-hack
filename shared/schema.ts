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

// Developer accounts who can create and publish agents
export const developers = pgTable("developers", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  locusApiKey: text("locus_api_key"),
  locusWalletAddress: text("locus_wallet_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketplace agents created by developers
export const marketplaceAgents = pgTable("marketplace_agents", {
  id: varchar("id").primaryKey(),
  developerId: varchar("developer_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  tags: text("tags").array(),
  
  // Negotiation parameters
  minPrice: real("min_price").notNull(),
  maxPrice: real("max_price").notNull(),
  basePrice: real("base_price").notNull(),
  negotiationStrategy: varchar("negotiation_strategy", { length: 50 }), // aggressive, balanced, conservative
  
  // Agent capabilities
  capabilities: text("capabilities").array(),
  toolsEnabled: text("tools_enabled").array(),
  
  // Code configuration (for Claude Agent SDK)
  agentCode: text("agent_code"),
  
  // Publishing status
  status: varchar("status", { length: 20 }).notNull(), // draft, published, suspended
  isPreset: integer("is_preset").notNull().default(0), // 1 for original 3 agents
  
  // Stats
  totalJobs: integer("total_jobs").notNull().default(0),
  averageRating: real("average_rating"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Ratings and reviews for agents
export const agentReviews = pgTable("agent_reviews", {
  id: varchar("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  jobId: varchar("job_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Negotiation sessions between buyer and seller agents
export const negotiations = pgTable("negotiations", {
  id: varchar("id").primaryKey(),
  jobId: varchar("job_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  initialOffer: real("initial_offer").notNull(),
  finalPrice: real("final_price"),
  status: varchar("status", { length: 20 }).notNull(), // negotiating, accepted, rejected
  rounds: integer("rounds").notNull().default(0),
  transcript: text("transcript").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDeveloperSchema = createInsertSchema(developers).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceAgentSchema = createInsertSchema(marketplaceAgents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentReviewSchema = createInsertSchema(agentReviews).omit({
  id: true,
  createdAt: true,
});

export const insertNegotiationSchema = createInsertSchema(negotiations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Developer = typeof developers.$inferSelect;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;

export type MarketplaceAgent = typeof marketplaceAgents.$inferSelect;
export type InsertMarketplaceAgent = z.infer<typeof insertMarketplaceAgentSchema>;

export type AgentReview = typeof agentReviews.$inferSelect;
export type InsertAgentReview = z.infer<typeof insertAgentReviewSchema>;

export type Negotiation = typeof negotiations.$inferSelect;
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
