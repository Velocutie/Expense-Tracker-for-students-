'use client';

import type { CSSProperties } from 'react';

const sizes = {
  sm: { box: 'h-8 w-8', icon: 32, wordmark: 'text-[15px]', tagline: 'text-[10px]' },
  md: { box: 'h-12 w-12', icon: 48, wordmark: 'text-xl', tagline: 'text-xs' },
  lg: { box: 'h-16 w-16', icon: 64, wordmark: 'text-2xl', tagline: 'text-sm' },
};

type BrandSize = keyof typeof sizes;

type ExpenseWiseBrandProps = {
  size?: BrandSize;
  showName?: boolean;
  showTagline?: boolean;
  light?: boolean;
  className?: string;
};

export function ExpenseWiseMark({ size = 'md', className = '' }: { size?: BrandSize; className?: string }) {
  const config = sizes[size];
  return (
    <span
      className={`expensewise-mark ${config.box} ${className}`}
      aria-hidden="true"
      style={{ '--brand-size': `${config.icon}px` } as CSSProperties}
    >
      <svg viewBox="0 0 64 64" width={config.icon} height={config.icon} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`brand-surface-${size}`} x1="10" y1="8" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E9D5FF" />
            <stop offset="0.42" stopColor="#A855F7" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id={`brand-glow-${size}`} x1="13" y1="9" x2="51" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FAE8FF" />
            <stop offset="1" stopColor="#C084FC" />
          </linearGradient>
          <filter id={`brand-shadow-${size}`} x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#4C1D95" floodOpacity="0.38" />
          </filter>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="17" fill={`url(#brand-surface-${size})`} filter={`url(#brand-shadow-${size})`} />
        <path d="M8 28C15 17 28 10 42 10c5 0 10 1 14 3v12c-7-5-14-7-22-7-11 0-20 4-26 12V28Z" fill="white" fillOpacity="0.18" />
        <path d="M19 40.5 27 32l6 5 12-14" stroke={`url(#brand-glow-${size})`} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M45 23h.1" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <circle cx="19" cy="40.5" r="2.25" fill="white" fillOpacity="0.92" />
        <path d="M14 54h36" stroke="white" strokeOpacity="0.24" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function ExpenseWiseBrand({
  size = 'md',
  showName = true,
  showTagline = true,
  light = false,
  className = '',
}: ExpenseWiseBrandProps) {
  const config = sizes[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ExpenseWiseMark size={size} />
      {showName && (
        <div className="min-w-0">
          <p className={`${config.wordmark} font-bold leading-none tracking-[-0.03em] ${light ? 'text-white' : 'text-gray-950 dark:text-white'}`}>
            ExpenseWise
          </p>
          {showTagline && (
            <p className={`${config.tagline} mt-1 font-medium tracking-[0.02em] ${light ? 'text-white/65' : 'text-gray-500 dark:text-gray-400'}`}>
              Student Finance
            </p>
          )}
        </div>
      )}
    </div>
  );
}
