'use client';

import { useEffect, useState } from 'react';
import { ExpenseWiseMark } from '@/components/ExpenseWiseBrand';

const ARRIVAL_KEY = 'expensewise-auth-arrival';

export function AuthExitLayer({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="auth-exit-layer" aria-hidden="true">
      <div className="auth-exit-layer__halo" />
      <div className="auth-exit-layer__mark">
        <ExpenseWiseMark size="lg" className="auth-exit-layer__brand-mark" />
      </div>
      <p className="auth-exit-layer__label">Opening your dashboard</p>
    </div>
  );
}

export function AuthArrivalLayer() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(ARRIVAL_KEY) !== '1') return;
    sessionStorage.removeItem(ARRIVAL_KEY);
    const start = window.requestAnimationFrame(() => setActive(true));
    const finish = window.setTimeout(() => setActive(false), 720);
    return () => {
      window.cancelAnimationFrame(start);
      window.clearTimeout(finish);
    };
  }, []);

  if (!active) return null;

  return <div className="auth-arrival-layer" aria-hidden="true" />;
}
