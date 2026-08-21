'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { EXPENSE_CATEGORIES } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingDown, TrendingUp, Plus, Wallet, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Tip } from '@/components/Tip';

function getMonthKey(date: Date) { return date.toISOString().slice(0, 7); }
function getMonthLabel(mk: string) {
  const [y, m] = mk.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[parseInt(m) - 1] + ' ' + y;
}
function prevMonth(mk: string) {
  const d = new Date(mk + '-15');
  d.setMonth(d.getMonth() - 1);
  return getMonthKey(d);
}
function nextMonth(mk: string) {
  const d = new Date(mk + '-15');
  d.setMonth(d.getMonth() + 1);
  return getMonthKey(d);
}
function daysLeftInMonth(mk: string) {
  const [y, m] = mk.split('-').map(Number);
  const now = new Date();
  const lastDay = new Date(y, m, 0).getDate();
  if (now.getFullYear() === y && now.getMonth() === m - 1) return lastDay - now.getDate();
  if (new Date(y, m - 1) > now) return lastDay;
  return 0;
}

const COLORS = ['#3b82f6','#ef4444','#22c55e','#f97316','#8b5cf6','#ec4899'];

export default function DashboardPage() {
  const store = useStore();
  const { expenses, budgets, savingsGoals, settings, getTotalReceived, getTotalExpenses, getCurrentSavedMoney, getSpentByCategory } = store;
  const [month, setMonth] = useState(getMonthKey(new Date()));

  const totalReceived = getTotalReceived(month);
  const totalExpenses = getTotalExpenses(month);
  const moneyLeft = totalReceived - totalExpenses;
  const savedMoney = getCurrentSavedMoney();
  const remaining = daysLeftInMonth(month);
  const safeDaily = remaining > 0 ? Math.max(0, Math.floor(moneyLeft / remaining)) : 0;
  const byCat = getSpentByCategory(month);

  const catData = EXPENSE_CATEGORIES.filter(c => byCat[c.name]).map(c => ({ name: c.name, value: byCat[c.name], color: c.color }));
  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    const amt = expenses.filter(e => e.date === ds).reduce((s, e) => s + e.amount, 0);
    return { day: d.toLocaleDateString('en', { weekday: 'short' }), amount: amt };
  });

  const recentExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const topCategory = catData.length > 0 ? catData.reduce((a, b) => a.value > b.value ? a : b) : null;
  const totalGoalProgress = savingsGoals.reduce((s, g) => s + g.current, 0);
  const totalGoalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Good {greeting} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apos;s how your money is doing.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2">
          <button onClick={() => setMonth(prevMonth(month))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all" aria-label="Previous month">&lsaquo;</button>
          <span className="text-sm font-medium min-w-[100px] text-center dark:text-gray-200">{getMonthLabel(month)}</span>
          <button onClick={() => setMonth(nextMonth(month))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all" aria-label="Next month">&rsaquo;</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-default">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center"><ArrowDownLeft size={16} className="text-green-600 dark:text-green-400" /></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Received</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{'\u20B9'}{totalReceived.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-default">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center"><ArrowUpRight size={16} className="text-red-600 dark:text-red-400" /></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Spent</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">{'\u20B9'}{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-default">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center"><Wallet size={16} className="text-blue-600 dark:text-blue-400" /></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Money Left</span>
          </div>
          <p className={`text-xl md:text-2xl font-bold ${moneyLeft >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>{'\u20B9'}{moneyLeft.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-default">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center"><PiggyBank size={16} className="text-amber-600 dark:text-amber-400" /></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Saved</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-400">{'\u20B9'}{savedMoney.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {remaining > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><Calendar size={18} className="text-indigo-600 dark:text-indigo-400" /></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Safe to spend today</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{'\u20B9'}{safeDaily.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({remaining} days left)</span></p>
          </div>
        </div>
      )}

      {moneyLeft > 0 && remaining > 0 && (
        <Tip>Try to spend less than {'\u20B9'}{safeDaily.toLocaleString('en-IN')} today to stay on track this month.</Tip>
      )}
      {moneyLeft <= 0 && (
        <Tip className="border-red-100 dark:border-red-500/10 bg-red-50/50 dark:bg-red-500/5">You&apos;ve overspent this month. Consider skipping non-essential expenses until next month.</Tip>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/expenses" className="flex items-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 active:scale-[0.96]"><Plus size={16} /> Add Expense</Link>
        <Link href="/money-received" className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.96]"><Plus size={16} /> Add Money</Link>
        <Link href="/saved-money" className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.96]"><Plus size={16} /> Save Money</Link>
        <Link href="/savings-goals" className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.96]"><Plus size={16} /> New Goal</Link>
      </div>

      {savedMoney > 0 && totalGoalTarget === 0 && (
        <Tip>You have {'\u20B9'}{savedMoney.toLocaleString('en-IN')} saved! Consider creating a savings goal to give it a purpose.</Tip>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Daily Spending (7 days)</h2>
          {daily.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={daily}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(v) => ['\u20B9' + Number(v).toLocaleString('en-IN'), 'Spent']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#1f2937', color: '#f3f4f6' }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No spending data this week.</div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
          {catData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="45%" height={180}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {catData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => ['\u20B9' + Number(v).toLocaleString('en-IN')]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#1f2937', color: '#f3f4f6' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {catData.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{c.name}</span>
                    <span className="font-medium dark:text-gray-300">{'\u20B9'}{c.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No expenses recorded yet.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          {topCategory && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <TrendingDown size={18} className="text-red-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Biggest spend</p>
                <p className="text-sm font-semibold dark:text-gray-200">{topCategory.name} &bull; {'\u20B9'}{topCategory.value.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
          {totalGoalTarget > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <TrendingUp size={18} className="text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Savings goals</p>
                <p className="text-sm font-semibold dark:text-gray-200">{'\u20B9'}{totalGoalProgress.toLocaleString('en-IN')} / {'\u20B9'}{totalGoalTarget.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Expenses</h2>
            <Link href="/expenses" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium active:scale-95 transition-all">View all &rarr;</Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-2">
              {recentExpenses.map(e => {
                const cat = EXPENSE_CATEGORIES.find(c => c.name === e.category);
                const Icon = cat?.icon;
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all active:scale-[0.99] cursor-default">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (cat?.color || '#78716c') + '15' }}>
                      {Icon ? <Icon size={16} style={{ color: cat?.color }} /> : <span className="text-sm">📌</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{e.description || e.category}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{e.category} &bull; {e.date}</p>
                    </div>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">-{'\u20B9'}{e.amount.toLocaleString('en-IN')}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">No expenses yet. Add your first one!</div>
          )}
        </div>
      </div>
    </div>
  );
}
