import { Gauge, PiggyBank, ShieldCheck } from 'lucide-react';

const SMART_TIPS = [
  {
    icon: Gauge,
    title: 'Use a pace, not a guess',
    text: 'Compare your average daily spend with the days left in the month before making a non-essential purchase.',
    tone: 'from-purple-500 to-violet-600',
  },
  {
    icon: PiggyBank,
    title: 'Pay your future self first',
    text: 'Move a small fixed amount into savings when money arrives. Consistency beats waiting for a perfect month.',
    tone: 'from-fuchsia-500 to-purple-600',
  },
  {
    icon: ShieldCheck,
    title: 'Keep a buffer',
    text: 'Leave room for surprise travel, repairs, or academic costs instead of budgeting every rupee to zero.',
    tone: 'from-indigo-500 to-blue-600',
  },
];

export function SmartTips({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? 'grid grid-cols-1 sm:grid-cols-3 gap-3' : 'grid grid-cols-1 md:grid-cols-3 gap-3'} aria-label="Smart money tips">
      {SMART_TIPS.map(({ icon: Icon, title, text, tone }) => (
        <article key={title} className="smart-tip-card group relative overflow-hidden rounded-2xl border border-purple-200/45 dark:border-purple-300/15 bg-white/55 dark:bg-purple-950/25 p-4 shadow-[0_16px_36px_-26px_rgba(76,29,149,0.45)] backdrop-blur-sm">
          <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-lg shadow-purple-900/15 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-3`}>
            <Icon size={17} />
          </div>
          <h3 className="text-sm font-semibold text-purple-950 dark:text-white">{title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-purple-900/70 dark:text-purple-100/70">{text}</p>
        </article>
      ))}
    </section>
  );
}
