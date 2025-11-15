import Anthropic from "@anthropic-ai/sdk";

// Using Replit's AI Integrations service for Anthropic access
const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

function safeParseJSON(text: string, functionName: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`[${functionName}] No JSON found in response:`, text);
    throw new Error(`${functionName}: No JSON object found in AI response`);
  }
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error(`[${functionName}] JSON parse error:`, error.message);
    console.error(`[${functionName}] Raw text:`, text);
    console.error(`[${functionName}] Attempted to parse:`, jsonMatch[0]);
    throw new Error(`${functionName}: Failed to parse JSON - ${error.message}`);
  }
}

export interface TaskBreakdown {
  tasks: Array<{
    type: "web_scraping" | "analysis" | "writing";
    description: string;
    requirements: any;
    budgetMax: number;
  }>;
}

export interface BidCalculation {
  bidPrice: number;
  reasoning: string;
  estimatedTimeSeconds: number;
}

export interface BidEvaluation {
  decision: "accept" | "reject";
  selectedAgentId: string | null;
  reasoning: string;
}

export interface WorkVerification {
  approved: boolean;
  qualityScore: number;
  issues: string[];
  reasoning: string;
}

export async function breakdownResearchRequest(request: string): Promise<TaskBreakdown> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: `You are an AI task coordinator breaking down research requests into subtasks.
Break the request into 2-3 tasks: web_scraping (to gather data), analysis (to analyze data), and optionally writing (to create final report).

For web_scraping tasks, specify websites to scrape and data fields needed.
For analysis tasks, specify what insights to extract.
For writing tasks, specify the format and style.

Assign realistic budgets (scraping: $2-4, analysis: $3-5, writing: $2-3).

Return JSON only: {"tasks": [{"type": "web_scraping", "description": "...", "requirements": {...}, "budgetMax": 3.0}]}`,
    messages: [{ role: "user", content: request }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return safeParseJSON(content.text, "breakdownResearchRequest");
  }
  throw new Error("breakdownResearchRequest: Non-text response from AI");
}

export async function calculateBid(
  jobDescription: string,
  jobType: string,
  budgetMax: number,
  agentType: string,
  baseRate: number
): Promise<BidCalculation> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `You are a ${agentType} agent calculating a competitive bid for a job.

Your base rate: $${baseRate} per task
Job type: ${jobType}
Client budget: $${budgetMax}

Calculate a competitive bid that:
- Covers your costs with reasonable profit margin
- Stays under budget
- Accounts for task complexity (simple 1x, medium 1.5x, complex 2x multiplier)

Return JSON only: {"bidPrice": 2.50, "reasoning": "...", "estimatedTimeSeconds": 30}`,
    messages: [{ role: "user", content: `Job: ${jobDescription}` }],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return safeParseJSON(content.text, "calculateBid");
  }
  throw new Error("calculateBid: Non-text response from AI");
}

export async function evaluateBids(
  jobDescription: string,
  budgetMax: number,
  bids: Array<{ agentId: string; price: string; reasoning: string; estimatedTime: string }>
): Promise<BidEvaluation> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `You are evaluating bids for a job. Select the best bid based on:
- Price vs budget
- Agent reasoning quality
- Estimated delivery time

Your budget: $${budgetMax}

Return JSON only: {"decision": "accept", "selectedAgentId": "agent-id", "reasoning": "..."}
If no suitable bids, return: {"decision": "reject", "selectedAgentId": null, "reasoning": "..."}`,
    messages: [
      {
        role: "user",
        content: `Job: ${jobDescription}\n\nBids:\n${JSON.stringify(bids, null, 2)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return safeParseJSON(content.text, "evaluateBids");
  }
  throw new Error("evaluateBids: Non-text response from AI");
}

export async function verifyWork(
  jobDescription: string,
  requirements: any,
  submission: any
): Promise<WorkVerification> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `You are verifying completed work. Check if:
1. All requirements met
2. Data quality acceptable
3. Format correct

Return JSON only: {"approved": true, "qualityScore": 4.5, "issues": [], "reasoning": "..."}`,
    messages: [
      {
        role: "user",
        content: `Job: ${jobDescription}\n\nRequirements: ${JSON.stringify(requirements)}\n\nSubmission: ${JSON.stringify(submission)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return safeParseJSON(content.text, "verifyWork");
  }
  throw new Error("verifyWork: Non-text response from AI");
}

export async function performWebScraping(requirements: any): Promise<any> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: `You are a web scraping agent. Based on requirements, generate realistic sample data.
For competitor research, include: company names, pricing, features, market position.
Return comprehensive JSON data.`,
    messages: [
      {
        role: "user",
        content: `Scrape data for: ${JSON.stringify(requirements)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      return safeParseJSON(content.text, "performWebScraping");
    } catch (error) {
      console.log("[performWebScraping] Returning raw text as fallback");
      return { data: content.text, raw: true };
    }
  }
  throw new Error("performWebScraping: Non-text response from AI");
}

export async function performAnalysis(data: any, analysisType: string): Promise<any> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: `You are a data analysis agent. Analyze the provided data and extract key insights.
Focus on: trends, patterns, competitive advantages, market positioning.
Return structured JSON with insights and recommendations.`,
    messages: [
      {
        role: "user",
        content: `Analyze this data (${analysisType}):\n${JSON.stringify(data, null, 2)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    try {
      return safeParseJSON(content.text, "performAnalysis");
    } catch (error) {
      console.log("[performAnalysis] Returning raw text as fallback");
      return { insights: content.text, raw: true };
    }
  }
  throw new Error("performAnalysis: Non-text response from AI");
}
