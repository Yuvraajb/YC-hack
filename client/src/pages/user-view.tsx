import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AgentBidCard, { type AgentBid } from "@/components/AgentBidCard";
import PaymentCard, { type Payment } from "@/components/PaymentCard";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserView() {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobResult, setJobResult] = useState<{
    selectedAgent: AgentBid;
    output: string;
    payment: Payment;
  } | null>(null);
  const { toast } = useToast();

  const handleCreateJob = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Creating job with prompt:', prompt);
    
    // todo: remove mock functionality - simulate job creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult = {
      selectedAgent: {
        agentId: 'quality',
        agentName: 'High Quality',
        eta: '8 min',
        price: 0.75,
        confidence: 98,
        plan: 'Comprehensive analysis with multiple validation passes and optimization.',
        isWinner: true,
      },
      output: `# Task Completed: ${prompt}\n\nI've analyzed your requirements and implemented a comprehensive solution. The approach includes:\n\n1. **Architecture Design**: Created a scalable, maintainable structure\n2. **Implementation**: Built core functionality with best practices\n3. **Testing**: Validated all edge cases and scenarios\n4. **Optimization**: Applied performance improvements\n\nThe solution is production-ready and follows industry standards.`,
      payment: {
        txId: `tx_${Math.random().toString(36).substr(2, 9)}`,
        amount: 0.75,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        status: 'success' as const,
      },
    };
    
    setJobResult(mockResult);
    setIsSubmitting(false);
    setPrompt("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pb-12">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <section className="min-h-[calc(100vh-4rem-3rem)] flex flex-col justify-center py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold mb-4">
                AI Agent Marketplace
              </h1>
              <p className="text-lg text-muted-foreground">
                Describe your task and let our AI agents compete to deliver the best solution
              </p>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder="Describe your task... (e.g., Create a landing page for my SaaS product)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 resize-none text-base rounded-xl"
                data-testid="input-prompt"
              />
              
              <Button
                onClick={handleCreateJob}
                disabled={isSubmitting || !prompt.trim()}
                size="lg"
                className="w-full md:w-auto md:px-8"
                data-testid="button-create-job"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Job...
                  </>
                ) : (
                  'Create Job'
                )}
              </Button>
            </div>
          </section>

          {jobResult && (
            <section className="space-y-8 pb-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Selected Agent</h2>
                <AgentBidCard bid={jobResult.selectedAgent} />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Output</h2>
                <Card className="rounded-xl border-card-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-foreground">
                        {jobResult.output}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Payment Receipt</h2>
                <PaymentCard payment={jobResult.payment} />
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
