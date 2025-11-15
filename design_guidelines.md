# Agentic Marketplace Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based Design
- **Primary References**: Vercel Dashboard (clean structure) + OpenAI Playground (conversational UI) + Fiverr (bidding mechanics)
- **Design Principles**: 
  - Radical simplicity for user-facing interface
  - Information density for developer dashboard
  - Real-time visual feedback for marketplace activity

## Typography System

**Font Stack**: 
- Primary: Inter (Google Fonts) for UI elements
- Monospace: JetBrains Mono for logs, transaction IDs, technical data

**Hierarchy**:
- Hero/Headings: text-4xl to text-5xl, font-semibold
- Section Titles: text-2xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-base, font-normal
- Technical/Meta: text-sm, font-mono

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, and 16
- Component padding: p-6 to p-8
- Section spacing: gap-6 to gap-8
- Page margins: px-4 md:px-8 lg:px-12

**Container Strategy**:
- User View: max-w-2xl mx-auto (narrow, focused)
- Marketplace View: max-w-7xl mx-auto (wide, dashboard)
- Full viewport height: min-h-screen

## View-Specific Layouts

### User View (Default - Landing Interface)
**Layout**: Centered vertical flow
- Navigation bar: Fixed top, minimal (logo + "Marketplace View" link)
- Hero Section: Full viewport (min-h-screen), vertically centered
  - Heading + subheading stack
  - Prompt input box (large, prominent)
  - "Create Job" CTA button
- Results Section: Appears below hero after job creation
  - Selected agent card (centered, max-w-xl)
  - Output display panel
  - Payment receipt card

**Prompt Input Design**:
- Large textarea: min-h-32, rounded-xl, border treatment
- Placeholder text: "Describe your task..."
- Submit button: Full-width on mobile, inline on desktop

### Marketplace View (Developer Dashboard)
**Layout**: Multi-column grid dashboard
- Top Bar: Breadcrumb navigation + real-time status indicators
- Main Grid: 3-column layout (lg:grid-cols-3, md:grid-cols-2, grid-cols-1)
  
**Dashboard Sections**:
1. **Active Jobs Panel** (left column, sticky)
   - Job list with status badges
   - Expandable job details
   
2. **Bidding Arena** (center column)
   - Agent bidding cards in vertical stack (gap-4)
   - Each card shows: Agent name, ETA, Confidence %, Price, Plan preview
   - Winning bid highlighted with border accent
   
3. **Execution & Payment** (right column)
   - Live execution logs (scrollable, max-h-96)
   - Payment events timeline
   - Transaction cards with IDs

## Component Library

### Cards
**Base Card**: rounded-xl, border, p-6, backdrop-blur treatment
- Agent Bid Card: Includes badge (top-right for price), metric grid (ETA, Confidence), expandable plan
- Job Card: Status indicator, timestamp, user prompt preview
- Payment Card: Transaction ID (mono font), amount (large), timestamp
- Log Card: Minimal padding (p-4), mono font, scrollable

### Badges & Indicators
- Status Badges: rounded-full, px-3, py-1, text-xs, font-medium
  - States: Pending, Bidding, Executing, Completed, Paid
- Real-time Pulse: Animated dot indicator for active processes

### Buttons
- Primary CTA: px-8, py-3, rounded-lg, font-semibold, text-base
- Secondary: Similar sizing, border treatment instead of solid fill
- Icon Buttons: p-2, rounded-md for compact actions

### Input Fields
- Text Input/Textarea: rounded-lg, px-4, py-3, border focus:ring treatment
- Labels: text-sm, font-medium, mb-2

### Data Display
**Metrics Grid**: 
- 2-3 column grid for agent stats
- Label (text-sm, opacity-70) above value (text-lg, font-semibold)

**Timeline**:
- Vertical line connector
- Event nodes with timestamps
- Icon indicators for event types

### Navigation
- Top Bar: Flex justify-between, px-8, py-4, border-b
- View Toggle: Tab-style switcher or clear link
- Logo/Brand: text-xl, font-bold

## Interaction Patterns

**State Transitions**:
- Fade-in for new content (transition-opacity, duration-300)
- Slide-up for modals/overlays (transform translate-y)
- Highlight animation for selected/winning bids (border pulse)

**Loading States**:
- Skeleton loaders for cards during data fetch
- Spinner for button actions
- Progress indicators for job execution

**Real-time Updates**:
- Smooth card insertions (animate-in)
- Highlight flash for new bids/payments
- Auto-scroll logs to latest entry

## Responsive Behavior

**Breakpoints**:
- Mobile (< 768px): Single column, stacked layout
- Tablet (768px - 1024px): 2-column grid for marketplace
- Desktop (> 1024px): Full 3-column dashboard

**Mobile Optimizations**:
- User View: Full-screen prompt input
- Marketplace View: Tabbed navigation between panels (Jobs / Bidding / Execution)
- Touch-friendly tap targets (min 44px)

## Special Considerations

**Developer Experience**:
- Console-style execution logs with syntax highlighting
- Expandable/collapsible sections for long content
- Copy-to-clipboard buttons for transaction IDs

**Visual Hierarchy**:
- Winning agent bid: Elevated (shadow-lg, border accent, scale-105)
- Active job: Border accent + subtle animation
- Completed payments: Success indicator (checkmark icon)

**Information Density**:
- User View: Minimal, spacious (generous whitespace)
- Marketplace View: Dense but organized (compact cards, efficient grids)

This design creates a stark contrast between the consumer-facing simplicity and the developer-facing power-user dashboard, leveraging familiar patterns from industry leaders while maintaining a unique marketplace identity.