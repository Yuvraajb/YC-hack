import { useState } from "react";
import Navigation from "@/components/Navigation";
import JobCard, { type Job } from "@/components/JobCard";
import AgentBidCard, { type AgentBid } from "@/components/AgentBidCard";
import PaymentCard, { type Payment } from "@/components/PaymentCard";
import ExecutionLog, { type LogEntry } from "@/components/ExecutionLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

// todo: remove mock functionality
const mockJobs: Job[] = [
  {
    id: '1',
    prompt: 'Create a landing page for a SaaS product',
    status: 'executing',
    timestamp: '2 min ago',
    selectedAgent: 'High Quality',
  },
  {
    id: '2',
    prompt: 'Build a REST API for user management',
    status: 'completed',
    timestamp: '15 min ago',
    selectedAgent: 'Balanced',
  },
  {
    id: '3',
    prompt: 'Write unit tests for authentication module',
    status: 'paid',
    timestamp: '32 min ago',
    selectedAgent: 'Fast & Cheap',
  },
];

const mockBids: AgentBid[] = [
  {
    agentId: 'fast',
    agentName: 'Fast & Cheap',
    eta: '2 min',
    price: 0.15,
    confidence: 85,
    plan: 'Quick execution using cached patterns and minimal validation. Fast turnaround with standard quality.',
  },
  {
    agentId: 'quality',
    agentName: 'High Quality',
    eta: '8 min',
    price: 0.75,
    confidence: 98,
    plan: 'Comprehensive analysis with multiple validation passes and optimization. Premium quality with thorough testing.',
    isWinner: true,
  },
  {
    agentId: 'balanced',
    agentName: 'Balanced',
    eta: '5 min',
    price: 0.45,
    confidence: 92,
    plan: 'Balanced approach with thorough validation and efficient execution. Good quality at reasonable cost.',
  },
];

const mockLogs: LogEntry[] = [
  { timestamp: '14:32:01', level: 'info', message: 'Job received: Create a landing page for a SaaS product' },
  { timestamp: '14:32:02', level: 'info', message: 'Broadcasting to 3 agents...' },
  { timestamp: '14:32:05', level: 'success', message: 'Received bid from Fast & Cheap: $0.15 (ETA: 2min, Confidence: 85%)' },
  { timestamp: '14:32:06', level: 'success', message: 'Received bid from Balanced: $0.45 (ETA: 5min, Confidence: 92%)' },
  { timestamp: '14:32:08', level: 'success', message: 'Received bid from High Quality: $0.75 (ETA: 8min, Confidence: 98%)' },
  { timestamp: '14:32:09', level: 'info', message: 'Evaluating bids using weighted scoring algorithm...' },
  { timestamp: '14:32:10', level: 'success', message: 'Selected: High Quality (final score: 9.2/10)' },
  { timestamp: '14:32:11', level: 'info', message: 'Initiating execution with selected agent...' },
  { timestamp: '14:32:15', level: 'info', message: 'Analyzing requirements and constraints...' },
  { timestamp: '14:32:22', level: 'info', message: 'Generating project structure and dependencies...' },
  { timestamp: '14:32:35', level: 'info', message: 'Implementing core components and layouts...' },
  { timestamp: '14:33:12', level: 'warning', message: 'Applied optimization suggestions for performance' },
  { timestamp: '14:33:28', level: 'info', message: 'Running validation checks...' },
  { timestamp: '14:33:45', level: 'success', message: 'Execution completed successfully! Output generated.' },
  { timestamp: '14:33:46', level: 'info', message: 'Processing payment transaction...' },
  { timestamp: '14:33:48', level: 'success', message: 'Payment successful: tx_9f8e7d6c5b4a3210' },
];

const mockPayments: Payment[] = [
  {
    txId: 'tx_9f8e7d6c5b4a3210',
    amount: 0.75,
    timestamp: 'Today at 2:33 PM',
    status: 'success',
  },
  {
    txId: 'tx_fedcba9876543210',
    amount: 0.45,
    timestamp: 'Today at 2:18 PM',
    status: 'success',
  },
];

export default function MarketplaceView() {
  const [activeJobId, setActiveJobId] = useState('1');

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
                      {mockJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          isActive={activeJobId === job.id}
                          onClick={() => {
                            console.log('Selected job:', job.id);
                            setActiveJobId(job.id);
                          }}
                        />
                      ))}
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
                  {mockBids.map((bid) => (
                    <AgentBidCard key={bid.agentId} bid={bid} />
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <ExecutionLog logs={mockLogs} />
              
              <Card className="rounded-xl border-card-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockPayments.map((payment) => (
                    <PaymentCard key={payment.txId} payment={payment} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
