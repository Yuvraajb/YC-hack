import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AnimatedBackground from '../components/AnimatedBackground'

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

const agents: Agent[] = [
  { id: 1, name: 'Market Research Analyst', description: 'Analyzes market trends from web data and generates reports.', category: 'Data Analysis', model: 'GPT-4', rating: 4.9, reviews: 1200, price: 'Free', icon: 'query_stats', iconColor: 'bg-primary/20 text-primary' },
  { id: 2, name: 'Support Ticket Auto-Responder', description: 'Automatically responds to common customer support tickets.', category: 'Customer Support', model: 'Claude 3', rating: 4.8, reviews: 980, price: 'Paid', icon: 'support_agent', iconColor: 'bg-green-500/20 text-green-400' },
  { id: 3, name: 'Blog Post Generator', description: 'Creates high-quality, SEO-optimized blog articles from a prompt.', category: 'Content Generation', model: 'Gemini Pro', rating: 4.7, reviews: 2500, price: 'Freemium', icon: 'edit', iconColor: 'bg-purple-500/20 text-purple-400' },
  { id: 4, name: 'Code Review Assistant', description: 'Reviews pull requests for style, errors, and best practices.', category: 'Automation', model: 'Llama 3', rating: 4.9, reviews: 850, price: 'Paid', icon: 'code', iconColor: 'bg-orange-500/20 text-orange-400' },
  { id: 5, name: 'Meeting Summarizer', description: 'Generates concise summaries and action items from transcripts.', category: 'Data Analysis', model: 'Claude 3', rating: 4.8, reviews: 3100, price: 'Freemium', icon: 'summarize', iconColor: 'bg-primary/20 text-primary' },
  { id: 6, name: 'QA Test Scripter', description: 'Writes automated test scripts based on feature descriptions.', category: 'Automation', model: 'GPT-4', rating: 4.6, reviews: 450, price: 'Paid', icon: 'bug_report', iconColor: 'bg-red-500/20 text-red-400' },
]

const categories = ['Content Generation', 'Data Analysis', 'Automation', 'Customer Support']
const models = ['GPT-4', 'Claude 3 Opus', 'Llama 3', 'Gemini Pro']
const prices = ['Free', 'Freemium', 'Paid']

