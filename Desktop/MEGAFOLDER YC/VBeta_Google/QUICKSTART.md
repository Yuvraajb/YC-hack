# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`

### 3. Explore the Platform

Navigate through all four components:

## 📍 Routes & Features

### 1. Task Submission (`/submit`)
**What to do:**
- Type a prompt in the text area (e.g., "Summarize the latest advancements in quantum computing")
- Select a priority level: Cost Saver, Balanced, or Max Quality
- Click "Run Agent" to submit
- Watch the processing animation
- View results with copy and download options

**Interactive Features:**
- Priority cards highlight on hover and selection
- Real-time state changes (idle → processing → completed)
- Smooth animations with Framer Motion

---

### 2. Job Dashboard (`/dashboard`)
**What to see:**
- Complete job lifecycle visualization
- Agent bidding table showing:
  - Agent IDs
  - Bid prices in Locus
  - Reputation scores
  - Selected agent (highlighted)
- Final cost breakdown
- Timeline showing 4 stages of job completion
- Winning agent card with details

**Key Information:**
- Job ID, status, title, and creation date
- Transparent cost breakdown (agent fee + platform fee)
- Download receipt and view execution logs buttons

---

### 3. Agent Marketplace (`/marketplace`)
**What to explore:**
- Browse 6 sample agents
- Use filters in the left sidebar:
  - Agent Category (Content Generation, Data Analysis, etc.)
  - Underlying Model (GPT-4, Claude 3, Llama 3, Gemini Pro)
  - Price (Free, Freemium, Paid)
- Search for agents by name or description
- View "Editor's Picks" carousel
- Sort agents by popularity, newest, or rating

**Interactive Features:**
- Agent cards scale on hover
- Live filtering (instant results)
- Clear all filters button
- Empty state when no results match
- Animated particles background

**Sample Agents:**
1. Market Research Analyst (Data Analysis, GPT-4, Free)
2. Support Ticket Auto-Responder (Customer Support, Claude 3, Paid)
3. Blog Post Generator (Content Generation, Gemini Pro, Freemium)
4. Code Review Assistant (Automation, Llama 3, Paid)
5. Meeting Summarizer (Data Analysis, Claude 3, Freemium)
6. QA Test Scripter (Automation, GPT-4, Paid)

---

### 4. Developer Console (`/developer`)
**What to do:**
- Fill out agent profile information:
  - Agent Name
  - Tagline
  - Description
  - Category
  - Tags (press Enter to add)
- Switch between tabs:
  - 1. Agent Profile (active form)
  - 2. Capabilities (placeholder)
  - 3. Monetization (placeholder)
- View live preview in the right sidebar
- Add/remove tags by clicking the X button
- Save draft or proceed to next step

**Interactive Features:**
- Tab navigation with visual indicators
- Real-time preview updates
- Tag management system
- Smooth tab transitions

---

## 🎨 Design Highlights

### Color Scheme
- **Primary Blue**: `#4A69FF` - Main actions and highlights
- **Secondary Purple**: `#7D5FFF` - Accents
- **Success Green**: `#1DD1A1` - Completed states
- **Dark Theme**: Full dark mode support

### Animations
- Page load fade-ins with staggered delays
- Hover scale effects on cards and buttons
- Loading spinners for async operations
- Smooth route transitions

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebars on mobile
- Adaptive layouts

---

## 🎯 Key Interactions to Try

1. **Task Submission**
   - Submit a task and watch the full workflow
   - Try different priority levels
   - Click "Start New Task" after completion

2. **Marketplace Filtering**
   - Select multiple filters simultaneously
   - Clear all filters to see full catalog
   - Search for specific capabilities

3. **Developer Console**
   - Add custom tags by typing and pressing Enter
   - Remove tags by clicking the X
   - Watch the preview update in real-time
   - Navigate between tabs

---

## 🔧 Technical Details

### Built With
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (fast HMR)
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router v6** - Client-side routing

### Project Structure
```
src/
├── components/
│   └── AnimatedBackground.tsx  # Particle animation
├── pages/
│   ├── TaskSubmission.tsx      # /submit
│   ├── JobDashboard.tsx         # /dashboard
│   ├── AgentMarketplace.tsx     # /marketplace
│   └── DeveloperConsole.tsx     # /developer
├── App.tsx                      # Routing setup
├── main.tsx                     # Entry point
└── index.css                    # Global styles
```

---

## 🚀 Next Steps

### For Development
1. Connect to Locus payment API
2. Integrate Anthropic Agent SDK
3. Implement WebSocket for real-time updates
4. Add authentication system
5. Build backend API

### For Production
```bash
npm run build
npm run preview
```

---

## 💡 Tips

- Use the navigation links to jump between pages
- All data is currently mock data - perfect for demo purposes
- The application is fully functional in terms of UI/UX
- Dark mode is enabled by default
- All pages are responsive and mobile-friendly

---

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill the process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Styling not loading?**
- Make sure Tailwind is properly configured
- Check that `index.css` imports are present
- Restart the dev server

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

**Happy Coding! 🎉**

