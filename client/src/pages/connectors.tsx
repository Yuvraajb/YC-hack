import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Calendar, CheckCircle, Loader2, Plug, Shield, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  icon: typeof Mail;
  usedByAgents: string[];
  permissions: string[];
}

const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  {
    id: 'google-mail',
    name: 'Gmail',
    description: 'Read and manage your Gmail messages',
    icon: Mail,
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
    usedByAgents: ['Personal Assistant AI'],
    permissions: [
      'Read events',
      'Create events',
      'Manage calendars'
    ]
  }
];

export default function Connectors() {
  const { toast } = useToast();

  const { data: connectorStatus, isLoading, error, refetch } = useQuery<Record<string, boolean>>({
    queryKey: ['/api/connectors/status'],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load connector status. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const openReplitConnectors = () => {
    toast({
      title: "Opening Replit Connectors",
      description: "Look for the Connectors panel in your Replit workspace",
      duration: 5000,
    });
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
            Connect your accounts once - all marketplace agents can use them
          </p>
        </div>

        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong className="text-foreground">Authorize once, access everywhere.</strong> When you connect via Replit, 
            all agents in the marketplace automatically get access to your authorized services. Your tokens are managed 
            securely by Replit and auto-refresh when needed.
          </AlertDescription>
        </Alert>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking connection status...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load connector status. Please try again.</span>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="ml-4"
                data-testid="button-retry-status"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {CONNECTOR_DEFINITIONS.map((connector) => {
            const Icon = connector.icon;
            const isConnected = connectorStatus?.[connector.id] === true;

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
                          {!isLoading && isConnected && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{connector.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : isConnected ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Button
                          onClick={openReplitConnectors}
                          variant="default"
                          size="sm"
                          data-testid={`button-connect-${connector.id}`}
                        >
                          Connect via Replit
                        </Button>
                      )}
                    </div>
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

        <Alert className="mt-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <h3 className="font-medium mb-2">How Connectors Work</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex gap-2">
                <span>1.</span>
                <span>Click "Connect via Replit" and authorize in the Replit Connectors panel (one-time setup)</span>
              </li>
              <li className="flex gap-2">
                <span>2.</span>
                <span>All agents in the marketplace automatically inherit your authorization</span>
              </li>
              <li className="flex gap-2">
                <span>3.</span>
                <span>Tokens are managed and auto-refreshed by Replit - no maintenance needed</span>
              </li>
              <li className="flex gap-2">
                <span>4.</span>
                <span>When an agent runs, it uses your authorized credentials to access your data</span>
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
