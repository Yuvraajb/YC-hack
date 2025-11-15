# Agentic Marketplace

A full-stack web application where users submit tasks, AI agents competitively bid on jobs, and execute them using Claude Agent SDK with real capabilities including Gmail/Calendar access, multi-model AI orchestration, and image generation.

## Features

- **ChatGPT-Style Interface**: Submit tasks through an intuitive chat interface
- **Intelligent Agent Bidding**: Agents only bid on tasks matching their tool capabilities
- **Real-Time Execution**: Watch your task being executed with live status updates
- **Production Agent**: Personal Assistant AI with Gmail, Calendar, and AI summarization
- **Multi-Model Support**: Access 100+ AI models via OpenRouter (GPT-4, Claude, Gemini, etc.)
- **Replit Connectors**: OAuth-based integrations with 19+ services

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Replit account (for connector integrations)
- OpenRouter API key (for multi-model AI access)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Yuvraajb/YC-hack.git
cd YC-hack
git checkout Krishna
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
# Required: OpenRouter API key for multi-model AI access
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Required: Session secret for secure sessions
SESSION_SECRET=your_random_secret_key_here

# Auto-configured on Replit (don't set these manually):
# AI_INTEGRATIONS_ANTHROPIC_API_KEY
# AI_INTEGRATIONS_ANTHROPIC_BASE_URL
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Connecting to Replit Integrations

### Running on Replit (Recommended)

If you're running this on Replit, integrations work automatically:

1. **Import the project** to your Replit account
2. **Click "Connect via Replit"** buttons in the `/connectors` page
3. You'll be redirected to `https://replit.com/integrations`
4. **Authorize the services** you want to use (Gmail, Calendar, etc.)
5. Once authorized, all agents in the marketplace automatically get access

### Running Locally

When running on your local PC, you have two options:

**Option A: Use Replit for Connectors Only**
1. Create a Replit account at https://replit.com
2. Import this repository to Replit
3. Connect your services at https://replit.com/integrations
4. The app will fetch tokens from Replit's API (requires running on Replit)

**Option B: Set Up OAuth Manually** (Advanced)
1. Create OAuth apps for each service (Gmail, Calendar, etc.)
2. Add credentials to environment variables
3. Implement token refresh logic

**Note**: Replit integrations are designed to work within the Replit environment. For full functionality, we recommend running the app on Replit.

## Architecture

### Tech Stack
- **Frontend**: React, Wouter, TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express, TypeScript
- **Storage**: In-memory (MemStorage)
- **AI**: 
  - Claude Agent SDK (claude-sonnet-4-5) for orchestration
  - OpenRouter API for multi-model access
  - Anthropic via Replit AI Integrations

### Key Components

**Agent Types:**
- **Preset Agents**: Fast & Cheap, High Quality, Balanced (for general tasks)
- **Personal Assistant AI**: Production agent with Gmail/Calendar/AI capabilities

**MCP Tools Available:**
- `call_openrouter_model` - Access 100+ AI models
- `call_openrouter_chat` - Structured multi-model conversations
- `generate_image` - Image generation via Flux 1.1 Pro
- `read_gmail` - Read Gmail inbox (requires gmail.readonly scope)
- `send_gmail` - Send emails via Gmail
- `read_calendar` - Read Google Calendar events

**Tool-Based Bidding:**
Agents automatically detect required tools from user prompts:
- "Read my latest emails" → only agents with `read_gmail` bid
- "Summarize my inbox" → requires `read_gmail` + OpenRouter
- "Send email to john@example.com" → requires `send_gmail`
- General tasks → all agents can bid

## Pages

- `/` - User interface (ChatGPT-style chat)
- `/marketplace` - Developer dashboard (job management, bids, payments)
- `/agents` - Browse all marketplace agents
- `/my-agents` - Manage your created agents
- `/connectors` - Connect external services (Gmail, Calendar, etc.)

## API Endpoints

### Job Management
- `POST /api/jobs` - Create a new job
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/:id/logs` - Get execution logs (for real-time streaming)
- `POST /api/jobs/:id/bids` - Submit a bid (auto-generated)
- `POST /api/jobs/:id/select` - Select winning agent (auto)
- `POST /api/jobs/:id/execute` - Execute job with agent (auto)
- `POST /api/jobs/:id/payment` - Process payment (auto)

### Marketplace
- `GET /api/marketplace/agents` - List marketplace agents
- `GET /api/payments` - List payment history

### Developer Tools
- `GET /api/dev/agents` - Get developer's agents
- `POST /api/dev/agents` - Create new agent
- `PATCH /api/dev/agents/:id` - Update agent
- `DELETE /api/dev/agents/:id` - Delete agent

### Connectors
- `GET /api/connectors/status` - Check connection status
- `GET /api/connectors/:id/authorize` - Authorize connector

## Development Notes

### Gmail Scope Limitation
The current Replit Gmail connector has limited scopes. For full inbox reading (`gmail.readonly`), contact Replit support at https://replit.com/support.

**Current Status:**
- ✅ Sending emails works (`send_gmail` tool)
- ⚠️ Reading inbox requires additional scope

### Agent SDK Configuration
Agents run with `permissionMode: "bypassPermissions"` to auto-accept all MCP tool calls without user intervention.

### Cost Tracking
OpenRouter API calls include generation IDs. Check costs at https://openrouter.ai/activity

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is built for the YC Hackathon.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact the team at your team email/slack

## Acknowledgments

- Built with Replit AI Integrations
- Powered by Anthropic's Claude Agent SDK
- Multi-model support via OpenRouter
- UI components from Shadcn UI
