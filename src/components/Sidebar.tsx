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
import { ExpenseWiseBrand } from '@/components/ExpenseWiseBrand';

/* ─────────────────────── CONSTANTS ─────────────────────── */

const EXPANDED_W = 240;
const COLLAPSED_W = 72;
const CARD_MARGIN = 8; // m-2 = 8px each side

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

/* ─────────────────────── TOOLTIP ─────────────────────── */

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

/* ─────────────────────── NAV ITEM ─────────────────────── */

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
      aria-label={label}
      className={`
        relative flex items-center rounded-xl text-sm font-medium
        transition-colors duration-150 group active:scale-[0.97]
        ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'}
        ${isActive
          ? 'bg-purple-500/[0.11] dark:bg-purple-400/[0.16] text-purple-700 dark:text-purple-200 font-semibold ring-1 ring-purple-500/20 dark:ring-purple-300/20 shadow-[0_8px_18px_-14px_rgba(124,58,237,0.9)]'
          : 'text-gray-600 dark:text-gray-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-gray-100'
        }
      `}
    >
      {/* Left accent bar */}
      {isActive && (
        <span
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-b from-fuchsia-400 via-purple-500 to-violet-600 dark:from-fuchsia-300 dark:via-purple-400 dark:to-violet-500 rounded-r-full shadow-[0_0_12px_rgba(168,85,247,0.8)]
            ${isCollapsed ? 'w-1 h-4' : 'w-0.5 h-5'}
          `}
        />
      )}

      <Icon
        size={17}
        className={`shrink-0 ${isActive ? 'text-purple-600 dark:text-purple-200' : ''}`}
      />

      {/* Label */}
      <span
        className={`
          whitespace-nowrap overflow-hidden leading-none
          transition-[max-width,opacity] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'}
        `}
      >
        {label}
      </span>

      {isCollapsed && <Tooltip label={label} />}
    </Link>
  );
}

/* ─────────────────────── SIDEBAR INNER ─────────────────────── */

function SidebarInner({
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
    <div className="flex flex-col h-full">

      {/* ── HEADER ────────────────────────────────────────
          In expanded mode: Logo + App Name on left, Toggle on right.
          In collapsed mode: Logo on top, Toggle button centered below it.
          This ensures ZERO horizontal clipping or overlap.
      ─────────────────────────────────────────────────── */}
      <div
        className={`
          shrink-0 border-b border-black/[0.05] dark:border-white/[0.05]
          transition-all duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed
            ? 'flex flex-col items-center justify-center py-2.5 px-1 gap-1.5 min-h-[72px]'
            : 'flex items-center justify-between h-[60px] px-3'
          }
        `}
      >
        {/* Logo & Brand Slot */}
        <div className={`flex items-center min-w-0 ${collapsed ? 'justify-center' : 'gap-2.5 flex-1 overflow-hidden'}`} title={collapsed ? 'ExpenseWise' : undefined}>
          <ExpenseWiseBrand size="sm" showName={!collapsed} showTagline={!collapsed} />
        </div>

        {/* Toggle button */}
        {showCollapseButton && onCollapse && (
          <button
            onClick={onCollapse}
            className="
              shrink-0 w-7 h-7 rounded-lg
              flex items-center justify-center
              text-gray-400 dark:text-gray-500
              hover:bg-black/[0.06] dark:hover:bg-white/[0.08]
              hover:text-gray-700 dark:hover:text-gray-200
              transition-colors duration-150
            "
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed
              ? <PanelLeftOpen size={16} />
              : <PanelLeftClose size={16} />
            }
          </button>
        )}
      </div>

      {/* ── NAVIGATION ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-visible py-3 px-2 space-y-1">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.label} className="mb-1">
            {/* Section label or subtle divider */}
            {collapsed ? (
              idx > 0 && <div className="my-1.5 border-t border-black/[0.06] dark:border-white/[0.06] mx-1" />
            ) : (
              <div className="px-3 pt-1 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 select-none">
                {section.label}
              </div>
            )}

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

        {/* Account section header */}
        <div className="mb-1">
          {collapsed ? (
            <div className="my-1.5 border-t border-black/[0.06] dark:border-white/[0.06] mx-1" />
          ) : (
            <div className="px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 select-none">
              Account
            </div>
          )}

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

      {/* ── THEME TOGGLE ──────────────────────────────── */}
      <div
        className={`
          px-2 shrink-0 overflow-hidden
          transition-[max-height,opacity,padding-bottom] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
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

      {/* ── USER + SIGN OUT ──────────────────────────── */}
      <div className="border-t border-black/[0.05] dark:border-white/[0.05] shrink-0 px-2 py-2 space-y-0.5">
        {/* Profile link */}
        <Link
          href="/profile"
          title={collapsed ? (user?.name || 'Profile') : undefined}
          className={`
            relative flex items-center rounded-xl
            hover:bg-black/[0.04] dark:hover:bg-white/[0.06]
            transition-colors duration-150 group cursor-pointer
            ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'}
          `}
        >
          <div className="w-7 h-7 rounded-lg bg-purple-100/80 dark:bg-purple-400/20 flex items-center justify-center shrink-0">
            <User size={13} className="text-purple-700 dark:text-purple-200" />
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
            relative w-full flex items-center rounded-xl
            text-rose-500 dark:text-rose-500
            hover:bg-rose-500/[0.08] dark:hover:bg-rose-500/[0.12]
            hover:text-rose-600 dark:hover:text-rose-400
            transition-colors duration-150 group
            ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'}
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

/* ─────────────────────── MAIN EXPORT ─────────────────────── */

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

  const sidebarW = collapsed ? COLLAPSED_W : EXPANDED_W;
  const cardW = sidebarW - CARD_MARGIN * 2;

  return (
    <>
      {/* ═══════════════ DESKTOP SIDEBAR ═══════════════
          The <aside> acts as an in-flow flex spacer.
          The glass card is absolute inside it so its
          overflow-hidden / rounded corners don't affect
          fixed descendants (modals, overlays).
      ════════════════════════════════════════════════ */}
      <aside
        className="hidden md:block shrink-0 relative"
        style={{
          width: sidebarW,
          minWidth: sidebarW,
          transition: `width 220ms cubic-bezier(0.4,0,0.2,1),
                       min-width 220ms cubic-bezier(0.4,0,0.2,1)`,
        }}
      >
        {/* Glass card — absolutely positioned to match aside width */}
        <div
          className="
            flex flex-col absolute top-2 bottom-2 left-2
            rounded-2xl
            bg-white/75 dark:bg-[#171126]/78
            backdrop-blur-xl
            border border-purple-500/[0.12] dark:border-purple-200/[0.13]
            shadow-[0_18px_42px_-24px_rgba(76,29,149,0.42),0_2px_12px_rgba(76,29,149,0.08)]
            dark:shadow-[0_2px_16px_0_rgba(0,0,0,0.35)]
          "
          style={{
            width: cardW,
            transition: `width 220ms cubic-bezier(0.4,0,0.2,1)`,
          }}
        >
          <SidebarInner
            collapsed={collapsed}
            onCollapse={() => setCollapsed((c) => !c)}
            showCollapseButton
          />
        </div>
      </aside>

      {/* ═══════════════ MOBILE HAMBURGER ═══════════════ */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
          md:hidden fixed top-3 left-3 z-50
          w-10 h-10 rounded-xl
          bg-white/82 dark:bg-[#171126]/86
          backdrop-blur-md
          shadow-md border border-black/[0.07] dark:border-white/[0.07]
          flex items-center justify-center
          active:scale-95 transition-all duration-150
        "
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen
          ? <X size={18} className="text-gray-700 dark:text-gray-200" />
          : <Menu size={18} className="text-gray-700 dark:text-gray-200" />
        }
      </button>

      {/* ═══════════════ MOBILE OVERLAY ═══════════════ */}
      <div
        className={`
          md:hidden fixed inset-0 z-30
          bg-black/40 dark:bg-black/60 backdrop-blur-sm
          transition-opacity duration-200
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setMobileOpen(false)}
      />

      {/* ═══════════════ MOBILE DRAWER ═══════════════ */}
      <aside
        className={`
          md:hidden fixed inset-y-0 left-0 z-40 w-64
          transition-transform duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          p-2
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-hidden={!mobileOpen}
      >
        <div
          className="
            flex flex-col h-full rounded-2xl
            bg-white/92 dark:bg-[#171126]/94
            backdrop-blur-xl
            border border-purple-500/[0.12] dark:border-purple-200/[0.13]
            shadow-[0_4px_32px_0_rgba(0,0,0,0.12)]
            dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.5)]
          "
        >
          <SidebarInner collapsed={false} showCollapseButton={false} />
        </div>
      </aside>

      {/* ═══════════════ MOBILE BOTTOM NAV ═══════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div
          className="
            mx-2 mb-2 flex items-center justify-around px-2 py-2
            bg-white/82 dark:bg-[#171126]/86
            backdrop-blur-xl
            border border-purple-500/[0.12] dark:border-purple-200/[0.13]
            rounded-2xl
            shadow-lg dark:shadow-[0_4px_24px_0_rgba(0,0,0,0.4)]
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
                    ? 'text-purple-700 dark:text-purple-200'
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
