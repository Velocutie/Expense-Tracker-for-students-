'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MONEY_SOURCES } from '@/lib/store';
import { Plus, Trash2, X } from 'lucide-react';
import { Tip } from '@/components/Tip';

function getMonthKey(d: string) { return d.slice(0, 7); }

export default function MoneyReceivedPage() {
  const { moneyReceived, addMoneyReceived, deleteMoneyReceived } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [month, setMonth] = useState(getMonthKey(new Date().toISOString().slice(0, 10)));
  const [form, setForm] = useState({ amount: '', source: 'Parents', date: new Date().toISOString().slice(0, 10), note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => { setForm({ amount: '', source: 'Parents', date: new Date().toISOString().slice(0, 10), note: '' }); setShowForm(false); setSubmitError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await addMoneyReceived({ amount: amt, source: form.source, date: form.date, note: form.note });
    setSubmitting(false);
    if (result.error) { setSubmitError(result.error); return; }
    resetForm();
  };

  const filtered = moneyReceived.filter(m => getMonthKey(m.date) === month).sort((a, b) => b.date.localeCompare(a.date));
  const total = filtered.reduce((s, m) => s + m.amount, 0);
  const months = [...new Set(moneyReceived.map(m => getMonthKey(m.date)))].sort().reverse();
  const allMonths = Array.from(new Set([getMonthKey(new Date().toISOString().slice(0, 10)), ...months])).sort().reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Money Received</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track money from parents, scholarships, and more.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
          <Plus size={16} /> Add Money
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

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Received This Month</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{'\u20B9'}{total.toLocaleString('en-IN')}</p>
      </div>

      <Tip>Record money as soon as you receive it. Don&apos;t wait till month end — you&apos;ll forget small amounts.</Tip>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Money Received</h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:scale-90 transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                <div className="grid grid-cols-3 gap-2">
                  {MONEY_SOURCES.map(src => {
                    const Icon = src.icon;
                    return (
                      <button key={src.name} type="button" onClick={() => setForm(f => ({ ...f, source: src.name }))} className={`p-2.5 rounded-xl text-xs font-medium transition-all active:scale-95 flex flex-col items-center gap-1 ${form.source === src.name ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                        <Icon size={18} style={{ color: src.color }} />
                        {src.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label>
                <input type="text" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Monthly allowance" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60">{submitting ? 'Saving…' : 'Add Money'}</button>
              </div>
              {submitError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>}
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {filtered.map(m => {
              const src = MONEY_SOURCES.find(s => s.name === m.source);
              const Icon = src?.icon;
              return (
                <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (src?.color || '#78716c') + '15' }}>
                    {Icon ? <Icon size={18} style={{ color: src?.color }} /> : <span>{'\uD83D\uDCB0'}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.source}{m.note ? ' \u2014 ' + m.note : ''}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.date}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 shrink-0">+{'\u20B9'}{m.amount.toLocaleString('en-IN')}</p>
                  <button onClick={() => deleteMoneyReceived(m.id)} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 shrink-0 transition-all active:scale-90" aria-label="Delete"><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            <p className="text-sm">No money recorded for this month.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium active:scale-95 transition-all">Add your first entry &rarr;</button>
          </div>
        )}
      </div>
    </div>
  );
}
