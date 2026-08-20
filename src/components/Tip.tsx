import { Lightbulb } from 'lucide-react';

interface TipProps {
  children: React.ReactNode;
  className?: string;
}

export function Tip({ children, className = '' }: TipProps) {
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 ${className}`}>
      <Lightbulb size={13} className="text-indigo-400 dark:text-indigo-500 mt-0.5 shrink-0" />
      <p className="text-[11px] leading-relaxed text-indigo-600/70 dark:text-indigo-400/60">{children}</p>
    </div>
  );
}
