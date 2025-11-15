import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import JobCard, { type Job } from "@/components/JobCard";
import AgentBidCard, { type AgentBid } from "@/components/AgentBidCard";
import PaymentCard, { type Payment } from "@/components/PaymentCard";
import ExecutionLog, { type LogEntry } from "@/components/ExecutionLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function MarketplaceView() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
    refetchInterval: 2000,
  });

  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['/api/payments'],
    refetchInterval: 2000,
  });

  const { data: jobDetails } = useQuery({
    queryKey: ['/api/jobs', activeJobId],
    enabled: !!activeJobId,
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (!activeJobId && jobs.length > 0) {
      setActiveJobId(jobs[0].id);
    }
  }, [jobs, activeJobId]);

  const activeJob = jobs.find(j => j.id === activeJobId);
  const details = jobDetails as any;

  const formattedJobs: Job[] = jobs.map(job => ({
    id: job.id,
    prompt: job.prompt,
    status: job.status,
    timestamp: formatTimeAgo(new Date(job.createdAt)),
    selectedAgent: details?.bids?.find((b: any) => b.agentId === job.selectedAgentId)?.agentName,
  }));

  const bids: AgentBid[] = details?.bids?.map((bid: any) => ({
    agentId: bid.agentId,
    agentName: bid.agentName,
    eta: bid.eta,
    price: bid.price,
    confidence: bid.confidence,
    plan: bid.plan,
    isWinner: bid.agentId === activeJob?.selectedAgentId,
  })) || [];

  const logs: LogEntry[] = details?.logs?.map((log: any) => ({
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
  })) || [];

  const formattedPayments: Payment[] = payments.slice(0, 2).map(payment => ({
    txId: payment.txId,
    amount: payment.amount,
    timestamp: new Date(payment.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    status: payment.status,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-semibold">Marketplace Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Live view of agent bidding, job execution, and payment processing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <Card className="rounded-xl border-card-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] pb-6">
                    <div className="space-y-4 px-6">
                      {formattedJobs.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic py-4">
                          No jobs yet. Create one from the User View!
                        </div>
                      ) : (
                        formattedJobs.map((job) => (
                          <JobCard
                            key={job.id}
                            job={job}
                            isActive={activeJobId === job.id}
                            onClick={() => setActiveJobId(job.id)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="rounded-xl border-card-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">Agent Bids</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {bids.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">
                      Select a job to view bids
                    </div>
                  ) : (
                    bids.map((bid) => (
                      <AgentBidCard key={bid.agentId} bid={bid} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <ExecutionLog logs={logs} />
              
              <Card className="rounded-xl border-card-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formattedPayments.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">
                      No payments yet
                    </div>
                  ) : (
                    formattedPayments.map((payment) => (
                      <PaymentCard key={payment.txId} payment={payment} />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
