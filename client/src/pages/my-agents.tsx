import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Code2, Sparkles, Star, DollarSign, TrendingUp, Edit } from "lucide-react";
import { useLocation } from "wouter";
import type { MarketplaceAgent } from "@shared/schema";

export default function MyAgents() {
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: agents = [], isLoading } = useQuery<MarketplaceAgent[]>({
    queryKey: ["/api/dev/agents"],
  });

  const handleCreateWithAI = () => {
    setShowCreateDialog(false);
    setLocation("/builder/ai");
  };

  const handleCreateWithCode = () => {
    setShowCreateDialog(false);
    setLocation("/builder/code");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">My Agents</h1>
              <p className="text-muted-foreground text-lg">
                Manage your AI agents and track their performance
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
              data-testid="button-create-agent"
            >
              <Plus className="h-5 w-5" />
              Create Agent
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Code2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first AI agent to get started
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setShowCreateDialog(true)}
                    className="gap-2"
                    data-testid="button-create-first-agent"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover-elevate transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1" data-testid={`text-agent-name-${agent.id}`}>
                        {agent.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mb-2">
                        {agent.category}
                      </Badge>
                    </div>
                    <Badge
                      variant={agent.status === "published" ? "default" : "outline"}
                      data-testid={`badge-status-${agent.id}`}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <DollarSign className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold">${agent.basePrice}</span>
                      <span className="text-xs text-muted-foreground">Base</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <TrendingUp className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold">{agent.totalJobs}</span>
                      <span className="text-xs text-muted-foreground">Jobs</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                      <Star className="h-4 w-4 text-muted-foreground mb-1" />
                      <span className="font-semibold">
                        {agent.averageRating ? agent.averageRating.toFixed(1) : "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground">Rating</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {agent.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {(agent.tags?.length ?? 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(agent.tags?.length ?? 0) - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      data-testid={`button-edit-${agent.id}`}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    {agent.status === "draft" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        data-testid={`button-publish-${agent.id}`}
                      >
                        Publish
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Agent Method Selection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create a New Agent</DialogTitle>
            <DialogDescription>
              Choose how you want to build your agent
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card
              className="cursor-pointer hover-elevate active-elevate-2 transition-all border-2"
              onClick={handleCreateWithAI}
              data-testid="card-build-with-ai"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Build with AI</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Perfect for beginners. Use our visual builder to create agents with a guided
                  interface. We'll auto-generate the SDK code for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Visual form-based builder
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Auto-generated SDK code
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Real-time preview
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover-elevate active-elevate-2 transition-all border-2"
              onClick={handleCreateWithCode}
              data-testid="card-custom-code"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Use Custom Code</CardTitle>
                </div>
                <CardDescription className="text-base">
                  For experienced developers. Paste your existing Claude Agent SDK code and
                  configure negotiation settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Direct code editor
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Full SDK control
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Advanced customization
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
