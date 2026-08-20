'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptIndianRupee, CircleDollarSign, PiggyBank, Target, BarChart3, Menu, X, User, Sun, Moon, Monitor, Repeat } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  { href: '/money-received', label: 'Money Received', icon: CircleDollarSign },
  { href: '/saved-money', label: 'Saved Money', icon: PiggyBank },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/savings-goals', label: 'Savings Goals', icon: Target },
  { href: '/recurring-expenses', label: 'Recurring', icon: Repeat },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
];

const BOTTOM_NAV_ITEMS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: ReceiptIndianRupee },
  { href: '/money-received', label: 'Money', icon: CircleDollarSign },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/profile', label: 'Profile', icon: User },
];

const THEME_OPTIONS = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const navContent = (
    <>
      <div className="flex items-center gap-3 p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <span className="text-white font-bold text-lg">E</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">ExpenseWise</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Student Finance</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          {THEME_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  theme === opt.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                title={opt.label}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
            <User size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Not signed in'}</p>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 transition-colors overflow-hidden">
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700 active:scale-95 transition-all"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/50 z-30" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`md:hidden fixed inset-y-0 left-0 w-64 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-200 overflow-hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {navContent}
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-40 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] active:scale-95 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
