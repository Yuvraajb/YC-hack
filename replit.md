# Agentic Marketplace

## Overview
A polished full-stack web application where users submit tasks through a simple interface, AI agents bid on jobs and execute tasks using Claude Agent SDK (claude-sonnet-4-5) with real MCP tools for Gmail, Google Calendar, multi-model AI access, and image generation. Features a Personal Assistant AI agent that reads your Gmail and Calendar to provide intelligent summaries.

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
    - Created server/agent-sdk.ts with WebSearch tool and custom MCP tools
    - Updated all 3 preset agents to use SDK with defined enabled tools
    - Created "WebExplorer Vision" - specialized agent with WebSearch + generate_image tools
    - Fixed event streaming to properly capture agent responses using stream_event handlers
    - Maintained HH:MM:SS timestamp formatting for execution logs
    - **Permission Mode**: Set to "bypassPermissions" to auto-accept all tool calls without asking users
  - **Multi-Model Integration via OpenRouter**:
    - Integrated OpenRouter API to enable agents to call any AI model as tools
    - Created OpenRouterClient with retry logic, rate limiting, and token tracking
    - Implemented 3 MCP tools:
      - `call_openrouter_model`: Generic model caller (100+ models) with token usage tracking
      - `call_openrouter_chat`: Structured chat with system prompts
      - `generate_image`: Real image generation using Flux 1.1 Pro returning base64 data URLs
    - Updated all preset agents and WebExplorer Vision with OpenRouter tools
    - Agents can now orchestrate multi-model workflows (e.g., GPT-4 for analysis + Flux for images)
    - Cost tracking via generation IDs (check openrouter.ai/activity for detailed costs)
  - **Google Integrations (Gmail & Calendar)**:
    - Integrated Replit's native Gmail and Google Calendar connectors
    - Created server/google-integrations.ts with OAuth-based client helpers
    - Implemented 2 MCP tools:
      - `read_gmail`: Fetch recent inbox emails with metadata
      - `read_calendar`: Fetch upcoming calendar events
    - Added tools to Claude Agent SDK MCP server
    - OAuth tokens auto-refresh via Replit integration system
  - **Production Agent Created - Demo Agents Deleted**:
    - Deleted all 7 demo marketplace agents
    - Created "Personal Assistant AI" - real production agent
    - Features: Gmail inbox reading, Calendar event fetching, AI-powered summaries
    - Uses multi-model orchestration (read data → GPT-4/Claude analysis → summary)
    - Pricing: $8-25 (base $15), balanced negotiation strategy
  - **ChatGPT-Style UX Transformation (2025-11-15)**:
    - Rebuilt User View with ChatGPT-inspired interface
    - Centered prompt box transforms into full chat window on submit
    - Real-time execution log streaming with 1-second polling
    - Set-based deduplication using intrinsic log properties (timestamp + message)
    - Auto-execution flow: submit → bid → select → execute (no manual steps)
    - Message types: user (right), system (logs), assistant (final output)
    - Added `/api/jobs/:id/logs` endpoint for clean log polling
    - Robust error handling for async state updates and log reordering
  - **Connectors Page & Architecture (2025-11-15)**:
    - Created `/connectors` page showing status for 19 available Replit connectors
    - **Supported connectors** (categorized):
      - **Productivity**: Google Calendar, Google Sheets, Notion, ClickUp
      - **Communication**: Gmail, Outlook, Twilio, Resend, SendGrid, YouTube
      - **Development**: GitHub, Jira, Linear
      - **Business**: Stripe, HubSpot, Salesforce, Zendesk
      - **Storage**: OneDrive, SharePoint
    - Added `GET /api/connectors/status` endpoint with explicit ID-to-slug mapping
    - **Key Architecture**: Authorize once via Replit = all agents get access
    - Tokens fetched server-side from Replit's API, shared across all agent executions
    - No per-agent authorization needed - single OAuth flow covers entire marketplace
    - Each connector has unique icon, category badge, permissions list, and status indicator
    - Backend maintains explicit mapping between frontend IDs and Replit connector slugs
    - **Gmail Scope Issue**: Current Gmail connector has limited scopes - requires re-authorization in Replit for full email reading (gmail.readonly scope)
    - UI note clarifies Gmail/Calendar statuses are verified real-time, other connectors show estimated status
    - **Connect Buttons**: Redirect to https://replit.com/integrations in new tab for easy authorization
  - **Tool-Based Agent Bidding (2025-11-15)**:
    - Implemented `analyzePromptForTools()`: detects required tools from user prompts using regex patterns
    - **Detection patterns**:
      - Email send: `(send|compose|write).*(email|mail)` → requires `send_gmail`
      - Email read: `(read|check|show|view|summarize|analyze).*(email|inbox|mail)` → requires `read_gmail`
      - Calendar: `(calendar|event|schedule|meeting)` → requires `read_calendar`
      - Web search: `(search|find|lookup|research).*(web|online|internet|google)` → requires `WebSearch`
      - Image gen: `(generate|create|make|draw).*(image|picture|photo)` → requires `generate_image`
      - AI orchestration: `(analyze|compare|evaluate|summarize)` → requires `call_openrouter_model` OR `call_openrouter_chat`
    - **Bidding filter**: Only agents with matching tools can bid on jobs
    - Applies to both preset agents (FastCoder, QualityFirst, SmartBalance) and marketplace agents
    - OpenRouter tools treated as interchangeable (`call_openrouter_model` ≈ `call_openrouter_chat`)
    - Examples:
      - "Read my latest emails" → only Personal Assistant AI bids (has `read_gmail`)
      - "Summarize my inbox" → only Personal Assistant AI bids (has `read_gmail` + OpenRouter)
      - "Send email to john@example.com" → only Personal Assistant AI bids (has `send_gmail`)
      - General tasks → preset agents bid (no specific tools required)
  - **Status Display Optimization (2025-11-15)**:
    - Category-based transient status: `getStatusCategory()` extracts stable keys ('broadcasting', 'evaluating', 'finding')
    - All old transient messages removed and replaced each polling cycle
    - Milestone logs (bids received, agent selected, execution complete) preserved in chat
    - Cleaner UX: users see only current step, not accumulating duplicate statuses

