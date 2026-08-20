'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { EXPENSE_CATEGORIES } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Tip } from '@/components/Tip';

function getMonthKey(d: Date | string) { return typeof d === 'string' ? d.slice(0, 7) : d.toISOString().slice(0, 7); }
function prevMonthKey(mk: string) {
  const d = new Date(mk + '-15');
  d.setMonth(d.getMonth() - 1);
  return getMonthKey(d);
}
function getMonthLabel(mk: string) {
  const [y, m] = mk.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1] + ' ' + y;
}

const COLORS = ['#3b82f6','#ef4444','#22c55e','#f97316','#8b5cf6','#ec4899'];

export default function InsightsPage() {
  const { expenses, moneyReceived, savedMoneyEntries, getCurrentSavedMoney, getSpentByCategory, getTotalReceived, getTotalExpenses } = useStore();
  const [month, setMonth] = useState(getMonthKey(new Date().toISOString().slice(0, 10)));

  const prevMo = prevMonthKey(month);
  const byCat = getSpentByCategory(month);

  const totalReceived = getTotalReceived(month);
  const totalExpenses = getTotalExpenses(month);
  const prevExpenses = getTotalExpenses(prevMo);

  const catData = EXPENSE_CATEGORIES.filter(c => byCat[c.name]).map(c => ({ name: c.name, value: byCat[c.name], color: c.color }));
  const topCategory = catData.length > 0 ? catData.reduce((a, b) => a.value > b.value ? a : b) : null;

  const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
  const avgDaily = daysInMonth > 0 ? Math.round(totalExpenses / daysInMonth) : 0;
  const pctChange = prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0;

  const savedThisMonth = savedMoneyEntries.filter(e => getMonthKey(e.date) === month);
  const savedAdditions = savedThisMonth.filter(e => e.type === 'add').reduce((s, e) => s + e.amount, 0);
  const savedRemovals = savedThisMonth.filter(e => e.type === 'remove').reduce((s, e) => s + e.amount, 0);

  const months6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return getMonthKey(d);
  });
  const trend = months6.map(m => {
    const exp = expenses.filter(e => getMonthKey(e.date) === m).reduce((s, e) => s + e.amount, 0);
    const rec = moneyReceived.filter(e => getMonthKey(e.date) === m).reduce((s, e) => s + e.amount, 0);
    return { month: getMonthLabel(m).split(' ')[0], expenses: exp, received: rec };
  });

  const paceDaysLeft = daysInMonth - new Date().getDate();
  const paceWarning = paceDaysLeft > 0 && totalExpenses / (daysInMonth - paceDaysLeft) * daysInMonth > totalReceived && totalReceived > 0;

  const allMonths = Array.from(new Set([...expenses.map(e => getMonthKey(e.date)), ...moneyReceived.map(e => getMonthKey(e.date))])).sort().reverse();
  const displayMonths = Array.from(new Set([getMonthKey(new Date().toISOString().slice(0, 10)), ...allMonths])).sort().reverse();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Insights</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Understand your spending patterns.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {displayMonths.slice(0, 6).map(m => {
            const [y, mo] = m.split('-');
            const label = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(mo)-1] + ' ' + y;
            return (
              <button key={m} onClick={() => setMonth(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${month === m ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{label}</button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Received</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{'\u20B9'}{totalReceived.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spent</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{'\u20B9'}{totalExpenses.toLocaleString('en-IN')}</p>
          {prevExpenses > 0 && (
            <p className={`text-xs mt-0.5 ${pctChange > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
              {pctChange > 0 ? '+' : ''}{pctChange}% vs last month
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Daily Average</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{'\u20B9'}{avgDaily.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saved</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{'\u20B9'}{getCurrentSavedMoney().toLocaleString('en-IN')}</p>
        </div>
      </div>

      <Tip>Compare your spending with last month. If it went up, check which category grew the most — that&apos;s where to cut back.</Tip>

      <div className="space-y-3">
        {topCategory && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <TrendingDown size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">{topCategory.name}</span> is your biggest expense at {'\u20B9'}{topCategory.value.toLocaleString('en-IN')}.</p>
          </div>
        )}
        {pctChange > 0 && prevExpenses > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">You&apos;ve spent <span className="font-semibold text-red-600 dark:text-red-400">{pctChange}% more</span> than last month.</p>
          </div>
        )}
        {pctChange < 0 && prevExpenses > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <TrendingUp size={18} className="text-green-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Great! You&apos;ve spent <span className="font-semibold text-green-600 dark:text-green-400">{Math.abs(pctChange)}% less</span> than last month.</p>
          </div>
        )}
        {paceWarning && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">At your current pace, you may <span className="font-semibold">run out of your monthly allowance early</span>.</p>
          </div>
        )}
        {savedAdditions > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <Target size={18} className="text-indigo-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">Your Saved Money <span className="font-semibold text-green-600 dark:text-green-400">increased by {'\u20B9'}{savedAdditions.toLocaleString('en-IN')}</span> this month.</p>
          </div>
        )}
        {savedRemovals > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <Target size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">You withdrew <span className="font-semibold text-amber-600 dark:text-amber-400">{'\u20B9'}{savedRemovals.toLocaleString('en-IN')}</span> from saved money this month.</p>
          </div>
        )}
        {totalReceived > 0 && totalExpenses > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
            <Target size={18} className="text-indigo-500 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">You&apos;ve used <span className="font-semibold">{Math.round((totalExpenses / totalReceived) * 100)}%</span> of your received money.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
          {catData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="45%" height={200}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {catData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => ['\u20B9' + Number(v).toLocaleString('en-IN')]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#1f2937', color: '#f3f4f6' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {catData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{c.name}</span>
                    <span className="font-medium dark:text-gray-300">{'\u20B9'}{c.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No expenses recorded.</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">6-Month Trend</h2>
          {trend.some(t => t.expenses > 0 || t.received > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip formatter={(v) => ['\u20B9' + Number(v).toLocaleString('en-IN')]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#1f2937', color: '#f3f4f6' }} />
                <Bar dataKey="received" fill="#22c55e" radius={[4, 4, 0, 0]} name="Received" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">Not enough data for trend.</div>
          )}
        </div>
      </div>
    </div>
  );
}
