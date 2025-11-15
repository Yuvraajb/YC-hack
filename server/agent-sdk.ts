import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import type { IStorage } from "./storage";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { readGmailTool, sendGmailTool, readCalendarTool } from "./google-integrations";

// Helper function to format timestamp
function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  });
}

// OpenRouter API client with retry logic and rate limiting
class OpenRouterClient {
  private apiKey: string;
  private baseURL = "https://openrouter.ai/api/v1";
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(url: string, options: RequestInit, attempt = 1): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // Handle rate limiting (429)
      if (response.status === 429 && attempt < this.maxRetries) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '1') * 1000;
        const delay = Math.max(retryAfter, this.retryDelay * Math.pow(2, attempt - 1));
        await this.sleep(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      // Handle server errors (5xx) with retry
      if (response.status >= 500 && response.status < 600 && attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      
      return response;
    } catch (error) {
      if (attempt < this.maxRetries) {
        await this.sleep(this.retryDelay * Math.pow(2, attempt - 1));
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  async callModel(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    max_tokens?: number;
    temperature?: number;
  }): Promise<{ content: string; tokens?: { prompt: number; completion: number; total: number }; generationId?: string }> {
    const response = await this.fetchWithRetry(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://replit.com',
        'X-Title': 'Agentic Marketplace'
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        max_tokens: params.max_tokens || 1024,
        temperature: params.temperature || 0.7,
        usage: { include: true }  // Enable token tracking
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const usage = data.usage;
    
    return {
      content: data.choices?.[0]?.message?.content || "",
      tokens: usage ? {
        prompt: usage.prompt_tokens || 0,
        completion: usage.completion_tokens || 0,
        total: usage.total_tokens || 0
      } : undefined,
      generationId: data.id
    };
  }

  async generateImage(params: {
    prompt: string;
    model?: string;
    aspect_ratio?: string;
  }): Promise<{ url: string; generationId?: string }> {
    // Use a supported image generation model
    const model = params.model || "black-forest-labs/flux-1.1-pro";
    
    const response = await this.fetchWithRetry(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://replit.com',
        'X-Title': 'Agentic Marketplace'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: params.prompt
          }
        ],
        modalities: ["text", "image"]  // Required for image generation
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter image generation error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    // Extract image from OpenRouter response
    // Per official docs: message.images[].image_url.url contains base64 data URL
    const message = data.choices?.[0]?.message;
    
    if (!message?.images || !Array.isArray(message.images) || message.images.length === 0) {
      throw new Error("No images returned from OpenRouter. Response: " + JSON.stringify(data).slice(0, 500));
    }
    
    const imageUrl = message.images[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error("Image URL missing from response. Response: " + JSON.stringify(message.images[0]).slice(0, 500));
    }
    
    return {
      url: imageUrl, // Base64 data URL (data:image/png;base64,...)
      generationId: data.id  // For cost lookup at openrouter.ai/activity
    };
  }
}

// Initialize OpenRouter client (lazy)
let openRouterClient: OpenRouterClient | null = null;

function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }
    openRouterClient = new OpenRouterClient(apiKey);
  }
  return openRouterClient;
}

// MCP Tool: Generic OpenRouter model caller
const callOpenRouterModelTool = tool(
  "call_openrouter_model",
  "Call any AI model via OpenRouter API. Supports 100+ models including GPT-4, Claude, Gemini, LLaMA, etc. Use this for specialized reasoning, analysis, or text generation tasks.",
  {
    model: z.string().describe("Model ID (e.g., 'openai/gpt-4', 'anthropic/claude-3-opus', 'google/gemini-pro')"),
    prompt: z.string().describe("The prompt/question to send to the model"),
    temperature: z.number().optional().describe("Temperature (0-1), defaults to 0.7")
  },
  async (args) => {
    try {
      const client = getOpenRouterClient();
      const result = await client.callModel({
        model: args.model,
        messages: [{ role: "user", content: args.prompt }],
        temperature: args.temperature
      });

      const tokenInfo = result.tokens 
        ? `\n\nTokens used: ${result.tokens.total} (${result.tokens.prompt} prompt + ${result.tokens.completion} completion)`
        : '';

      return {
        content: [
          {
            type: "text" as const,
            text: `${result.content}${tokenInfo}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error calling ${args.model}: ${error.message}`
          }
        ]
      };
    }
  }
);

