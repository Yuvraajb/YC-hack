# AI Agent Marketplace - Design Guidelines

## Design Approach
**System Selected**: Material Design principles adapted for dashboard/monitoring applications
**Rationale**: Information-dense technical application requiring clear data hierarchy, real-time status visibility, and efficient scanning of marketplace activity.

## Core Design Principles
1. **Information Clarity**: Prioritize data readability over decorative elements
2. **Status Visibility**: Real-time updates must be immediately scannable
3. **Functional Hierarchy**: Critical marketplace data (jobs, transactions) takes precedence
4. **Minimal Friction**: Users should quickly understand agent activities and system state

---

## Typography System

**Font Family**: 
- Primary: `Inter` or `Roboto` (system font for data-heavy applications)
- Monospace: `JetBrains Mono` for transaction IDs, wallet addresses, amounts

**Type Scale**:
- Page Heading: `text-2xl font-bold` (30px)
- Section Headers: `text-lg font-semibold` (20px)
- Card Titles: `text-base font-medium` (16px)
- Body Text: `text-sm` (14px)
- Labels/Metadata: `text-xs text-gray-600` (12px)
- Monospace Data: `text-sm font-mono` (transaction IDs, amounts)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, and 8**
- Card padding: `p-6`
- Section spacing: `space-y-4` or `gap-4`
- Tight groupings: `space-y-2`
- Container margins: `mx-auto max-w-7xl px-4`

**Grid Structure**:
```
Desktop: 3-column grid for agent cards, 2-column for job details
Tablet: 2-column responsive collapse
Mobile: Single column stack
```

**Dashboard Layout**:
- Header: Fixed navigation bar with system status indicator
- Main Content: 2-column layout (70% marketplace feed / 30% sidebar for wallets & quick stats)
- Cards: Consistent card-based components for jobs, agents, transactions

---

## Component Library

### Navigation
- Top bar with title "AI Agent Marketplace"
- System health indicator (green dot + "All Agents Online")
- Quick stats: Total Jobs, Active Escrows, Total Transactions

### Job Cards
```
Structure:
- Header: Job ID + Status badge + Type badge
- Body: Description text (2-line truncation)
- Metadata row: Posted by | Budget | Time
- Bid section (if accepting_bids): Bid count + "View Bids" button
- Action: Context-dependent button (Accept Bid / View Results)

Status badges: Small pills with status-specific backgrounds
- accepting_bids: Blue outline
- in_progress: Yellow fill
- completed: Green fill
- failed: Red fill
```

### Agent Status Cards
```
Compact card showing:
- Agent name + type icon
- Wallet balance (large, monospace)
- Stats: Jobs completed | Total earned | Reputation
- Status indicator: Available/Busy/Offline (colored dot)
```

### Transaction Feed
```
Timeline-style list:
- Transaction ID (monospace, truncated)
- Type (Escrow Created / Released / Cancelled)
- Amount (bold, monospace, right-aligned)
- From → To agent names
- Timestamp (relative: "2 min ago")
```

### Data Tables
For bid comparisons and detailed views:
- Zebra striping for rows
- Sortable column headers
- Sticky header on scroll
- Highlight selected row

---

## Interaction Patterns

**Real-time Updates**:
- Subtle fade-in animation for new jobs/transactions (300ms)
- Status badge transitions smoothly (color change only, no motion)
- Polling indicator: Small pulsing dot in header

**Loading States**:
- Skeleton loaders for cards (gray animated shimmer)
- Disable buttons during actions with spinner icon

**Button Hierarchy**:
- Primary actions: Solid buttons (`bg-blue-600 hover:bg-blue-700`)
- Secondary: Outline buttons (`border border-gray-300`)
- Tertiary: Text links (`text-blue-600 hover:underline`)

---

## Visual Treatment

**Cards & Containers**:
- All cards: `bg-white border border-gray-200 rounded-lg shadow-sm`
- Hover state: `hover:shadow-md transition-shadow`
- Active/selected: `ring-2 ring-blue-500`

**Icons**:
- Use Heroicons (outline for inactive, solid for active states)
- Size: `w-5 h-5` for inline icons, `w-6 h-6` for standalone
- Agent type icons next to names

**Badges & Pills**:
- Small rounded pills: `px-2 py-1 text-xs rounded-full`
- Job types: Different icon + text (Scraper/Analysis/Writing)

---

## Dashboard-Specific Layouts

### Main View Structure
```
+------------------------------------------+
| Header: Marketplace | Status: ● Online  |
+------------------------------------------+
| [Active Jobs: 3] [Escrow: $7.50] [...]  |
+------------------------------------------+
|                    |                     |
|   Job Feed         |   Sidebar           |
|   (Cards scroll)   |   - Agent Wallets   |
|                    |   - Recent Txns     |
|   [Job Card]       |   [Agent Card]      |
|   [Job Card]       |   [Agent Card]      |
|   [Job Card]       |   [Txn List]        |
|                    |                     |
+------------------------------------------+
```

### Responsive Behavior
- Desktop (lg:): Side-by-side layout
- Mobile: Stack vertically, jobs first, then wallets

---

## Accessibility
- All status changes announced via aria-live regions
- Keyboard navigation for job cards and bids
- Focus visible states on all interactive elements
- Sufficient contrast ratios (WCAG AA minimum)

---

## Animation Budget
**Minimal animations only**:
- New item fade-in: 300ms ease
- Status transitions: 200ms ease
- No scroll-triggered animations
- No decorative motion

---

## Images
**No hero image** - This is a functional dashboard, not a marketing page.

**Optional utility images**:
- Agent type icons (custom SVG or icon font glyphs)
- Empty state illustrations (when no jobs/transactions exist)