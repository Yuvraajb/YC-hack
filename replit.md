# AI Agent Marketplace

## Overview
An autonomous AI agent marketplace where agents hire each other to complete research tasks. Built with TypeScript, Express, React, and Claude AI via Replit AI Integrations.

## Architecture

### Backend (80% of implementation)
- **Express REST API**: Marketplace server with comprehensive endpoints
- **Payment Ledger System**: In-memory escrow-based payment system
- **Storage**: MemStorage for agents, jobs, bids, and transactions
- **Claude AI Integration**: All decision-making powered by Claude Sonnet 4.5

### Autonomous Agents
1. **Coordinator Agent**
   - Evaluates bids every 3 seconds
   - Uses Claude AI for bid evaluation
   - Verifies completed work automatically
   - Manages payment release/cancellation

2. **Web Scraper Agent**
   - Polls for scraping jobs every 2 seconds
   - Calculates competitive bids using Claude AI
   - Executes web scraping tasks
   - Submits results automatically

3. **Analysis Agent**
   - Polls for analysis jobs every 2 seconds
   - Calculates bids using Claude AI
   - Performs data analysis
   - Submits insights automatically

4. **Writer Agent**
   - Polls for writing jobs every 2 seconds
   - Calculates competitive bids using Claude AI
   - Writes professional reports using Claude AI
   - Submits formatted documents automatically

### Job Lifecycle
1. User submits research request
2. Claude AI breaks down into tasks (scraping, analysis, writing)
3. Jobs posted to marketplace with budgets
4. Specialist agents autonomously bid (5-second window)
5. Coordinator evaluates and accepts best bid
6. Payment locked in escrow
7. Agent executes work
8. Coordinator verifies quality
9. Payment released to agent's wallet

### Payment System
- Coordinator starts with $50.00
- Specialist agents start with $0.00
- Escrow locks funds when job accepted
- Payment released upon verification
- Full transaction audit trail

## API Endpoints

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Job details
- `GET /api/jobs/:id/bids` - Get bids
- `POST /api/jobs/:id/bids` - Submit bid
- `POST /api/jobs/:id/accept` - Accept bid (creates escrow)
- `POST /api/jobs/:id/submit` - Submit work
- `POST /api/jobs/:id/verify` - Verify work (releases payment)

### Research
- `POST /api/research` - Submit research request (initiates full workflow)

### Agents & Transactions
- `GET /api/agents` - List all agents
- `GET /api/transactions` - Transaction history
- `GET /api/status` - System status

## Frontend (20% of implementation)
- Real-time dashboard with 2-second polling
- Research request submission form
- Live job feed with status tracking
- Agent wallet balances and stats
- Transaction history feed
- Stats cards (total jobs, active, completed, escrow balance)

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, TanStack Query, Tailwind CSS, shadcn/ui
- **AI**: Anthropic Claude (via Replit AI Integrations)
- **Storage**: In-memory (MemStorage)
- **Payments**: Custom ledger system with escrow

## Development
- All agents start automatically 1 second after server startup
- Graceful shutdown handlers for SIGTERM/SIGINT
- Comprehensive logging for all agent activities
- No database setup required - fully in-memory

## Recent Changes
- **Phase 1 (Completed)**:
  - Implemented complete backend with autonomous agent system (80% focus)
  - Added Claude AI integration for all decision-making (bid calculation, evaluation, verification, work execution)
  - Built payment ledger with escrow support
  - Created real-time polling frontend (20% focus)
  - Added research request form with live updates
  - Configured design tokens for marketplace theme
  - Implemented all 4 agent types: Coordinator, Web Scraper, Analyst, and Writer
  - Full job lifecycle automation from request to payment release
  
- **Phase 2 (In Progress)**:
  - Migrated from in-memory storage to PostgreSQL database with Drizzle ORM
  - Implemented competitive bidding with 10 total agents (1 coordinator + 9 specialists)
  - Multiple agents per specialty: 3 scrapers, 3 analysts, 3 writers
  - Each agent has unique pricing (base rates: 0.6 to 1.8)
  - True marketplace dynamics: all agents bid, coordinator selects best value
  - Increased coordinator budget to $100.00 to support more jobs

## Testing Workflow
1. Submit research request via dashboard
2. Watch agents automatically bid on jobs
3. Observe coordinator accept bids and create escrow
4. See agents complete work and submit results
5. Watch coordinator verify and release payments
6. Check agent wallet balances update in real-time
