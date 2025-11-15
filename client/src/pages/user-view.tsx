import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Send, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ExecutionLog {
  level: string;
  message: string;
  timestamp: string;
}

export default function UserView() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for execution logs
  useEffect(() => {
    if (!currentJobId || !isExecuting) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const pollLogs = async () => {
      try {
        const response = await fetch(`/api/jobs/${currentJobId}`);
        const job = await response.json();

        // Fetch logs
        const logsResponse = await fetch(`/api/jobs/${currentJobId}/logs`);
        const logs: ExecutionLog[] = await logsResponse.json();

        // Update messages with logs
        if (logs.length > 0) {
          const lastLog = logs[logs.length - 1];
          
          setMessages(prev => {
            // Check if we already have this log
            const hasLog = prev.some(m => m.content.includes(lastLog.message));
            if (!hasLog) {
              return [...prev, {
                id: `log-${Date.now()}`,
                type: 'system',
                content: lastLog.message,
                timestamp: new Date()
              }];
            }
            return prev;
          });
        }

        // Check if job is complete
        if (job.output && job.status === 'completed') {
          setMessages(prev => [...prev, {
            id: `output-${Date.now()}`,
            type: 'assistant',
            content: job.output,
            timestamp: new Date()
          }]);

          setIsExecuting(false);
          setCurrentJobId(null);

          toast({
            title: "Complete",
            description: "Your task has been completed!",
          });
        }
      } catch (error) {
        console.error('Error polling logs:', error);
      }
    };

    // Poll every 1 second
    pollingIntervalRef.current = setInterval(pollLogs, 1000);
    pollLogs(); // Initial poll

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [currentJobId, isExecuting, toast]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    const currentPrompt = prompt;
    setPrompt("");
    setIsExecuting(true);

    try {
      // Create job
      const jobRes = await apiRequest("POST", "/api/jobs", { 
        prompt: currentPrompt, 
        status: "pending" 
      });
      const job = await jobRes.json();
      setCurrentJobId(job.id);

      // Add system message
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        type: 'system',
        content: 'Finding the best agent for your task...',
        timestamp: new Date()
      }]);

      // Generate bids
      await apiRequest("POST", `/api/jobs/${job.id}/bids`);

      // Select best agent
      const selectRes = await apiRequest("POST", `/api/jobs/${job.id}/select`);
      const { selectedBid } = await selectRes.json();

      setMessages(prev => [...prev, {
        id: `agent-${Date.now()}`,
        type: 'system',
        content: `Selected agent: ${selectedBid.agentName} ($${selectedBid.price})`,
        timestamp: new Date()
      }]);

      // Execute agent (this will be tracked via polling)
      setMessages(prev => [...prev, {
        id: `exec-${Date.now()}`,
        type: 'system',
        content: 'Agent is working on your task...',
        timestamp: new Date()
      }]);

      await apiRequest("POST", `/api/jobs/${job.id}/execute`);

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'system',
        content: `Error: ${error.message || "Failed to process task"}`,
        timestamp: new Date()
      }]);
      setIsExecuting(false);
      setCurrentJobId(null);
      
      toast({
        title: "Error",
        description: error.message || "Failed to process task",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Show initial centered UI if no messages
  if (messages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
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
            <div className="relative">
              <Textarea
                placeholder="Describe your task... (e.g., Summarize my Gmail and Calendar)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-32 resize-none text-base rounded-xl pr-12"
                data-testid="input-prompt"
                autoFocus
              />
              <Button
                onClick={handleSubmit}
                disabled={isExecuting || !prompt.trim()}
                size="icon"
                className="absolute bottom-3 right-3 rounded-lg"
                data-testid="button-submit"
              >
                {isExecuting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface when messages exist
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-semibold">AI Agent Marketplace</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type !== 'user' && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'assistant' ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {message.type === 'assistant' ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              )}
              
              <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                <Card className={`p-4 ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : message.type === 'assistant'
                    ? 'bg-card'
                    : 'bg-muted/50'
                }`}>
                  <div className={`text-sm whitespace-pre-wrap ${
                    message.type === 'system' ? 'text-muted-foreground' : ''
                  }`}>
                    {message.content}
                  </div>
                </Card>
              </div>

              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          
          {isExecuting && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <Card className="p-4 bg-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Working on it...</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input at bottom */}
      <div className="border-t bg-card/50 backdrop-blur sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative">
            <Textarea
              placeholder="Send a message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              className="resize-none pr-12 min-h-[60px]"
              data-testid="input-chat"
              disabled={isExecuting}
            />
            <Button
              onClick={handleSubmit}
              disabled={isExecuting || !prompt.trim()}
              size="icon"
              className="absolute bottom-2 right-2 rounded-lg"
              data-testid="button-send"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