// MCP Tool: Optimized chat with structured output
const callOpenRouterChatTool = tool(
  "call_openrouter_chat",
  "Call a language model with structured conversation. Best for multi-turn reasoning or when you need specific model capabilities (coding, math, multilingual, etc).",
  {
    model: z.string().describe("Model ID to use"),
    system_prompt: z.string().optional().describe("System instructions for the model"),
    user_message: z.string().describe("User message/question"),
    max_tokens: z.number().optional().describe("Maximum tokens to generate")
  },
  async (args) => {
    try {
      const client = getOpenRouterClient();
      const messages: Array<{ role: string; content: string }> = [];
      
      if (args.system_prompt) {
        messages.push({ role: "system", content: args.system_prompt });
      }
      messages.push({ role: "user", content: args.user_message });

      const result = await client.callModel({
        model: args.model,
        messages,
        max_tokens: args.max_tokens
      });

      return {
        content: [
          {
            type: "text" as const,
            text: result.content
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error.message}`
          }
        ]
      };
    }
  }
);

// MCP Tool: Real image generation via OpenRouter
const generateImageTool = tool(
  "generate_image",
  "Generate an image based on a text description using Flux 1.1 Pro or other image models via OpenRouter. Returns the actual base64 image data URL that can be displayed in browsers.",
  {
    description: z.string().describe("Detailed description of the image to generate"),
    model: z.string().optional().describe("Image model to use (default: black-forest-labs/flux-1.1-pro)")
  },
  async (args) => {
    try {
      const client = getOpenRouterClient();
      const result = await client.generateImage({
        prompt: args.description,
        model: args.model
      });

      // Return in a structured format that Claude can understand
      return {
        content: [
          {
            type: "text" as const,
            text: `Successfully generated image for: "${args.description}"\n\nImage URL: ${result.url}\n\nThis is a base64 data URL that can be used directly in HTML <img> tags or displayed in browsers.${result.generationId ? `\n\nGeneration ID: ${result.generationId} (for cost lookup at openrouter.ai/activity)` : ''}`
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to generate image: ${error.message}\n\nPrompt was: "${args.description}"`
          }
        ]
      };
    }
  }
);

// Create MCP server with custom tools
const customToolsServer = createSdkMcpServer({
  name: "custom-tools",
  version: "1.0.0",
  tools: [
    callOpenRouterModelTool,
    callOpenRouterChatTool,
    generateImageTool,
    readGmailTool,
    sendGmailTool,
    readCalendarTool
  ]
});

export interface AgentExecutionOptions {
  storage: IStorage;
  jobId: string;
  prompt: string;
  systemPrompt?: string;
  enabledTools?: string[];
  maxSteps?: number;
}

/**
 * Execute a task using Claude Agent SDK with specified tools
 */
