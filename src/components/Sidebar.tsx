'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ReceiptIndianRupee, CircleDollarSign, PiggyBank,
  Target, BarChart3, Menu, X, User, Sun, Moon, Monitor, Repeat,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  // Sync collapsed state from sessionStorage after mount (client-only)
  useEffect(() => {
    const stored = sessionStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  // Persist collapsed state on change
  useEffect(() => {
    sessionStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navContent = (isCollapsed: boolean) => (
    <>
      {/* Header */}
      <div className={`flex items-center border-b border-gray-100 dark:border-gray-700/60 shrink-0 ${isCollapsed ? 'justify-center p-4 h-16' : 'gap-3 p-5 h-16'}`}>
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
          <span className="text-white font-bold text-base">E</span>
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">ExpenseWise</h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Student Finance</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              aria-label={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 relative group active:scale-[0.97] ${
                isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-500 rounded-r-full" />
              )}
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      {!isCollapsed && (
        <div className="px-3 pb-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl">
            {THEME_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    theme === opt.value
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                  title={opt.label}
                  aria-label={`Switch to ${opt.label} theme`}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className={`border-t border-gray-100 dark:border-gray-700/60 shrink-0 ${isCollapsed ? 'p-3' : 'p-3'}`}>
        <Link
          href="/profile"
          title={isCollapsed ? user?.name || 'Profile' : undefined}
          aria-label={isCollapsed ? 'Go to Profile' : undefined}
          className={`flex items-center gap-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all duration-150 active:scale-[0.97] cursor-pointer group relative ${
            isCollapsed ? 'justify-center p-2.5' : 'p-2.5'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
            <User size={15} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Not signed in'}</p>
            </div>
          )}
          {isCollapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              {user?.name || 'Profile'}
            </span>
          )}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shrink-0 transition-all duration-200 overflow-visible relative`}
        style={{ width: collapsed ? '64px' : '240px' }}
      >
        {navContent(collapsed)}

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[60px] w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-150 hover:bg-gray-50 dark:hover:bg-slate-700 z-50 shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeftOpen size={13} className="text-gray-500 dark:text-gray-400" />
            : <PanelLeftClose size={13} className="text-gray-500 dark:text-gray-400" />
          }
        </button>
      </aside>

      {/* Mobile menu toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-700 active:scale-95 transition-all duration-150 hover:bg-gray-50 dark:hover:bg-slate-700/80"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={20} className="text-gray-700 dark:text-gray-200" /> : <Menu size={20} className="text-gray-700 dark:text-gray-200" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 dark:bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-64 flex flex-col border-r border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-250 ease-out overflow-hidden`}
        style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {navContent(false)}
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700/60 z-40 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-150 min-w-[56px] active:scale-95 ${
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
