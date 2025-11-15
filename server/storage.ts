import { 
  type Job, type InsertJob, 
  type Bid, type InsertBid, 
  type Payment, type InsertPayment, 
  type Log, type InsertLog,
  type Developer, type InsertDeveloper,
  type MarketplaceAgent, type InsertMarketplaceAgent,
  type AgentReview, type InsertAgentReview,
  type Negotiation, type InsertNegotiation
} from "@shared/schema";
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
  
  // Developers
  createDeveloper(developer: InsertDeveloper): Promise<Developer>;
  getDeveloper(id: string): Promise<Developer | undefined>;
  getDeveloperByEmail(email: string): Promise<Developer | undefined>;
  updateDeveloper(id: string, updates: Partial<Developer>): Promise<Developer | undefined>;
  
  // Marketplace Agents
  createMarketplaceAgent(agent: InsertMarketplaceAgent): Promise<MarketplaceAgent>;
  getMarketplaceAgent(id: string): Promise<MarketplaceAgent | undefined>;
  getAllMarketplaceAgents(): Promise<MarketplaceAgent[]>;
  getPublishedMarketplaceAgents(): Promise<MarketplaceAgent[]>;
  getAgentsByDeveloper(developerId: string): Promise<MarketplaceAgent[]>;
  updateMarketplaceAgent(id: string, updates: Partial<MarketplaceAgent>): Promise<MarketplaceAgent | undefined>;
  deleteMarketplaceAgent(id: string): Promise<boolean>;
  
  // Agent Reviews
  createAgentReview(review: InsertAgentReview): Promise<AgentReview>;
  getReviewsByAgent(agentId: string): Promise<AgentReview[]>;
  
  // Negotiations
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  getNegotiation(id: string): Promise<Negotiation | undefined>;
  getNegotiationByJobAndAgent(jobId: string, agentId: string): Promise<Negotiation | undefined>;
  updateNegotiation(id: string, updates: Partial<Negotiation>): Promise<Negotiation | undefined>;
}

export class MemStorage implements IStorage {
  private jobs: Map<string, Job>;
  private bids: Map<string, Bid>;
  private payments: Map<string, Payment>;
  private logs: Map<string, Log>;
  private developers: Map<string, Developer>;
  private marketplaceAgents: Map<string, MarketplaceAgent>;
  private agentReviews: Map<string, AgentReview>;
  private negotiations: Map<string, Negotiation>;

