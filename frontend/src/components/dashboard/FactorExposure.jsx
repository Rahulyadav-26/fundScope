'use client';
import React from 'react';
import usePortfolioStore from '@/store/portfolioStore';
import { ChartCard, Skeleton } from '../ui';
import { cn } from '@/lib/utils';

// All gray shades — differentiated by lightness, no colour
const CAP_SHADES = {
  'Large Cap': 'hsl(0 0% 88%)',
  'Mid Cap':   'hsl(0 0% 68%)',
  'Small Cap': 'hsl(0 0% 50%)',
  'Flexi Cap': 'hsl(0 0% 36%)',
  'Sectoral':  'hsl(0 0% 26%)',
  'Debt':      'hsl(0 0% 18%)',
  'Other':     'hsl(0 0% 12%)',
};
const CLASS_SHADES = {
  'Equity': 'hsl(0 0% 82%)',
  'Debt':   'hsl(0 0% 46%)',
  'Hybrid': 'hsl(0 0% 24%)',
};

function ExposureBar({ label, data, shadeMap }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0.5);
  return (
    <div>
      <p className="text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-widest mb-2">
        {label}
      </p>
      <div className="h-2.5 w-full rounded-full overflow-hidden flex gap-px bg-[hsl(var(--muted))]">
        {entries.map(([key, val]) => (
          <div
            key={key}
            className="h-full transition-all duration-700"
            style={{ width: `${val}%`, background: shadeMap[key] ?? 'hsl(0 0% 30%)' }}
            title={`${key}: ${val.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: shadeMap[key] ?? 'hsl(0 0% 30%)' }}
            />
            {key}{' '}
            <span className="font-mono text-[hsl(var(--foreground))]">{val.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FactorExposure() {
  const { analytics, isLoading } = usePortfolioStore();

  if (isLoading || !analytics.factors) {
    return <Skeleton className="h-full w-full rounded-[var(--radius)]" />;
  }

  const { marketCap, assetClass } = analytics.factors;

  return (
    <ChartCard title="Factor Exposure" subtitle="Market cap & asset class breakdown">
      <div className="flex flex-col justify-center gap-8 h-full">
        <ExposureBar label="Market Capitalization" data={marketCap}  shadeMap={CAP_SHADES}   />
        <ExposureBar label="Asset Class"           data={assetClass} shadeMap={CLASS_SHADES} />
      </div>
    </ChartCard>
  );
}
