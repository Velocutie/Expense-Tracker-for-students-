'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { EXPENSE_CATEGORIES } from '@/lib/store';
import { Plus, Trash2, X, AlertTriangle } from 'lucide-react';
import { Tip } from '@/components/Tip';

function getMonthKey(d: string) { return d.slice(0, 7); }

export default function BudgetsPage() {
  const { budgets, expenses, addBudget, updateBudget, deleteBudget, getSpentByCategory } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(getMonthKey(new Date().toISOString().slice(0, 10)));
  const [form, setForm] = useState({ category: 'Food & Drinks', limit: '', period: 'monthly' as 'monthly' | 'weekly' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const spent = getSpentByCategory(month);

  useEffect(() => {
    budgets.forEach(b => {
      const categorySpent = spent[b.category] || 0;
      if (b.spent !== categorySpent) updateBudget(b.id, { spent: categorySpent });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, month]);

  const resetForm = () => { setForm({ category: 'Food & Drinks', limit: '', period: 'monthly' }); setShowForm(false); setSubmitError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(form.limit);
    if (!limit || limit <= 0) return;
    setSubmitting(true);
    setSubmitError(null);
    const existing = budgets.find(b => b.category === form.category && b.period === form.period);
    let result;
    if (existing) result = await updateBudget(existing.id, { limit });
    else result = await addBudget({ category: form.category, limit, period: form.period });
    setSubmitting(false);
    if (result.error) { setSubmitError(result.error); return; }
    resetForm();
  };

  const monthlyBudgets = budgets.filter(b => b.period === 'monthly');
  const totalBudget = monthlyBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = monthlyBudgets.reduce((s, b) => s + (spent[b.category] || 0), 0);

  const months = [...new Set(budgets.map(b => getMonthKey(b.createdAt)))].sort().reverse();
  const allMonths = Array.from(new Set([getMonthKey(new Date().toISOString().slice(0, 10)), ...months])).sort().reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set spending limits for each category.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
          <Plus size={16} /> Set Budget
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {allMonths.map(m => {
          const [y, mo] = m.split('-');
          const label = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(mo)-1] + ' ' + y;
          return (
            <button key={m} onClick={() => setMonth(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${month === m ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{label}</button>
          );
        })}
      </div>

      {monthlyBudgets.length === 0 && (
        <Tip>Start with your biggest expense category — usually Food or Rent. Setting a budget there makes the biggest difference.</Tip>
      )}

      {monthlyBudgets.length > 0 && totalBudget > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Overall Budget</h2>
            <span className="text-sm font-bold dark:text-gray-300">{Math.round((totalSpent / totalBudget) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${totalSpent > totalBudget ? 'bg-red-500' : totalSpent > totalBudget * 0.75 ? 'bg-yellow-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{'\u20B9'}{totalSpent.toLocaleString('en-IN')} spent</span>
            <span>{'\u20B9'}{totalBudget.toLocaleString('en-IN')} budget</span>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Set Budget</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Limit</label>
                <input type="number" step="0.01" min="1" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} placeholder="e.g. 5000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                  <button type="button" onClick={() => setForm(f => ({ ...f, period: 'monthly' }))} className={`flex-1 py-2.5 text-sm font-medium transition-all active:scale-95 ${form.period === 'monthly' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Monthly</button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, period: 'weekly' }))} className={`flex-1 py-2.5 text-sm font-medium transition-all active:scale-95 ${form.period === 'weekly' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Weekly</button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60">{submitting ? 'Saving…' : 'Set Budget'}</button>
              </div>
              {submitError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>}
            </form>
          </div>
        </div>
      )}

      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(budget => {
            const cat = EXPENSE_CATEGORIES.find(c => c.name === budget.category);
            const Icon = cat?.icon;
            const categorySpent = spent[budget.category] || 0;
            const pct = budget.limit > 0 ? Math.min((categorySpent / budget.limit) * 100, 100) : 0;
            const isOver = categorySpent > budget.limit;
            const remaining = budget.limit - categorySpent;
            const warn = pct >= 80 && !isOver;
            return (
              <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (cat?.color || '#78716c') + '15' }}>
                      {Icon ? <Icon size={18} style={{ color: cat?.color }} /> : <span>{'\uD83D\uDCCC'}</span>}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{budget.category}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{budget.period} budget</p>
                    </div>
                  </div>
                  <button onClick={() => { if (confirm('Delete this budget?')) deleteBudget(budget.id); }} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-90" aria-label="Delete budget"><Trash2 size={14} /></button>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div className={`h-2.5 rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 75 ? 'bg-yellow-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`${isOver ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>{'\u20B9'}{categorySpent.toLocaleString('en-IN')} spent</span>
                  <span className={remaining >= 0 ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}>{remaining >= 0 ? `\u20B9${remaining.toLocaleString('en-IN')} left` : `\u20B9${Math.abs(remaining).toLocaleString('en-IN')} over`}</span>
                </div>
                {warn && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={12} /> Close to budget limit
                  </div>
                )}
                {isOver && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400">
                    <AlertTriangle size={12} /> Budget exceeded!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No budgets set yet.</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium active:scale-95 transition-all">Create your first budget &rarr;</button>
        </div>
      )}
    </div>
  );
}
