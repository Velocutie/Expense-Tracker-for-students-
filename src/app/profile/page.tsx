'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { User, Mail, LogOut, Trash2, Shield, Smartphone, Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const store = useStore();
  const router = useRouter();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleClearData = () => {
    localStorage.removeItem('expensewise-data');
    localStorage.removeItem('expense-tracker-data');
    window.location.reload();
  };

  const totalExpenses = store.expenses.length;
  const totalReceived = store.moneyReceived.length;
  const totalBudgets = store.budgets.length;
  const totalGoals = store.savingsGoals.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
            <User size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h2>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <Mail size={14} />
              {user?.email || 'No email'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalExpenses}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Expenses tracked</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReceived}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Money entries</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBudgets}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Budgets set</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalGoals}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Savings goals</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'light' as const, icon: Sun, label: 'Light' },
            { value: 'dark' as const, icon: Moon, label: 'Dark' },
            { value: 'system' as const, icon: Monitor, label: 'System' },
          ].map(opt => {
            const Icon = opt.icon;
            return (
              <button key={opt.value} onClick={() => setTheme(opt.value)} className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-medium transition-all active:scale-95 ${theme === opt.value ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                <Icon size={18} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white px-6 pt-6 pb-2">Settings</h3>
        
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          <div className="flex items-center gap-3 px-6 py-4">
            <Smartphone size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Local Backup</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Data also saved to browser localStorage</p>
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-lg">Active</span>
          </div>

          <div className="flex items-center gap-3 px-6 py-4">
            <Shield size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Cloud Sync</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Data synced across devices with Supabase</p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">Active</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-500/20 shadow-sm overflow-hidden">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 px-6 pt-6 pb-2">Danger Zone</h3>
        
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {!showClearConfirm ? (
            <button onClick={() => setShowClearConfirm(true)} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-left active:scale-[0.99]">
              <Trash2 size={18} className="text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Clear All Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delete all expenses, budgets, and goals</p>
              </div>
            </button>
          ) : (
            <div className="px-6 py-4 bg-red-50 dark:bg-red-500/5">
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95 transition-all">Cancel</button>
                <button onClick={handleClearData} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-all">Yes, clear everything</button>
              </div>
            </div>
          )}

          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all text-left active:scale-[0.99]">
            <LogOut size={18} className="text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">ExpenseWise v1.0</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Made for college students 💜</p>
      </div>
    </div>
  );
}
