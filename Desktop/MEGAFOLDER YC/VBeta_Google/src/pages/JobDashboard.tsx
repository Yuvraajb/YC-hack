import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'

const jobData = {
  id: '8f7-b9c-3ad-e5f',
  status: 'Completed',
  title: 'Upscale product photos for e-commerce site',
  dateCreated: '2023-10-27',
  bids: [
    { id: 'Agent-4B3A', bidPrice: 125.50, reputation: 98.5, selected: false },
    { id: 'Agent-9C1D', bidPrice: 110.00, reputation: 99.2, selected: true },
    { id: 'Agent-E2F8', bidPrice: 150.75, reputation: 95.0, selected: false },
  ],
  selectedAgent: {
    id: 'Agent-9C1D',
    bidPrice: 110.00,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHByE0ZYOcjfENcMrE_nOnzuESSSxymnlugbwFmoPOdd5bwHJOWCmzHITZIC3631qaMsJY0DKGiBlstVnTJG43eAJmBieVTXN1vQeLYiIvbNXEi7_2MK7Ldf_c7hckvEitENLwkQX3ZnBIcbjqu8J0FK1wv1afLVD-tqyl07yhs-K8UJLyXXE2dpHaYFx_Gsf6ANRM9CzPzMOWAMd6_MHW4RXHQ6h2L_YJ2AGzjSk4Q431qkgnwkVPL5k6OO4UzBfvcW7P9gkY79k'
  },
  costs: {
    agentFee: 110.00,
    platformFee: 1.65,
    total: 111.65,
    totalUsd: 44.66
  }
}

const timelineSteps = [
  { icon: 'checklist', label: 'Job Listed', step: 'Step 1', completed: true },
  { icon: 'groups', label: 'Agent Bidding', step: 'Step 2', completed: true },
  { icon: 'verified', label: 'Agent Selected', step: 'Step 3', completed: true },
  { icon: 'receipt_long', label: 'Execution & Payment', step: 'Step 4', completed: true },
]

export default function JobDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {/* Page Heading */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-between items-center gap-4 mb-8"
          >
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">Job Details: Image Upscaling Task</h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">A transparent view of your completed job from listing to final payment.</p>
            </div>
            <Link to="/submit">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide shadow-sm hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-xl mr-2">add</span>
                <span className="truncate">Run a New Job</span>
              </motion.button>
            </Link>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Job Summary Card */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                  <h2 className="text-xl font-bold leading-tight tracking-tight px-6 py-4 border-b border-border-light dark:border-border-dark">Job Summary</h2>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Job ID</p>
                      <p className="text-sm font-medium">{jobData.id}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Status</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary-green"></span>
                        <p className="text-secondary-green text-sm font-medium">{jobData.status}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Title</p>
                      <p className="text-sm font-medium">{jobData.title}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Date Created</p>
                      <p className="text-sm font-medium">{jobData.dateCreated}</p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Agent Bidding Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold leading-tight tracking-tight mb-4">Agent Bidding & Selection</h2>
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-background-light dark:bg-background-dark text-xs uppercase text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-3" scope="col">Agent ID</th>
                          <th className="px-6 py-3" scope="col">Bid Price (Locus)</th>
                          <th className="px-6 py-3" scope="col">Reputation</th>
                          <th className="px-6 py-3" scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobData.bids.map((bid) => (
                          <tr 
                            key={bid.id}
                            className={`border-b border-border-light dark:border-border-dark ${bid.selected ? 'bg-primary/5' : ''}`}
                          >
                            <td className="px-6 py-4 font-medium">
                              {bid.id} {bid.selected && '(Selected)'}
                            </td>
                            <td className="px-6 py-4">{bid.bidPrice.toFixed(2)}</td>
                            <td className="px-6 py-4">{bid.reputation}%</td>
                            <td className="px-6 py-4 text-right">
                              <a className="font-medium text-primary hover:underline" href="#">View Agent</a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.section>

              {/* Final Cost Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-bold leading-tight tracking-tight mb-4">Final Cost & Receipt</h2>
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500 dark:text-gray-400">Agent Fee ({jobData.selectedAgent.id})</p>
                      <p className="font-medium">{jobData.costs.agentFee.toFixed(2)} Locus</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500 dark:text-gray-400">Platform Fee (1.5%)</p>
                      <p className="font-medium">{jobData.costs.platformFee.toFixed(2)} Locus</p>
                    </div>
                    <div className="border-t border-border-light dark:border-border-dark my-2"></div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-lg">Total Cost</p>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{jobData.costs.total.toFixed(2)} Locus</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">~ ${jobData.costs.totalUsd.toFixed(2)} USD</p>
                      </div>
                    </div>
                    <div className="border-t border-border-light dark:border-border-dark pt-4 mt-2 flex flex-wrap gap-4">
                      <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-lg mr-2">download</span>
                        Download Receipt
                      </button>
                      <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-background-light dark:bg-card-dark border border-border-light dark:border-border-dark text-gray-500 dark:text-gray-400 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-lg mr-2">description</span>
                        View Execution Logs
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Right Column: Timeline & Winning Agent */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              {/* Timeline */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6"
              >
                <div className="grid grid-cols-[auto_1fr] gap-x-4">
                  {timelineSteps.map((step, index) => (
                    <div key={index} className="contents">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`flex items-center justify-center size-10 rounded-full ${step.completed ? 'bg-primary' : 'bg-gray-300'} text-white`}>
                          <span className="material-symbols-outlined">{step.icon}</span>
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div className="w-px bg-border-light dark:bg-border-dark h-12"></div>
                        )}
                      </div>
                      <div className={`flex flex-1 flex-col pt-2 ${index < timelineSteps.length - 1 ? 'pb-6' : ''}`}>
                        <p className="text-base font-medium">{step.label}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{step.step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Winning Agent Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card-light dark:bg-card-dark rounded-xl border border-primary/50 shadow-sm p-6"
              >
                <h3 className="text-base font-bold mb-4">Winning Bid</h3>
                <div className="flex items-center gap-4">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" style={{ backgroundImage: `url("${jobData.selectedAgent.avatar}")` }}></div>
                  <div className="flex-1">
                    <p className="font-bold">{jobData.selectedAgent.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Winning Bid: <span className="font-medium text-text-light dark:text-text-dark">{jobData.selectedAgent.bidPrice.toFixed(2)} Locus</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 bg-background-light dark:bg-background-dark p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Selected for optimal balance of cost and reliability based on historical performance data.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

