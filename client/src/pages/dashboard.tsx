import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Activity, Wallet, Briefcase, TrendingUp, Send, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Job, Agent, Transaction } from "@shared/schema";

function JobCard({ job }: { job: Job }) {
  const statusColors = {
    accepting_bids: "bg-job-accepting text-white",
    in_progress: "bg-job-progress text-white",
    completed: "bg-job-completed text-white",
    failed: "bg-job-failed text-white",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-job-${job.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground" data-testid={`text-job-id-${job.id}`}>
                {job.id}
              </span>
              <Badge variant="outline" className="text-xs" data-testid={`badge-job-type-${job.id}`}>
                {job.type.replace("_", " ")}
              </Badge>
            </div>
            <CardTitle className="text-base" data-testid={`text-job-description-${job.id}`}>
              {job.description}
            </CardTitle>
          </div>
          <Badge className={statusColors[job.status]} data-testid={`badge-job-status-${job.id}`}>
            {job.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span data-testid={`text-job-budget-${job.id}`}>Budget: ${job.budgetMax}</span>
          <span data-testid={`text-job-posted-by-${job.id}`}>By: {job.postedBy}</span>
        </div>
        {job.acceptedBid && (
          <div className="mt-2 text-sm" data-testid={`text-job-accepted-${job.id}`}>
            <span className="text-muted-foreground">Assigned to:</span>{" "}
            <span className="font-medium">{job.acceptedBid.agentId}</span>
            <span className="text-muted-foreground ml-2">${job.acceptedBid.price}</span>
          </div>
        )}
        {job.submission && (
          <div className="mt-2 text-xs text-muted-foreground" data-testid={`text-job-submission-${job.id}`}>
            Work submitted, awaiting verification
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColors = {
    available: "text-status-online",
    busy: "text-status-busy",
    offline: "text-status-offline",
  };

  return (
    <Card data-testid={`card-agent-${agent.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold" data-testid={`text-agent-name-${agent.id}`}>
              {agent.name}
            </h3>
            <p className="text-xs text-muted-foreground" data-testid={`text-agent-type-${agent.id}`}>
              {agent.type.replace("_", " ")}
            </p>
          </div>
          <div className={`flex items-center gap-1 ${statusColors[agent.status]}`}>
            <Activity className="w-3 h-3" />
            <span className="text-xs" data-testid={`text-agent-status-${agent.id}`}>
              {agent.status}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-mono font-semibold" data-testid={`text-agent-balance-${agent.id}`}>
              ${agent.walletBalance}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Jobs</span>
            <span data-testid={`text-agent-jobs-${agent.id}`}>{agent.jobsCompleted}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Earned</span>
            <span data-testid={`text-agent-earned-${agent.id}`}>${agent.totalEarned}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" data-testid={`transaction-${transaction.id}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-muted-foreground truncate" data-testid={`text-transaction-id-${transaction.id}`}>
            {transaction.id}
          </span>
          <Badge variant="outline" className="text-xs shrink-0" data-testid={`badge-transaction-type-${transaction.id}`}>
            {transaction.type.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-sm" data-testid={`text-transaction-flow-${transaction.id}`}>
          {transaction.fromWallet} → {transaction.toWallet}
        </p>
        {transaction.jobId && (
          <p className="text-xs text-muted-foreground" data-testid={`text-transaction-job-${transaction.id}`}>
            Job: {transaction.jobId}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono font-semibold text-sm" data-testid={`text-transaction-amount-${transaction.id}`}>
          ${transaction.amount}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(transaction.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [researchRequest, setResearchRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Real-time polling every 2 seconds
  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    refetchInterval: 2000,
  });

  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    refetchInterval: 2000,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 2000,
  });

  const stats = {
    totalJobs: jobs?.length || 0,
    activeJobs: jobs?.filter((j) => j.status === "in_progress").length || 0,
    completedJobs: jobs?.filter((j) => j.status === "completed").length || 0,
    totalEscrow: jobs
      ?.filter((j) => j.status === "in_progress")
      .reduce((sum, j) => sum + parseFloat(j.acceptedBid?.price?.toString() || "0"), 0)
      .toFixed(2) || "0.00",
  };

  const handleResearchSubmit = async () => {
    if (!researchRequest.trim()) {
      toast({
        title: "Error",
        description: "Please enter a research request",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/research", { request: researchRequest });
      
      toast({
        title: "Research Initiated",
        description: `${response.jobs.length} jobs created. Agents will start bidding shortly.`,
      });

      setResearchRequest("");
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit research request",
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
              <h1 className="text-2xl font-bold" data-testid="text-marketplace-title">
                AI Agent Marketplace
              </h1>
              <p className="text-sm text-muted-foreground">
                Autonomous agents hiring each other
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-status-online">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium" data-testid="text-system-status">
                  All Agents Online
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Jobs</span>
                </div>
                <p className="text-2xl font-bold mt-1" data-testid="stat-total-jobs">
                  {stats.totalJobs}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-job-progress" />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
                <p className="text-2xl font-bold mt-1" data-testid="stat-active-jobs">
                  {stats.activeJobs}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-job-completed" />
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
                <p className="text-2xl font-bold mt-1" data-testid="stat-completed-jobs">
                  {stats.completedJobs}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">In Escrow</span>
                </div>
                <p className="text-2xl font-bold mt-1 font-mono" data-testid="stat-escrow-amount">
                  ${stats.totalEscrow}
                </p>
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
                <CardTitle>Submit Research Request</CardTitle>
                <CardDescription>
                  Agents will autonomously break down your request, bid on tasks, and complete the work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Example: Research Tesla's main competitors and their pricing strategies"
                  value={researchRequest}
                  onChange={(e) => setResearchRequest(e.target.value)}
                  className="min-h-24"
                  data-testid="input-research-request"
                />
                <Button
                  onClick={handleResearchSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                  data-testid="button-submit-research"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Research Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Job Feed</h2>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>Live updates</span>
                </div>
              </div>

              {jobsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                    No jobs posted yet. Submit a research request above to get started!
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Agents</h2>
              {agentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
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
                    No agents registered
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Transaction Feed</h2>
              {transactionsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : transactions && transactions.length > 0 ? (
                <Card>
                  <CardContent className="pt-4 pb-2 max-h-96 overflow-y-auto">
                    {transactions.slice(0, 10).map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                    No transactions yet
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
