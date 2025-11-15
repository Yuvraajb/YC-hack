export interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
  bidBehavior: {
    basePrice: number;
    baseDuration: number; // in minutes
    confidenceRange: [number, number];
  };
  enabledTools: string[];
}

export const agents: Agent[] = [
  {
    id: "fast-cheap",
    name: "Fast & Cheap",
    systemPrompt: `You are a fast and efficient AI agent. Your approach prioritizes speed and cost-effectiveness. 
You deliver quick solutions using proven patterns and minimal complexity. 
While you maintain good quality standards, you optimize for rapid turnaround.
Keep responses concise and focused on core requirements.`,
    bidBehavior: {
      basePrice: 0.15,
      baseDuration: 2,
      confidenceRange: [80, 88],
    },
    enabledTools: ["WebSearch", "call_openrouter_model", "call_openrouter_chat"],
  },
  {
    id: "high-quality",
    name: "High Quality",
    systemPrompt: `You are a premium AI agent focused on delivering the highest quality solutions.
You perform comprehensive analysis, thorough validation, and apply best practices rigorously.
Your solutions are production-ready, well-documented, and optimized for maintainability.
You take the time needed to ensure excellence in every aspect of the deliverable.`,
    bidBehavior: {
      basePrice: 0.75,
      baseDuration: 8,
      confidenceRange: [95, 99],
    },
    enabledTools: ["WebSearch", "generate_image", "call_openrouter_model", "call_openrouter_chat", "Bash"],
  },
  {
    id: "balanced",
    name: "Balanced",
    systemPrompt: `You are a balanced AI agent offering the best of both worlds.
You deliver solid quality within reasonable timeframes and budgets.
Your approach combines efficiency with thoroughness, applying best practices where they matter most.
You optimize for practical value and reliable results.`,
    bidBehavior: {
      basePrice: 0.45,
      baseDuration: 5,
      confidenceRange: [90, 94],
    },
    enabledTools: ["WebSearch", "generate_image", "call_openrouter_model", "call_openrouter_chat"],
  },
];

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function generateBid(agent: Agent, promptComplexity: number = 1): {
  agentId: string;
  agentName: string;
  eta: string;
  price: number;
  confidence: number;
  plan: string;
} {
  const duration = Math.ceil(agent.bidBehavior.baseDuration * promptComplexity);
  const price = parseFloat((agent.bidBehavior.basePrice * promptComplexity).toFixed(2));
  const [minConf, maxConf] = agent.bidBehavior.confidenceRange;
  const confidence = Math.floor(Math.random() * (maxConf - minConf + 1)) + minConf;
  
  const eta = duration === 1 ? "1 min" : `${duration} min`;
  
  const plans = {
    "fast-cheap": "Quick execution using cached patterns and minimal validation. Fast turnaround with standard quality.",
    "high-quality": "Comprehensive analysis with multiple validation passes and optimization. Premium quality with thorough testing.",
    "balanced": "Balanced approach with thorough validation and efficient execution. Good quality at reasonable cost.",
  };
  
  return {
    agentId: agent.id,
    agentName: agent.name,
    eta,
    price,
    confidence,
    plan: plans[agent.id as keyof typeof plans],
  };
}

export function calculateBidScore(bid: {
  price: number;
  confidence: number;
  eta: string;
}): number {
  const etaMinutes = parseInt(bid.eta);
  
  const priceScore = Math.max(0, 10 - (bid.price * 10));
  const confidenceScore = bid.confidence / 10;
  const speedScore = Math.max(0, 10 - etaMinutes);
  
  const score = (confidenceScore * 0.5) + (priceScore * 0.3) + (speedScore * 0.2);
  
  return parseFloat(score.toFixed(1));
}
