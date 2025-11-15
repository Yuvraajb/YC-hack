import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, Calendar, CheckCircle, Loader2, Plug, Shield, Info, AlertTriangle,
  Github, Table, Briefcase, CreditCard, Phone, BookOpen, Kanban, Target,
  Inbox, Zap, Building, Cloud, PlayCircle, Headphones, CheckSquare,
  FolderOpen, Send, type LucideIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'productivity' | 'communication' | 'development' | 'business' | 'storage';
  usedByAgents: string[];
  permissions: string[];
  note?: string;
}

const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  {
    id: 'google-mail',
    name: 'Gmail',
    description: 'Send, receive, and manage Gmail messages',
    icon: Mail,
    category: 'communication',
    usedByAgents: ['Personal Assistant AI'],
    permissions: ['Read email metadata', 'Send emails', 'Manage labels'],
    note: '⚠️ Important: Gmail connector is missing the "gmail.readonly" scope needed to read inbox emails. Contact Replit support at replit.com/support to request this scope be added. Currently limited to sending emails and managing labels only.'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Manage Google Calendar events and settings',
    icon: Calendar,
    category: 'productivity',
    usedByAgents: ['Personal Assistant AI'],
    permissions: ['Read events', 'Create events', 'Manage calendars']
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Read and write data to Google Sheets',
    icon: Table,
    category: 'productivity',
    usedByAgents: [],
    permissions: ['Read spreadsheets', 'Write data', 'Create sheets']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    icon: CreditCard,
    category: 'business',
    usedByAgents: [],
    permissions: ['Create payments', 'Manage subscriptions', 'View transactions']
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send SMS messages and make voice calls',
    icon: Phone,
    category: 'communication',
    usedByAgents: [],
    permissions: ['Send SMS', 'Make calls', 'View messages']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Access and manage Notion workspaces and pages',
    icon: BookOpen,
    category: 'productivity',
    usedByAgents: [],
    permissions: ['Read pages', 'Create content', 'Update databases']
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Access repositories, users, and organizations',
    icon: Github,
    category: 'development',
    usedByAgents: [],
    permissions: ['Read repositories', 'Create issues', 'Manage pull requests']
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Access CRM objects, contacts, and deals',
    icon: Briefcase,
    category: 'business',
    usedByAgents: [],
    permissions: ['Read contacts', 'Manage deals', 'View analytics']
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Manage Jira work items and issues',
    icon: Kanban,
    category: 'development',
    usedByAgents: [],
    permissions: ['Read issues', 'Create tasks', 'Update status']
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Create and manage Linear issues and projects',
    icon: Target,
    category: 'development',
    usedByAgents: [],
    permissions: ['Read issues', 'Create tasks', 'Manage comments']
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Access and manage OneDrive files and folders',
    icon: Cloud,
    category: 'storage',
    usedByAgents: [],
    permissions: ['Read files', 'Upload files', 'Manage folders']
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Send/receive emails and manage Outlook calendar',
    icon: Inbox,
    category: 'communication',
    usedByAgents: [],
    permissions: ['Read emails', 'Send emails', 'Manage calendar']
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Send transactional emails',
    icon: Zap,
    category: 'communication',
    usedByAgents: [],
    permissions: ['Send emails', 'View analytics']
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Send transactional emails',
    icon: Send,
    category: 'communication',
    usedByAgents: [],
    permissions: ['Send emails', 'Manage templates', 'View stats']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Access CRM data and perform operations',
    icon: Building,
    category: 'business',
    usedByAgents: [],
    permissions: ['Read records', 'Create leads', 'Update opportunities']
  },
  {
    id: 'sharepoint',
    name: 'SharePoint',
    description: 'Read, write, and manage SharePoint sites and documents',
    icon: FolderOpen,
    category: 'storage',
    usedByAgents: [],
    permissions: ['Read documents', 'Upload files', 'Manage sites']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Upload, manage videos, channels, and analytics',
    icon: PlayCircle,
    category: 'communication',
    usedByAgents: [],
    permissions: ['Upload videos', 'Manage channels', 'View analytics']
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Read and write access to the Ticket API',
    icon: Headphones,
    category: 'business',
    usedByAgents: [],
    permissions: ['Read tickets', 'Create tickets', 'Update status']
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'Work with tasks, lists, and projects',
    icon: CheckSquare,
    category: 'productivity',
    usedByAgents: [],
    permissions: ['Read tasks', 'Create tasks', 'Update projects']
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

        <Alert className="mb-6 border-blue-500/20 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            <strong className="text-foreground">Connection status:</strong> Gmail and Google Calendar statuses are verified in real-time. 
            Other connectors show status based on Replit's connector naming (status may vary if connector slugs differ).
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
                          <CardTitle className="text-xl" data-testid={`text-connector-name-${connector.id}`}>{connector.name}</CardTitle>
                          {!isLoading && isConnected && (
                            <Badge variant="default" className="gap-1" data-testid={`badge-status-connected-${connector.id}`}>
                              <CheckCircle className="w-3 h-3" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <CardDescription data-testid={`text-description-${connector.id}`}>{connector.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" data-testid={`loader-status-${connector.id}`} />
                      ) : isConnected ? (
                        <Badge variant="default" className="gap-1" data-testid={`badge-status-active-${connector.id}`}>
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
                    {connector.note && (
                      <Alert className="border-yellow-500/20 bg-yellow-500/5" data-testid={`alert-note-${connector.id}`}>
                        <Info className="h-4 w-4 text-yellow-500" />
                        <AlertDescription className="text-sm">{connector.note}</AlertDescription>
                      </Alert>
                    )}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Category</h4>
                      <Badge variant="outline" className="capitalize" data-testid={`badge-category-${connector.id}`}>{connector.category}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {connector.permissions.map((permission, index) => (
                          <Badge key={permission} variant="outline" data-testid={`badge-permission-${connector.id}-${index}`}>
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {connector.usedByAgents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Used by Agents</h4>
                        <div className="flex flex-wrap gap-2">
                          {connector.usedByAgents.map((agent, index) => (
                            <Badge key={agent} variant="secondary" data-testid={`badge-agent-${connector.id}-${index}`}>
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
