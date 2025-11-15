import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";

export interface LogEntry {
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}

interface ExecutionLogProps {
  logs: LogEntry[];
  title?: string;
}

const levelColors = {
  info: "text-chart-2",
  success: "text-chart-5",
  warning: "text-chart-4",
  error: "text-destructive",
};

export default function ExecutionLog({ logs, title = "Execution Logs" }: ExecutionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);
  
  return (
    <Card className="rounded-xl border-card-border" data-testid="card-execution-log">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-96 w-full rounded-lg bg-muted/30 border border-border">
          <div className="p-4 font-mono text-xs space-y-2" ref={scrollRef}>
            {logs.length === 0 ? (
              <div className="text-muted-foreground italic">No logs yet...</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-3" data-testid={`log-entry-${idx}`}>
                  <span className="text-muted-foreground shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span className={`${levelColors[log.level]} shrink-0 uppercase font-semibold`}>
                    {log.level}:
                  </span>
                  <span className="text-foreground break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
