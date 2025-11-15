import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { CoordinatorAgent } from "./agents/coordinator";
import { ScraperAgent } from "./agents/scraper";
import { AnalystAgent } from "./agents/analyst";

const app = express();

// Initialize agents
let coordinatorAgent: CoordinatorAgent;
let scraperAgent: ScraperAgent;
let analystAgent: AnalystAgent;

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
    // Create coordinator agent with starting balance
    await storage.createAgent({
      name: "Coordinator Agent",
      type: "coordinator",
      walletBalance: "50.00",
      status: "available",
      pricingModel: null,
    });

    // Create specialist agents (start with $0)
    await storage.createAgent({
      name: "Web Scraper Agent",
      type: "web_scraper",
      walletBalance: "0.00",
      status: "available",
      pricingModel: {
        baseRate: 1.0,
        complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
      },
    });

    await storage.createAgent({
      name: "Analysis Agent",
      type: "analysis",
      walletBalance: "0.00",
      status: "available",
      pricingModel: {
        baseRate: 1.5,
        complexityMultiplier: { simple: 1, medium: 1.5, complex: 2 },
      },
    });

    log("✓ Agents initialized in marketplace");
  } catch (error: any) {
    log(`Error initializing agents: ${error.message}`);
  }
}

function startAgents() {
  log("Starting autonomous agents...");

  coordinatorAgent = new CoordinatorAgent();
  scraperAgent = new ScraperAgent();
  analystAgent = new AnalystAgent();

  coordinatorAgent.start();
  scraperAgent.start();
  analystAgent.start();

  log("✓ All agents are now autonomously operating");
}

function stopAgents() {
  if (coordinatorAgent) coordinatorAgent.stop();
  if (scraperAgent) scraperAgent.stop();
  if (analystAgent) analystAgent.stop();
}
