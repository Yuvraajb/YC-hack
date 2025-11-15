import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import UserView from "@/pages/user-view";
import MarketplaceView from "@/pages/marketplace-view";
import GeneralMarketplace from "@/pages/general-marketplace";
import AgentBuilder from "@/pages/agent-builder";
import NotFound from "@/pages/not-found";
import { Store, BarChart3, Hammer, Briefcase } from "lucide-react";

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
            <Link href="/builder">
              <Button 
                variant={location === "/builder" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
                data-testid="nav-builder"
              >
                <Hammer className="h-4 w-4" />
                Build Agent
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
          <Route path="/builder" component={AgentBuilder} />
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
