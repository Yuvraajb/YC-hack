import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

type Priority = 'cost-saver' | 'balanced' | 'max-quality'
type TaskState = 'idle' | 'processing' | 'completed'

interface TaskResult {
  title: string
  content: string
}

export default function TaskSubmission() {
  const [prompt, setPrompt] = useState('')
  const [priority, setPriority] = useState<Priority>('balanced')
  const [taskState, setTaskState] = useState<TaskState>('idle')
  const [result, setResult] = useState<TaskResult | null>(null)

  const handleSubmit = () => {
    if (!prompt.trim()) return
    
    setTaskState('processing')
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        title: 'Summary of Quantum Computing Advancements',
        content: `In the past month, the field of quantum computing has seen significant strides, particularly in qubit stability and error correction. Researchers at QuantumLeap Inc. announced a breakthrough in maintaining qubit coherence for over 100 microseconds, a substantial increase from previous records. This was achieved using a novel magnetic shielding technique.

Furthermore, a team from the University of Tech demonstrated a new error-correction code capable of detecting and rectifying both bit-flip and phase-flip errors simultaneously, which is a critical step towards building fault-tolerant quantum computers. The algorithm, named 'Cerberus Code,' is expected to be adopted by major hardware developers.

Key Highlights:
• Qubit Stability: Coherence extended to over 100 microseconds by QuantumLeap Inc.
• Error Correction: New 'Cerberus Code' developed for simultaneous error detection.
• Hardware Integration: Startups are now focusing on integrating these new techniques into scalable quantum processor architectures.

These advancements signal a rapid acceleration in the race to build a commercially viable quantum computer, with potential impacts on fields ranging from cryptography to drug discovery.`
      })
      setTaskState('completed')
    }, 3000)
  }

  const handleNewTask = () => {
    setPrompt('')
    setTaskState('idle')
    setResult(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="border-b border-border-light dark:border-border-dark px-4 sm:px-6 lg:px-8 bg-card-light dark:bg-card-dark/50">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="text-primary size-6">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                  <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-bold">AI Agent Platform</h2>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="hidden sm:block text-sm font-medium hover:text-primary">My Jobs</Link>
              <Link to="/marketplace" className="hidden sm:block text-sm font-medium hover:text-primary">Marketplace</Link>
              <Link to="/developer" className="hidden sm:block text-sm font-medium hover:text-primary">Developer</Link>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuATCIv5hplAghB95qfNZxchmy-LiHEl3FpYo9V_scqGbp8rxV0-FwWkfWhwJ81VVPrvs2GssRgobExdy10VrWthjFTMUJAkcaFCQxdXTQKMIRUvIEMsVksKeLK6V80uk5wzeM7Reof-zsObXtoCkj5xJPeNBXcX-wzNy5_jbVVW3RHHpIlN0Caix5ab9PcRxb_c-O5UYXTt7iAUNx7KgkVn7gIFP5D7NIRB-SvmTU2gRIrnoh1O7tzBwtesVKZqwPTsao-pUnKhPio")' }}></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            {/* Page Heading */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight">Create a New Agent Task</h1>
            </div>

            {/* Prompt Input */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold tracking-tight">Your Prompt</h2>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-primary border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark min-h-48 placeholder:text-gray-400 p-4 text-base" 
                placeholder="Describe the task for the AI agent... For example: 'Summarize the latest advancements in quantum computing from the past month.'"
              />
            </div>

            {/* Priority Selection */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold tracking-tight">Select Priority</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Cost Saver Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPriority('cost-saver')}
                  className={`group cursor-pointer rounded-xl border-2 p-4 flex flex-col items-start gap-3 transition-colors ${
                    priority === 'cost-saver' 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">savings</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold">Cost Saver</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lowest cost, basic results.</p>
                  </div>
                </motion.div>

                {/* Balanced Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPriority('balanced')}
                  className={`group cursor-pointer rounded-xl border-2 p-4 flex flex-col items-start gap-3 transition-colors ${
                    priority === 'balanced' 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">balance</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold">Balanced</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Good quality and speed.</p>
                  </div>
                </motion.div>

                {/* Max Quality Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPriority('max-quality')}
                  className={`group cursor-pointer rounded-xl border-2 p-4 flex flex-col items-start gap-3 transition-colors ${
                    priority === 'max-quality' 
                      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
                      : 'border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-center size-10 rounded-lg bg-primary/20 text-primary">
                    <span className="material-symbols-outlined">diamond</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold">Max Quality</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Highest quality, slower task.</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action Button */}
            <div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!prompt.trim() || taskState === 'processing'}
                className="w-full sm:w-auto flex items-center justify-center rounded-lg h-12 bg-primary text-white gap-2 text-base font-bold px-8 hover:bg-primary/90 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <span>Run Agent</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column: Output */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark min-h-[500px] lg:min-h-full"
          >
            {/* Empty State */}
            {taskState === 'idle' && (
              <div className="flex flex-col flex-grow items-center justify-center p-8 text-center">
                <div className="flex items-center justify-center size-16 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
                </div>
                <h3 className="mt-4 text-lg font-bold">Your results will appear here</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fill out the prompt and select a priority to get started.</p>
              </div>
            )}

            {/* Processing State */}
            {taskState === 'processing' && (
              <div className="flex flex-col flex-grow items-center justify-center p-8 text-center">
                <svg className="animate-spin h-12 w-12 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className="mt-4 text-lg font-bold">Agent at work...</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This may take a few moments. Please wait.</p>
              </div>
            )}

            {/* Completed State */}
            {taskState === 'completed' && result && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-grow p-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-border-light dark:border-border-dark">
                  <h3 className="text-xl font-bold">Results</h3>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center rounded-lg size-9 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Copy to Clipboard">
                      <span className="material-symbols-outlined text-xl">content_copy</span>
                    </button>
                    <button className="flex items-center justify-center rounded-lg size-9 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Download results">
                      <span className="material-symbols-outlined text-xl">download</span>
                    </button>
                  </div>
                </div>
                <div className="flex-grow py-4 overflow-y-auto">
                  <h4 className="text-lg font-bold mb-3">{result.title}</h4>
                  <div className="text-sm whitespace-pre-line leading-relaxed">{result.content}</div>
                </div>
                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                  <button 
                    onClick={handleNewTask}
                    className="w-full sm:w-auto flex items-center justify-center rounded-lg h-10 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark gap-2 text-sm font-bold px-4 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span>Start New Task</span>
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

