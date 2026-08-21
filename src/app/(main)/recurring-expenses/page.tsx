'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { EXPENSE_CATEGORIES } from '@/lib/store';
import { Plus, Trash2, X, Pencil, Repeat } from 'lucide-react';
import { Tip } from '@/components/Tip';

const FREQUENCIES = [
  { value: 'monthly' as const, label: 'Monthly' },
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'yearly' as const, label: 'Yearly' },
];

export default function RecurringExpensesPage() {
  const { recurringExpenses, addRecurringExpense, updateRecurringExpense, deleteRecurringExpense } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', amount: '', category: 'Subscriptions', frequency: 'monthly' as 'monthly' | 'weekly' | 'yearly' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => { setForm({ name: '', amount: '', category: 'Subscriptions', frequency: 'monthly' }); setShowForm(false); setEditingId(null); setSubmitError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.name.trim() || !amt || amt <= 0) return;
    setSubmitting(true);
    setSubmitError(null);
    let result;
    if (editingId) {
      result = await updateRecurringExpense(editingId, { name: form.name, amount: amt, category: form.category, frequency: form.frequency });
    } else {
      result = await addRecurringExpense({ name: form.name, amount: amt, category: form.category, frequency: form.frequency });
    }
    setSubmitting(false);
    if (result.error) { setSubmitError(result.error); return; }
    resetForm();
  };

  const handleEdit = (r: { id: string; name: string; amount: number; category: string; frequency: 'monthly' | 'weekly' | 'yearly' }) => {
    setForm({ name: r.name, amount: r.amount.toString(), category: r.category, frequency: r.frequency });
    setEditingId(r.id);
    setShowForm(true);
  };

  const totalMonthly = recurringExpenses.reduce((s, r) => {
    if (r.frequency === 'monthly') return s + r.amount;
    if (r.frequency === 'weekly') return s + r.amount * 4.33;
    return s + r.amount / 12;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Recurring Expenses</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track subscriptions and regular payments.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
          <Plus size={16} /> Add Recurring
        </button>
      </div>

      {recurringExpenses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Monthly Total</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{'\u20B9'}{totalMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      )}

      <Tip>Subscriptions are easy to forget. List them all here so you know exactly what you&apos;re paying every month.</Tip>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 animate-modal-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Netflix, Gym membership" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors">
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                  {FREQUENCIES.map(f => (
                    <button key={f.value} type="button" onClick={() => setForm(fr => ({ ...fr, frequency: f.value }))} className={`flex-1 py-2.5 text-sm font-medium transition-all active:scale-95 ${form.frequency === f.value ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60">{submitting ? 'Saving…' : editingId ? 'Update' : 'Add'}</button>
              </div>
              {submitError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>}
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {recurringExpenses.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {recurringExpenses.map(r => {
              const cat = EXPENSE_CATEGORIES.find(c => c.name === r.category);
              const Icon = cat?.icon;
              return (
                <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (cat?.color || '#78716c') + '15' }}>
                    {Icon ? <Icon size={18} style={{ color: cat?.color }} /> : <Repeat size={18} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{r.category} &bull; {r.frequency}</p>
                  </div>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">{'\u20B9'}{r.amount.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-400 dark:text-gray-500">/{r.frequency === 'monthly' ? 'mo' : r.frequency === 'weekly' ? 'wk' : 'yr'}</span></p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(r)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-90" aria-label="Edit"><Pencil size={14} /></button>
                    <button onClick={() => deleteRecurringExpense(r.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-90" aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            <p className="text-sm">No recurring expenses yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium active:scale-95 transition-all">Add your first recurring expense &rarr;</button>
          </div>
        )}
      </div>
    </div>
  );
}
