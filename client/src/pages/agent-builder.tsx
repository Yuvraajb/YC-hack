import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Code2, Sparkles, X, Plus } from "lucide-react";

const CATEGORIES = ["Coding", "Writing", "Data Analysis", "Research", "Creative", "Marketing", "Customer Support"];
const AVAILABLE_TOOLS = [
  "File Operations",
  "Web Search",
  "Code Execution",
  "Image Generation",
  "Data Visualization",
  "API Calls",
  "Database Access",
];
const CAPABILITIES = [
  "Natural Language Processing",
  "Code Generation",
  "Data Analysis",
  "Creative Writing",
  "Problem Solving",
  "Research & Summarization",
  "Task Automation",
];

export default function AgentBuilder() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"visual" | "code">("visual");

  // Visual Builder State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Code Editor State
  const [agentCode, setAgentCode] = useState(`// Claude Agent SDK Code
import { query } from 'claude-agent-sdk';

async function runAgent(task: string) {
  // Your agent logic here
  const result = await query({
    prompt: task,
    // Add your configuration
  });
  
  return result;
}

export default runAgent;
`);

  const createAgentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/dev/agents", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Agent created successfully. You can now publish it to the marketplace.",
      });
      // Reset form
      setName("");
      setDescription("");
      setSystemPrompt("");
      setMinPrice("");
      setMaxPrice("");
      setBasePrice("");
      setSelectedTools([]);
      setSelectedCapabilities([]);
      setTags([]);
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
    if (!name || !description || !category || !systemPrompt || !minPrice || !maxPrice || !basePrice) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = {
      developerId: "demo-developer-1", // In real app, this would come from auth
      name,
      description,
      category,
      systemPrompt,
      minPrice: parseFloat(minPrice),
      maxPrice: parseFloat(maxPrice),
      basePrice: parseFloat(basePrice),
      capabilities: selectedCapabilities,
      toolsEnabled: selectedTools,
      tags,
      agentCode: mode === "code" ? agentCode : null,
    };

    createAgentMutation.mutate(data);
  };

  const toggleTool = (tool: string) => {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const toggleCapability = (cap: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    );
  };

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Agent Builder</h1>
          <p className="text-muted-foreground text-lg">Create and deploy AI agents to the marketplace</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "visual" | "code")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="visual" className="gap-2" data-testid="tab-visual">
              <Sparkles className="h-4 w-4" />
              Visual Builder
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2" data-testid="tab-code">
              <Code2 className="h-4 w-4" />
              Code Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Configure your agent's identity and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., CodeMaster Pro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your agent does..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add a tag"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      data-testid="input-tag"
                    />
                    <Button onClick={addTag} variant="secondary" size="icon" data-testid="button-add-tag">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Prompt</CardTitle>
                <CardDescription>Define how your agent should behave</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="You are a helpful AI assistant specialized in..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={6}
                  data-testid="input-system-prompt"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & Negotiation</CardTitle>
                <CardDescription>Set your agent's price range for negotiation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Minimum Price *</Label>
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
                    <Label htmlFor="basePrice">Base Price *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Maximum Price *</Label>
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
                <p className="text-sm text-muted-foreground">
                  Your agent will negotiate within this range. Base price is the starting offer.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tools & Capabilities</CardTitle>
                <CardDescription>Select what tools and capabilities your agent has</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Available Tools</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_TOOLS.map(tool => (
                      <Badge
                        key={tool}
                        variant={selectedTools.includes(tool) ? "default" : "outline"}
                        className="cursor-pointer justify-center py-2"
                        onClick={() => toggleTool(tool)}
                        data-testid={`badge-tool-${tool}`}
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Capabilities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAPABILITIES.map(cap => (
                      <Badge
                        key={cap}
                        variant={selectedCapabilities.includes(cap) ? "default" : "outline"}
                        className="cursor-pointer justify-center py-2"
                        onClick={() => toggleCapability(cap)}
                        data-testid={`badge-capability-${cap}`}
                      >
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Claude Agent SDK Code</CardTitle>
                <CardDescription>
                  Write custom agent code using Claude Agent SDK for advanced functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={agentCode}
                  onChange={(e) => setAgentCode(e.target.value)}
                  className="font-mono text-sm"
                  rows={20}
                  data-testid="input-agent-code"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  You still need to fill out basic info, pricing, and capabilities in the Visual Builder tab
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" size="lg" data-testid="button-cancel">
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
