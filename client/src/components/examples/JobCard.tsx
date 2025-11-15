import JobCard from '../JobCard';
import { useState } from 'react';

export default function JobCardExample() {
  const [activeId, setActiveId] = useState('1');
  
  const mockJobs = [
    {
      id: '1',
      prompt: 'Create a landing page for a SaaS product',
      status: 'executing' as const,
      timestamp: '2 min ago',
      selectedAgent: 'High Quality',
    },
    {
      id: '2',
      prompt: 'Build a REST API for user management',
      status: 'completed' as const,
      timestamp: '15 min ago',
      selectedAgent: 'Balanced',
    },
    {
      id: '3',
      prompt: 'Write unit tests for authentication module',
      status: 'bidding' as const,
      timestamp: '1 min ago',
    },
  ];

  return (
    <div className="space-y-3 max-w-md">
      {mockJobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isActive={activeId === job.id}
          onClick={() => {
            console.log('Job clicked:', job.id);
            setActiveId(job.id);
          }}
        />
      ))}
    </div>
  );
}
