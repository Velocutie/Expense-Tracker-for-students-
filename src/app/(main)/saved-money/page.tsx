'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, Minus, Trash2, X, PiggyBank } from 'lucide-react';
import { Tip } from '@/components/Tip';

export default function SavedMoneyPage() {
  const { savedMoneyEntries, addSavedMoneyEntry, deleteSavedMoneyEntry, getCurrentSavedMoney } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'add' | 'remove'>('add');
  const [form, setForm] = useState({ amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentSaved = getCurrentSavedMoney();
  const sorted = [...savedMoneyEntries].sort((a, b) => b.date.localeCompare(a.date));

  const resetForm = () => { setForm({ amount: '', date: new Date().toISOString().slice(0, 10), note: '' }); setShowForm(false); setSubmitError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    if (formType === 'remove' && amt > currentSaved) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await addSavedMoneyEntry({ amount: amt, type: formType, date: form.date, note: form.note });
    setSubmitting(false);
    if (result.error) { setSubmitError(result.error); return; }
    resetForm();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Saved Money</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track money you&apos;ve set aside.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setFormType('add'); resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all shadow-sm shadow-green-600/20 active:scale-95">
            <Plus size={16} /> Add Saved
          </button>
          <button onClick={() => { setFormType('remove'); resetForm(); setShowForm(true); }} disabled={currentSaved <= 0} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-40 active:scale-95">
            <Minus size={16} /> Remove
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center"><PiggyBank size={20} className="text-amber-600 dark:text-amber-400" /></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Saved Money</p>
        </div>
        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{'\u20B9'}{currentSaved.toLocaleString('en-IN')}</p>
      </div>

      <Tip>Move money here the day you receive your allowance. What&apos;s left after saving is what you spend — not the other way around.</Tip>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{formType === 'add' ? 'Add Saved Money' : 'Remove Saved Money'}</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input type="number" step="0.01" min="0.01" max={formType === 'remove' ? currentSaved : undefined} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg transition-colors" required />
                {formType === 'remove' && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max: {'\u20B9'}{currentSaved.toLocaleString('en-IN')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
                <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Saved from allowance" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-medium active:scale-95 transition-all disabled:opacity-60 ${formType === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {submitting ? 'Saving…' : formType === 'add' ? 'Add' : 'Remove'}
                </button>
              </div>
              {submitError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>}
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">History</h2>
        </div>
        {sorted.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {sorted.map(e => (
              <div key={e.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${e.type === 'add' ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                  {e.type === 'add' ? <Plus size={16} className="text-green-600 dark:text-green-400" /> : <Minus size={16} className="text-red-600 dark:text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{e.note || (e.type === 'add' ? 'Saved' : 'Withdrawn')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{e.date}</p>
                </div>
                <p className={`text-sm font-semibold shrink-0 ${e.type === 'add' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {e.type === 'add' ? '+' : '-'}{'\u20B9'}{e.amount.toLocaleString('en-IN')}
                </p>
                <button onClick={() => deleteSavedMoneyEntry(e.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 shrink-0 transition-all active:scale-90" aria-label="Delete"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            <p className="text-sm">No saved money entries yet.</p>
            <p className="text-xs mt-1">Track money you&apos;ve decided to set aside.</p>
          </div>
        )}
      </div>
    </div>
  );
}
