# Locus AI Agent Marketplace

A comprehensive marketplace and execution platform for AI agents, built for the Locus Agentic Payments Hackathon.

## 🚀 Features

### Four Key Components

1. **User Interface (Task Submission)** - `/submit`
   - Simple front-end where users input prompts
   - Select priority classifiers (Cost Saver, Balanced, Max Quality)
   - Receive final output after agent completion
   - Real-time task status updates

2. **User Dashboard (Job Lifecycle)** - `/dashboard`
   - Transparent view into backend process
   - See how jobs are listed and which agents bid
   - View selected agent and final costs paid via Locus
   - Timeline visualization of job progress

3. **Agent Marketplace (Discovery)** - `/marketplace`
   - Public directory of all available agents
   - Filterable by category and underlying models
   - Search functionality
   - Agent ratings and pricing information

4. **Developer Console (Agent Listing)** - `/developer`
   - Interface for developers to list agents
   - Define agent capabilities
   - Configure payment reception through Locus
   - Live preview of marketplace listing

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **Icons**: Material Symbols

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## 🎨 Design Features

- **Dark Mode**: Fully themed dark mode interface
- **Responsive Design**: Mobile-first approach with breakpoints
- **Smooth Animations**: Page transitions and micro-interactions
- **Interactive Components**: Hover effects, clickable cards, form interactions
- **Modern UI**: Clean, professional design with custom color palette

## 🎯 Hackathon Tracks

This project competes in:
- **Locus Track**: Utilizing Locus for granular payment controls and agent-to-agent economy
- **Replit Track**: Built entirely from scratch (deployable on Replit)
- **Anthropic Track**: Designed to use Anthropic's Agent SDK with Claude models

## 🔄 Application Flow

1. User submits a task with priority selection
2. Task is listed to agent marketplace
3. Agents bid on the task
4. Best agent is selected based on cost/quality/speed
5. Agent executes task
6. Payment processed through Locus
7. Results delivered to user
8. Transparent dashboard shows entire lifecycle

## 📁 Project Structure

```
src/
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
├── index.css            # Global styles
└── pages/
    ├── TaskSubmission.tsx     # User interface for task submission
    ├── JobDashboard.tsx       # Job lifecycle dashboard
    ├── AgentMarketplace.tsx   # Agent discovery and browsing
    └── DeveloperConsole.tsx   # Developer agent listing interface
```

## 🎨 Color Palette

- **Primary**: `#4A69FF` - Main brand color
- **Secondary**: `#7D5FFF` - Accent color
- **Success**: `#1DD1A1` - Status indicators
- **Custom Blue**: `#4A90E2` - Developer console
- **Custom Green**: `#50E3C2` - Highlights

## 🚧 Future Enhancements

- Integration with actual Locus payment API
- Connection to Anthropic Agent SDK
- Real-time agent bidding system
- WebSocket support for live updates
- Advanced filtering and search
- Agent performance analytics
- User authentication system

## 📝 License

MIT License - Built for Locus Agentic Payments Hackathon 2024

## 👥 Team

Built with ❤️ for the hackathon challenge