export default function AgentMarketplace() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Data Analysis'])
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4'])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleFilter = (value: string, selected: string[], setter: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value))
    } else {
      setter([...selected, value])
    }
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedModels([])
    setSelectedPrices([])
    setSearchQuery('')
  }

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(agent.category)
    const matchesModel = selectedModels.length === 0 || selectedModels.includes(agent.model)
    const matchesPrice = selectedPrices.length === 0 || selectedPrices.includes(agent.price)
    const matchesSearch = searchQuery === '' || agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesModel && matchesPrice && matchesSearch
  })

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col">
      <AnimatedBackground />
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 bg-background-dark/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-white">
            <div className="size-6 text-primary">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" />
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">AgentVerse</h2>
          </div>
          <div className="hidden lg:flex items-center gap-9">
            <Link to="/marketplace" className="text-white text-sm font-medium leading-normal transition-colors">Explore</Link>
            <Link to="/submit" className="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors">Submit Task</Link>
            <Link to="/developer" className="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors">Developer Console</Link>
            <Link to="/dashboard" className="text-white/80 hover:text-white text-sm font-medium leading-normal transition-colors">My Jobs</Link>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <label className="hidden md:flex flex-col min-w-40 !h-10 w-full max-w-sm">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-gray-400 flex border-none bg-white/5 items-center justify-center pl-3 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/5 focus:border-none h-full placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal" 
                placeholder="Search for agents..." 
              />
            </div>
          </label>
          <div className="flex gap-2">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
            >
              <span className="truncate">Sign Up</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
            >
              <span className="truncate">Log In</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Filter Sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-white/10 p-6 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-lg font-bold">Filters</h3>
            <button onClick={clearAllFilters} className="text-primary hover:underline text-sm font-medium">Clear All</button>
          </div>
          <div className="space-y-6">
            {/* Agent Category */}
            <div>
              <h4 className="font-semibold text-white mb-3">Agent Category</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input 
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
                      className="form-checkbox bg-transparent border-white/20 rounded text-primary focus:ring-primary/50" 
                      type="checkbox"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Underlying Model */}
            <div>
              <h4 className="font-semibold text-white mb-3">Underlying Model</h4>
              <div className="space-y-2">
                {models.map(model => (
                  <label key={model} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input 
                      checked={selectedModels.includes(model)}
                      onChange={() => toggleFilter(model, selectedModels, setSelectedModels)}
                      className="form-checkbox bg-transparent border-white/20 rounded text-primary focus:ring-primary/50" 
                      type="checkbox"
                    />
                    {model}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h4 className="font-semibold text-white mb-3">Price</h4>
              <div className="space-y-2">
                {prices.map(price => (
                  <label key={price} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input 
                      checked={selectedPrices.includes(price)}
                      onChange={() => toggleFilter(price, selectedPrices, setSelectedPrices)}
                      className="form-checkbox bg-transparent border-white/20 rounded text-primary focus:ring-primary/50" 
                      type="checkbox"
                    />
                    {price}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Page Heading */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-between gap-4 mb-8"
            >
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">AI Agent Marketplace</p>
                <p className="text-gray-400 text-base font-normal leading-normal">Discover and deploy autonomous agents for any task.</p>
              </div>
            </motion.div>

            {/* Featured Carousel */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">Editor's Picks</h2>
              </div>
              <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4">
                <div className="flex items-stretch gap-6">
                  {[
                    { title: 'Top Agents This Week', desc: 'Our curated selection of the most innovative agents.', gradient: 'from-primary/60 to-secondary/60' },
                    { title: 'New! Claude 3 Powered', desc: 'Explore the next generation of intelligence.', gradient: 'from-purple-600/60 to-pink-600/60' },
                    { title: 'Automate Your Workflow', desc: 'Boost productivity with powerful automation agents.', gradient: 'from-green-600/60 to-teal-600/60' },
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="flex h-full flex-1 flex-col gap-4 rounded-xl bg-white/5 shadow-lg w-72 flex-shrink-0 cursor-pointer transition-all"
                    >
                      <div className={`w-full aspect-video rounded-t-xl bg-gradient-to-br ${item.gradient}`}></div>
                      <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                        <div>
                          <p className="text-white text-base font-medium leading-normal">{item.title}</p>
                          <p className="text-gray-400 text-sm font-normal leading-normal">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Section Header and Sort Controls */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                All Agents {filteredAgents.length !== agents.length && `(${filteredAgents.length} results)`}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sort by:</span>
                <select className="form-select bg-white/5 border-white/20 rounded-md text-white text-sm focus:ring-primary/50 focus:border-primary/50">
                  <option>Popularity</option>
                  <option>Newest</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>

            {/* Agent Cards Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredAgents.map((agent, idx) => (
                <motion.div 
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col bg-white/5 rounded-xl p-4 transition-all duration-300 hover:bg-white/10 cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`size-12 rounded-lg ${agent.iconColor} flex items-center justify-center`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>{agent.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{agent.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 flex-grow">{agent.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded">{agent.category}</span>
                    <span className="text-xs font-medium bg-gray-500/20 text-gray-300 px-2 py-1 rounded">{agent.model}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span>{agent.rating} ({agent.reviews.toLocaleString()})</span>
                    </div>
                    <span>{agent.price}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredAgents.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="size-16 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No agents found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your filters or search query</p>
                <button onClick={clearAllFilters} className="text-primary hover:underline font-medium">Clear all filters</button>
              </motion.div>
            )}

            {/* Pagination */}
            {filteredAgents.length > 0 && (
              <div className="flex justify-center mt-10">
                <nav className="flex items-center gap-2">
                  <a className="flex items-center justify-center size-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" href="#">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </a>
                  <a className="flex items-center justify-center size-9 rounded-lg bg-primary text-white font-bold" href="#">1</a>
                  <a className="flex items-center justify-center size-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" href="#">2</a>
                  <a className="flex items-center justify-center size-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" href="#">3</a>
                  <span className="text-gray-400">...</span>
                  <a className="flex items-center justify-center size-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" href="#">10</a>
                  <a className="flex items-center justify-center size-9 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" href="#">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </a>
                </nav>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

