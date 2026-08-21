import { ArrowDownLeft, ArrowUpRight, CalendarClock, Sparkles, WalletCards } from 'lucide-react';

type CashFlowForecastProps = {
  currentIncome: number;
  recurringIncome: number;
  recurringBills: number;
  historicalSpending: number;
  projectedBalance: number;
  monthLabel: string;
};

const formatMoney = (value: number) => `₹${Math.round(Math.max(value, 0)).toLocaleString('en-IN')}`;

export function CashFlowForecast({
  currentIncome,
  recurringIncome,
  recurringBills,
  historicalSpending,
  projectedBalance,
  monthLabel,
}: CashFlowForecastProps) {
  const isPositive = projectedBalance >= 0;
  const totalInflow = currentIncome + recurringIncome;
  const totalOutflow = recurringBills + historicalSpending;
  const outflowRatio = totalInflow > 0 ? Math.min((totalOutflow / totalInflow) * 100, 100) : 0;

  return (
    <section className="cash-flow-forecast relative overflow-hidden rounded-[1.6rem] border border-purple-200/55 dark:border-purple-300/15 bg-white/62 dark:bg-purple-950/25 p-5 shadow-[0_20px_50px_-32px_rgba(76,29,149,0.55)] backdrop-blur-md" aria-labelledby="cash-flow-title">
      <div className="absolute -left-16 -bottom-20 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10" aria-hidden="true" />
      <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-900/20">
            <WalletCards size={19} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700/70 dark:text-purple-200/65">Planning ahead</p>
            <h2 id="cash-flow-title" className="mt-1 text-base font-bold tracking-[-0.02em] text-purple-950 dark:text-white">Cash flow forecast</h2>
          </div>
        </div>
        <span className="text-xs font-medium text-purple-700/65 dark:text-purple-200/60">Estimated for {monthLabel}</span>
      </div>

      <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200/55 bg-emerald-50/60 p-3 dark:border-emerald-300/10 dark:bg-emerald-500/[0.08]">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200"><ArrowDownLeft size={14} /> Inflow</div>
          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatMoney(totalInflow)}</p>
          <p className="mt-1 text-[11px] text-emerald-800/65 dark:text-emerald-100/60">Received + recurring income estimate</p>
        </div>
        <div className="rounded-2xl border border-rose-200/55 bg-rose-50/60 p-3 dark:border-rose-300/10 dark:bg-rose-500/[0.08]">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-200"><ArrowUpRight size={14} /> Outflow</div>
          <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">{formatMoney(totalOutflow)}</p>
          <p className="mt-1 text-[11px] text-rose-800/65 dark:text-rose-100/60">Recurring bills + historical spending pace</p>
        </div>
        <div className={`rounded-2xl border p-3 ${isPositive ? 'border-violet-200/65 bg-violet-50/70 dark:border-violet-300/10 dark:bg-violet-500/[0.09]' : 'border-amber-200/65 bg-amber-50/70 dark:border-amber-300/10 dark:bg-amber-500/[0.09]'}`}>
          <div className={`flex items-center gap-2 text-xs font-semibold ${isPositive ? 'text-violet-800 dark:text-violet-200' : 'text-amber-800 dark:text-amber-200'}`}><CalendarClock size={14} /> Projected left</div>
          <p className={`mt-1 text-lg font-bold ${isPositive ? 'text-violet-700 dark:text-violet-300' : 'text-amber-700 dark:text-amber-300'}`}>{isPositive ? formatMoney(projectedBalance) : `-${formatMoney(Math.abs(projectedBalance))}`}</p>
          <p className={`mt-1 text-[11px] ${isPositive ? 'text-violet-800/65 dark:text-violet-100/60' : 'text-amber-800/65 dark:text-amber-100/60'}`}>{isPositive ? 'A healthy cushion is forming' : 'Consider reducing flexible spending'}</p>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-purple-900/65 dark:text-purple-100/65">
          <span>Estimated money committed</span>
          <span>{Math.round(outflowRatio)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-purple-100/80 dark:bg-purple-900/55">
          <div className={`h-full rounded-full bg-gradient-to-r ${outflowRatio > 85 ? 'from-amber-400 to-rose-500' : 'from-purple-400 via-fuchsia-500 to-indigo-500'} transition-[width] duration-500`} style={{ width: `${outflowRatio}%` }} />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-purple-100/50 px-3 py-2.5 text-[11px] leading-relaxed text-purple-950/70 dark:bg-purple-900/30 dark:text-purple-50/70">
          <Sparkles size={13} className="mt-0.5 shrink-0 text-purple-600 dark:text-purple-300" />
          <span>Forecasts are estimates built from upcoming recurring bills, recurring-income history, and recent spending patterns—not a guarantee of future cash.</span>
        </div>
      </div>
    </section>
  );
}
