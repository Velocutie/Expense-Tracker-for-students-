'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ReceiptIndianRupee, CircleDollarSign, PiggyBank,
  Target, BarChart3, Menu, X, User, Sun, Moon, Monitor, Repeat,
  PanelLeftClose, PanelLeftOpen, LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useAuth } from '@/lib/auth';

/* ─────────────────────────── NAV STRUCTURE ─────────────────────────── */

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/expenses', label: 'Expenses', icon: ReceiptIndianRupee },
    ],
  },
  {
    label: 'Trackers',
    items: [
      { href: '/money-received', label: 'Money Received', icon: CircleDollarSign },
      { href: '/saved-money', label: 'Saved Money', icon: PiggyBank },
      { href: '/budgets', label: 'Budgets', icon: Target },
      { href: '/savings-goals', label: 'Savings Goals', icon: Target },
      { href: '/recurring-expenses', label: 'Recurring', icon: Repeat },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/insights', label: 'Insights', icon: BarChart3 },
    ],
  },
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

/* ─────────────────────────── TOOLTIP ─────────────────────────── */

function Tooltip({ label }: { label: string }) {
  return (
    <span
      className="
        absolute left-full ml-3 px-2.5 py-1 text-xs font-medium
        bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
        rounded-lg opacity-0 group-hover:opacity-100
        transition-opacity duration-150 pointer-events-none
        whitespace-nowrap z-[9999] shadow-lg
      "
    >
      {label}
    </span>
  );
}

/* ─────────────────────────── NAV ITEM ─────────────────────────── */

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      aria-label={isCollapsed ? label : undefined}
      className={`
        relative flex items-center gap-3 rounded-xl text-sm font-medium
        transition-colors duration-150 group active:scale-[0.97]
        ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
        ${isActive
          ? 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-gray-100'
        }
      `}
    >
      {/* Left accent bar for active item */}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
      )}

      <Icon
        size={17}
        className={`shrink-0 transition-colors duration-150 ${
          isActive ? 'text-indigo-500 dark:text-indigo-400' : ''
        }`}
      />

      {/* Label with fade */}
      <span
        className={`
          whitespace-nowrap overflow-hidden leading-none
          transition-[max-width,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'}
        `}
      >
        {label}
      </span>

      {/* Tooltip when collapsed */}
      {isCollapsed && <Tooltip label={label} />}
    </Link>
  );
}

/* ─────────────────────────── SIDEBAR INNER CONTENT ─────────────────────────── */

