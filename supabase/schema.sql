-- ============================================
-- ExpenseWise Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- MONEY RECEIVED TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS money_received (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  source TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- BUDGETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  "limit" NUMERIC(12, 2) NOT NULL CHECK ("limit" > 0),
  spent NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SAVED MONEY ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_money_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('add', 'remove')),
  date DATE NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SAVINGS GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target NUMERIC(12, 2) NOT NULL CHECK (target > 0),
  current NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- RECURRING EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- APP SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  monthly_allowance NUMERIC(12, 2) DEFAULT 5000 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);

CREATE INDEX IF NOT EXISTS idx_money_received_user_id ON money_received(user_id);
CREATE INDEX IF NOT EXISTS idx_money_received_date ON money_received(date);
CREATE INDEX IF NOT EXISTS idx_money_received_user_date ON money_received(user_id, date);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

CREATE INDEX IF NOT EXISTS idx_saved_money_user_id ON saved_money_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE money_received ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_money_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own money_received" ON money_received FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own money_received" ON money_received FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own money_received" ON money_received FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own money_received" ON money_received FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own saved_money" ON saved_money_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved_money" ON saved_money_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved_money" ON saved_money_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved_money" ON saved_money_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own savings_goals" ON savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings_goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings_goals" ON savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings_goals" ON savings_goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recurring_expenses" ON recurring_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recurring_expenses" ON recurring_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring_expenses" ON recurring_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring_expenses" ON recurring_expenses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON app_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON app_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON app_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON app_settings FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- PAYMENT METHOD MIGRATION
-- ============================================
-- Existing rows remain valid and are treated as Other by the app.
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'other';
ALTER TABLE money_received ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'other';

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_payment_method_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_payment_method_check
  CHECK (payment_method IN ('cash', 'bank_upi', 'card', 'other'));

ALTER TABLE money_received DROP CONSTRAINT IF EXISTS money_received_payment_method_check;
ALTER TABLE money_received ADD CONSTRAINT money_received_payment_method_check
  CHECK (payment_method IN ('cash', 'bank_upi', 'card', 'other'));
