import { ArrowRight, CircleDollarSign, ReceiptText, ShoppingBag, PiggyBank } from 'lucide-react';

const STEPS = [
  { key: 'income', label: 'Income', icon: CircleDollarSign, tone: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-200/70 dark:ring-emerald-300/15' },
  { key: 'bills', label: 'Bills', icon: ReceiptText, tone: 'from-amber-400 to-orange-500', ring: 'ring-amber-200/70 dark:ring-amber-300/15' },
  { key: 'spending', label: 'Spending', icon: ShoppingBag, tone: 'from-fuchsia-400 to-purple-600', ring: 'ring-fuchsia-200/70 dark:ring-fuchsia-300/15' },
  { key: 'savings', label: 'Savings', icon: PiggyBank, tone: 'from-violet-400 to-indigo-600', ring: 'ring-violet-200/70 dark:ring-violet-300/15' },
] as const;

type FinancialTimelineProps = {
  income: number;
  bills: number;
  spending: number;
  savings: number;
  monthLabel: string;
};

export function FinancialTimeline({ income, bills, spending, savings, monthLabel }: FinancialTimelineProps) {
  const values = { income, bills, spending, savings };
  return (
    <section className="financial-timeline relative overflow-hidden rounded-[1.6rem] border border-purple-200/55 dark:border-purple-300/15 bg-white/62 dark:bg-purple-950/25 p-5 shadow-[0_20px_50px_-32px_rgba(76,29,149,0.55)] backdrop-blur-md" aria-labelledby="financial-timeline-title">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-500/10" aria-hidden="true" />
      <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700/70 dark:text-purple-200/65">Your money flow</p>
          <h2 id="financial-timeline-title" className="mt-1 text-base font-bold tracking-[-0.02em] text-purple-950 dark:text-white">Income → bills → spending → savings</h2>
        </div>
        <span className="text-xs font-medium text-purple-700/65 dark:text-purple-200/60">{monthLabel}</span>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-0">
        <div className="pointer-events-none absolute left-[13%] right-[13%] top-6 hidden h-px bg-gradient-to-r from-emerald-300 via-fuchsia-300 to-violet-300 opacity-70 sm:block dark:from-emerald-400/45 dark:via-fuchsia-400/45 dark:to-violet-400/45" aria-hidden="true" />
        {STEPS.map(({ key, label, icon: Icon, tone, ring }, index) => (
          <div key={key} className="relative flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
            <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg shadow-purple-900/15 ring-4 ${ring} transition-transform duration-200 hover:-translate-y-1 hover:rotate-3`}>
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-purple-950 dark:text-white">{label}</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-purple-900/75 dark:text-purple-100/75">₹{values[key].toLocaleString('en-IN')}</p>
            </div>
            {index < STEPS.length - 1 && <ArrowRight size={15} className="absolute -right-2 top-5 hidden text-purple-400/70 sm:block" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </section>
  );
}
