import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <button className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -mx-3" data-testid="link-logo">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">Agentic Marketplace</span>
            </button>
          </Link>
          
          <div className="flex items-center gap-2">
            {location === "/" ? (
              <Link href="/marketplace">
                <Button variant="outline" size="default" data-testid="button-marketplace-view">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Marketplace View
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button variant="outline" size="default" data-testid="button-user-view">
                  <Sparkles className="w-4 h-4 mr-2" />
                  User View
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
