'use client';
import React from 'react';
import usePortfolioStore from '@/store/portfolioStore';
import { ChartCard, Skeleton } from '../ui';
import { cn } from '@/lib/utils';

function RiskBox({ title, value, subtitle, level }) {
  // level = 'good' | 'neutral' | 'warning' | 'danger'
  // All gray — good is brightest, danger is dimmest
  const textClass = {
    good:    'text-[hsl(var(--foreground))]',
    neutral: 'text-[hsl(var(--success))]',     // 88% gray — slightly lighter
    warning: 'text-[hsl(var(--warning))]',     // 60% gray — mid
    danger:  'text-[hsl(var(--muted-foreground))]', // 46% — dim
  }[level] ?? 'text-[hsl(var(--foreground))]';

  return (
    <div className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] p-4 rounded-[calc(var(--radius)-2px)] flex flex-col justify-center">
      <p className="text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-widest mb-1">{title}</p>
      <p className={cn('text-2xl font-bold font-mono', textClass)}>{value}</p>
      <p className="text-[hsl(var(--muted-foreground))] text-[10px] uppercase tracking-wider mt-1">{subtitle}</p>
    </div>
  );
}

export function RiskMetrics() {
  const { analytics, isLoading } = usePortfolioStore();

  if (isLoading || !analytics.risk) {
    return <Skeleton className="h-full w-full rounded-[var(--radius)]" />;
  }

  const { standardDeviation, sharpeRatio, maxDrawdown, sortinoRatio } = analytics.risk;

  return (
    <ChartCard title="Risk Profile" subtitle="Annualised risk-adjusted metrics">
      <div className="grid grid-cols-2 gap-3 h-full">
        <RiskBox
          title="Volatility"
          value={`${(standardDeviation * 100).toFixed(2)}%`}
          subtitle="Annualised Std Dev"
          level={standardDeviation < 0.15 ? 'good' : standardDeviation < 0.25 ? 'warning' : 'danger'}
        />
        <RiskBox
          title="Sharpe Ratio"
          value={sharpeRatio.toFixed(2)}
          subtitle="Risk-adjusted Return"
          level={sharpeRatio >= 1.5 ? 'good' : sharpeRatio >= 1 ? 'neutral' : 'warning'}
        />
        <RiskBox
          title="Max Drawdown"
          value={`${(maxDrawdown * 100).toFixed(2)}%`}
          subtitle="Peak to Trough"
          level={Math.abs(maxDrawdown) < 0.1 ? 'good' : Math.abs(maxDrawdown) < 0.2 ? 'warning' : 'danger'}
        />
        <RiskBox
          title="Sortino Ratio"
          value={sortinoRatio.toFixed(2)}
          subtitle="Downside Risk-adj"
          level={sortinoRatio >= 1.5 ? 'good' : sortinoRatio >= 1 ? 'neutral' : 'warning'}
        />
      </div>
    </ChartCard>
  );
}
