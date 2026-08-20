# ExpenseWise — Project Context

> **Last Updated:** August 20, 2026  
> **Project Root:** `D:\AKSHATSEX\Accounts`

---

## Overview

ExpenseWise is a personal finance tracking web application built for college students living away from home. It tracks expenses, money received, savings goals, budgets, and spending insights — all with a clean, modern, mobile-friendly interface.

**Key feature:** Runs entirely in the browser with localStorage, and syncs to Supabase cloud when the user is logged in.

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.3.1 | Full-stack React framework (App Router) |
| React | 19.2.8 | UI component library |
| TypeScript | 5.x | Static type checking |
| Tailwind CSS | 4.x | Utility-first CSS |
| Supabase | 2.112.3 | Database + Auth |
| Recharts | 3.10.1 | Charts (bar, pie) |
| Lucide React | latest | Icons |

---

## Project Structure

```
D:\AKSHATSEX\Accounts\
├── .env.local                          # Supabase credentials (URL + anon key)
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript config
├── postcss.config.mjs                  # PostCSS config for Tailwind
├── context.md                          # This file — project context
│
├── supabase/
│   └── schema.sql                      # SQL schema — RUN THIS in Supabase SQL Editor
│
├── public/
│   └── manifest.json                   # PWA manifest for iOS/Android home screen
│
└── src/
    ├── app/
    │   ├── layout.tsx                  # Root layout — wraps with ThemeProvider > AuthProvider > StoreProvider
    │   ├── page.tsx                    # Dashboard (home page)
    │   ├── globals.css                 # Tailwind import + dark mode + mobile optimizations
    │   ├── not-found.tsx               # 404 error page
    │   │
    │   ├── expenses/
    │   │   └── page.tsx                # Expense tracking — add/delete/filter by month
    │   ├── money-received/
    │   │   └── page.tsx                # Money received — add/delete/filter by month
    │   ├── saved-money/
    │   │   └── page.tsx                # Saved money — add/remove entries, history
    │   ├── budgets/
    │   │   └── page.tsx                # Budgets — set limits per category, progress bars
    │   ├── savings-goals/
    │   │   └── page.tsx                # Savings goals — create/edit/delete goals
    │   ├── insights/
    │   │   └── page.tsx                # Insights — charts, trends, smart text insights
    │   ├── login/
    │   │   └── page.tsx                # Login page — email/password + Google OAuth
    │   ├── signup/
    │   │   └── page.tsx                # Signup page — create account
    │   └── profile/
    │       └── page.tsx                # Profile — account info, stats, dark mode, sign out
    │
    ├── components/
    │   └── Sidebar.tsx                 # Navigation — desktop sidebar + mobile bottom tab bar + theme toggle
    │
    └── lib/
        ├── auth.tsx                    # AuthContext — Supabase Auth (signIn, signUp, signOut, Google)
        ├── store.tsx                   # StoreContext — all data CRUD + computed helpers + Supabase sync
        ├── supabase.ts                 # Supabase client config + DB type definitions
        ├── theme.tsx                   # ThemeContext — dark/light/system mode toggle
        └── types.ts                    # Legacy TypeScript interfaces (mostly unused now)
```

---

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Greeting, stat cards, charts, recent expenses, quick actions |
| `/expenses` | Expenses | Add/delete expenses, month filter, category selector |
| `/money-received` | Money Received | Add/delete income, source selector, month filter |
| `/saved-money` | Saved Money | Add/remove saved money, history |
| `/budgets` | Budgets | Set budgets per category, progress bars, warnings |
| `/savings-goals` | Savings Goals | Create/edit/delete goals with progress tracking |
| `/insights` | Insights | Monthly summary, trends, pie/bar charts, smart insights |
| `/login` | Login | Email/password + Google sign-in |
| `/signup` | Signup | Create new account |
| `/profile` | Profile | Account info, stats, theme toggle, clear data, sign out |
| `*` | 404 | Not found page |

---

## Providers (wrapped in layout.tsx)

```
ThemeProvider (theme.tsx)
  └── AuthProvider (auth.tsx)
       └── StoreProvider (store.tsx)
            └── <Sidebar /> + <main>{children}</main>
```

---

## Data Model

### Expense
```typescript
{ id, amount, category, description, date, createdAt }
```

### MoneyReceived
```typescript
{ id, amount, source, date, note, createdAt }
```

### Budget
```typescript
{ id, category, limit, spent, period ('monthly'|'weekly'), createdAt }
```

### SavedMoneyEntry
```typescript
{ id, amount, type ('add'|'remove'), date, note, createdAt }
```

### SavingsGoal
```typescript
{ id, name, target, current, deadline, createdAt }
```

