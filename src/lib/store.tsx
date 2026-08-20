'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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

// All mutating operations return Promise<{ error?: string }> so pages can
// show errors when a database operation fails instead of silently pretending success.
interface MutResult { error?: string }

interface StoreContextType extends StoreData {
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => Promise<MutResult>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<MutResult>;
  deleteExpense: (id: string) => Promise<MutResult>;
  addMoneyReceived: (m: Omit<MoneyReceived, 'id' | 'createdAt'>) => Promise<MutResult>;
  deleteMoneyReceived: (id: string) => Promise<MutResult>;
  addBudget: (b: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => Promise<MutResult>;
  updateBudget: (id: string, data: Partial<Budget>) => Promise<MutResult>;
  deleteBudget: (id: string) => Promise<MutResult>;
  addSavedMoneyEntry: (e: Omit<SavedMoneyEntry, 'id' | 'createdAt'>) => Promise<MutResult>;
  deleteSavedMoneyEntry: (id: string) => Promise<MutResult>;
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => Promise<MutResult>;
  updateSavingsGoal: (id: string, data: Partial<SavingsGoal>) => Promise<MutResult>;
  deleteSavingsGoal: (id: string) => Promise<MutResult>;
  addRecurringExpense: (r: Omit<RecurringExpense, 'id' | 'createdAt'>) => Promise<MutResult>;
  updateRecurringExpense: (id: string, data: Partial<RecurringExpense>) => Promise<MutResult>;
  deleteRecurringExpense: (id: string) => Promise<MutResult>;
  updateSettings: (s: Partial<AppSettings>) => Promise<MutResult>;
  getTotalReceived: (month?: string) => number;
  getTotalExpenses: (month?: string) => number;
  getMoneyLeft: (month?: string) => number;
  getCurrentSavedMoney: () => number;
  getSpentByCategory: (month?: string) => Record<string, number>;
  isUsingCloud: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

function mk(d: string) { return d.slice(0, 7); }

// Generate a proper UUID v4 for Supabase (schema uses UUID type)
function newUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ===================== EMPTY STATE =====================

const emptyData: StoreData = {
  expenses: [], moneyReceived: [], budgets: [], savedMoneyEntries: [],
  savingsGoals: [], recurringExpenses: [], settings: { monthlyAllowance: 5000 }
};

// ===================== SUPABASE DATA LOADING =====================

async function loadSupabaseData(userId: string): Promise<StoreData> {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB] Loading all data from Supabase for user:', userId);
  }

