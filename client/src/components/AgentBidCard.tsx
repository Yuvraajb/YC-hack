import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, DollarSign } from "lucide-react";
import { useState } from "react";

export interface AgentBid {
  agentId: string;
  agentName: string;
  eta: string;
  price: number;
  confidence: number;
  plan: string;
  isWinner?: boolean;
}

interface AgentBidCardProps {
  bid: AgentBid;
}

export default function AgentBidCard({ bid }: AgentBidCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <Card 
      className={`rounded-xl transition-all ${
        bid.isWinner 
          ? 'border-primary shadow-lg scale-[1.02]' 
          : 'border-card-border hover-elevate'
      }`}
      data-testid={`card-agent-${bid.agentId}`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-medium">{bid.agentName}</CardTitle>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          ${bid.price.toFixed(2)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>ETA</span>
            </div>
            <div className="text-lg font-semibold" data-testid={`text-eta-${bid.agentId}`}>
              {bid.eta}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>Confidence</span>
            </div>
            <div className="text-lg font-semibold" data-testid={`text-confidence-${bid.agentId}`}>
              {bid.confidence}%
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover-elevate active-elevate-2 rounded-md px-2 py-1 -mx-2"
            data-testid={`button-toggle-plan-${bid.agentId}`}
          >
            {isExpanded ? 'Hide' : 'View'} Execution Plan
          </button>
          {isExpanded && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border">
              {bid.plan}
            </div>
          )}
        </div>
        
        {bid.isWinner && (
          <div className="flex items-center gap-2 text-sm font-medium text-primary pt-2 border-t border-primary/20">
            <DollarSign className="w-4 h-4" />
            <span>Selected Winner</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
