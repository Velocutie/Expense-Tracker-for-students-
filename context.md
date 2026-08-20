# ExpenseWise — Project Context

## Overview
ExpenseWise is a **Next.js 16 (Turbopack)** personal finance app for college students. It tracks expenses, money received, saved money, budgets, savings goals, and recurring expenses. All data is stored in **Supabase** (PostgreSQL + Auth + RLS). The app uses the **App Router** with route groups.

## Tech Stack
- **Framework:** Next.js 16.3.1 (Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` syntax)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Icons:** Lucide React
- **Charts:** Recharts
- **State:** React Context (no Redux/Zustand)

## Project Structure
```
src/
  app/
    layout.tsx              ← Root layout (minimal: html/body + ThemeProvider + AuthProvider)
    globals.css             ← Tailwind + custom animations
    (auth)/                 ← Route group: NO sidebar, separate aesthetic UI
      layout.tsx            ← Just a wrapper div (no html/body)
      login/page.tsx        ← Split-screen login with animated gradient
      signup/page.tsx       ← Split-screen signup with animated gradient
    (main)/                 ← Route group: WITH sidebar + StoreProvider + AuthGuard
      layout.tsx            ← Sidebar + StoreProvider + AuthGuard
      page.tsx              ← Dashboard (recharts, stats, charts)
      expenses/page.tsx     ← CRUD with edit support
      money-received/page.tsx
      saved-money/page.tsx
      budgets/page.tsx      ← Auto-syncs spent from expenses
      savings-goals/page.tsx
      recurring-expenses/page.tsx
      insights/page.tsx
      profile/page.tsx      ← Edit name/email/password, allowance, export, theme
  lib/
    supabase.ts             ← Supabase client + Database type definitions
    auth.tsx                ← AuthProvider: signIn, signUp, signOut, updateName, updateEmail, updatePassword
    store.tsx               ← StoreProvider: all CRUD + Supabase sync + computed values
    theme.tsx               ← ThemeProvider (light/dark/system)
  components/
    Sidebar.tsx             ← Desktop sidebar + mobile bottom nav + theme toggle + profile link
    AuthGuard.tsx           ← Redirects unauthenticated to /login, authenticated away from /login
    Tip.tsx                 ← Reusable tip/advice component
supabase/
  schema.sql                ← Full database schema with 7 tables, indexes, RLS policies
```

## Database Tables (all in `supabase/schema.sql`)

| Table | Columns | Notes |
|-------|---------|-------|
| `expenses` | id, user_id, amount, category, description, date, created_at | |
| `money_received` | id, user_id, amount, source, date, note, created_at | |
| `budgets` | id, user_id, category, "limit", spent, period, created_at | `limit` is quoted (reserved keyword) |
| `saved_money_entries` | id, user_id, amount, type (add/remove), date, note, created_at | |
| `savings_goals` | id, user_id, name, target, current, deadline, created_at | |
| `recurring_expenses` | id, user_id, name, amount, category, frequency, created_at | |
| `app_settings` | user_id (PK), monthly_allowance, updated_at | One row per user |

All tables have:
- `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- Indexes on `user_id`
- RLS enabled with 4 policies each (SELECT, INSERT, UPDATE, DELETE using `auth.uid() = user_id`)

## Supabase Connection

**`.env.local`** must contain:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Client:** `src/lib/supabase.ts` exports `supabase` client and `Database` interface.

## Data Flow (all in `src/lib/store.tsx`)

Every feature follows the same pattern:
1. **Load:** `loadSupabaseData(userId)` fetches all tables via `Promise.all` on mount
2. **Create:** Updates React state optimistically → fires `.insert()` to Supabase
3. **Update:** Updates React state → fires `.update()` to Supabase
4. **Delete:** Updates React state → fires `.delete()` to Supabase
5. **Fallback:** localStorage always written as backup; used when not logged in

### Feature → Supabase Table Mapping

| Feature | Table | Load | Add | Update | Delete |
|---------|-------|------|-----|--------|--------|
| Expenses | `expenses` | ✅ | ✅ | ✅ | ✅ |
| Money Received | `money_received` | ✅ | ✅ | ❌ No UI | ✅ |
| Saved Money | `saved_money_entries` | ✅ | ✅ | ❌ No UI | ✅ |
| Budgets | `budgets` | ✅ | ✅ | ✅ | ✅ |
| Savings Goals | `savings_goals` | ✅ | ✅ | ✅ | ✅ |
| Recurring Expenses | `recurring_expenses` | ✅ | ✅ | ✅ | ✅ |
| App Settings | `app_settings` | ✅ | ✅ (upsert) | ✅ (upsert) | N/A |

### Dashboard Computed Values
- `getTotalReceived(month)` — sums `moneyReceived` for the month
- `getTotalExpenses(month)` — sums `expenses` for the month
- `getMoneyLeft(month)` — received - expenses
- `getCurrentSavedMoney()` — sums add/remove entries
- `getSpentByCategory(month)` — groups expenses by category

## Auth System (`src/lib/auth.tsx`)

- `AuthProvider` wraps the app, listens to `supabase.auth.onAuthStateChange()`
- Methods: `signIn`, `signUp`, `signOut`, `signInWithGoogle`, `updateName`, `updateEmail`, `updatePassword`
- `AuthGuard` component protects `(main)` routes — redirects to `/login` if not authenticated

## Profile Page Features (`src/app/(main)/profile/page.tsx`)

- Edit display name → `supabase.auth.updateUser({ data: { name } })`
- Edit email → `supabase.auth.updateUser({ email })` (sends confirmation)
- Change password → `supabase.auth.updateUser({ password })`
- Monthly allowance → `store.updateSettings()` → upserts to `app_settings`
- Export data → CSV or JSON download
- Theme toggle (light/dark/system)
- Clear all data (localStorage)
- Sign out

## Auth Pages UI (`src/app/(auth)/`)

- Split-screen design: gradient left, glass-morphism form card right
- Login: indigo→purple→pink gradient
- Signup: purple→pink→orange gradient
- Animations: floating orbs, fade-in cascades, shake on error, gradient shift
- CSS animations defined in `globals.css` keyframes

## Conventions

- All components use `'use client'`
- Lucide icons for all UI icons
- Indian Rupee symbol: `{'\u20B9'}`
- Date formatting: `en-IN` locale
- Rounded corners: `rounded-xl` or `rounded-2xl`
- Dark mode: `dark:` prefix variants throughout
- Touch targets: min 44px on mobile
- Error handling: `console.error` for Supabase errors, user-facing toast/alert not yet implemented

## Build Command
```bash
npm run build
```

## Known Gaps / Future Work
- No edit UI for Money Received or Saved Money entries (Supabase UPDATE policies exist but unused)
- No edit UI for Money Received (no `updateMoneyReceived` function in store)
- No edit UI for Saved Money entries (no `updateSavedMoneyEntry` function in store)
- No user-facing error toasts (errors only go to console)
- Recurring expenses don't auto-generate regular expense entries
- No data migration from localStorage to Supabase (only load fallback)
- No tests written yet
