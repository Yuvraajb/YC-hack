import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import type { IStorage } from "./storage";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

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

// Image generation tool using placeholders
// In production, integrate with DALL-E, Stable Diffusion, or Midjourney
const generateImageTool = tool(
  "generate_image",
  "Generate an image based on a text description. Returns a placeholder confirmation since actual image generation requires external APIs like DALL-E or Stable Diffusion.",
  {
    description: z.string().describe("Detailed description of the image to generate"),
    aspect_ratio: z.string().optional().describe("Aspect ratio (1:1, 16:9, 9:16, etc), defaults to 1:1")
  },
  async (args) => {
    const aspectRatio = args.aspect_ratio || "1:1";
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            status: "success",
            message: "Image generation requested",
            description: args.description,
            aspect_ratio: aspectRatio,
            placeholder_url: `https://via.placeholder.com/800x800.png?text=${encodeURIComponent(args.description.slice(0, 50))}`,
            note: "In production, this would integrate with DALL-E, Stable Diffusion, or Midjourney API"
          }, null, 2)
        }
      ]
    };
  }
);

// Create MCP server with custom tools
const customToolsServer = createSdkMcpServer({
  name: "custom-tools",
  version: "1.0.0",
  tools: [generateImageTool]
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
        permissionMode: "acceptEdits",
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
      } else if (message.type === "message" || message.type === "assistant") {
        // Final message with complete content (SDK can emit either "message" or "assistant" type)
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
