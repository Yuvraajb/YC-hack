import { Badge } from "@/components/ui/badge";

export type JobStatus = "pending" | "bidding" | "executing" | "completed" | "paid";

interface StatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  bidding: { label: "Bidding", className: "bg-chart-4 text-background" },
  executing: { label: "Executing", className: "bg-chart-2 text-background" },
  completed: { label: "Completed", className: "bg-chart-5 text-background" },
  paid: { label: "Paid", className: "bg-primary text-primary-foreground" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      className={`${config.className} rounded-full px-3 py-1 text-xs font-medium`}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
