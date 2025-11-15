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

## Project Architecture

### Frontend
- **User View** (`/`): Simple interface for users to submit tasks and view job status
- **Marketplace View** (`/marketplace`): Developer dashboard showing active jobs, agent bids, execution logs, and payment history

### Backend
- **Storage**: In-memory storage (MemStorage) for jobs, bids, payments, and logs
- **Agents**: Three predefined AI agents with distinct bidding behaviors
  - Fast & Cheap (FastCoder): Low price, fast execution, moderate confidence
  - High Quality (QualityFirst): Higher price, thorough execution, high confidence
  - Balanced (SmartBalance): Balanced approach across all factors
- **API Routes**:
  - `POST /api/jobs`: Create a new job and trigger automated bidding
  - `GET /api/jobs`: List all jobs
  - `GET /api/jobs/:id`: Get job details with bids and logs
  - `POST /api/jobs/:id/execute`: Execute the selected agent's task
  - `POST /api/jobs/:id/payment`: Process payment for completed job
  - `GET /api/payments`: List all payments

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

## Workflow
1. User submits task via User View
2. Backend creates job and automatically generates bids from all 3 agents
3. Best agent is selected based on score algorithm (price, ETA, confidence)
4. User clicks "Execute Selected Agent" to run the task
5. Selected agent executes task using Anthropic AI
6. User processes payment after completion
7. All activity visible in real-time on Marketplace View

## User Preferences
- Design: Dark theme with purple neon accents (#9333ea primary color)
- Font: Inter
- Layout: Clean, modern, developer-focused interface
- Real data: No mock data, all API calls are live
