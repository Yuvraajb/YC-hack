import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { CoordinatorAgent } from "./agents/coordinator";
import { ScraperAgent } from "./agents/scraper";
import { AnalystAgent } from "./agents/analyst";
import { WriterAgent } from "./agents/writer";

const app = express();

// Initialize agents
let coordinatorAgent: CoordinatorAgent;
let scraperAgents: ScraperAgent[] = [];
let analystAgents: AnalystAgent[] = [];
let writerAgents: WriterAgent[] = [];

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize marketplace agents in database
  await initializeAgents();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);

    // Start autonomous agents after server is ready
    setTimeout(() => {
      startAgents();
    }, 1000);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, stopping agents...');
    stopAgents();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    log('SIGINT received, stopping agents...');
    stopAgents();
    process.exit(0);
  });
})();

async function initializeAgents() {
  try {
    const existingAgents = await storage.getAllAgents();
    
    if (existingAgents.length === 0) {
      // Create coordinator agent with starting balance
      await storage.createAgent({
        name: "Coordinator Agent",
        type: "coordinator",
        walletBalance: "100.00",
        status: "available",
        pricingModel: null,
      });

      // Create multiple competing scrapers with different pricing
      await storage.createAgent({
        name: "Fast Scraper",
        type: "web_scraper",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 0.8,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      await storage.createAgent({
        name: "Premium Scraper",
        type: "web_scraper",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 1.2,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      await storage.createAgent({
        name: "Budget Scraper",
        type: "web_scraper",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 0.6,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      // Create multiple competing analysts
      await storage.createAgent({
        name: "Data Analyst Pro",
        type: "analysis",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 1.4,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      await storage.createAgent({
        name: "Quick Analyst",
        type: "analysis",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 1.0,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      await storage.createAgent({
        name: "Expert Analyst",
        type: "analysis",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 1.8,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      // Create multiple competing writers
      await storage.createAgent({
        name: "Content Writer",
        type: "writer",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 1.0,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      await storage.createAgent({
        name: "Technical Writer",
        type: "writer",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 1.5,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      await storage.createAgent({
        name: "Fast Writer",
        type: "writer",
        walletBalance: "0.00",
        status: "available",
        pricingModel: {
          baseRate: 0.9,
          complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
        },
      });

      log("✓ Agents initialized in marketplace");
    } else {
      log(`✓ Agents already exist in database (${existingAgents.length} agents)`);
    }
  } catch (error: any) {
    log(`Error initializing agents: ${error.message}`);
  }
}

async function startAgents() {
  log("Starting autonomous agents...");

  // Start coordinator
  coordinatorAgent = new CoordinatorAgent();
  coordinatorAgent.start();

  // Get all agents from database and start specialists
  const allAgents = await storage.getAllAgents();
  
  // Start all web scrapers
  const scrapers = allAgents.filter(a => a.type === "web_scraper");
  scraperAgents = scrapers.map(agent => {
    const scraper = new ScraperAgent(agent.id, agent.pricingModel?.baseRate || 1.0);
    scraper.start();
    return scraper;
  });

  // Start all analysts
  const analysts = allAgents.filter(a => a.type === "analysis");
  analystAgents = analysts.map(agent => {
    const analyst = new AnalystAgent(agent.id, agent.pricingModel?.baseRate || 1.5);
    analyst.start();
    return analyst;
  });

  // Start all writers
  const writers = allAgents.filter(a => a.type === "writer");
  writerAgents = writers.map(agent => {
    const writer = new WriterAgent(agent.id, agent.pricingModel?.baseRate || 1.2);
    writer.start();
    return writer;
  });

  log(`✓ All agents are now autonomously operating (${1 + scraperAgents.length + analystAgents.length + writerAgents.length} total)`);
}

function stopAgents() {
  if (coordinatorAgent) coordinatorAgent.stop();
  scraperAgents.forEach(agent => agent.stop());
  analystAgents.forEach(agent => agent.stop());
  writerAgents.forEach(agent => agent.stop());
}
