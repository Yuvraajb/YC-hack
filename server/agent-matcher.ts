import Anthropic from "@anthropic-ai/sdk";
import type { Agent } from "@shared/schema";

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

export interface AgentMatch {
  agentId: string;
  confidence: number;
  reasoning: string;
}

export async function matchAgentToRequest(
  userRequest: string,
  availableAgents: Agent[]
): Promise<AgentMatch> {
  const agentList = availableAgents.map(agent => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    capabilities: agent.capabilities,
    pricePerCall: parseFloat(agent.pricePerCall),
    reputationScore: parseFloat(agent.reputationScore),
    jobsCompleted: parseInt(agent.jobsCompleted),
  }));

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: `You are an AI agent marketplace coordinator. Match user requests to the most suitable agent.

Analyze the user's request and available agents. Consider:
1. Agent capabilities and how well they match the request
2. Agent reputation and past performance
3. Price vs. quality balance
4. Agent specialization vs. generalization

Return JSON: {
  "agentId": "selected-agent-id",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this agent is the best match"
}

If no agent is suitable, return confidence < 0.5 and explain why.`,
    messages: [
      {
        role: "user",
        content: `User Request: ${userRequest}\n\nAvailable Agents:\n${JSON.stringify(agentList, null, 2)}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return safeParseJSON(content.text, "matchAgentToRequest");
  }
  throw new Error("matchAgentToRequest: Non-text response from AI");
}

export async function executeAgentTask(
  agent: Agent,
  userRequest: string
): Promise<any> {
  // If agent has custom API endpoint, call it
  if (agent.apiEndpoint) {
    try {
      const response = await fetch(agent.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(agent.apiKey ? { "Authorization": `Bearer ${agent.apiKey}` } : {}),
        },
        body: JSON.stringify({ request: userRequest }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error(`[AgentExecution] API call failed:`, error.message);
      throw error;
    }
  }

  // Default: Use Claude AI to execute the task
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    system: `You are "${agent.name}". ${agent.description}

Your capabilities: ${agent.capabilities.join(", ")}

Execute the user's request to the best of your abilities. Return a comprehensive, helpful response.
If the request is outside your capabilities, explain what you can and cannot do.`,
    messages: [
      {
        role: "user",
        content: userRequest,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return {
      response: content.text,
      agentName: agent.name,
      capabilities: agent.capabilities,
    };
  }
  throw new Error("executeAgentTask: Non-text response from AI");
}
