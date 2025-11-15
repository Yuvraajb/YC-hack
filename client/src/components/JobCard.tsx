import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock } from "lucide-react";

export type JobStatus = "pending" | "bidding" | "executing" | "completed" | "paid";

export interface Job {
  id: string;
  prompt: string;
  status: JobStatus;
  timestamp: string;
  selectedAgent?: string;
}

interface JobCardProps {
  job: Job;
  isActive?: boolean;
  onClick?: () => void;
}

export default function JobCard({ job, isActive, onClick }: JobCardProps) {
  return (
    <Card
      className={`rounded-xl cursor-pointer transition-all ${
        isActive 
          ? 'border-primary shadow-md' 
          : 'border-card-border hover-elevate'
      }`}
      onClick={onClick}
      data-testid={`card-job-${job.id}`}
    >
      <CardHeader className="pb-4">
        <p className="text-sm font-medium leading-relaxed" data-testid={`text-prompt-${job.id}`}>
          {job.prompt}
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span data-testid={`text-timestamp-${job.id}`}>{job.timestamp}</span>
        </div>
        {job.selectedAgent && (
          <div className="text-xs text-muted-foreground">
            Agent: <span className="text-foreground font-medium">{job.selectedAgent}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