  const [expensesRes, moneyRes, budgetsRes, savedRes, goalsRes, recurringRes, settingsRes] = await Promise.all([
    supabase.from('expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('money_received').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('budgets').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('saved_money_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('savings_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('recurring_expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('app_settings').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  // Log any SELECT errors in development
  if (process.env.NODE_ENV === 'development') {
    if (expensesRes.error) console.error('[DB] expenses SELECT error:', expensesRes.error);
    if (moneyRes.error) console.error('[DB] money_received SELECT error:', moneyRes.error);
    if (budgetsRes.error) console.error('[DB] budgets SELECT error:', budgetsRes.error);
    if (savedRes.error) console.error('[DB] saved_money_entries SELECT error:', savedRes.error);
    if (goalsRes.error) console.error('[DB] savings_goals SELECT error:', goalsRes.error);
    if (recurringRes.error) console.error('[DB] recurring_expenses SELECT error:', recurringRes.error);
    if (settingsRes.error) console.error('[DB] app_settings SELECT error:', settingsRes.error);
    console.log('[DB] Rows loaded — expenses:', expensesRes.data?.length ?? 0,
      '| money_received:', moneyRes.data?.length ?? 0,
      '| budgets:', budgetsRes.data?.length ?? 0,
      '| saved_money_entries:', savedRes.data?.length ?? 0,
      '| savings_goals:', goalsRes.data?.length ?? 0,
      '| recurring_expenses:', recurringRes.data?.length ?? 0,
      '| settings:', settingsRes.data ? 'found' : 'not found');
  }

  return {
    expenses: (expensesRes.data || []).map(e => ({
      id: e.id, amount: Number(e.amount), category: e.category,
      description: e.description, date: e.date, createdAt: e.created_at,
    })),
    moneyReceived: (moneyRes.data || []).map(m => ({
      id: m.id, amount: Number(m.amount), source: m.source,
      date: m.date, note: m.note, createdAt: m.created_at,
    })),
    budgets: (budgetsRes.data || []).map(b => ({
      id: b.id, category: b.category, limit: Number(b.limit),
      spent: Number(b.spent), period: b.period, createdAt: b.created_at,
    })),
    savedMoneyEntries: (savedRes.data || []).map(s => ({
      id: s.id, amount: Number(s.amount), type: s.type,
      date: s.date, note: s.note, createdAt: s.created_at,
    })),
    savingsGoals: (goalsRes.data || []).map(g => ({
      id: g.id, name: g.name, target: Number(g.target),
      current: Number(g.current), deadline: g.deadline || '', createdAt: g.created_at,
    })),
    recurringExpenses: (recurringRes.data || []).map(r => ({
      id: r.id, name: r.name, amount: Number(r.amount),
      category: r.category, frequency: r.frequency, createdAt: r.created_at,
    })),
    settings: settingsRes.data
      ? { monthlyAllowance: Number(settingsRes.data.monthly_allowance) }
      : { monthlyAllowance: 5000 },
  };
}

// ===================== PROVIDER =====================

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<StoreData>({ ...emptyData });
  const [loaded, setLoaded] = useState(false);
  const [isUsingCloud, setIsUsingCloud] = useState(false);

  // Track which user we last loaded for — clears data on logout or user switch
  const loadedForUserRef = useRef<string | null>(null);

  // Load data once auth resolves. Re-runs if user changes (login/logout/switch).
  useEffect(() => {
    // Don't run until AuthProvider has finished its async getSession() call.
    if (authLoading) return;

    async function init() {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUTH] user id after auth resolved:', user?.id ?? 'null (logged out)');
      }

      if (user) {
        // Only reload if the user actually changed
        if (loadedForUserRef.current === user.id && loaded) return;
        loadedForUserRef.current = user.id;

        try {
          const cloudData = await loadSupabaseData(user.id);
          setData(cloudData);
          setIsUsingCloud(true);
          setLoaded(true);
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[DB] Failed to load from Supabase:', err);
          }
          // Don't fall back to localStorage — surface the failure so it's visible
          setData({ ...emptyData });
          setIsUsingCloud(false);
          setLoaded(true);
        }
      } else {
        // User logged out — clear all financial data immediately
        if (loadedForUserRef.current !== null) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[AUTH] User logged out. Clearing application data.');
          }
          loadedForUserRef.current = null;
          setData({ ...emptyData });
          setIsUsingCloud(false);
          setLoaded(true);
        } else {
          // First load, not logged in — still mark as loaded so AuthGuard works
          setLoaded(true);
        }
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // ===================== EXPENSES =====================

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const id = newUUID();
    const createdAt = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') console.log('[EXPENSE] inserting:', expense.amount);

    const { error } = await supabase.from('expenses').insert({
      id, user_id: user.id, amount: expense.amount,
      category: expense.category, description: expense.description,
      date: expense.date, created_at: createdAt,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[EXPENSE] insert error:', error);
      return { error: error.message };
    }
    if (process.env.NODE_ENV === 'development') console.log('[EXPENSE] insert success');
    setData(p => ({ ...p, expenses: [{ ...expense, id, createdAt }, ...p.expenses] }));
    return {};
  }, [user]);

  const updateExpense = useCallback(async (id: string, d: Partial<Expense>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const update: Record<string, unknown> = {};
    if (d.amount !== undefined) update.amount = d.amount;
    if (d.category !== undefined) update.category = d.category;
    if (d.description !== undefined) update.description = d.description;
    if (d.date !== undefined) update.date = d.date;

    const { error } = await supabase.from('expenses').update(update).eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[EXPENSE] update error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, expenses: p.expenses.map(e => e.id === id ? { ...e, ...d } : e) }));
    return {};
  }, [user]);

  const deleteExpense = useCallback(async (id: string): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[EXPENSE] delete error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, expenses: p.expenses.filter(e => e.id !== id) }));
    return {};
  }, [user]);

  // ===================== MONEY RECEIVED =====================

  const addMoneyReceived = useCallback(async (m: Omit<MoneyReceived, 'id' | 'createdAt'>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const id = newUUID();
    const createdAt = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') console.log('[MONEY] inserting:', m.amount);

    const { error } = await supabase.from('money_received').insert({
      id, user_id: user.id, amount: m.amount,
      source: m.source, date: m.date, note: m.note, created_at: createdAt,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[MONEY] insert error:', error);
      return { error: error.message };
    }
    if (process.env.NODE_ENV === 'development') console.log('[MONEY] insert success');
    setData(p => ({ ...p, moneyReceived: [{ ...m, id, createdAt }, ...p.moneyReceived] }));
    return {};
  }, [user]);

  const deleteMoneyReceived = useCallback(async (id: string): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('money_received').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[MONEY] delete error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, moneyReceived: p.moneyReceived.filter(x => x.id !== id) }));
    return {};
  }, [user]);

  // ===================== BUDGETS =====================

  const addBudget = useCallback(async (b: Omit<Budget, 'id' | 'createdAt' | 'spent'>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const id = newUUID();
    const createdAt = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') console.log('[BUDGET] inserting:', b.category);

    const { error } = await supabase.from('budgets').insert({
      id, user_id: user.id, category: b.category,
      limit: b.limit, spent: 0, period: b.period, created_at: createdAt,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[BUDGET] insert error:', error);
      return { error: error.message };
    }
    if (process.env.NODE_ENV === 'development') console.log('[BUDGET] insert success');
    setData(p => ({ ...p, budgets: [{ ...b, id, createdAt, spent: 0 }, ...p.budgets] }));
    return {};
  }, [user]);

  const updateBudget = useCallback(async (id: string, d: Partial<Budget>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const update: Record<string, unknown> = {};
    if (d.limit !== undefined) update.limit = d.limit;
    if (d.spent !== undefined) update.spent = d.spent;
    if (d.period !== undefined) update.period = d.period;
    if (d.category !== undefined) update.category = d.category;

    const { error } = await supabase.from('budgets').update(update).eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[BUDGET] update error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, budgets: p.budgets.map(b => b.id === id ? { ...b, ...d } : b) }));
    return {};
  }, [user]);

  const deleteBudget = useCallback(async (id: string): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[BUDGET] delete error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, budgets: p.budgets.filter(b => b.id !== id) }));
    return {};
  }, [user]);

  // ===================== SAVED MONEY =====================

  const addSavedMoneyEntry = useCallback(async (entry: Omit<SavedMoneyEntry, 'id' | 'createdAt'>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    if (entry.type === 'remove') {
      const cur = data.savedMoneyEntries.reduce((s, e) => e.type === 'add' ? s + e.amount : s - e.amount, 0);
      if (entry.amount > cur) return { error: 'Cannot remove more than current saved amount' };
    }
    const id = newUUID();
    const createdAt = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') console.log('[SAVED] inserting:', entry.type, entry.amount);

    const { error } = await supabase.from('saved_money_entries').insert({
      id, user_id: user.id, amount: entry.amount,
      type: entry.type, date: entry.date, note: entry.note, created_at: createdAt,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[SAVED] insert error:', error);
      return { error: error.message };
    }
    if (process.env.NODE_ENV === 'development') console.log('[SAVED] insert success');
    setData(p => ({ ...p, savedMoneyEntries: [{ ...entry, id, createdAt }, ...p.savedMoneyEntries] }));
    return {};
  }, [user, data.savedMoneyEntries]);

  const deleteSavedMoneyEntry = useCallback(async (id: string): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('saved_money_entries').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[SAVED] delete error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, savedMoneyEntries: p.savedMoneyEntries.filter(e => e.id !== id) }));
    return {};
  }, [user]);

  // ===================== SAVINGS GOALS =====================

  const addSavingsGoal = useCallback(async (g: Omit<SavingsGoal, 'id' | 'createdAt'>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const id = newUUID();
    const createdAt = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') console.log('[GOAL] inserting:', g.name);

    const { error } = await supabase.from('savings_goals').insert({
      id, user_id: user.id, name: g.name, target: g.target,
      current: g.current, deadline: g.deadline || null, created_at: createdAt,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[GOAL] insert error:', error);
      return { error: error.message };
    }
    if (process.env.NODE_ENV === 'development') console.log('[GOAL] insert success');
    setData(p => ({ ...p, savingsGoals: [{ ...g, id, createdAt }, ...p.savingsGoals] }));
    return {};
  }, [user]);

  const updateSavingsGoal = useCallback(async (id: string, d: Partial<SavingsGoal>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const update: Record<string, unknown> = {};
    if (d.name !== undefined) update.name = d.name;
    if (d.target !== undefined) update.target = d.target;
    if (d.current !== undefined) update.current = d.current;
    if (d.deadline !== undefined) update.deadline = d.deadline || null;

    const { error } = await supabase.from('savings_goals').update(update).eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[GOAL] update error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, savingsGoals: p.savingsGoals.map(g => g.id === id ? { ...g, ...d } : g) }));
    return {};
  }, [user]);

  const deleteSavingsGoal = useCallback(async (id: string): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[GOAL] delete error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, savingsGoals: p.savingsGoals.filter(g => g.id !== id) }));
    return {};
  }, [user]);

  // ===================== RECURRING EXPENSES =====================

  const addRecurringExpense = useCallback(async (r: Omit<RecurringExpense, 'id' | 'createdAt'>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const id = newUUID();
    const createdAt = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') console.log('[RECURRING] inserting:', r.name);

    const { error } = await supabase.from('recurring_expenses').insert({
      id, user_id: user.id, name: r.name, amount: r.amount,
      category: r.category, frequency: r.frequency, created_at: createdAt,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[RECURRING] insert error:', error);
      return { error: error.message };
    }
    if (process.env.NODE_ENV === 'development') console.log('[RECURRING] insert success');
    setData(p => ({ ...p, recurringExpenses: [{ ...r, id, createdAt }, ...p.recurringExpenses] }));
    return {};
  }, [user]);

  const updateRecurringExpense = useCallback(async (id: string, d: Partial<RecurringExpense>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const update: Record<string, unknown> = {};
    if (d.name !== undefined) update.name = d.name;
    if (d.amount !== undefined) update.amount = d.amount;
    if (d.category !== undefined) update.category = d.category;
    if (d.frequency !== undefined) update.frequency = d.frequency;

    const { error } = await supabase.from('recurring_expenses').update(update).eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[RECURRING] update error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, recurringExpenses: p.recurringExpenses.map(r => r.id === id ? { ...r, ...d } : r) }));
    return {};
  }, [user]);

  const deleteRecurringExpense = useCallback(async (id: string): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await supabase.from('recurring_expenses').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[RECURRING] delete error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, recurringExpenses: p.recurringExpenses.filter(r => r.id !== id) }));
    return {};
  }, [user]);

  // ===================== SETTINGS =====================

  const updateSettings = useCallback(async (s: Partial<AppSettings>): Promise<MutResult> => {
    if (!user) return { error: 'Not authenticated' };
    const newAllowance = s.monthlyAllowance ?? data.settings.monthlyAllowance;

    const { error } = await supabase.from('app_settings').upsert({
      user_id: user.id,
      monthly_allowance: newAllowance,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('[SETTINGS] upsert error:', error);
      return { error: error.message };
    }
    setData(p => ({ ...p, settings: { ...p.settings, ...s } }));
    return {};
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
