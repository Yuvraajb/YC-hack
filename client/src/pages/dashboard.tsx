import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Activity, Wallet, Briefcase, TrendingUp, Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job, Agent, Transaction } from "@shared/schema";

function TaskCard({ task }: { task: Job }) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500 text-white",
    assigned: "bg-blue-500 text-white",
    in_progress: "bg-purple-500 text-white",
    completed: "bg-green-500 text-white",
    failed: "bg-red-500 text-white",
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                {task.id}
              </span>
            </div>
            <CardTitle className="text-base line-clamp-2">
              {task.userRequest}
            </CardTitle>
          </div>
          <Badge className={statusColors[task.status]}>
            {task.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {task.assignedAgentId && (
          <div className="text-sm">
            <span className="text-muted-foreground">Agent:</span>{" "}
            <span className="font-medium">{task.assignedAgentId}</span>
          </div>
        )}
        {task.totalCost && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Cost: ${task.totalCost} ({task.locusAmount} LOCUS)
            </span>
          </div>
        )}
        {task.result && (
          <div className="mt-2 p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">Result:</p>
            <p className="text-sm line-clamp-3">
              {typeof task.result === 'object' ? task.result.response : JSON.stringify(task.result)}
            </p>
          </div>
        )}
        {task.paymentStatus === "pending" && task.result && (
          <Badge variant="outline" className="text-yellow-600">
            ⚠️ Payment pending
          </Badge>
        )}
        {task.paymentStatus === "paid" && (
          <Badge variant="outline" className="text-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColors: Record<string, string> = {
    available: "text-green-600",
    busy: "text-yellow-600",
    offline: "text-gray-400",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {agent.description}
            </p>
          </div>
          <div className={`flex items-center gap-1 ${statusColors[agent.status]}`}>
            <Activity className="w-3 h-3" />
            <span className="text-xs">{agent.status}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1 mb-2">
            {agent.capabilities?.slice(0, 3).map((cap: string) => (
              <Badge key={cap} variant="outline" className="text-xs">
                {cap}
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="font-mono font-semibold">${agent.pricePerCall}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Jobs</span>
            <span>{agent.jobsCompleted}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Earned</span>
            <span>${agent.totalEarned}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [request, setRequest] = useState("");
  const [userWallet, setUserWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: tasks, isLoading: tasksLoading } = useQuery<Job[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 2000,
  });

  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    refetchInterval: 5000,
  });

  const stats = {
    totalTasks: tasks?.length || 0,
    activeTasks: tasks?.filter((t) => t.status === "in_progress").length || 0,
    completedTasks: tasks?.filter((t) => t.status === "completed").length || 0,
    totalAgents: agents?.length || 0,
  };

  const handleSubmitTask = async () => {
    if (!request.trim() || !userWallet.trim()) {
      toast({
        title: "Error",
        description: "Please enter both your request and wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/tasks", { 
        request: request.trim(),
        userWallet: userWallet.trim(),
      });

      toast({
        title: "Task Submitted! 🎉",
        description: `Matched to: ${response.agent.name}\n${response.matchReasoning}\n\nCost: $${response.pricing.totalCost} (${response.pricing.locusAmount} LOCUS)\n\nAgent is working on your request...`,
      });

      setRequest("");
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                AI Agent Marketplace
              </h1>
              <p className="text-sm text-muted-foreground">
                Open marketplace • Anyone can create agents • Earn with LOCUS
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {stats.totalAgents} Agents Online
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Tasks</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.totalTasks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.activeTasks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.completedTasks}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Agents</span>
                </div>
                <p className="text-2xl font-bold mt-1">{stats.totalAgents}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Task</CardTitle>
                <CardDescription>
                  AI will automatically match you with the best agent for your request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">What do you need help with?</label>
                  <Textarea
                    placeholder="Example: Research the top 5 AI coding tools and compare their features"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    className="min-h-24"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Your Wallet Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={userWallet}
                    onChange={(e) => setUserWallet(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Pay with LOCUS tokens after work is completed
                  </p>
                </div>
                <Button
                  onClick={handleSubmitTask}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding best agent...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Task
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Tasks</h2>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                    No tasks yet. Submit your first task above!
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Available Agents</h2>
                <Badge variant="outline">{stats.totalAgents} agents</Badge>
              </div>

              {agentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : agents && agents.length > 0 ? (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                    No agents available
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
