import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  txId: string;
  amount: number;
  timestamp: string;
  status: "success" | "pending" | "failed";
}

interface PaymentCardProps {
  payment: Payment;
}

export default function PaymentCard({ payment }: PaymentCardProps) {
  const { toast } = useToast();
  
  const copyTxId = () => {
    navigator.clipboard.writeText(payment.txId);
    toast({
      title: "Copied!",
      description: "Transaction ID copied to clipboard",
    });
  };
  
  return (
    <Card className="rounded-xl border-card-border" data-testid={`card-payment-${payment.txId}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-chart-5" />
          <span>Payment Successful</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-3xl font-bold text-foreground" data-testid="text-amount">
            ${payment.amount.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {payment.timestamp}
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">Transaction ID</div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={copyTxId}
              data-testid="button-copy-txid"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <div 
            className="font-mono text-xs text-foreground break-all"
            data-testid="text-txid"
          >
            {payment.txId}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