### AppSettings
```typescript
{ monthlyAllowance }
```

---

## Expense Categories (13)

| Category | Color |
|----------|-------|
| Food & Drinks | #ef4444 |
| Transport | #f97316 |
| Education | #8b5cf6 |
| Rent / PG | #6366f1 |
| Bills | #3b82f6 |
| Mobile / Internet | #0ea5e9 |
| Entertainment | #22c55e |
| Shopping | #eab308 |
| Health | #ec4899 |
| Snacks / Coffee | #d97316 |
| Subscriptions | #14b8a6 |
| Gifts | #a855f7 |
| Other | #78716c |

## Money Sources (6)

| Source | Color |
|--------|-------|
| Parents | #22c55e |
| Scholarship | #8b5cf6 |
| Freelance | #3b82f6 |
| Part-time | #f97316 |
| Gift | #ec4899 |
| Other | #78716c |

---

## State Management

### Three Context Providers:

1. **ThemeContext** (`src/lib/theme.tsx`)
   - Manages light/dark/system theme
   - Persists to `localStorage` key: `expensewise-theme`
   - Toggles `.dark` class on `<html>` element

2. **AuthContext** (`src/lib/auth.tsx`)
   - Uses real Supabase Auth
   - Methods: `signIn`, `signUp`, `signOut`, `signInWithGoogle`
   - Exposes `user` object: `{ id, email, name }`

3. **StoreContext** (`src/lib/store.tsx`)
   - All CRUD operations for expenses, money received, budgets, saved money, savings goals
   - **Dual persistence:** writes to both Supabase (when logged in) AND localStorage (always as backup)
   - Computed helpers: `getTotalReceived`, `getTotalExpenses`, `getMoneyLeft`, `getCurrentSavedMoney`, `getSpentByCategory`
   - `isUsingCloud` boolean to check if Supabase is active

---

## Supabase Setup

### Credentials
- **Project URL:** `https://ihzrhhrlfccvorbwjlqr.supabase.co`
- **Anon Key:** stored in `.env.local`

### Database Tables
Created by running `supabase/schema.sql`:
- `expenses` (id, user_id, amount, category, description, date, created_at)
- `money_received` (id, user_id, amount, source, date, note, created_at)
- `budgets` (id, user_id, category, limit, spent, period, created_at)
- `saved_money_entries` (id, user_id, amount, type, date, note, created_at)
- `savings_goals` (id, user_id, name, target, current, deadline, created_at)
- `app_settings` (user_id PK, monthly_allowance, updated_at)

### Security
- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data (`auth.uid() = user_id`)
- Indexes on user_id and date columns for performance

---

## UI Features

### Dark Mode
- **3 modes:** Light / Dark / System (follows OS preference)
- Toggle in sidebar (desktop) and slide-out menu (mobile)
- Persisted to localStorage
- Smooth transitions on all color changes

### Mobile Responsive
- **Desktop:** Full sidebar + main content
- **Mobile:** Hamburger menu + bottom tab bar (Home, Expenses, Money, Budgets, Profile)
- Touch-friendly 44px minimum touch targets
- Safe area insets for iPhone notch (Dynamic Island)
- PWA manifest for Add to Home Screen on iOS/Android

### Button Interactivity
- `active:scale-95` on all buttons for tactile press feedback
- `hover:shadow-md` on cards for lift effect
- Colored shadows on primary buttons (`shadow-indigo-600/20`)
- Smooth transitions on all interactive elements

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build + type check
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Getting Started

1. Install dependencies: `npm install`
2. Run the SQL schema in Supabase SQL Editor (from `supabase/schema.sql`)
3. Start dev server: `npm run dev`
4. Open `http://localhost:3000`
5. Sign up for an account on `/signup`

---

## Known Issues

- `src/lib/types.ts` contains legacy interfaces (Account, Transaction, Transfer) that are no longer used — can be cleaned up
- `generate-files.cjs` at root is a leftover generator script — can be deleted
- Supabase Google OAuth requires additional setup in Supabase dashboard (Authentication > Providers > Google)

---

## Design System

| Element | Value |
|---------|-------|
| Primary accent | Indigo (#6366f1) |
| Success | Green (#22c55e) |
| Danger | Red (#ef4444) |
| Warning | Amber (#eab308) |
| Light background | Gray-50 (#f9fafb) |
| Dark background | Gray-950 (#030712) |
| Cards | White dark:bg-gray-800 with subtle borders |
| Border radius | xl (12px) for cards, 2xl (16px) for modals |
| Font | Inter (Google Fonts) |
| Currency | ₹ (Indian Rupee) |
