import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface Agent {
  id: number
  name: string
  description: string
  category: string
  model: string
  rating: number
  reviews: number
  price: string
  icon: string
  iconColor: string
}

interface AgentModalProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onDeploy: () => void
}

export default function AgentModal({ agent, isOpen, onClose, onDeploy }: AgentModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!agent) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-border-light dark:border-border-dark"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-border-light dark:border-border-dark">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`size-16 rounded-xl ${agent.iconColor} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-4xl">{agent.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-black mb-1">{agent.name}</h2>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-yellow-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="text-sm font-medium">{agent.rating}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({agent.reviews.toLocaleString()} reviews)</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          agent.price === 'Free' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                          agent.price === 'Paid' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                          'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        }`}>
                          {agent.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{agent.description}</p>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Category</p>
                        <p className="font-semibold">{agent.category}</p>
                      </div>
                      <div className="bg-background-light dark:bg-background-dark rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Model</p>
                        <p className="font-semibold">{agent.model}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {['Fast execution time', 'High accuracy', 'Scalable architecture', 'Easy integration'].map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-primary text-xl mt-0.5">check_circle</span>
                          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing */}
                  <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Starting at</p>
                        <p className="text-2xl font-black text-primary">{agent.price === 'Free' ? 'Free' : '$0.05 / call'}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onDeploy}
                        className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <span>Deploy Agent</span>
                        <span className="material-symbols-outlined">rocket_launch</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

