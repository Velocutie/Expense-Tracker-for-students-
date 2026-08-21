import { Lightbulb } from 'lucide-react';

interface TipProps {
  children: React.ReactNode;
  className?: string;
}

export function Tip({ children, className = '' }: TipProps) {
  return (
    <div className={`tip-card group relative flex items-start gap-3 px-4 py-3 rounded-2xl overflow-hidden ${className}`}>
      <div className="tip-card__glow" aria-hidden="true" />
      <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-purple-50 shadow-[0_8px_18px_-10px_rgba(124,58,237,0.9)] transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
        <Lightbulb size={16} strokeWidth={2.2} />
      </div>
      <div className="relative min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-900/70 dark:text-purple-100/75">Money intelligence</p>
        <p className="mt-0.5 text-xs leading-relaxed text-purple-950/85 dark:text-purple-50/85">{children}</p>
      </div>
    </div>
  );
}
