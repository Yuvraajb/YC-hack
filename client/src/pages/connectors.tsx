import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, CheckCircle, AlertCircle, Loader2, Plug } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: typeof Mail;
  status: 'connected' | 'disconnected' | 'checking';
  usedByAgents: string[];
  permissions: string[];
}

export default function Connectors() {
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: 'google-mail',
      name: 'Gmail',
      description: 'Read and manage your Gmail messages',
      icon: Mail,
      status: 'checking',
      usedByAgents: ['Personal Assistant AI'],
      permissions: [
        'Read emails',
        'Send emails',
        'Manage labels'
      ]
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Access and manage your calendar events',
      icon: Calendar,
      status: 'checking',
      usedByAgents: ['Personal Assistant AI'],
      permissions: [
        'Read events',
        'Create events',
        'Manage calendars'
      ]
    }
  ]);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkConnectorStatus();
  }, []);

  const checkConnectorStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/connectors/status');
      const data = await response.json();
      
      setConnectors(prev => prev.map(connector => ({
        ...connector,
        status: data[connector.id] ? 'connected' : 'disconnected'
      })));
    } catch (error) {
      console.error('Error checking connector status:', error);
      setConnectors(prev => prev.map(c => ({ ...c, status: 'disconnected' })));
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async (connectorId: string) => {
    try {
      const response = await fetch(`/api/connectors/${connectorId}/authorize`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Open OAuth flow in popup
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.authUrl,
          'oauth-popup',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Poll for completion
        const pollInterval = setInterval(() => {
          if (popup?.closed) {
            clearInterval(pollInterval);
            checkConnectorStatus();
            toast({
              title: "Authorization Complete",
              description: "Please check if the connection was successful.",
            });
          }
        }, 1000);
      } else if (data.instructions) {
        // Show instructions for manual authorization
        toast({
          title: "Authorization Required",
          description: data.message,
          duration: 10000,
        });
        
        // For now, show a helpful message
        alert(`To connect ${connectorId}:\n\n${data.instructions.join('\n')}\n\nNote: We're working on making this process fully automated within the app.`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate authorization",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Connectors</h1>
          </div>
          <p className="text-muted-foreground">
            Connect your accounts to enable AI agents to access your data and perform actions on your behalf
          </p>
        </div>

        {isChecking && (
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking connection status...</span>
          </div>
        )}

        <div className="grid gap-6">
          {connectors.map((connector) => {
            const Icon = connector.icon;
            const isConnected = connector.status === 'connected';
            const isChecking = connector.status === 'checking';

            return (
              <Card key={connector.id} data-testid={`connector-${connector.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{connector.name}</CardTitle>
                          {isConnected && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Connected
                            </Badge>
                          )}
                          {connector.status === 'disconnected' && (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{connector.description}</CardDescription>
                      </div>
                    </div>
                    {!isChecking && (
                      <Button
                        onClick={() => handleConnect(connector.id)}
                        disabled={isConnected}
                        variant={isConnected ? "secondary" : "default"}
                        data-testid={`button-connect-${connector.id}`}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {connector.permissions.map((permission) => (
                          <Badge key={permission} variant="outline">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {connector.usedByAgents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Used by Agents</h4>
                        <div className="flex flex-wrap gap-2">
                          {connector.usedByAgents.map((agent) => (
                            <Badge key={agent} variant="secondary">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-lg bg-muted">
          <h3 className="font-medium mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Connect your accounts once - all agents can access them</li>
            <li>• OAuth tokens are managed securely by Replit</li>
            <li>• Tokens auto-refresh - you never need to reconnect</li>
            <li>• You can disconnect anytime to revoke access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
