import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Code2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";

const NEGOTIATION_STRATEGIES = [
  {
    value: "aggressive",
    label: "Aggressive",
    description: "Start high, make minimal concessions. Best for premium agents.",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Fair starting price, moderate flexibility. Recommended for most agents.",
  },
  {
    value: "conservative",
    label: "Conservative",
    description: "Competitive pricing, quick to close deals. Good for new agents building reputation.",
  },
];

const STARTER_CODE = `/**
 * Custom Agent - Claude Agent SDK
 * Paste your existing agent code here
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function runAgent(task: string): Promise<string> {
  const systemPrompt = \`You are a helpful AI assistant.\`;
  
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: task,
        },
      ],
    });

    const response = message.content.find(
      (block) => block.type === "text"
    );
    
    return response?.type === "text" ? response.text : "No response";
  } catch (error) {
    console.error("Agent execution error:", error);
    throw error;
  }
}

export default runAgent;
`;

export default function CustomCodeBuilder() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [negotiationStrategy, setNegotiationStrategy] = useState("");
  const [agentCode, setAgentCode] = useState(STARTER_CODE);

  const createAgentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/dev/agents", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Agent created successfully. You can publish it from My Agents page.",
      });
      setLocation("/my-agents");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    },
  });

  const handleCreateAgent = () => {
    if (!name || !description || !minPrice || !maxPrice || !basePrice || !negotiationStrategy) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!agentCode || agentCode === STARTER_CODE) {
      toast({
        title: "No Custom Code",
        description: "Please provide your custom agent code",
        variant: "destructive",
      });
      return;
    }

    const data = {
      developerId: "demo-developer-1", // In real app, this would come from auth
      name,
      description,
      category: "Custom", // Default for custom code agents
      systemPrompt: "Custom agent implementation", // Extracted from code
      minPrice: parseFloat(minPrice),
      maxPrice: parseFloat(maxPrice),
      basePrice: parseFloat(basePrice),
      negotiationStrategy,
      agentCode,
      capabilities: [],
      toolsEnabled: [],
      tags: ["custom", "sdk"],
    };

    createAgentMutation.mutate(data);
  };

  const selectedStrategy = NEGOTIATION_STRATEGIES.find(s => s.value === negotiationStrategy);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1" data-testid="text-page-title">
                Custom Code Builder
              </h1>
              <p className="text-muted-foreground text-lg">
                Paste your Claude Agent SDK code and configure your agent
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This builder is for experienced developers who already have Claude Agent SDK code. If
            you're new, use the <strong>Build with AI</strong> option instead.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide details about your agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., AdvancedCoder Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  placeholder="10.00"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  data-testid="input-base-price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what your agent does and its key features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-testid="input-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimum Price ($) *</Label>
                <Input
                  id="minPrice"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  data-testid="input-min-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maximum Price ($) *</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  step="0.01"
                  placeholder="20.00"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  data-testid="input-max-price"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negotiation Strategy</CardTitle>
            <CardDescription>
              Choose how your agent negotiates prices with potential buyers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy *</Label>
              <Select value={negotiationStrategy} onValueChange={setNegotiationStrategy}>
                <SelectTrigger data-testid="select-strategy">
                  <SelectValue placeholder="Select negotiation strategy" />
                </SelectTrigger>
                <SelectContent>
                  {NEGOTIATION_STRATEGIES.map((strategy) => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStrategy && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">{selectedStrategy.label} Strategy</p>
                <p className="text-sm text-muted-foreground">{selectedStrategy.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Code</CardTitle>
            <CardDescription>
              Paste your Claude Agent SDK code here. Must export a default function that accepts a
              task string and returns a promise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              className="font-mono text-sm bg-muted/50"
              rows={25}
              placeholder={STARTER_CODE}
              data-testid="input-agent-code"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Make sure your code uses the Claude Agent SDK (@anthropic-ai/sdk) and follows the
              required export pattern.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation("/my-agents")}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleCreateAgent}
            disabled={createAgentMutation.isPending}
            data-testid="button-create-agent"
          >
            {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
          </Button>
        </div>
      </div>
    </div>
  );
}
