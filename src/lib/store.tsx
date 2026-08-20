'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  Utensils, Bus, GraduationCap, Home, Receipt, Smartphone,
  Gamepad2, ShoppingBag, Heart, Coffee, Repeat, Gift, MoreHorizontal,
  CircleDollarSign, BookOpen, Bike, Laptop
} from 'lucide-react';
import { supabase } from './supabase';
import { useAuth } from './auth';

// ===================== TYPES =====================

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface MoneyReceived {
  id: string;
  amount: number;
  source: string;
  date: string;
  note: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly';
  createdAt: string;
}

export interface SavedMoneyEntry {
  id: string;
  amount: number;
  type: 'add' | 'remove';
  date: string;
  note: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  createdAt: string;
}

export interface AppSettings {
  monthlyAllowance: number;
}

// ===================== CONSTANTS =====================

export const EXPENSE_CATEGORIES = [
  { name: 'Food & Drinks', icon: Utensils, color: '#ef4444' },
  { name: 'Transport', icon: Bus, color: '#f97316' },
  { name: 'Education', icon: GraduationCap, color: '#8b5cf6' },
  { name: 'Rent / PG', icon: Home, color: '#6366f1' },
  { name: 'Bills', icon: Receipt, color: '#3b82f6' },
  { name: 'Mobile / Internet', icon: Smartphone, color: '#0ea5e9' },
  { name: 'Entertainment', icon: Gamepad2, color: '#22c55e' },
  { name: 'Shopping', icon: ShoppingBag, color: '#eab308' },
  { name: 'Health', icon: Heart, color: '#ec4899' },
  { name: 'Snacks / Coffee', icon: Coffee, color: '#d97316' },
  { name: 'Subscriptions', icon: Repeat, color: '#14b8a6' },
  { name: 'Gifts', icon: Gift, color: '#a855f7' },
  { name: 'Other', icon: MoreHorizontal, color: '#78716c' },
];

export const MONEY_SOURCES = [
  { name: 'Parents', icon: CircleDollarSign, color: '#22c55e' },
  { name: 'Scholarship', icon: BookOpen, color: '#8b5cf6' },
  { name: 'Freelance', icon: Laptop, color: '#3b82f6' },
  { name: 'Part-time', icon: Bike, color: '#f97316' },
  { name: 'Gift', icon: Gift, color: '#ec4899' },
  { name: 'Other', icon: MoreHorizontal, color: '#78716c' },
];

// ===================== STORE =====================

interface StoreData {
  expenses: Expense[];
  moneyReceived: MoneyReceived[];
  budgets: Budget[];
  savedMoneyEntries: SavedMoneyEntry[];
  savingsGoals: SavingsGoal[];
  recurringExpenses: RecurringExpense[];
  settings: AppSettings;
}