function SidebarContent({
  collapsed,
  onCollapse,
  showCollapseButton = true,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
  showCollapseButton?: boolean;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div
        className={`
          flex items-center shrink-0 h-[60px] border-b border-black/[0.05] dark:border-white/[0.05]
          ${collapsed ? 'justify-center px-3' : 'px-4'}
        `}
      >
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
          <span className="text-white font-bold text-sm select-none">E</span>
        </div>

        {/* App name — fades out when collapsed */}
        <div
          className={`
            flex-1 min-w-0 ml-2.5 overflow-hidden
            transition-[max-width,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
            ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}
          `}
        >
          <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-none whitespace-nowrap">
            ExpenseWise
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 whitespace-nowrap">
            Student Finance
          </p>
        </div>

        {/* Collapse toggle (only on desktop variant) */}
        {showCollapseButton && onCollapse && (
          <button
            onClick={onCollapse}
            className={`
              shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
              text-gray-400 dark:text-gray-500
              hover:bg-black/[0.06] dark:hover:bg-white/[0.08]
              hover:text-gray-600 dark:hover:text-gray-300
              transition-colors duration-150
              ${collapsed ? '' : 'ml-1'}
            `}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen size={15} />
              : <PanelLeftClose size={15} />
            }
          </button>
        )}
      </div>

      {/* ── Navigation sections ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-1">
            {/* Section label */}
            <div
              className={`
                overflow-hidden
                transition-[max-height,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                ${collapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'}
              `}
            >
              <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-600 select-none">
                {section.label}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={pathname === item.href}
                  isCollapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}

        {/* ── Account section ── */}
        <div className="mb-1">
          <div
            className={`
              overflow-hidden
              transition-[max-height,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
              ${collapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'}
            `}
          >
            <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-600 select-none">
              Account
            </p>
          </div>

          <div className="space-y-0.5">
            <NavItem
              href="/profile"
              label="Profile"
              icon={User}
              isActive={pathname === '/profile'}
              isCollapsed={collapsed}
            />
          </div>
        </div>
      </nav>

      {/* ── Theme toggle (hidden when collapsed) ── */}
      <div
        className={`
          px-2 shrink-0 overflow-hidden
          transition-[max-height,opacity,padding] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? 'max-h-0 opacity-0 pb-0' : 'max-h-16 opacity-100 pb-2'}
        `}
      >
        <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.07] rounded-xl">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`
                  flex-1 flex items-center justify-center px-2 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-white dark:bg-white/[0.12] text-gray-900 dark:text-white shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.12]'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
                title={opt.label}
                aria-label={`Switch to ${opt.label} theme`}
              >
                <Icon size={13} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── User + Sign Out ── */}
      <div className="border-t border-black/[0.05] dark:border-white/[0.05] shrink-0 px-2 py-2 space-y-0.5">
        {/* Profile link */}
        <Link
          href="/profile"
          title={collapsed ? (user?.name || 'Profile') : undefined}
          className={`
            relative flex items-center gap-3 rounded-xl
            hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
            transition-colors duration-150 group cursor-pointer
            ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
          `}
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
            <User size={13} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div
            className={`
              flex-1 min-w-0 overflow-hidden
              transition-[max-width,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
              ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[140px] opacity-100'}
            `}
          >
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate whitespace-nowrap">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate whitespace-nowrap">
              {user?.email || 'Not signed in'}
            </p>
          </div>
          {collapsed && <Tooltip label={user?.name || 'Profile'} />}
        </Link>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`
            relative w-full flex items-center gap-3 rounded-xl
            text-rose-500 dark:text-rose-500
            hover:bg-rose-500/[0.08] dark:hover:bg-rose-500/[0.12]
            hover:text-rose-600 dark:hover:text-rose-400
            transition-colors duration-150 group
            ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
          `}
          aria-label="Sign out"
        >
          <LogOut size={15} className="shrink-0" />
          <span
            className={`
              text-sm font-medium whitespace-nowrap overflow-hidden
              transition-[max-width,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
              ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[120px] opacity-100'}
            `}
          >
            Sign Out
          </span>
          {collapsed && <Tooltip label="Sign Out" />}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN EXPORT ─────────────────────────── */

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore collapsed state from sessionStorage (client-only)
  useEffect(() => {
    const stored = sessionStorage.getItem('sidebar-collapsed');
    if (stored === 'true') setCollapsed(true);
  }, []);

  // Persist collapsed state
  useEffect(() => {
    sessionStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Close mobile drawer on navigate
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ════════════════════════ DESKTOP SIDEBAR ════════════════════════ */}
      <aside
        className={`
          hidden md:flex flex-col shrink-0 relative
          transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
        `}
        style={{ width: collapsed ? '64px' : '240px' }}
      >
        {/* Glass card wrapper — sits inset from the viewport edge */}
        <div
          className={`
            flex flex-col
            m-2 rounded-2xl overflow-hidden
            bg-white/80 dark:bg-[#141C2D]/75
            backdrop-blur-xl
            border border-black/[0.07] dark:border-white/[0.07]
            shadow-[0_2px_16px_0_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.35)]
            transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
            absolute inset-y-0
          `}
          style={{ width: collapsed ? 'calc(64px - 16px)' : 'calc(240px - 16px)' }}
        >
          <SidebarContent
            collapsed={collapsed}
            onCollapse={() => setCollapsed((c) => !c)}
            showCollapseButton
          />
        </div>
      </aside>

      {/* ════════════════════════ MOBILE HAMBURGER ════════════════════════ */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
          md:hidden fixed top-3 left-3 z-50
          w-10 h-10 rounded-xl
          bg-white/90 dark:bg-[#141C2D]/90
          backdrop-blur-md
          shadow-md border border-black/[0.07] dark:border-white/[0.07]
          flex items-center justify-center
          active:scale-95 transition-all duration-150
          hover:bg-white dark:hover:bg-[#1a2438]
        "
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen
          ? <X size={18} className="text-gray-700 dark:text-gray-200" />
          : <Menu size={18} className="text-gray-700 dark:text-gray-200" />
        }
      </button>

      {/* ════════════════════════ MOBILE OVERLAY ════════════════════════ */}
      <div
        className={`
          md:hidden fixed inset-0 z-30
          bg-black/40 dark:bg-black/60 backdrop-blur-sm
          transition-opacity duration-200
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setMobileOpen(false)}
      />

      {/* ════════════════════════ MOBILE DRAWER ════════════════════════ */}
      <aside
        className={`
          md:hidden fixed inset-y-0 left-0 z-40 w-64
          transition-transform duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          p-2
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div
          className="
            flex flex-col h-full rounded-2xl overflow-hidden
            bg-white/90 dark:bg-[#141C2D]/90
            backdrop-blur-xl
            border border-black/[0.07] dark:border-white/[0.07]
            shadow-[0_4px_32px_0_rgba(0,0,0,0.12)] dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.5)]
          "
        >
          <SidebarContent collapsed={false} showCollapseButton={false} />
        </div>
      </aside>

      {/* ════════════════════════ MOBILE BOTTOM NAV ════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div
          className="
            mx-2 mb-2 flex items-center justify-around px-2 py-2
            bg-white/90 dark:bg-[#141C2D]/90
            backdrop-blur-xl
            border border-black/[0.07] dark:border-white/[0.07]
            rounded-2xl shadow-lg dark:shadow-[0_4px_24px_0_rgba(0,0,0,0.4)]
          "
        >
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl
                  transition-all duration-150 min-w-[52px] active:scale-95
                  ${isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }
                `}
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
