import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();

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
  // Initialize seed agents if database is empty
  await initializeSeedAgents();

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
    log(`AI Agent Marketplace serving on port ${port}`);
    log(`Platform fee: 10% | Payment: Locus tokens`);
  });
})();

async function initializeSeedAgents() {
  try {
    const existingAgents = await storage.getAllAgents();
    
    if (existingAgents.length === 0) {
      log("Seeding marketplace with initial agents...");

      // Seed diverse agents
      await storage.createAgent({
        name: "Research Pro",
        description: "Expert at conducting comprehensive research on any topic. I gather data from multiple sources, analyze trends, and provide detailed insights.",
        capabilities: ["research", "data analysis", "report writing", "fact-checking"],
        creatorWallet: process.env.LOCUS_OWNER_KEY || "0x0000000000000000000000000000000000000000",
        pricePerCall: "5.00",
        status: "available",
        isActive: "true",
      });

      await storage.createAgent({
        name: "Code Helper",
        description: "Programming assistant that helps with code review, debugging, and writing clean, efficient code across multiple languages.",
        capabilities: ["coding", "debugging", "code review", "documentation"],
        creatorWallet: process.env.LOCUS_OWNER_KEY || "0x0000000000000000000000000000000000000000",
        pricePerCall: "7.00",
        status: "available",
        isActive: "true",
      });

      await storage.createAgent({
        name: "Content Writer",
        description: "Professional content creator specializing in blog posts, articles, social media content, and marketing copy.",
        capabilities: ["writing", "content creation", "copywriting", "editing"],
        creatorWallet: process.env.LOCUS_OWNER_KEY || "0x0000000000000000000000000000000000000000",
        pricePerCall: "4.00",
        status: "available",
        isActive: "true",
      });

      await storage.createAgent({
        name: "Data Analyst",
        description: "Specializes in data analysis, visualization, and extracting actionable insights from complex datasets.",
        capabilities: ["data analysis", "visualization", "statistics", "insights"],
        creatorWallet: process.env.LOCUS_OWNER_KEY || "0x0000000000000000000000000000000000000000",
        pricePerCall: "6.00",
        status: "available",
        isActive: "true",
      });

      await storage.createAgent({
        name: "Quick Assistant",
        description: "Fast, affordable assistant for simple tasks, quick questions, and general help.",
        capabilities: ["general assistance", "Q&A", "task help", "quick research"],
        creatorWallet: process.env.LOCUS_OWNER_KEY || "0x0000000000000000000000000000000000000000",
        pricePerCall: "2.00",
        status: "available",
        isActive: "true",
      });

      log("✓ Seed agents created successfully");
    } else {
      log(`✓ Found ${existingAgents.length} existing agents in marketplace`);
    }
  } catch (error: any) {
    log(`Error initializing agents: ${error.message}`);
  }
}
