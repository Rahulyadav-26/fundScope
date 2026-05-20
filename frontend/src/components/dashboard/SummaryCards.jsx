'use client';
import React from 'react';
import usePortfolioStore from '@/store/portfolioStore';
import { MetricCard, Skeleton } from '../ui';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function SummaryCards() {
  const { portfolio, analytics, isLoading } = usePortfolioStore();

  if (isLoading || !portfolio) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[var(--radius)]" />
        ))}
      </div>
    );
  }

  const xirr  = analytics.returns?.xirr  ?? 0;
  const sharpe = analytics.risk?.sharpeRatio ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in">
      <MetricCard
        title="Current Value"
        prefix="₹"
        value={(portfolio.currentValue / 1e5).toFixed(2) + 'L'}
        trend={portfolio.absoluteReturn}
        trendLabel="absolute"
      />
      <MetricCard
        title="Total Invested"
        prefix="₹"
        value={(portfolio.totalInvested / 1e5).toFixed(2) + 'L'}
      />
      <MetricCard
        title="XIRR"
        value={xirr.toFixed(2)}
        suffix="%"
        trend={xirr - 12}
        trendLabel="vs 12% target"
      />
      <MetricCard
        title="Sharpe Ratio"
        value={sharpe.toFixed(2)}
        trend={sharpe - 1}
        trendLabel="vs 1.0 benchmark"
      />
    </div>
  );
}
