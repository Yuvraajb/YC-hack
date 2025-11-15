import { storage } from "../storage";
import { calculateBid } from "../anthropic";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export class WriterAgent {
  private agentId: string;
  private agentType = "writer";
  private baseRate: number;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(agentId: string, baseRate: number) {
    this.agentId = agentId;
    this.baseRate = baseRate;
  }

  async start() {
    console.log(`[${this.agentId}] Starting writer agent`);

    // Poll every 2 seconds for writing jobs
    this.pollingInterval = setInterval(async () => {
      await this.pollForJobs();
    }, 2000);
  }

  async pollForJobs() {
    try {
      const jobs = await storage.getJobsByStatus("accepting_bids");
      const writingJobs = jobs.filter((j) => j.type === "writing");

      for (const job of writingJobs) {
        // Check if we already bid on this job
        const existingBids = await storage.getBidsByJob(job.id);
        const alreadyBid = existingBids.some((b) => b.agentId === this.agentId);

        if (alreadyBid) {
          continue;
        }

        console.log(`[${this.agentId}] Found writing job: ${job.id}`);

        // Use Claude AI to calculate competitive bid
        const bidCalculation = await calculateBid(
          job.description,
          job.type,
          parseFloat(job.budgetMax),
          this.agentType,
          this.baseRate
        );

        console.log(`[${this.agentId}] Calculated bid: $${bidCalculation.bidPrice}`);
        console.log(`[${this.agentId}] Reasoning: ${bidCalculation.reasoning}`);

        // Submit bid
        await storage.createBid({
          jobId: job.id,
          agentId: this.agentId,
          price: bidCalculation.bidPrice.toFixed(2),
          estimatedTime: bidCalculation.estimatedTimeSeconds.toString(),
          reasoning: bidCalculation.reasoning,
        });

        console.log(`[${this.agentId}] Bid submitted for job ${job.id}`);
      }

      // Check for assigned jobs
      await this.executeAssignedJobs();
    } catch (error: any) {
      console.error(`[${this.agentId}] Error polling jobs:`, error.message);
    }
  }

  async executeAssignedJobs() {
    try {
      const jobs = await storage.getJobsByStatus("in_progress");
      const myJobs = jobs.filter(
        (j) => j.acceptedBid?.agentId === this.agentId && !j.submission
      );

      for (const job of myJobs) {
        console.log(`[${this.agentId}] Executing job ${job.id}`);

        // Use Claude AI to write the report
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 4096,
          system: `You are a professional writer creating research reports. Based on the provided data, write a well-structured, comprehensive report. Format it professionally with sections, insights, and conclusions.`,
          messages: [
            {
              role: "user",
              content: `Write a report for: ${job.description}\n\nData/Requirements: ${JSON.stringify(job.requirements, null, 2)}`,
            },
          ],
        });

        const content = message.content[0];
        let results;
        if (content.type === "text") {
          results = {
            report: content.text,
            format: "markdown",
            sections: ["Executive Summary", "Key Findings", "Analysis", "Conclusion"],
          };
        } else {
          throw new Error("Unexpected response type from Claude");
        }

        console.log(`[${this.agentId}] Writing completed for job ${job.id}`);

        // Submit work
        const response = await fetch("http://localhost:5000/api/jobs/" + job.id + "/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: this.agentId,
            results,
          }),
        });

        if (response.ok) {
          console.log(`[${this.agentId}] Work submitted for job ${job.id}`);
        }
      }
    } catch (error: any) {
      console.error(`[${this.agentId}] Error executing jobs:`, error.message);
    }
  }

  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    console.log(`[${this.agentId}] Stopped`);
  }
}
