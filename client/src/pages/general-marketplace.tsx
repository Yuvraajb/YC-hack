import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Zap, DollarSign, Tag, Search } from "lucide-react";
import { useState } from "react";
import type { MarketplaceAgent } from "@shared/schema";

export default function GeneralMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: agents = [], isLoading } = useQuery<MarketplaceAgent[]>({
    queryKey: ["/api/marketplace/agents"],
  });

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || agent.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(agents.map(a => a.category)))];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">Agent Marketplace</h1>
          <p className="text-muted-foreground text-lg">Discover AI agents built by developers worldwide</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card 
                key={agent.id} 
                className="hover-elevate transition-all cursor-pointer"
                data-testid={`card-agent-${agent.id}`}
              >
                <CardHeader className="space-y-0 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="text-xl" data-testid={`text-agent-name-${agent.id}`}>
                      {agent.name}
                    </CardTitle>
                    {agent.averageRating && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        <span data-testid={`text-rating-${agent.id}`}>
                          {agent.averageRating.toFixed(1)}
                        </span>
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="w-fit mb-3">
                    {agent.category}
                  </Badge>
                  <CardDescription className="line-clamp-2">
                    {agent.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>Price Range</span>
                    </div>
                    <span className="font-medium" data-testid={`text-price-${agent.id}`}>
                      ${agent.minPrice} - ${agent.maxPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Jobs Completed</span>
                    </div>
                    <span className="font-medium">{agent.totalJobs}</span>
                  </div>

                  {agent.tags && agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {agent.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                      {agent.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    variant="default"
                    data-testid={`button-view-agent-${agent.id}`}
                  >
                    View Agent
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredAgents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No agents found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
