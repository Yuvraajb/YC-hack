import ExecutionLog from '../ExecutionLog';

export default function ExecutionLogExample() {
  const mockLogs = [
    { timestamp: '14:32:01', level: 'info' as const, message: 'Job received: Create a landing page' },
    { timestamp: '14:32:02', level: 'info' as const, message: 'Broadcasting to 3 agents...' },
    { timestamp: '14:32:05', level: 'success' as const, message: 'Received bid from Fast & Cheap: $0.15' },
    { timestamp: '14:32:06', level: 'success' as const, message: 'Received bid from Balanced: $0.45' },
    { timestamp: '14:32:08', level: 'success' as const, message: 'Received bid from High Quality: $0.75' },
    { timestamp: '14:32:09', level: 'info' as const, message: 'Selecting best agent based on score...' },
    { timestamp: '14:32:10', level: 'success' as const, message: 'Selected: High Quality (score: 9.2/10)' },
    { timestamp: '14:32:11', level: 'info' as const, message: 'Starting execution...' },
    { timestamp: '14:32:15', level: 'info' as const, message: 'Analyzing requirements...' },
    { timestamp: '14:32:22', level: 'info' as const, message: 'Generating code structure...' },
    { timestamp: '14:32:35', level: 'info' as const, message: 'Implementing components...' },
    { timestamp: '14:33:12', level: 'warning' as const, message: 'Optimization suggestions applied' },
    { timestamp: '14:33:45', level: 'success' as const, message: 'Execution completed successfully!' },
    { timestamp: '14:33:46', level: 'info' as const, message: 'Processing payment...' },
    { timestamp: '14:33:48', level: 'success' as const, message: 'Payment successful: tx_9f8e7d6c5b4a' },
  ];

  return (
    <div className="max-w-2xl">
      <ExecutionLog logs={mockLogs} />
    </div>
  );
}