## Project Architecture

### Frontend
- **User View** (`/`): ChatGPT-style interface with centered prompt that transforms into chat window on submit
  - Shows real-time execution logs via polling
  - Displays final agent output as assistant message
  - Auto-executes jobs without manual intervention
- **Marketplace View** (`/marketplace`): Developer dashboard showing active jobs, agent bids, execution logs, and payment history
- **Browse Agents** (`/agents`): General marketplace for browsing all published agents with search, filtering, and sorting
- **My Agents** (`/my-agents`): Developer workspace for managing created agents
- **AI Builder** (`/builder/ai`): Visual form-based agent builder with auto-generated Claude Agent SDK code
- **Custom Code Builder** (`/builder/code`): Advanced editor for developers with existing Claude SDK code
- **Connectors** (`/connectors`): Manage Gmail and Calendar integrations with status display and connection instructions

### Backend
- **Storage**: In-memory storage (MemStorage) for jobs, bids, payments, logs, developers, marketplace agents, reviews, negotiations
- **Production Agents**: 
  - **Personal Assistant AI**: Productivity agent with Gmail/Calendar/AI summarization
    - Reads Gmail inbox (10-15 recent emails)
    - Fetches Calendar events (next 7 days)
    - Uses GPT-4 or Claude via OpenRouter for intelligent summaries
    - Provides actionable insights and schedule overviews
- **Preset Job Agents** (for quick job execution):
  - Fast & Cheap (FastCoder): Low price, fast execution, moderate confidence
  - High Quality (QualityFirst): Higher price, thorough execution, high confidence
  - Balanced (SmartBalance): Balanced approach across all factors
- **API Routes**:
  - Job Management: `POST /api/jobs`, `GET /api/jobs`, `GET /api/jobs/:id`, `GET /api/jobs/:id/logs`, `POST /api/jobs/:id/bids`, `POST /api/jobs/:id/select`, `POST /api/jobs/:id/execute`, `POST /api/jobs/:id/payment`
  - Marketplace: `GET /api/marketplace/agents`, `GET /api/payments`
  - Developer Agents: `GET /api/dev/agents`, `POST /api/dev/agents`, `PATCH /api/dev/agents/:id`, `DELETE /api/dev/agents/:id`
  - Connectors: `GET /api/connectors/status`, `GET /api/connectors/:id/authorize`
- **Negotiation Strategies**: 
  - Aggressive: High starting price, minimal concessions
  - Balanced: Fair pricing, moderate flexibility
  - Conservative: Competitive pricing, quick to close deals

### AI Integration
- **Primary Orchestrator**: Claude Agent SDK (claude-sonnet-4-5)
  - Uses Replit AI Integrations for Anthropic access (no API key needed)
  - Charges billed to Replit credits
  - Environment variables:
    - `AI_INTEGRATIONS_ANTHROPIC_API_KEY` (auto-configured)
    - `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` (auto-configured)
- **MCP Tools Available** (6 custom tools in MCP server):
  1. `call_openrouter_model` - Access 100+ AI models (GPT-4, Gemini, etc.)
  2. `call_openrouter_chat` - Structured multi-model conversations
  3. `generate_image` - Real image generation via Flux 1.1 Pro
  4. `read_gmail` - Read recent Gmail inbox emails (requires gmail.readonly scope - not yet available)
  5. `send_gmail` - Send emails via Gmail with to/cc/bcc, subject, body (works!)
  6. `read_calendar` - Read upcoming Google Calendar events
- **Multi-Model Support**: OpenRouter API
  - Provides access to 100+ AI models as MCP tools
  - Includes GPT-4, Claude, Gemini, LLaMA, Flux (image generation), etc.
  - Environment variable: `OPENROUTER_API_KEY` (user-provided)
  - Features:
    - Retry logic with exponential backoff (429 rate limiting + 5xx errors)
    - Token usage tracking per API call
    - Generation IDs for cost lookup at openrouter.ai/activity
    - Secure API key management

- **Google Integrations**: Gmail & Calendar (Replit Native)
  - Gmail: Read inbox emails with full metadata (sender, subject, date, snippet)
  - Calendar: Read upcoming events with times, locations, descriptions
  - OAuth authentication handled automatically by Replit
  - Access tokens auto-refresh on expiry
  - MCP tools: `read_gmail`, `read_calendar`

## Tech Stack
- Frontend: React, Wouter, TanStack Query, Shadcn UI, Tailwind CSS
- Backend: Express, TypeScript
- Storage: In-memory (MemStorage)
- AI: Anthropic SDK with Replit AI Integrations

## Workflows

### User Job Submission (ChatGPT-Style Flow)
1. User enters task in centered prompt box
2. Clicks submit - UI transforms to chat interface
3. User message appears in chat (right-aligned)
4. Backend auto-creates job and generates bids from all agents
5. System messages appear showing bidding and agent selection
6. Selected agent begins execution automatically
7. Real-time logs stream into chat as system messages (1-second polling)
8. Final agent output appears as assistant message (left-aligned with bot icon)
9. Chat input re-enables for follow-up messages
10. All activity visible in real-time via log streaming

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
