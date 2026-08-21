'use client';

import { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, Sparkles, Target } from 'lucide-react';
import type { SavingsGoal } from '@/lib/store';

type SavingsWhatIfProps = { goals: SavingsGoal[] };

const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

export function SavingsWhatIf({ goals }: SavingsWhatIfProps) {
  const [monthlyAmount, setMonthlyAmount] = useState('500');
  const [months, setMonths] = useState('6');
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id || '');

  const selectedGoal = goals.find(goal => goal.id === selectedGoalId) || goals[0];
  const projection = useMemo(() => {
    const monthly = Math.max(Number(monthlyAmount) || 0, 0);
    const duration = Math.max(Number(months) || 0, 0);
    const projected = (selectedGoal?.current || 0) + monthly * duration;
    const target = selectedGoal?.target || 0;
    return { monthly, duration, projected, target, remaining: Math.max(target - projected, 0) };
  }, [monthlyAmount, months, selectedGoal]);

  return (
    <section className="savings-what-if relative overflow-hidden rounded-[1.6rem] border border-purple-200/55 dark:border-purple-300/15 bg-white/62 dark:bg-purple-950/25 p-5 shadow-[0_20px_50px_-32px_rgba(76,29,149,0.55)] backdrop-blur-md" aria-labelledby="what-if-title">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-500/10" aria-hidden="true" />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white shadow-lg shadow-purple-900/20"><Calculator size={19} /></div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700/70 dark:text-purple-200/65">Scenario planner</p>
          <h2 id="what-if-title" className="mt-1 text-base font-bold tracking-[-0.02em] text-purple-950 dark:text-white">What if you saved a little more?</h2>
          <p className="mt-1 text-xs text-purple-900/65 dark:text-purple-100/60">Try a monthly amount and see what becomes possible.</p>
        </div>
      </div>

      {selectedGoal ? (
        <>
          <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_1fr]">
            <label className="text-xs font-semibold text-purple-950 dark:text-purple-50">Goal
              <select value={selectedGoal.id} onChange={e => setSelectedGoalId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-purple-200/70 bg-white/70 px-3 py-2.5 text-sm font-medium text-purple-950 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30 dark:border-purple-300/15 dark:bg-purple-950/40 dark:text-white">
                {goals.map(goal => <option key={goal.id} value={goal.id}>{goal.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-purple-950 dark:text-purple-50">Save per month
              <div className="relative mt-1.5"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-purple-500">₹</span><input type="number" min="0" step="50" value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)} className="w-full rounded-xl border border-purple-200/70 bg-white/70 py-2.5 pl-7 pr-3 text-sm font-medium text-purple-950 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30 dark:border-purple-300/15 dark:bg-purple-950/40 dark:text-white" /></div>
            </label>
            <label className="text-xs font-semibold text-purple-950 dark:text-purple-50">For how many months?
              <input type="number" min="1" max="120" value={months} onChange={e => setMonths(e.target.value)} className="mt-1.5 w-full rounded-xl border border-purple-200/70 bg-white/70 px-3 py-2.5 text-sm font-medium text-purple-950 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30 dark:border-purple-300/15 dark:bg-purple-950/40 dark:text-white" />
            </label>
          </div>

          <div className="relative mt-5 rounded-2xl border border-purple-200/55 bg-gradient-to-br from-purple-100/80 via-fuchsia-50/75 to-blue-50/75 p-4 dark:border-purple-300/15 dark:from-purple-900/35 dark:via-fuchsia-950/25 dark:to-blue-950/25">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 dark:text-purple-100"><Target size={14} /> Projected for “{selectedGoal.name}”</div>
                <p className="mt-1 text-2xl font-bold tracking-[-0.04em] text-purple-950 dark:text-white">{formatMoney(projection.projected)}</p>
                <p className="mt-1 text-xs text-purple-900/65 dark:text-purple-100/60">Current {formatMoney(selectedGoal.current)} + {formatMoney(projection.monthly)} × {projection.duration} months</p>
              </div>
              <div className="sm:max-w-[230px] sm:text-right">
                {projection.target > 0 && projection.projected >= projection.target ? (
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300 sm:justify-end"><CheckCircle2 size={17} /> You could buy it in {projection.duration} months.</p>
                ) : (
                  <p className="flex items-start gap-2 text-sm font-semibold text-purple-900/80 dark:text-purple-50/80 sm:justify-end"><Sparkles size={17} className="mt-0.5 shrink-0 text-fuchsia-500" /> You&apos;d be {formatMoney(projection.remaining)} away from the goal after {projection.duration} months.</p>
                )}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-purple-200/70 dark:bg-purple-950/65"><div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 transition-[width] duration-300" style={{ width: `${projection.target > 0 ? Math.min((projection.projected / projection.target) * 100, 100) : 0}%` }} /></div>
          </div>
        </>
      ) : (
        <p className="relative mt-5 rounded-2xl bg-purple-100/65 p-4 text-sm text-purple-900/75 dark:bg-purple-900/30 dark:text-purple-50/70">Create a savings goal first, then use this simulator to test a realistic plan.</p>
      )}
    </section>
  );
}
