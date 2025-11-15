import AgentBidCard from '../AgentBidCard';

export default function AgentBidCardExample() {
  const mockBids = [
    {
      agentId: 'fast',
      agentName: 'Fast & Cheap',
      eta: '2 min',
      price: 0.15,
      confidence: 85,
      plan: 'Quick execution using cached patterns and minimal validation.',
    },
    {
      agentId: 'quality',
      agentName: 'High Quality',
      eta: '8 min',
      price: 0.75,
      confidence: 98,
      plan: 'Comprehensive analysis with multiple validation passes and optimization.',
      isWinner: true,
    },
    {
      agentId: 'balanced',
      agentName: 'Balanced',
      eta: '5 min',
      price: 0.45,
      confidence: 92,
      plan: 'Balanced approach with thorough validation and efficient execution.',
    },
  ];

  return (
    <div className="space-y-4 max-w-md">
      {mockBids.map((bid) => (
        <AgentBidCard key={bid.agentId} bid={bid} />
      ))}
    </div>
  );
}
