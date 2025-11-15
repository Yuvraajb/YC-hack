import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../components/Navigation'

type Tab = 'profile' | 'capabilities' | 'monetization'

interface FormData {
  agentName: string
  tagline: string
  description: string
  category: string
  tags: string[]
}

export default function DeveloperConsole() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [formData, setFormData] = useState<FormData>({
    agentName: 'Content Summarizer Pro',
    tagline: 'Condenses long articles into key points.',
    description: '',
    category: 'Content Creation',
    tags: ['summarization', 'nlp', 'text-analysis']
  })
  const [newTag, setNewTag] = useState('')

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(newTag.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      }
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const tabs: { id: Tab; label: string; number: number }[] = [
    { id: 'profile', label: 'Agent Profile', number: 1 },
    { id: 'capabilities', label: 'Capabilities', number: 2 },
    { id: 'monetization', label: 'Monetization', number: 3 },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Page Heading */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-between items-center gap-3 mb-6"
            >
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">List Your Agent on the Marketplace</h1>
            </motion.div>

            {/* Tabs */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="pb-3 mb-6"
            >
              <div className="flex border-b border-gray-200 dark:border-gray-700 gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-custom-blue'
                        : 'border-b-transparent text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                      activeTab === tab.id ? 'text-custom-blue' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {tab.number}. {tab.label}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Agent Profile Section */}
                  <section>
                    <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Agent Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="flex flex-col">
                          <p className="text-base font-medium leading-normal pb-2">Agent Name</p>
                          <input 
                            value={formData.agentName}
                            onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-custom-blue/50 border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] h-12 placeholder:text-gray-400 dark:placeholder:text-[#9dabb9] px-4 text-base font-normal leading-normal" 
                            placeholder="e.g., 'Content Summarizer Pro'"
                          />
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex flex-col">
                          <p className="text-base font-medium leading-normal pb-2">Tagline</p>
                          <input 
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-custom-blue/50 border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] h-12 placeholder:text-gray-400 dark:placeholder:text-[#9dabb9] px-4 text-base font-normal leading-normal" 
                            placeholder="A short, catchy phrase for your agent"
                          />
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex flex-col">
                          <p className="text-base font-medium leading-normal pb-2">Detailed Description</p>
                          <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-custom-blue/50 border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] min-h-32 placeholder:text-gray-400 dark:placeholder:text-[#9dabb9] p-4 text-base font-normal leading-normal" 
                            placeholder="Describe what your agent does. Markdown is supported."
                          />
                        </label>
                      </div>
                      <div>
                        <p className="text-base font-medium leading-normal pb-2">Agent Avatar</p>
                        <div className="flex items-center gap-4">
                          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAl6kFXBsgzIrFXjcPFcmTdUgYpwQ2mEUf0Wzbzb9OcaZ5W4OoBrQ-XWbrux3Xo8NH4wlzx0H-v9m84U_U223QZli1uff_7WmMVPZIoXi90n9od6W3eL837UHu5NZqvrzITxDaCwVix5Ja6Gb7zaV1ZOWGiqe2zFeC0UOEqaoE844g5lEuEUcewnJLrYptwJWoQz_l2GQIVOkWeap-oXdja3nKHkXoOvoHZ3777ijbDSq8cPX0OB5r7bptwQ-BvOk6p8QDvOlR6jhA")' }}></div>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            <span className="truncate">Upload Icon</span>
                          </motion.button>
                        </div>
                      </div>
                      <div>
                        <label className="flex flex-col">
                          <p className="text-base font-medium leading-normal pb-2">Category</p>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg focus:outline-0 focus:ring-2 focus:ring-custom-blue/50 border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] h-12 placeholder:text-gray-400 dark:placeholder:text-[#9dabb9] px-4 text-base font-normal leading-normal"
                          >
                            <option>Content Creation</option>
                            <option>Data Analysis</option>
                            <option>Customer Support</option>
                            <option>Productivity</option>
                          </select>
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex flex-col">
                          <p className="text-base font-medium leading-normal pb-2">Skill & Capability Tags</p>
                          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-300 dark:border-[#3b4754] bg-white dark:bg-[#1c2127] p-2">
                            {formData.tags.map((tag) => (
                              <div key={tag} className="flex items-center gap-1 bg-custom-blue/10 dark:bg-custom-blue/20 text-custom-blue rounded-full px-3 py-1 text-sm">
                                <span>{tag}</span>
                                <button onClick={() => handleRemoveTag(tag)} className="text-custom-blue/60 hover:text-custom-blue">
                                  <span className="material-symbols-outlined text-base">close</span>
                                </button>
                              </div>
                            ))}
                            <input 
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={handleAddTag}
                              className="form-input flex-1 bg-transparent focus:outline-none focus:ring-0 border-0 p-1 min-w-[120px]" 
                              placeholder="Add a tag..."
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'capabilities' && (
                <motion.div
                  key="capabilities"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <section>
                    <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Agent Capabilities</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Define what your agent can do and configure its parameters.</p>
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-8 text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">settings_suggest</span>
                      <h3 className="text-xl font-bold mb-2">Capabilities Configuration</h3>
                      <p className="text-gray-500 dark:text-gray-400">Configure your agent's capabilities, API endpoints, and execution parameters here.</p>
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'monetization' && (
                <motion.div
                  key="monetization"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <section>
                    <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5">Monetization Settings</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Set up pricing and configure Locus payment reception.</p>
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-8 text-center">
                      <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">payments</span>
                      <h3 className="text-xl font-bold mb-2">Payment Configuration</h3>
                      <p className="text-gray-500 dark:text-gray-400">Configure pricing models and connect your Locus wallet to receive payments.</p>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3"
            >
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 dark:bg-gray-700 text-sm font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="truncate">Save Draft</span>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const nextTab: Record<Tab, Tab> = {
                    'profile': 'capabilities',
                    'capabilities': 'monetization',
                    'monetization': 'profile'
                  }
                  setActiveTab(nextTab[activeTab])
                }}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-custom-blue text-white text-sm font-bold hover:bg-blue-600 transition-colors"
              >
                <span className="truncate">
                  {activeTab === 'monetization' ? 'Submit for Review' : `Next: ${tabs.find(t => t.id === (activeTab === 'profile' ? 'capabilities' : 'monetization'))?.label}`}
                </span>
              </motion.button>
            </motion.div>
          </div>

          {/* Right Sidebar: Live Preview */}
          <aside className="hidden lg:block relative">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-8 space-y-4"
            >
              <h3 className="text-lg font-bold">Marketplace Preview</h3>
              <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 flex-shrink-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD4YBMijPgjktd7wCRMvE5ywmp23elC-sIqS_aLngua4qrWlSAn4JkE-PNkrvtqtuyUxoR8uS2QH9gMgMWupzS5WJoOYnXtG-G4FrkxEe40ZsYvtibCQoxUFJaHY9T9I6wnEGENYUr0d0mYTTnKh0utP3KK_GUr83VTvvoGgoC65EIvVe-KPh0-1K1WdTReKGr7GleLqECstE11DIeXWY9Ej1FrD3N7NIPejCBH3mXJVLhXO1oSR1ikl5zYfeUGLKR8sQbvphZu2Xk")' }}></div>
                  <div className="flex flex-col">
                    <h4 className="text-lg font-bold">{formData.agentName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">by DevCorp</p>
                    <div className="mt-1 flex items-center gap-1 text-amber-400">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                      <span className="material-symbols-outlined text-base">star</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(12 reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  {formData.tagline || 'Add a tagline to see it here'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Starting at</p>
                    <p className="text-xl font-bold">$0.05 / call</p>
                  </div>
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-custom-blue text-white text-sm font-bold">
                    <span className="truncate">View Details</span>
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-custom-blue/10 border border-blue-200 dark:border-custom-blue/30 rounded-xl p-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-custom-blue mt-1">help_outline</span>
                <div>
                  <h4 className="font-bold text-custom-blue">Tips for a Great Profile</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">Use a clear name, a compelling tagline, and relevant tags to help users discover your agent.</p>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </main>
    </div>
  )
}

