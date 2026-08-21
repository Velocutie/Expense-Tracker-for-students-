'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Plus, Trash2, Target, Pencil } from 'lucide-react';
import { Tip } from '@/components/Tip';
import { Modal } from '@/components/Modal';

export default function SavingsGoalsPage() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', target: '', current: '', deadline: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => { setForm({ name: '', target: '', current: '', deadline: '' }); setShowForm(false); setEditingId(null); setSubmitError(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(form.target);
    const current = parseFloat(form.current) || 0;
    if (!form.name.trim() || !target || target <= 0) return;
    setSubmitting(true);
    setSubmitError(null);
    let result;
    if (editingId) {
      result = await updateSavingsGoal(editingId, { name: form.name, target, current, deadline: form.deadline });
    } else {
      result = await addSavingsGoal({ name: form.name, target, current, deadline: form.deadline });
    }
    setSubmitting(false);
    if (result.error) { setSubmitError(result.error); return; }
    resetForm();
  };

  const handleEdit = (g: { id: string; name: string; target: number; current: number; deadline: string }) => {
    setForm({ name: g.name, target: g.target.toString(), current: g.current.toString(), deadline: g.deadline || '' });
    setEditingId(g.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set targets for what you&apos;re saving for.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
          <Plus size={16} /> New Goal
        </button>
      </div>

      <Modal
        open={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Goal' : 'New Savings Goal'}
        titleId="goals-modal-title"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Buy headphones" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
              <input type="number" step="0.01" min="1" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="3000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saved so far</label>
              <input type="number" step="0.01" min="0" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline (optional)</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={resetForm} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60">{submitting ? 'Saving…' : editingId ? 'Update' : 'Create Goal'}</button>
          </div>
          {submitError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{submitError}</p>}
        </form>
      </Modal>

      <Tip>Set a deadline for your goals. Without one, it&apos;s easy to keep pushing \'I&apos;ll save next month\' forever.</Tip>

      {savingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsGoals.map(g => {
            const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0;
            const isComplete = g.current >= g.target;
            return (
              <div key={g.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-green-50 dark:bg-green-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
                      <Target size={18} className={isComplete ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{g.name}</h3>
                      {g.deadline && <p className="text-xs text-gray-500 dark:text-gray-400">By {g.deadline}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(g)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 active:scale-90 transition-all" aria-label="Edit"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('Delete this goal?')) deleteSavingsGoal(g.id); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 active:scale-90 transition-all" aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-2">
                  <div className={`h-3 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{'\u20B9'}{g.current.toLocaleString('en-IN')} / {'\u20B9'}{g.target.toLocaleString('en-IN')}</span>
                  <span className={`${isComplete ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{Math.round(pct)}%</span>
                </div>
                {isComplete && <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">Goal reached!</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No savings goals yet.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Create a goal for something you&apos;re saving for.</p>
          <button onClick={() => setShowForm(true)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium active:scale-95 transition-all">Create your first goal &rarr;</button>
        </div>
      )}
    </div>
  );
}
