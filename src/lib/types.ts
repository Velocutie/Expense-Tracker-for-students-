export interface Account {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description: string;
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

export const CATEGORIES = [
  { name: 'Food & Drinks', icon: '🍔', color: '#ef4444' },
  { name: 'Transport', icon: '🚌', color: '#f97316' },
  { name: 'Shopping', icon: '🛍️', color: '#eab308' },
  { name: 'Entertainment', icon: '🎮', color: '#22c55e' },
  { name: 'Bills & Utilities', icon: '📱', color: '#3b82f6' },
  { name: 'Education', icon: '📚', color: '#8b5cf6' },
  { name: 'Health', icon: '💊', color: '#ec4899' },
  { name: 'Savings', icon: '💰', color: '#14b8a6' },
  { name: 'Salary', icon: '💼', color: '#6366f1' },
  { name: 'Freelance', icon: '💻', color: '#0ea5e9' },
  { name: 'Gifts', icon: '🎁', color: '#d946ef' },
  { name: 'Other', icon: '📌', color: '#78716c' },
];

export const ACCOUNT_ICONS = ['💳', '🏦', '💰', '🐷', '🏧', '💎', '🪙', '💵'];
export const ACCOUNT_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f97316',
  '#8b5cf6', '#ec4899', '#14b8a6', '#eab308',
];
