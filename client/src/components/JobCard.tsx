import { Card, CardContent, CardHeader } from "@/components/ui/card";
import StatusBadge, { type JobStatus } from "./StatusBadge";
import { Clock } from "lucide-react";

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
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" data-testid={`text-prompt-${job.id}`}>
            {job.prompt}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span data-testid={`text-timestamp-${job.id}`}>{job.timestamp}</span>
        </div>
        {job.selectedAgent && (
          <div className="mt-2 text-xs text-muted-foreground">
            Agent: <span className="text-foreground font-medium">{job.selectedAgent}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
