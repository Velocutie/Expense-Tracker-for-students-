import { memo } from 'react';
import { Banknote, CreditCard, Landmark, WalletCards } from 'lucide-react';
import type { PaymentMethod } from '@/lib/store';

const ACCOUNT_META: Record<PaymentMethod, { label: string; icon: typeof Banknote; tone: string; soft: string }> = {
  cash: { label: 'Cash', icon: Banknote, tone: 'text-emerald-700 dark:text-emerald-300', soft: 'bg-emerald-100/80 dark:bg-emerald-500/10' },
  bank_upi: { label: 'Bank / UPI', icon: Landmark, tone: 'text-blue-700 dark:text-blue-300', soft: 'bg-blue-100/80 dark:bg-blue-500/10' },
  card: { label: 'Card', icon: CreditCard, tone: 'text-fuchsia-700 dark:text-fuchsia-300', soft: 'bg-fuchsia-100/80 dark:bg-fuchsia-500/10' },
  other: { label: 'Other', icon: WalletCards, tone: 'text-purple-700 dark:text-purple-300', soft: 'bg-purple-100/80 dark:bg-purple-500/10' },
};

const formatMoney = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

type AccountBalanceCardProps = {
  balances: Record<PaymentMethod, number>;
  monthLabel?: string;
};

export const AccountBalanceCard = memo(function AccountBalanceCard({ balances, monthLabel }: AccountBalanceCardProps) {
  const total = Object.values(balances).reduce((sum, value) => sum + value, 0);
  return (
    <section className="account-balance-card relative overflow-hidden rounded-2xl border border-purple-200/55 dark:border-purple-300/15 bg-white/62 dark:bg-purple-950/25 p-5 shadow-[0_18px_42px_-28px_rgba(76,29,149,0.48)] backdrop-blur-md" aria-labelledby="account-balances-title">
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/10" aria-hidden="true" />
      <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700/70 dark:text-purple-200/65">Where your money lives</p>
          <h2 id="account-balances-title" className="mt-1 text-base font-bold tracking-[-0.02em] text-purple-950 dark:text-white">Account balances</h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] text-purple-800/55 dark:text-purple-100/50">{monthLabel || 'All recorded transactions'}</p>
          <p className={`text-lg font-bold ${total >= 0 ? 'text-purple-950 dark:text-white' : 'text-rose-600 dark:text-rose-300'}`}>{formatMoney(total)}</p>
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(ACCOUNT_META) as PaymentMethod[]).map((method) => {
          const meta = ACCOUNT_META[method];
          const Icon = meta.icon;
          const value = balances[method] || 0;
          return (
            <div key={method} className="rounded-xl border border-purple-100/70 bg-white/42 p-3 dark:border-purple-300/10 dark:bg-purple-950/20">
              <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${meta.soft} ${meta.tone}`}><Icon size={15} /></div>
              <p className="text-[11px] font-medium text-purple-900/60 dark:text-purple-100/60">{meta.label}</p>
              <p className={`mt-0.5 truncate text-sm font-bold ${value >= 0 ? meta.tone : 'text-rose-600 dark:text-rose-300'}`}>{value < 0 ? '-' : ''}{formatMoney(Math.abs(value))}</p>
            </div>
          );
        })}
      </div>
      <p className="relative mt-3 text-[10px] leading-relaxed text-purple-800/55 dark:text-purple-100/50">Income adds to its selected account and expenses subtract from the same account. Cards are tracked as a payment method only—no due tracking.</p>
    </section>
  );
});