  constructor() {
    this.jobs = new Map();
    this.bids = new Map();
    this.payments = new Map();
    this.logs = new Map();
    this.developers = new Map();
    this.marketplaceAgents = new Map();
    this.agentReviews = new Map();
    this.negotiations = new Map();
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

  // Developer methods
  async createDeveloper(insertDeveloper: InsertDeveloper): Promise<Developer> {
    const id = randomUUID();
    const developer: Developer = {
      ...insertDeveloper,
      id,
      createdAt: new Date(),
      locusApiKey: null,
      locusWalletAddress: null,
    };
    this.developers.set(id, developer);
    return developer;
  }

  async getDeveloper(id: string): Promise<Developer | undefined> {
    return this.developers.get(id);
  }

  async getDeveloperByEmail(email: string): Promise<Developer | undefined> {
    return Array.from(this.developers.values()).find(d => d.email === email);
  }

  async updateDeveloper(id: string, updates: Partial<Developer>): Promise<Developer | undefined> {
    const developer = this.developers.get(id);
    if (!developer) return undefined;
    
    const updated = { ...developer, ...updates };
    this.developers.set(id, updated);
    return updated;
  }

  // Marketplace Agent methods
  async createMarketplaceAgent(insertAgent: InsertMarketplaceAgent): Promise<MarketplaceAgent> {
    const id = randomUUID();
    const agent: MarketplaceAgent = {
      ...insertAgent,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalJobs: 0,
      averageRating: null,
      isPreset: 0,
      tags: insertAgent.tags || null,
      capabilities: insertAgent.capabilities || null,
      toolsEnabled: insertAgent.toolsEnabled || null,
      agentCode: insertAgent.agentCode || null,
      negotiationStrategy: insertAgent.negotiationStrategy || null,
    };
    this.marketplaceAgents.set(id, agent);
    return agent;
  }

  async getMarketplaceAgent(id: string): Promise<MarketplaceAgent | undefined> {
    return this.marketplaceAgents.get(id);
  }

  async getAllMarketplaceAgents(): Promise<MarketplaceAgent[]> {
    return Array.from(this.marketplaceAgents.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPublishedMarketplaceAgents(): Promise<MarketplaceAgent[]> {
    return Array.from(this.marketplaceAgents.values())
      .filter(agent => agent.status === 'published')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAgentsByDeveloper(developerId: string): Promise<MarketplaceAgent[]> {
    return Array.from(this.marketplaceAgents.values())
      .filter(agent => agent.developerId === developerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateMarketplaceAgent(id: string, updates: Partial<MarketplaceAgent>): Promise<MarketplaceAgent | undefined> {
    const agent = this.marketplaceAgents.get(id);
    if (!agent) return undefined;
    
    const updated = { ...agent, ...updates, updatedAt: new Date() };
    this.marketplaceAgents.set(id, updated);
    return updated;
  }

  async deleteMarketplaceAgent(id: string): Promise<boolean> {
    return this.marketplaceAgents.delete(id);
  }

  // Agent Review methods
  async createAgentReview(insertReview: InsertAgentReview): Promise<AgentReview> {
    const id = randomUUID();
    const review: AgentReview = {
      ...insertReview,
      id,
      createdAt: new Date(),
      comment: null,
    };
    this.agentReviews.set(id, review);

    // Update agent average rating
    const reviews = await this.getReviewsByAgent(insertReview.agentId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.updateMarketplaceAgent(insertReview.agentId, { averageRating: avgRating });

    return review;
  }

  async getReviewsByAgent(agentId: string): Promise<AgentReview[]> {
    return Array.from(this.agentReviews.values())
      .filter(review => review.agentId === agentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Negotiation methods
  async createNegotiation(insertNegotiation: InsertNegotiation): Promise<Negotiation> {
    const id = randomUUID();
    const negotiation: Negotiation = {
      ...insertNegotiation,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      finalPrice: null,
      rounds: 0,
      transcript: [],
    };
    this.negotiations.set(id, negotiation);
    return negotiation;
  }

  async getNegotiation(id: string): Promise<Negotiation | undefined> {
    return this.negotiations.get(id);
  }

  async getNegotiationByJobAndAgent(jobId: string, agentId: string): Promise<Negotiation | undefined> {
    return Array.from(this.negotiations.values()).find(
      n => n.jobId === jobId && n.agentId === agentId
    );
  }

  async updateNegotiation(id: string, updates: Partial<Negotiation>): Promise<Negotiation | undefined> {
    const negotiation = this.negotiations.get(id);
    if (!negotiation) return undefined;
    
    const updated = { ...negotiation, ...updates, updatedAt: new Date() };
    this.negotiations.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

// Seed demo agents
async function seedDemoAgents() {
  // Create demo developer
  const demoDev = await storage.createDeveloper({
    name: "Demo Developer",
    email: "demo@marketplace.com",
  });

  // Seed marketplace agents
  const agents = [
    {
      developerId: demoDev.id,
      name: "CodeMaster Pro",
      description: "Expert coding assistant specialized in full-stack development with React, Node.js, and Python. Handles complex refactoring, debugging, and architecture design.",
      category: "Coding",
      systemPrompt: "You are CodeMaster Pro, an expert software engineer with 10+ years of experience. You write clean, maintainable code following best practices. You excel at debugging, refactoring, and explaining complex concepts.",
      minPrice: 8,
      maxPrice: 25,
      basePrice: 15,
      negotiationStrategy: "balanced",
      capabilities: ["Code Generation", "Problem Solving", "Task Automation"],
      toolsEnabled: ["File Operations", "Code Execution", "Web Search"],
      tags: ["React", "Node.js", "Python", "Full-Stack"],
      status: "published",
    },
    {
      developerId: demoDev.id,
      name: "DataWiz Analyst",
      description: "Advanced data analysis agent with expertise in statistics, machine learning, and visualization. Perfect for insights extraction and predictive modeling.",
      category: "Data Analysis",
      systemPrompt: "You are DataWiz, a data scientist specializing in statistical analysis and machine learning. You excel at finding patterns, creating visualizations, and providing actionable insights from data.",
      minPrice: 12,
      maxPrice: 30,
      basePrice: 20,
      negotiationStrategy: "aggressive",
      capabilities: ["Data Analysis", "Natural Language Processing", "Research & Summarization"],
      toolsEnabled: ["Data Visualization", "Code Execution", "File Operations"],
      tags: ["Statistics", "ML", "Visualization", "Python"],
      status: "published",
    },
    {
      developerId: demoDev.id,
      name: "ContentCraft Writer",
      description: "Creative writing specialist for blogs, marketing copy, and technical documentation. Adapts tone and style to your brand voice.",
      category: "Writing",
      systemPrompt: "You are ContentCraft, a professional writer with expertise in various writing styles. You create engaging, well-researched content that resonates with target audiences.",
      minPrice: 5,
      maxPrice: 18,
      basePrice: 10,
      negotiationStrategy: "conservative",
      capabilities: ["Creative Writing", "Research & Summarization", "Natural Language Processing"],
      toolsEnabled: ["Web Search", "File Operations"],
      tags: ["Copywriting", "Blogs", "Marketing", "SEO"],
      status: "published",
    },
    {
      developerId: demoDev.id,
      name: "ResearchBot Scholar",
      description: "Academic research assistant that finds, analyzes, and summarizes scientific papers and technical documents with citations.",
      category: "Research",
      systemPrompt: "You are ResearchBot Scholar, an academic research assistant. You excel at finding relevant sources, synthesizing information, and providing well-cited summaries.",
      minPrice: 10,
      maxPrice: 28,
      basePrice: 18,
      negotiationStrategy: "balanced",
      capabilities: ["Research & Summarization", "Natural Language Processing", "Problem Solving"],
      toolsEnabled: ["Web Search", "File Operations"],
      tags: ["Academic", "Citations", "Analysis", "Summarization"],
      status: "published",
    },
    {
      developerId: demoDev.id,
      name: "SupportGenius AI",
      description: "Customer support specialist trained on handling tickets, troubleshooting, and providing empathetic, solution-focused responses.",
      category: "Customer Support",
      systemPrompt: "You are SupportGenius, a customer support expert. You provide helpful, empathetic responses to customer inquiries, troubleshoot issues, and ensure customer satisfaction.",
      minPrice: 4,
      maxPrice: 15,
      basePrice: 8,
      negotiationStrategy: "conservative",
      capabilities: ["Natural Language Processing", "Problem Solving", "Task Automation"],
      toolsEnabled: ["Web Search", "API Calls", "File Operations"],
      tags: ["Support", "Troubleshooting", "Customer Service"],
      status: "published",
    },
    {
      developerId: demoDev.id,
      name: "DesignFlow Creative",
      description: "Creative design assistant for brainstorming, mood boards, and design system documentation. Specialized in UI/UX concepts.",
      category: "Creative",
      systemPrompt: "You are DesignFlow, a creative design expert with a focus on UI/UX. You excel at generating creative concepts, design systems, and user experience recommendations.",
      minPrice: 7,
      maxPrice: 22,
      basePrice: 12,
      negotiationStrategy: "balanced",
      capabilities: ["Creative Writing", "Problem Solving", "Research & Summarization"],
      toolsEnabled: ["Image Generation", "Web Search", "File Operations"],
      tags: ["UI/UX", "Design Systems", "Creative", "Branding"],
      status: "published",
    },
    {
      developerId: demoDev.id,
      name: "WebExplorer Vision",
      description: "Advanced web browsing and image generation agent. Can visit websites, extract information, and create visual content based on web findings. Perfect for research-to-visual workflows.",
      category: "Research",
      systemPrompt: "You are WebExplorer Vision, a specialized agent that combines web research capabilities with image generation. You excel at browsing websites, extracting key information, and then creating visual representations or images based on your findings. When given a task, you first use web search to gather information from the specified website or topic, then use image generation to create relevant visuals. You provide detailed descriptions of both your research findings and the images you generate.",
      minPrice: 10,
      maxPrice: 30,
      basePrice: 18,
      negotiationStrategy: "balanced",
      capabilities: ["Web Browsing", "Image Generation", "Research & Summarization", "Creative Content"],
      toolsEnabled: ["WebSearch", "generate_image"],
      tags: ["Web Research", "Visual Content", "Image Generation", "Data Extraction"],
      status: "published",
    },
  ];

  for (const agent of agents) {
    await storage.createMarketplaceAgent(agent);
  }

  console.log(`Seeded ${agents.length} demo marketplace agents`);
}

// Seed on initialization
seedDemoAgents().catch(console.error);