interface StoreContextType extends StoreData {
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addMoneyReceived: (m: Omit<MoneyReceived, 'id' | 'createdAt'>) => void;
  deleteMoneyReceived: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavedMoneyEntry: (e: Omit<SavedMoneyEntry, 'id' | 'createdAt'>) => void;
  deleteSavedMoneyEntry: (id: string) => void;
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addRecurringExpense: (r: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  updateRecurringExpense: (id: string, data: Partial<RecurringExpense>) => void;
  deleteRecurringExpense: (id: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  getTotalReceived: (month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getMoneyLeft: (month?: string) => number;
  getCurrentSavedMoney: () => number;
  getSpentByCategory: (month?: string) => Record<string, number>;
  isUsingCloud: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);
const STORAGE_KEY = 'expensewise-data';
const LEGACY_KEY = 'expense-tracker-data';

function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function mk(d: string) { return d.slice(0, 7); }

// ===================== LOCAL STORAGE HELPERS =====================

const emptyData: StoreData = {
  expenses: [], moneyReceived: [], budgets: [], savedMoneyEntries: [],
  savingsGoals: [], recurringExpenses: [], settings: { monthlyAllowance: 5000 }
};

function migrate(): StoreData {
  const empty = { ...emptyData };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return empty;
    const l = JSON.parse(raw);
    if (l.transactions) {
      for (const t of l.transactions) {
        if (t.type === 'expense') empty.expenses.push({ id: t.id, amount: t.amount, category: t.category, description: t.description, date: t.date, createdAt: t.createdAt });
        else empty.moneyReceived.push({ id: t.id, amount: t.amount, source: 'Other', date: t.date, note: t.description, createdAt: t.createdAt });
      }
    }
    if (l.budgets) {
      for (const b of l.budgets) empty.budgets.push({ id: b.id, category: b.category, limit: b.limit, spent: b.spent || 0, period: b.period || 'monthly', createdAt: b.createdAt });
    }
    return empty;
  } catch { return empty; }
}

function loadLocalData(): StoreData {
  if (typeof window === 'undefined') return { ...emptyData };
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch { /* ignore */ }
  return migrate();
}

function saveLocalData(d: StoreData) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

// ===================== SUPABASE HELPERS =====================

async function loadSupabaseData(userId: string): Promise<StoreData> {
  const [expensesRes, moneyRes, budgetsRes, savedRes, goalsRes, recurringRes, settingsRes] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('money_received').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('budgets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('saved_money_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('savings_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('recurring_expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('app_settings').select('*').eq('user_id', userId).single(),
  ]);

  return {
    expenses: (expensesRes.data || []).map(e => ({
      id: e.id, amount: e.amount, category: e.category,
      description: e.description, date: e.date, createdAt: e.created_at,
    })),
    moneyReceived: (moneyRes.data || []).map(m => ({
      id: m.id, amount: m.amount, source: m.source,
      date: m.date, note: m.note, createdAt: m.created_at,
    })),
    budgets: (budgetsRes.data || []).map(b => ({
      id: b.id, category: b.category, limit: b.limit,
      spent: b.spent, period: b.period, createdAt: b.created_at,
    })),
    savedMoneyEntries: (savedRes.data || []).map(s => ({
      id: s.id, amount: s.amount, type: s.type,
      date: s.date, note: s.note, createdAt: s.created_at,
    })),
    savingsGoals: (goalsRes.data || []).map(g => ({
      id: g.id, name: g.name, target: g.target,
      current: g.current, deadline: g.deadline || '', createdAt: g.created_at,
    })),
    recurringExpenses: (recurringRes.data || []).map(r => ({
      id: r.id, name: r.name, amount: r.amount,
      category: r.category, frequency: r.frequency, createdAt: r.created_at,
    })),
    settings: settingsRes.data
      ? { monthlyAllowance: settingsRes.data.monthly_allowance }
      : { monthlyAllowance: 5000 },
  };
}

// ===================== PROVIDER =====================

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<StoreData>({ ...emptyData });
  const [loaded, setLoaded] = useState(false);
  const [isUsingCloud, setIsUsingCloud] = useState(false);

  // Load data on mount
  useEffect(() => {
    async function init() {
      if (user) {
        try {
          const cloudData = await loadSupabaseData(user.id);
          setData(cloudData);
          setIsUsingCloud(true);
        } catch {
          // Fallback to local storage
          setData(loadLocalData());
          setIsUsingCloud(false);
        }
      } else {
        setData(loadLocalData());
        setIsUsingCloud(false);
      }
      setLoaded(true);
    }
    init();
  }, [user]);

  // Save to localStorage when data changes (always, as backup)
  useEffect(() => {
    if (loaded) saveLocalData(data);
  }, [data, loaded]);

  // ===================== EXPENSES =====================
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = gid();
    const createdAt = new Date().toISOString();
    setData(p => ({ ...p, expenses: [...p.expenses, { ...expense, id, createdAt }] }));
    if (user) {
      supabase.from('expenses').insert({
        id, user_id: user.id, amount: expense.amount,
        category: expense.category, description: expense.description,
        date: expense.date, created_at: createdAt,
      }).then(({ error }) => { if (error) console.error('Supabase insert error:', error); });
    }
  }, [user]);

  const updateExpense = useCallback((id: string, d: Partial<Expense>) => {
    setData(p => ({ ...p, expenses: p.expenses.map(e => e.id === id ? { ...e, ...d } : e) }));
    if (user) {
      const update: Record<string, unknown> = {};
      if (d.amount !== undefined) update.amount = d.amount;
      if (d.category !== undefined) update.category = d.category;
      if (d.description !== undefined) update.description = d.description;
      if (d.date !== undefined) update.date = d.date;
      supabase.from('expenses').update(update).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update error:', error);
      });
    }
  }, [user]);

  const deleteExpense = useCallback((id: string) => {
    setData(p => ({ ...p, expenses: p.expenses.filter(e => e.id !== id) }));
    if (user) {
      supabase.from('expenses').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error);
      });
    }
  }, [user]);

  // ===================== MONEY RECEIVED =====================
  const addMoneyReceived = useCallback((m: Omit<MoneyReceived, 'id' | 'createdAt'>) => {
    const id = gid();
    const createdAt = new Date().toISOString();
    setData(p => ({ ...p, moneyReceived: [...p.moneyReceived, { ...m, id, createdAt }] }));
    if (user) {
      supabase.from('money_received').insert({
        id, user_id: user.id, amount: m.amount,
        source: m.source, date: m.date, note: m.note, created_at: createdAt,
      }).then(({ error }) => { if (error) console.error('Supabase insert error:', error); });
    }
  }, [user]);

  const deleteMoneyReceived = useCallback((id: string) => {
    setData(p => ({ ...p, moneyReceived: p.moneyReceived.filter(m => m.id !== id) }));
    if (user) {
      supabase.from('money_received').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error);
      });
    }
  }, [user]);

  // ===================== BUDGETS =====================
  const addBudget = useCallback((b: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
    const id = gid();
    const createdAt = new Date().toISOString();
    setData(p => ({ ...p, budgets: [...p.budgets, { ...b, id, createdAt, spent: 0 }] }));
    if (user) {
      supabase.from('budgets').insert({
        id, user_id: user.id, category: b.category,
        limit: b.limit, spent: 0, period: b.period, created_at: createdAt,
      }).then(({ error }) => { if (error) console.error('Supabase insert error:', error); });
    }
  }, [user]);

  const updateBudget = useCallback((id: string, d: Partial<Budget>) => {
    setData(p => ({ ...p, budgets: p.budgets.map(b => b.id === id ? { ...b, ...d } : b) }));
    if (user) {
      const update: Record<string, unknown> = {};
      if (d.limit !== undefined) update.limit = d.limit;
      if (d.spent !== undefined) update.spent = d.spent;
      if (d.period !== undefined) update.period = d.period;
      if (d.category !== undefined) update.category = d.category;
      supabase.from('budgets').update(update).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update error:', error);
      });
    }
  }, [user]);

  const deleteBudget = useCallback((id: string) => {
    setData(p => ({ ...p, budgets: p.budgets.filter(b => b.id !== id) }));
    if (user) {
      supabase.from('budgets').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error);
      });
    }
  }, [user]);

  // ===================== SAVED MONEY =====================
  const addSavedMoneyEntry = useCallback((entry: Omit<SavedMoneyEntry, 'id' | 'createdAt'>) => {
    if (entry.type === 'remove') {
      const cur = data.savedMoneyEntries.reduce((s, e) => e.type === 'add' ? s + e.amount : s - e.amount, 0);
      if (entry.amount > cur) return;
    }
    const id = gid();
    const createdAt = new Date().toISOString();
    setData(p => ({ ...p, savedMoneyEntries: [...p.savedMoneyEntries, { ...entry, id, createdAt }] }));
    if (user) {
      supabase.from('saved_money_entries').insert({
        id, user_id: user.id, amount: entry.amount,
        type: entry.type, date: entry.date, note: entry.note, created_at: createdAt,
      }).then(({ error }) => { if (error) console.error('Supabase insert error:', error); });
    }
  }, [data.savedMoneyEntries, user]);

  const deleteSavedMoneyEntry = useCallback((id: string) => {
    setData(p => ({ ...p, savedMoneyEntries: p.savedMoneyEntries.filter(e => e.id !== id) }));
    if (user) {
      supabase.from('saved_money_entries').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error);
      });
    }
  }, [user]);

  // ===================== SAVINGS GOALS =====================
  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const id = gid();
    const createdAt = new Date().toISOString();
    setData(p => ({ ...p, savingsGoals: [...p.savingsGoals, { ...g, id, createdAt }] }));
    if (user) {
      supabase.from('savings_goals').insert({
        id, user_id: user.id, name: g.name, target: g.target,
        current: g.current, deadline: g.deadline || null, created_at: createdAt,
      }).then(({ error }) => { if (error) console.error('Supabase insert error:', error); });
    }
  }, [user]);

  const updateSavingsGoal = useCallback((id: string, d: Partial<SavingsGoal>) => {
    setData(p => ({ ...p, savingsGoals: p.savingsGoals.map(g => g.id === id ? { ...g, ...d } : g) }));
    if (user) {
      const update: Record<string, unknown> = {};
      if (d.name !== undefined) update.name = d.name;
      if (d.target !== undefined) update.target = d.target;
      if (d.current !== undefined) update.current = d.current;
      if (d.deadline !== undefined) update.deadline = d.deadline || null;
      supabase.from('savings_goals').update(update).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update error:', error);
      });
    }
  }, [user]);

  const deleteSavingsGoal = useCallback((id: string) => {
    setData(p => ({ ...p, savingsGoals: p.savingsGoals.filter(g => g.id !== id) }));
    if (user) {
      supabase.from('savings_goals').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error);
      });
    }
  }, [user]);

  // ===================== RECURRING EXPENSES =====================
  const addRecurringExpense = useCallback((r: Omit<RecurringExpense, 'id' | 'createdAt'>) => {
    const id = gid();
    const createdAt = new Date().toISOString();
    setData(p => ({ ...p, recurringExpenses: [...p.recurringExpenses, { ...r, id, createdAt }] }));
    if (user) {
      supabase.from('recurring_expenses').insert({
        id, user_id: user.id, name: r.name, amount: r.amount,
        category: r.category, frequency: r.frequency, created_at: createdAt,
      }).then(({ error }) => { if (error) console.error('Supabase insert error:', error); });
    }
  }, [user]);

  const updateRecurringExpense = useCallback((id: string, d: Partial<RecurringExpense>) => {
    setData(p => ({ ...p, recurringExpenses: p.recurringExpenses.map(r => r.id === id ? { ...r, ...d } : r) }));
    if (user) {
      const update: Record<string, unknown> = {};
      if (d.name !== undefined) update.name = d.name;
      if (d.amount !== undefined) update.amount = d.amount;
      if (d.category !== undefined) update.category = d.category;
      if (d.frequency !== undefined) update.frequency = d.frequency;
      supabase.from('recurring_expenses').update(update).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update error:', error);
      });
    }
  }, [user]);

  const deleteRecurringExpense = useCallback((id: string) => {
    setData(p => ({ ...p, recurringExpenses: p.recurringExpenses.filter(r => r.id !== id) }));
    if (user) {
      supabase.from('recurring_expenses').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete error:', error);
      });
    }
  }, [user]);

  // ===================== SETTINGS =====================
  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setData(p => ({ ...p, settings: { ...p.settings, ...s } }));
    if (user) {
      supabase.from('app_settings').upsert({
        user_id: user.id,
        monthly_allowance: s.monthlyAllowance ?? data.settings.monthlyAllowance,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }).then(({ error }) => {
        if (error) console.error('Supabase upsert error:', error);
      });
    }
  }, [user, data.settings.monthlyAllowance]);

  // ===================== COMPUTED VALUES =====================
  const getTotalReceived = useCallback((month?: string) => {
    const m = month || mk(new Date().toISOString().slice(0, 10));
    return data.moneyReceived.filter(x => mk(x.date) === m).reduce((s, x) => s + x.amount, 0);
  }, [data.moneyReceived]);

  const getTotalExpenses = useCallback((month?: string) => {
    const m = month || mk(new Date().toISOString().slice(0, 10));
    return data.expenses.filter(x => mk(x.date) === m).reduce((s, x) => s + x.amount, 0);
  }, [data.expenses]);

  const getMoneyLeft = useCallback((month?: string) => getTotalReceived(month) - getTotalExpenses(month), [getTotalReceived, getTotalExpenses]);

  const getCurrentSavedMoney = useCallback(() => {
    return data.savedMoneyEntries.reduce((s, e) => e.type === 'add' ? s + e.amount : s - e.amount, 0);
  }, [data.savedMoneyEntries]);

  const getSpentByCategory = useCallback((month?: string) => {
    const m = month || mk(new Date().toISOString().slice(0, 10));
    const r: Record<string, number> = {};
    data.expenses.filter(x => mk(x.date) === m).forEach(x => { r[x.category] = (r[x.category] || 0) + x.amount; });
    return r;
  }, [data.expenses]);

  if (!loaded) return null;

  return (
    <StoreContext.Provider value={{
      ...data, addExpense, updateExpense, deleteExpense, addMoneyReceived, deleteMoneyReceived,
      addBudget, updateBudget, deleteBudget, addSavedMoneyEntry, deleteSavedMoneyEntry,
      addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      addRecurringExpense, updateRecurringExpense, deleteRecurringExpense,
      updateSettings, getTotalReceived, getTotalExpenses, getMoneyLeft,
      getCurrentSavedMoney, getSpentByCategory, isUsingCloud,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
