import { storage } from "../storage";
import { evaluateBids } from "../anthropic";

export class CoordinatorAgent {
  private agentId = "coordinator-agent";
  private pollingInterval: NodeJS.Timeout | null = null;

  async start() {
    console.log(`[${this.agentId}] Starting coordinator agent`);

    // Poll every 3 seconds for jobs that need bid evaluation
    this.pollingInterval = setInterval(async () => {
      await this.evaluatePendingBids();
    }, 3000);
  }

  async evaluatePendingBids() {
    try {
      const jobs = await storage.getJobsByStatus("accepting_bids");

      for (const job of jobs) {
        // Check if job has been open for at least 5 seconds (bidding window)
        const jobAge = Date.now() - job.postedAt.getTime();
        if (jobAge < 5000) {
          continue; // Still accepting bids
        }

        // Get all bids for this job
        const bids = await storage.getBidsByJob(job.id);

        if (bids.length === 0) {
          console.log(`[${this.agentId}] No bids for job ${job.id}, extending bidding window`);
          continue;
        }

        console.log(`[${this.agentId}] Evaluating ${bids.length} bids for job ${job.id}`);

        // Use Claude AI to evaluate bids
        const evaluation = await evaluateBids(
          job.description,
          parseFloat(job.budgetMax),
          bids.map((b) => ({
            agentId: b.agentId,
            price: b.price,
            reasoning: b.reasoning,
            estimatedTime: b.estimatedTime,
          }))
        );

        if (evaluation.decision === "accept" && evaluation.selectedAgentId) {
          const selectedBid = bids.find((b) => b.agentId === evaluation.selectedAgentId);
          if (selectedBid) {
            console.log(
              `[${this.agentId}] Accepting bid from ${evaluation.selectedAgentId} for $${selectedBid.price}`
            );
            console.log(`[${this.agentId}] Reasoning: ${evaluation.reasoning}`);

            // Accept the bid via API
            const response = await fetch("http://localhost:5000/api/jobs/" + job.id + "/accept", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bidId: selectedBid.id }),
            });

            if (response.ok) {
              console.log(`[${this.agentId}] Bid accepted, escrow created`);
            }
          }
        } else {
          console.log(`[${this.agentId}] Rejecting all bids: ${evaluation.reasoning}`);
          // Could extend bidding window or adjust budget here
        }
      }

      // Check for completed work that needs verification
      await this.verifyCompletedWork();
    } catch (error: any) {
      console.error(`[${this.agentId}] Error evaluating bids:`, error.message);
    }
  }

  async verifyCompletedWork() {
    try {
      const jobs = await storage.getJobsByStatus("in_progress");

      for (const job of jobs) {
        if (!job.submission) {
          continue; // Work not submitted yet
        }

        console.log(`[${this.agentId}] Verifying work for job ${job.id}`);

        // Verify via API
        const response = await fetch("http://localhost:5000/api/jobs/" + job.id + "/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log(`[${this.agentId}] Work approved, payment released to ${job.acceptedBid?.agentId}`);
          } else {
            console.log(`[${this.agentId}] Work rejected: ${result.verification.reasoning}`);
          }
        }
      }
    } catch (error: any) {
      console.error(`[${this.agentId}] Error verifying work:`, error.message);
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
