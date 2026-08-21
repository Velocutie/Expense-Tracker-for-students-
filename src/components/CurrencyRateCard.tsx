'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftRight, Clock3, RefreshCw } from 'lucide-react';

type RateResponse = { date?: string; base?: string; quote?: string; rate?: number };
type RateState = { rate: number; date: string; cached: boolean } | null;

const CACHE_KEY = 'expensewise-inr-usd-rate';
const RATE_URL = 'https://api.frankfurter.dev/v2/rate/INR/USD';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function CurrencyRateCard() {
  const [state, setState] = useState<RateState>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;

    const loadRate = async (allowCache = true) => {
      setLoading(true);
      setOffline(false);
      const today = todayKey();
      if (allowCache) {
        try {
          const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null') as RateState;
          if (cached?.rate && cached.date === today) {
            if (!cancelled) {
              setState({ ...cached, cached: true });
              setLoading(false);
            }
            return;
          }
        } catch {
          // Ignore malformed local cache and fetch a fresh rate.
        }
      }

      try {
        const response = await fetch(RATE_URL, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Rate request failed: ${response.status}`);
        const data = await response.json() as RateResponse;
        if (!data.rate || !Number.isFinite(data.rate)) throw new Error('Rate unavailable');
        const nextState = { rate: data.rate, date: data.date || today, cached: false };
        localStorage.setItem(CACHE_KEY, JSON.stringify(nextState));
        if (!cancelled) setState(nextState);
      } catch {
        if (!cancelled) setOffline(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadRate(refreshNonce === 0);
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 5, 0);
    midnightTimer = setTimeout(() => void loadRate(false), nextMidnight.getTime() - now.getTime());

    return () => {
      cancelled = true;
      if (midnightTimer) clearTimeout(midnightTimer);
    };
  }, [refreshNonce]);

  return (
    <section className="currency-rate-card relative overflow-hidden rounded-2xl border border-purple-200/55 dark:border-purple-300/15 bg-white/62 dark:bg-purple-950/25 p-4 shadow-[0_18px_42px_-28px_rgba(76,29,149,0.48)] backdrop-blur-md" aria-label="Live Indian rupee to US dollar reference rate">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-300/20 blur-2xl dark:bg-blue-500/10" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-900/15"><ArrowLeftRight size={16} /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-purple-700/70 dark:text-purple-200/65">Daily reference rate</p>
            <h2 className="mt-1 text-sm font-bold text-purple-950 dark:text-white">INR ↔ USD</h2>
          </div>
        </div>
        <button type="button" onClick={() => setRefreshNonce(value => value + 1)} className="rounded-lg p-1.5 text-purple-500/70 transition hover:bg-purple-100/70 hover:text-purple-700 dark:hover:bg-purple-400/15 dark:hover:text-purple-200" title="Refresh rate" aria-label="Refresh exchange rate">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="relative mt-4">
        {loading ? (
          <div className="h-12 animate-pulse rounded-xl bg-purple-100/70 dark:bg-purple-900/35" />
        ) : state ? (
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xl font-bold tracking-[-0.03em] text-purple-950 dark:text-white">₹1 = ${state.rate.toFixed(4)}</p>
              <p className="mt-1 text-xs text-purple-900/65 dark:text-purple-100/65">$1 ≈ ₹{(1 / state.rate).toFixed(2)}</p>
            </div>
            <div className="text-right text-[10px] text-purple-800/55 dark:text-purple-100/55">
              <div className="flex items-center justify-end gap-1"><Clock3 size={11} /> {state.date}</div>
              <p className="mt-1">{state.cached ? 'Cached today' : 'Updated today'}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-purple-100/60 px-3 py-2.5 text-xs text-purple-900/75 dark:bg-purple-900/30 dark:text-purple-100/70">Rate unavailable right now. Your INR tracking still works normally.</div>
        )}
      </div>
      <p className="relative mt-3 text-[10px] leading-relaxed text-purple-800/55 dark:text-purple-100/50">Reference data updates when the provider publishes a new daily rate. Source: Frankfurter.</p>
      {offline && <p className="sr-only">Live currency service unavailable; showing no converted rate.</p>}
    </section>
  );
}
