const fs = require('fs');
const path = require('path');
const dir = __dirname;

function wf(rel, content) {
  const fp = path.join(dir, rel);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content, 'utf8');
  console.log('Wrote:', rel, content.split('\n').length, 'lines');
}

// Delete old pages
const toDelete = ['src/app/accounts', 'src/app/transfers', 'src/app/transactions', 'src/app/_build'];
for (const d of toDelete) {
  const dp = path.join(dir, d);
  if (fs.existsSync(dp)) {
    fs.rmSync(dp, { recursive: true, force: true });
    console.log('Deleted:', d);
  }
}

// ========== TYPES ==========
wf('src/lib/types.ts', `
import {
  Utensils, Bus, GraduationCap, Home, Receipt, Smartphone,
  Gamepad2, ShoppingBag, Heart, Coffee, Repeat, Gift, MoreHorizontal,
  CircleDollarSign, BookOpen, Bike, Laptop
} from 'lucide-react';

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

export function getCategoryColor(name: string): string {
  return EXPENSE_CATEGORIES.find(c => c.name === name)?.color || '#78716c';
}

export interface LegacyTransaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}
`.trim());

// ========== STORE ==========
wf('src/lib/store.tsx', `'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  Expense, MoneyReceived, Budget, SavedMoneyEntry, SavingsGoal,
  RecurringExpense, AppSettings, LegacyTransaction,
} from './types';

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
}

const StoreContext = createContext<StoreContextType | null>(null);
const STORAGE_KEY = 'expensewise-data';
const LEGACY_KEY = 'expense-tracker-data';

function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function mk(d: string) { return d.slice(0, 7); }

function migrate(): StoreData {
  const empty: StoreData = { expenses: [], moneyReceived: [], budgets: [], savedMoneyEntries: [], savingsGoals: [], recurringExpenses: [], settings: { monthlyAllowance: 5000 } };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return empty;
    const l = JSON.parse(raw);
    if (l.transactions) {
      for (const t of l.transactions as LegacyTransaction[]) {
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

function loadData(): StoreData {
  if (typeof window === 'undefined') return { expenses: [], moneyReceived: [], budgets: [], savedMoneyEntries: [], savingsGoals: [], recurringExpenses: [], settings: { monthlyAllowance: 5000 } };
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch { /* ignore */ }
  return migrate();
}

function saveData(d: StoreData) { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>({ expenses: [], moneyReceived: [], budgets: [], savedMoneyEntries: [], savingsGoals: [], recurringExpenses: [], settings: { monthlyAllowance: 5000 } });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setData(loadData()); setLoaded(true); }, []);
  useEffect(() => { if (loaded) saveData(data); }, [data, loaded]);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    setData(p => ({ ...p, expenses: [...p.expenses, { ...expense, id: gid(), createdAt: new Date().toISOString() }] }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData(p => ({ ...p, expenses: p.expenses.filter(e => e.id !== id) }));
  }, []);

  const addMoneyReceived = useCallback((m: Omit<MoneyReceived, 'id' | 'createdAt'>) => {
    setData(p => ({ ...p, moneyReceived: [...p.moneyReceived, { ...m, id: gid(), createdAt: new Date().toISOString() }] }));
  }, []);

  const deleteMoneyReceived = useCallback((id: string) => {
    setData(p => ({ ...p, moneyReceived: p.moneyReceived.filter(m => m.id !== id) }));
  }, []);

  const addBudget = useCallback((b: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
    setData(p => ({ ...p, budgets: [...p.budgets, { ...b, id: gid(), createdAt: new Date().toISOString(), spent: 0 }] }));
  }, []);

  const updateBudget = useCallback((id: string, d: Partial<Budget>) => {
    setData(p => ({ ...p, budgets: p.budgets.map(b => b.id === id ? { ...b, ...d } : b) }));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setData(p => ({ ...p, budgets: p.budgets.filter(b => b.id !== id) }));
  }, []);

  const addSavedMoneyEntry = useCallback((entry: Omit<SavedMoneyEntry, 'id' | 'createdAt'>) => {
    if (entry.type === 'remove') {
      const cur = data.savedMoneyEntries.reduce((s, e) => e.type === 'add' ? s + e.amount : s - e.amount, 0);
      if (entry.amount > cur) return;
    }
    setData(p => ({ ...p, savedMoneyEntries: [...p.savedMoneyEntries, { ...entry, id: gid(), createdAt: new Date().toISOString() }] }));
  }, [data.savedMoneyEntries]);

  const deleteSavedMoneyEntry = useCallback((id: string) => {
    setData(p => ({ ...p, savedMoneyEntries: p.savedMoneyEntries.filter(e => e.id !== id) }));
  }, []);

  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    setData(p => ({ ...p, savingsGoals: [...p.savingsGoals, { ...g, id: gid(), createdAt: new Date().toISOString() }] }));
  }, []);

  const updateSavingsGoal = useCallback((id: string, d: Partial<SavingsGoal>) => {
    setData(p => ({ ...p, savingsGoals: p.savingsGoals.map(g => g.id === id ? { ...g, ...d } : g) }));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setData(p => ({ ...p, savingsGoals: p.savingsGoals.filter(g => g.id !== id) }));
  }, []);

  const addRecurringExpense = useCallback((r: Omit<RecurringExpense, 'id' | 'createdAt'>) => {
    setData(p => ({ ...p, recurringExpenses: [...p.recurringExpenses, { ...r, id: gid(), createdAt: new Date().toISOString() }] }));
  }, []);

  const updateRecurringExpense = useCallback((id: string, d: Partial<RecurringExpense>) => {
    setData(p => ({ ...p, recurringExpenses: p.recurringExpenses.map(r => r.id === id ? { ...r, ...d } : r) }));
  }, []);

  const deleteRecurringExpense = useCallback((id: string) => {
    setData(p => ({ ...p, recurringExpenses: p.recurringExpenses.filter(r => r.id !== id) }));
  }, []);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setData(p => ({ ...p, settings: { ...p.settings, ...s } }));
  }, []);

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
      ...data, addExpense, deleteExpense, addMoneyReceived, deleteMoneyReceived,
      addBudget, updateBudget, deleteBudget, addSavedMoneyEntry, deleteSavedMoneyEntry,
      addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      addRecurringExpense, updateRecurringExpense, deleteRecurringExpense,
      updateSettings, getTotalReceived, getTotalExpenses, getMoneyLeft,
      getCurrentSavedMoney, getSpentByCategory,
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
`);

console.log('\\nAll files written successfully!');
console.log('Run: npm run dev');
