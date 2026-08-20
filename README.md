# ExpenseWise — College Student Money Manager

A personal finance tracking web application built specifically for college students living away from home. Track expenses, record money received from parents, manage savings goals, set budgets, and gain insights into spending patterns.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Libraries & Dependencies](#libraries--dependencies)
- [Development Tools](#development-tools)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [State Management](#state-management)
- [Styling System](#styling-system)
- [Charts & Visualization](#charts--visualization)
- [Icons](#icons)
- [Routing](#routing)
- [TypeScript Configuration](#typescript-configuration)
- [Linting](#linting)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Browser Support](#browser-support)

---

## Project Overview

ExpenseWise helps college students answer the question: **"Where did my money go?"**

It tracks money received (from parents, scholarships, freelance work), expenses across student-relevant categories, budgets, savings goals, and saved money — all with a clean, modern, mobile-friendly interface.

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.3.1 | Full-stack React framework with App Router, server-side rendering, file-based routing, and optimized production builds |
| **React** | 19.2.8 | UI component library (latest React 19 with concurrent features) |
| **React DOM** | 19.2.8 | DOM rendering for React components |
| **TypeScript** | 5.x | Static type checking for JavaScript, catching errors at compile time |
| **Tailwind CSS** | 4.3.3 | Utility-first CSS framework for rapid UI development |
| **Node.js** | 24.x | JavaScript runtime for build tooling and development server |

---

## Libraries & Dependencies

### Production Dependencies

| Package | Version | What It Does |
|---------|---------|-------------|
| `next` | 16.3.1 | The core framework. Handles routing (App Router), server components, static generation, hot reloading, production optimization, and the development server |
| `react` | 19.2.8 | Component-based UI library. Used for building all interactive interfaces with hooks (`useState`, `useEffect`, `useCallback`, `useContext`) |
| `react-dom` | 19.2.8 | Bridges React to the browser DOM. Handles rendering `<RootLayout>` and all page components |
| `lucide-react` | 1.33.0 | Beautiful, consistent SVG icon library. Used for all UI icons (menu, trash, plus, charts, category icons, etc.) instead of emoji |
| `recharts` | 3.10.1 | Charting library built on D3.js. Used for bar charts (daily spending, monthly trends) and pie charts (category breakdowns) |

### Dev Dependencies

| Package | Version | What It Does |
|---------|---------|-------------|
| `tailwindcss` | 4.3.3 | Utility-first CSS framework. Provides all styling through class names (`bg-white`, `rounded-2xl`, `text-gray-900`, etc.) |
| `@tailwindcss/postcss` | 4.x | PostCSS plugin that processes Tailwind CSS directives and generates optimized CSS |
| `typescript` | 5.x | TypeScript compiler for type checking. Catches type errors during build (`npm run build`) |
| `@types/node` | 20.x | TypeScript type definitions for Node.js APIs |
| `@types/react` | 19.x | TypeScript type definitions for React (components, hooks, events) |
| `@types/react-dom` | 19.x | TypeScript type definitions for React DOM APIs |
| `eslint` | 9.x | JavaScript/TypeScript linter for code quality and consistency |
| `eslint-config-next` | 16.3.1 | ESLint rules specific to Next.js projects (recommended + TypeScript rules) |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **PostCSS** | CSS processing pipeline used by Tailwind CSS to transform utility classes into actual CSS |
| **Turbopack** | Next.js 16's default bundler (replaced Webpack). Provides fast builds and hot module replacement |
| **ESLint** | Code linting with flat config format (`eslint.config.mjs`). Uses `next/core-web-vitals` and `next/typescript` rule sets |
| **npm** | Package manager for installing and managing dependencies |
| **Git** | Version control (initialized by `create-next-app`) |

---

## Architecture

### App Router (Next.js 16)

The project uses Next.js **App Router** (not Pages Router). This means:

- All routes live under `src/app/`
- Each folder with a `page.tsx` file becomes a route
- `layout.tsx` wraps all pages with shared UI (sidebar, store provider)
- All pages are **Client Components** (`'use client'`) because they use React hooks and localStorage

### Client-Side Rendering

All pages use `'use client'` directive because they depend on:
- `localStorage` for data persistence
- React state (`useState`, `useEffect`)
- Interactive UI (modals, forms, charts)

### No Backend / No Database

The app runs entirely in the browser. All data is stored in **localStorage** under the key `expensewise-data`. Legacy data from the previous version (`expense-tracker-data`) is automatically migrated on first load.

---

## Features

### 1. Dashboard (`/`)
- Greeting based on time of day
- Month selector with prev/next navigation
- 4 stat cards: Money Received, Spent, Money Left, Saved Money
- Safe Daily Spend calculator (Money Left / remaining days in month)
- Quick action buttons (Add Expense, Add Money, Save Money, New Goal)
- Daily spending bar chart (last 7 days)
- Spending by category pie chart
- Smart insight cards (biggest spend, savings goal progress)
- Recent expenses list

### 2. Expenses (`/expenses`)
- Fast expense entry modal
- 13 student-relevant categories with Lucide icons
- Month filter
- Total expenses summary
- Expense list with delete capability
- Empty state guidance

### 3. Money Received (`/money-received`)
- Record money from 6 sources (Parents, Scholarship, Freelance, Part-time, Gift, Other)
- Source selector with icons
- Month filter
- Total received summary
- History list with delete

### 4. Saved Money (`/saved-money`)
- Add saved money entries
- Remove saved money (with validation — can't remove more than current balance)
- Current saved money display
- Full history with add/remove indicators
- Delete entries

### 5. Budgets (`/budgets`)
- Set monthly or weekly budgets per category
- Progress bars with color coding (green → yellow → red)
- Warnings when approaching or exceeding limits
- Overall budget progress
- Month filter
- Delete budgets

### 6. Savings Goals (`/savings-goals`)
- Create goals with name, target amount, current saved, optional deadline
- Progress bars with percentage
- Edit existing goals
- Delete goals
- Goal completion celebration

### 7. Insights (`/insights`)
- Monthly summary (Received, Spent, Daily Average, Saved)
- Month-over-month comparison (% change)
- Smart textual insights (biggest expense, spending trends, pace warnings)
- Spending by category pie chart
- 6-month spending vs received bar chart

---

## Project Structure

```
expense-tracker-temp/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (sidebar + store provider)
│   │   ├── page.tsx                # Dashboard (home page)
│   │   ├── globals.css             # Global styles (Tailwind import + scrollbar)
│   │   ├── expenses/
│   │   │   └── page.tsx            # Expense tracking page
│   │   ├── money-received/
│   │   │   └── page.tsx            # Money received tracking page
│   │   ├── saved-money/
│   │   │   └── page.tsx            # Saved money tracker page
│   │   ├── budgets/
│   │   │   └── page.tsx            # Budget management page
│   │   ├── savings-goals/
│   │   │   └── page.tsx            # Savings goals page
│   │   └── insights/
│   │       └── page.tsx            # Spending insights & charts page
│   ├── components/
│   │   └── Sidebar.tsx             # Navigation sidebar (desktop + mobile)
│   └── lib/
│       ├── types.ts                # TypeScript interfaces and constants
│       └── store.tsx               # React Context store with localStorage
├── public/                         # Static assets (favicon, etc.)
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── tsconfig.json                   # TypeScript configuration
├── postcss.config.mjs              # PostCSS config (Tailwind plugin)
├── eslint.config.mjs               # ESLint flat config
├── next.config.ts                  # Next.js configuration
└── next-env.d.ts                   # Next.js TypeScript declarations
```

---

## Data Model

All data is defined in `src/lib/types.ts`:

### Expense
```typescript
interface Expense {
  id: string;          // Auto-generated unique ID
  amount: number;      // Expense amount in ₹
  category: string;    // Category name (e.g., "Food & Drinks")
  description: string; // Optional description
  date: string;        // ISO date string (YYYY-MM-DD)
  createdAt: string;   // Auto-generated timestamp
}
```

### MoneyReceived
```typescript
interface MoneyReceived {
  id: string;
  amount: number;
  source: string;      // "Parents" | "Scholarship" | "Freelance" | "Part-time" | "Gift" | "Other"
  date: string;
  note: string;        // Optional note
  createdAt: string;
}
```

### Budget
```typescript
interface Budget {
  id: string;
  category: string;    // Must match an EXPENSE_CATEGORIES name
  limit: number;       // Budget limit in ₹
  spent: number;       // Auto-calculated from expenses
  period: 'monthly' | 'weekly';
  createdAt: string;
}
```

### SavedMoneyEntry
```typescript
interface SavedMoneyEntry {
  id: string;
  amount: number;
  type: 'add' | 'remove';
  date: string;
  note: string;
  createdAt: string;
}
```

### SavingsGoal
```typescript
interface SavingsGoal {
  id: string;
  name: string;        // Goal name (e.g., "Buy headphones")
  target: number;      // Target amount in ₹
  current: number;     // Current amount saved
  deadline: string;    // Optional deadline (YYYY-MM-DD)
  createdAt: string;
}
```

### RecurringExpense
```typescript
interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
}
```

### AppSettings
```typescript
interface AppSettings {
  monthlyAllowance: number;  // Expected monthly allowance (default: ₹5,000)
}
```

### Expense Categories (13 total)
| Category | Icon (Lucide) | Color |
|----------|---------------|-------|
| Food & Drinks | Utensils | #ef4444 |
| Transport | Bus | #f97316 |
| Education | GraduationCap | #8b5cf6 |
| Rent / PG | Home | #6366f1 |
| Bills | Receipt | #3b82f6 |
| Mobile / Internet | Smartphone | #0ea5e9 |
| Entertainment | Gamepad2 | #22c55e |
| Shopping | ShoppingBag | #eab308 |
| Health | Heart | #ec4899 |
| Snacks / Coffee | Coffee | #d97316 |
| Subscriptions | Repeat | #14b8a6 |
| Gifts | Gift | #a855f7 |
| Other | MoreHorizontal | #78716c |

### Money Sources (6 total)
| Source | Icon (Lucide) | Color |
|--------|---------------|-------|
| Parents | CircleDollarSign | #22c55e |
| Scholarship | BookOpen | #8b5cf6 |
| Freelance | Laptop | #3b82f6 |
| Part-time | Bike | #f97316 |
| Gift | Gift | #ec4899 |
| Other | MoreHorizontal | #78716c |

---

## State Management

### React Context + localStorage

The app uses **React Context API** for global state management, implemented in `src/lib/store.tsx`:

- **`StoreProvider`** — Wraps the entire app, provides all state and methods via context
- **`useStore()`** — Custom hook to access the store from any component

**Data persistence:**
- All data is serialized to JSON and stored in `localStorage` under key `expensewise-data`
- Data is loaded on initial render and saved on every state change
- Legacy data from the previous version (key: `expense-tracker-data`) is automatically migrated

**Store methods include:**
- CRUD operations for all data types (add, delete, update)
- Computed helpers (`getTotalReceived`, `getTotalExpenses`, `getMoneyLeft`, `getCurrentSavedMoney`, `getSpentByCategory`)
- Month-aware filtering
- Validation (e.g., can't remove more saved money than exists)

---

## Styling System

### Tailwind CSS 4

All styling is done through **Tailwind CSS utility classes** directly in JSX:

- **Layout:** `flex`, `grid`, `gap-*`, `p-*`, `m-*`
- **Typography:** `text-sm`, `font-bold`, `text-gray-900`
- **Colors:** `bg-indigo-600`, `text-red-600`, `border-gray-200`
- **Shapes:** `rounded-xl`, `rounded-2xl`, `rounded-full`
- **Effects:** `shadow-sm`, `shadow-2xl`, `backdrop-blur-sm`
- **Transitions:** `transition-colors`, `transition-all`, `hover:bg-gray-50`
- **Responsive:** `md:grid-cols-4`, `lg:grid-cols-2`

### Design System
- **Primary accent:** Indigo (#6366f1)
- **Success:** Green (#22c55e)
- **Danger:** Red (#ef4444)
- **Warning:** Yellow/Amber (#eab308)
- **Background:** Gray-50 (#f9fafb)
- **Cards:** White with subtle borders and shadows
- **Border radius:** 12px (xl) for cards, 16px (2xl) for modals

---

## Charts & Visualization

### Recharts 3.10.1

Charts are built with **Recharts**, a React charting library:

| Chart Type | Used In | Purpose |
|-----------|---------|---------|
| **BarChart** | Dashboard, Insights | Daily spending (7 days), 6-month trend (received vs spent) |
| **PieChart** | Dashboard, Insights | Spending breakdown by category (donut style with inner radius) |

**Chart components used:**
- `ResponsiveContainer` — Makes charts responsive to parent container
- `BarChart` + `Bar` — Vertical bar charts
- `PieChart` + `Pie` — Donut/pie charts with `innerRadius`
- `Cell` — Individual pie segment coloring
- `XAxis`, `YAxis` — Axis labels
- `Tooltip` — Hover tooltips with formatted ₹ values

---

## Icons

### Lucide React 1.33.0

All UI icons use **Lucide React** — a clean, consistent, MIT-licensed icon library:

| Icon | Used For |
|------|----------|
| `LayoutDashboard` | Dashboard nav |
| `ReceiptIndianRupee` | Expenses nav |
| `CircleDollarSign` | Money Received nav |
| `PiggyBank` | Saved Money nav |
| `Target` | Budgets & Savings Goals nav |
| `BarChart3` | Insights nav |
| `Menu` / `X` | Mobile hamburger menu |
| `Plus` / `Trash2` | Add and delete actions |
| `ArrowDownLeft` / `ArrowUpRight` | Income vs expense indicators |
| `Wallet` | Money Left stat card |
| `Calendar` | Safe Daily Spend card |
| `AlertTriangle` | Budget warnings |
| `TrendingDown` / `TrendingUp` | Insight indicators |
| `Pencil` | Edit goal |
| Category-specific icons | Utensils, Bus, GraduationCap, Home, Receipt, Smartphone, Gamepad2, ShoppingBag, Heart, Coffee, Repeat, Gift, MoreHorizontal |

---

## Routing

### Next.js App Router

Routes are file-system based under `src/app/`:

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Dashboard (home) |
| `/expenses` | `src/app/expenses/page.tsx` | Expense tracking |
| `/money-received` | `src/app/money-received/page.tsx` | Money received tracking |
| `/saved-money` | `src/app/saved-money/page.tsx` | Saved money tracker |
| `/budgets` | `src/app/budgets/page.tsx` | Budget management |
| `/savings-goals` | `src/app/savings-goals/page.tsx` | Savings goals |
| `/insights` | `src/app/insights/page.tsx` | Spending insights |

All pages are **statically generated** at build time but render client-side due to `'use client'` directive (needed for localStorage and hooks).

---

## TypeScript Configuration

From `tsconfig.json`:

| Setting | Value | Purpose |
|---------|-------|---------|
| `target` | ES2017 | Compile to ES2017 (async/await natively supported) |
| `strict` | true | Enable all strict type-checking options |
| `module` | esnext | Use ES module syntax |
| `moduleResolution` | bundler | Module resolution for bundlers (Next.js/Turbopack) |
| `jsx` | react-jsx | Transform JSX using the automatic runtime |
| `noEmit` | true | Don't emit compiled files (Next.js handles this) |
| `isolatedModules` | true | Ensure each file can be independently compiled |
| `paths` | `@/*` → `./src/*` | Path alias for clean imports |

---

## Linting

### ESLint 9 (Flat Config)

From `eslint.config.mjs`:

- **`eslint-config-next/core-web-vitals`** — Next.js recommended rules + Core Web Vitals best practices
- **`eslint-config-next/typescript`** — TypeScript-specific ESLint rules
- **Global ignores:** `.next/`, `out/`, `build/`, `next-env.d.ts`

Run linting with:
```bash
npm run lint
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+ (tested with 24.x)
- **npm** (or yarn/pnpm/bun)

### Installation
```bash
# Clone or extract the project
cd expense-tracker-temp

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build    # Type-check + build optimized production bundle
npm start        # Start production server
```

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server with hot reloading |
| `build` | `next build` | Type-check and create optimized production build |
| `start` | `next start` | Start the production server |
| `lint` | `eslint` | Run ESLint to check code quality |

---

## Browser Support

The app targets modern browsers:
- Chrome/Edge 90+
- Firefox 90+
- Safari 15+
- Any browser supporting ES2017+

**Features used:**
- CSS Grid & Flexbox
- CSS Custom Properties
- `localStorage` API
- `IntersectionObserver` (via Recharts)
- Modern JavaScript (async/await, optional chaining, nullish coalescing)

---

## Data Persistence

### localStorage

All data persists in the browser's `localStorage`:

| Key | Contents |
|-----|----------|
| `expensewise-data` | All app data (expenses, money received, budgets, saved money, savings goals, settings) |
| `expense-tracker-data` | Legacy data from previous version (auto-migrated) |

**Important notes:**
- Data stays in the browser — no server-side storage
- Data does NOT sync across devices
- Clearing browser data will delete all app data
- The app gracefully handles missing/corrupt data

---

## Accessibility

- All interactive elements have `aria-label` attributes
- Form inputs have associated `<label>` elements
- Color is never the sole indicator of status (text labels always accompany colors)
- Keyboard navigation works throughout
- Focus states are visible on all interactive elements
- Semantic HTML used where appropriate (`<nav>`, `<main>`, `<aside>`, `<button>`)

---

## Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| **Mobile** (< 768px) | Single column, hamburger menu, stacked cards |
| **Tablet** (768px - 1024px) | 2-column grid for stat cards, sidebar visible |
| **Desktop** (> 1024px) | Full sidebar, 4-column stat cards, 2-column chart layout |

---

## Performance

- **Static Generation:** All pages are pre-rendered at build time
- **Code Splitting:** Each route loads only its required code
- **Optimized Bundles:** Next.js + Turbopack tree-shakes unused code
- **Lazy Charts:** Recharts components load on demand
- **Minimal Dependencies:** Only 5 production dependencies

---

## License

This is a personal project. All rights reserved.
