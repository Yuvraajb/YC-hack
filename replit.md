# Agentic Marketplace

## Overview
A polished full-stack web application where users submit tasks through a simple interface, three AI agents competitively bid on jobs, the best agent is automatically selected, executes the task using Anthropic AI (claude-sonnet-4-5), and payment is processed - all with real-time visualization in a developer dashboard.

## Recent Changes
- **2025-11-15**: Complete implementation of the Agentic Marketplace
  - Built data schema and storage interface for jobs, bids, payments, and logs
  - Implemented backend API with job creation, automated bidding, agent selection, AI execution, and payment simulation
  - Created three predefined agents: Fast & Cheap (FastCoder), High Quality (QualityFirst), Balanced (SmartBalance)
  - Connected frontend to backend with real API calls
  - Fixed Anthropic integration to use Replit AI Integrations with proper environment variables
  - Added error handling and validation for AI execution
  - **Extended with Marketplace & Agent Builder**:
    - Created General Marketplace page for browsing developer-created agents
    - Built "My Agents" page with agent management and creation dialog
    - Implemented dual-path agent creation: AI-assisted builder vs custom code editor
    - Added negotiation strategy system (aggressive, balanced, conservative)
    - Seeded 7 diverse demo agents across categories
  - **Upgraded to Functional Agents with Claude Agent SDK**:
    - Integrated Claude Agent SDK for real web browsing and image generation capabilities
    - Created server/agent-sdk.ts with WebSearch tool and custom image generation MCP tool
    - Updated all 3 preset agents to use SDK with defined enabled tools
    - Created "WebExplorer Vision" - specialized agent with WebSearch + generate_image tools
    - Fixed event streaming to properly capture agent responses using stream_event handlers
    - Maintained HH:MM:SS timestamp formatting for execution logs

## Project Architecture

### Frontend
- **User View** (`/`): Simple interface for users to submit tasks and view job status
- **Marketplace View** (`/marketplace`): Developer dashboard showing active jobs, agent bids, execution logs, and payment history
- **Browse Agents** (`/agents`): General marketplace for browsing all published agents with search, filtering, and sorting
- **My Agents** (`/my-agents`): Developer workspace for managing created agents
- **AI Builder** (`/builder/ai`): Visual form-based agent builder with auto-generated Claude Agent SDK code
- **Custom Code Builder** (`/builder/code`): Advanced editor for developers with existing Claude SDK code

### Backend
- **Storage**: In-memory storage (MemStorage) for jobs, bids, payments, logs, developers, marketplace agents, reviews, negotiations
- **Agents**: Three predefined AI agents with distinct bidding behaviors
  - Fast & Cheap (FastCoder): Low price, fast execution, moderate confidence
  - High Quality (QualityFirst): Higher price, thorough execution, high confidence
  - Balanced (SmartBalance): Balanced approach across all factors
- **API Routes**:
  - Job Management: `POST /api/jobs`, `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs/:id/execute`, `POST /api/jobs/:id/payment`
  - Marketplace: `GET /api/marketplace/agents`, `GET /api/payments`
  - Developer Agents: `GET /api/dev/agents`, `POST /api/dev/agents`, `PATCH /api/dev/agents/:id`, `DELETE /api/dev/agents/:id`
- **Negotiation Strategies**: 
  - Aggressive: High starting price, minimal concessions
  - Balanced: Fair pricing, moderate flexibility
  - Conservative: Competitive pricing, quick to close deals

### AI Integration
- Uses Replit AI Integrations for Anthropic access (no API key needed)
- Charges billed to Replit credits
- Model: claude-sonnet-4-5
- Environment variables:
  - `AI_INTEGRATIONS_ANTHROPIC_API_KEY` (auto-configured)
  - `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` (auto-configured)

## Tech Stack
- Frontend: React, Wouter, TanStack Query, Shadcn UI, Tailwind CSS
- Backend: Express, TypeScript
- Storage: In-memory (MemStorage)
- AI: Anthropic SDK with Replit AI Integrations

## Workflows

### User Job Submission (Original Flow)
1. User submits task via User View
2. Backend creates job and automatically generates bids from all 3 agents
3. Best agent is selected based on score algorithm (price, ETA, confidence)
4. User clicks "Execute Selected Agent" to run the task
5. Selected agent executes task using Anthropic AI
6. User processes payment after completion
7. All activity visible in real-time on Marketplace View

### Agent Creation (New Flow)
1. Developer navigates to "My Agents" page
2. Clicks "Create Agent" button
3. Chooses creation method in dialog:
   - **Build with AI**: Visual builder with auto-generated SDK code (for beginners)
   - **Use Custom Code**: Direct code editor with negotiation settings (for veterans)
4. Fills in agent configuration (pricing, capabilities, tools, system prompt, negotiation strategy)
5. Creates agent (saved as draft)
6. Publishes to marketplace for users to hire

## User Preferences
- Design: Dark theme with purple neon accents (#9333ea primary color)
- Font: Inter
- Layout: Clean, modern, developer-focused interface
- Real data: No mock data, all API calls are live
