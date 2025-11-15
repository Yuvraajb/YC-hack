import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import UserView from "@/pages/user-view";
import MarketplaceView from "@/pages/marketplace-view";
import GeneralMarketplace from "@/pages/general-marketplace";
import MyAgents from "@/pages/my-agents";
import AgentBuilder from "@/pages/agent-builder";
import CustomCodeBuilder from "@/pages/custom-code-builder";
import Connectors from "@/pages/connectors";
import NotFound from "@/pages/not-found";
import { Store, BarChart3, Briefcase, FolderCog, Plug } from "lucide-react";

function Router() {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
          <Link href="/">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent cursor-pointer">
              Agentic Marketplace
            </span>
          </Link>
          <div className="flex gap-2 ml-auto">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-user-view"
              >
                <Briefcase className="h-4 w-4" />
                User View
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button 
                variant={location === "/marketplace" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-marketplace"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/agents">
              <Button 
                variant={location === "/agents" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-agents"
              >
                <Store className="h-4 w-4" />
                Browse Agents
              </Button>
            </Link>
            <Link href="/my-agents">
              <Button 
                variant={location === "/my-agents" || location.startsWith("/builder") ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-my-agents"
              >
                <FolderCog className="h-4 w-4" />
                My Agents
              </Button>
            </Link>
            <Link href="/connectors">
              <Button 
                variant={location === "/connectors" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-connectors"
              >
                <Plug className="h-4 w-4" />
                Connectors
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      
      <div className="flex-1">
        <Switch>
          <Route path="/" component={UserView} />
          <Route path="/marketplace" component={MarketplaceView} />
          <Route path="/agents" component={GeneralMarketplace} />
          <Route path="/my-agents" component={MyAgents} />
          <Route path="/builder/ai" component={AgentBuilder} />
          <Route path="/builder/code" component={CustomCodeBuilder} />
          <Route path="/connectors" component={Connectors} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