export async function executeAgentTask(options: AgentExecutionOptions): Promise<{
  success: boolean;
  result?: string;
  error?: string;
}> {
  const {
    storage,
    jobId,
    prompt,
    systemPrompt,
    enabledTools = ["WebSearch", "generate_image"],
    maxSteps = 50
  } = options;

  try {
    // Log start
    await storage.createLog({
      jobId,
      timestamp: formatTimestamp(),
      level: "info",
      message: `Agent execution started with Claude Agent SDK. Tools: ${enabledTools.join(', ')}`
    });

    // Configure allowed tools based on agent capabilities
    const allowedTools: string[] = [];
    
    // Add built-in tools
    if (enabledTools.includes("WebSearch") || enabledTools.includes("web_browsing")) {
      allowedTools.push("WebSearch");
    }
    if (enabledTools.includes("Bash") || enabledTools.includes("code_execution")) {
      allowedTools.push("Bash");
    }
    if (enabledTools.includes("Read") || enabledTools.includes("file_operations")) {
      allowedTools.push("Read");
    }
    if (enabledTools.includes("Write") || enabledTools.includes("file_operations")) {
      allowedTools.push("Write");
    }
    
    // Add custom tools (MCP tools are prefixed with "mcp__<server-name>__<tool-name>")
    if (enabledTools.includes("generate_image") || enabledTools.includes("image_generation")) {
      allowedTools.push("mcp__custom-tools__generate_image");
    }
    if (enabledTools.includes("call_openrouter_model") || enabledTools.includes("multi_model")) {
      allowedTools.push("mcp__custom-tools__call_openrouter_model");
    }
    if (enabledTools.includes("call_openrouter_chat") || enabledTools.includes("multi_model")) {
      allowedTools.push("mcp__custom-tools__call_openrouter_chat");
    }
    if (enabledTools.includes("read_gmail") || enabledTools.includes("gmail")) {
      allowedTools.push("mcp__custom-tools__read_gmail");
    }
    if (enabledTools.includes("read_calendar") || enabledTools.includes("calendar")) {
      allowedTools.push("mcp__custom-tools__read_calendar");
    }

    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

    if (!apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    await storage.createLog({
      jobId,
      timestamp: formatTimestamp(),
      level: "info",
      message: `SDK configured with ${allowedTools.length} tools: ${allowedTools.join(', ')}`
    });

    let fullResponse = "";
    let stepCount = 0;

    // Set environment variables for SDK (it reads them automatically)
    process.env.ANTHROPIC_API_KEY = apiKey;
    if (baseURL) {
      process.env.ANTHROPIC_BASE_URL = baseURL;
    }

    // Build the full prompt with system instructions if provided
    const fullPrompt = systemPrompt 
      ? `<system>\n${systemPrompt}\n</system>\n\n${prompt}`
      : prompt;

    // Execute the query with SDK
    const queryStream = query({
      prompt: fullPrompt,
      options: {
        model: "claude-sonnet-4-5",
        mcpServers: {
          "custom-tools": customToolsServer
        },
        allowedTools,
        permissionMode: "bypassPermissions",  // Bypass all permission prompts for MCP tools
        includePartialMessages: true  // Enable streaming text deltas
      }
    });

    // Process messages from the stream
    for await (const message of queryStream) {
      if (!message) continue;
      
      stepCount++;
      
      // Handle stream_event messages containing text deltas
      if (message.type === "stream_event") {
        const event = (message as any).event;
        
        if (event.type === "content_block_delta") {
          if (event.delta?.type === "text_delta") {
            const textChunk = event.delta.text;
            fullResponse += textChunk;
          }
        }
        
        // Log on message completion
        if (event.type === "message_stop") {
          await storage.createLog({
            jobId,
            timestamp: formatTimestamp(),
            level: "info",
            message: `Streaming completed (${fullResponse.length} characters collected)`
          });
        }
      } else if (message.type === "assistant") {
        // Final assistant message with complete content
        const msgData = message as any;
        if (msgData.content && Array.isArray(msgData.content)) {
          for (const block of msgData.content) {
            if (block.type === "text") {
              fullResponse += block.text;
            }
          }
          
          await storage.createLog({
            jobId,
            timestamp: formatTimestamp(),
            level: "info",
            message: `Agent response received (${fullResponse.length} characters)`
          });
        }
      } else if (message.type === "result") {
        // Result message indicates task completion
        await storage.createLog({
          jobId,
          timestamp: formatTimestamp(),
          level: "info",
          message: "Task execution completed successfully"
        });
      }
    }

    await storage.createLog({
      jobId,
      timestamp: formatTimestamp(),
      level: "info",
      message: `Agent execution completed in ${stepCount} steps. Response length: ${fullResponse.length} chars`
    });

    return {
      success: true,
      result: fullResponse || "Task completed successfully"
    };

  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    
    await storage.createLog({
      jobId,
      timestamp: formatTimestamp(),
      level: "error",
      message: `Agent execution failed: ${errorMessage}`
    });

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Fallback to basic Anthropic API execution (for backward compatibility)
 */
export async function executeBasicAgent(options: AgentExecutionOptions): Promise<{
  success: boolean;
  result?: string;
  error?: string;
}> {
  const { storage, jobId, prompt, systemPrompt } = options;

  try {
    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

    if (!apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const anthropic = new Anthropic({
      apiKey,
      baseURL
    });

    await storage.createLog({
      jobId,
      timestamp: formatTimestamp(),
      level: "info",
      message: "Executing task with basic Anthropic API (fallback mode)"
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const result = response.content
      .filter(block => block.type === "text")
      .map(block => (block as any).text)
      .join("\n");

    await storage.createLog({
      jobId,
      timestamp: formatTimestamp(),
      level: "info",
      message: "Task completed successfully"
    });

    return {
      success: true,
      result
    };

  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    
    await storage.createLog({
      jobId,
      timestamp: formatTimestamp(),
      level: "error",
      message: `Task execution failed: ${errorMessage}`
    });

    return {
      success: false,
      error: errorMessage
    };
  }
}
