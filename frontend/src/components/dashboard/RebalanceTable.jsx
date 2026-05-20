'use client';
import React from 'react';
import usePortfolioStore from '@/store/portfolioStore';
import { ChartCard, Skeleton } from '../ui';
import { cn, formatCurrency } from '@/lib/utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function RebalanceTable() {
  const { analytics, isLoading } = usePortfolioStore();

  if (isLoading || !analytics.rebalance) {
    return <Skeleton className="h-full w-full rounded-[var(--radius)]" />;
  }

  const { recommendations } = analytics.rebalance;

  if (!recommendations?.length) {
    return (
      <ChartCard title="Rebalancing" subtitle="Suggested trades to hit target weights">
        <div className="flex flex-col items-center justify-center h-full text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[hsl(var(--foreground))] font-medium text-sm">Portfolio Balanced</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1">
              All holdings within 2% drift tolerance.
            </p>
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Rebalancing" subtitle="Suggested trades to hit target weights">
      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-full pr-1">
        {recommendations.map((rec, i) => {
          const isBuy = rec.action === 'BUY';
          return (
            <div
              key={i}
              className="bg-[hsl(var(--background))] border border-[hsl(var(--border))] p-3 rounded-[calc(var(--radius)-2px)] hover:border-[hsl(var(--muted-foreground)/0.3)] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[hsl(var(--foreground))] text-xs font-medium truncate pr-2 max-w-[65%]">
                  {rec.fundName.split(' ').slice(0, 4).join(' ')}
                </p>
                {/* BUY = brighter, SELL = dimmer */}
                <span className={cn(
                  'text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border font-mono',
                  isBuy
                    ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]'
                    : 'bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]'
                )}>
                  {rec.action}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-2">
                <span className="font-mono">{rec.currentAllocation.toFixed(1)}%</span>
                <ArrowRight size={10} className="opacity-40" />
                <span className="font-mono">{rec.targetAllocation.toFixed(1)}%</span>
                <span className="ml-auto font-mono font-semibold text-[hsl(var(--foreground))]">
                  {formatCurrency(rec.amount)}
                </span>
              </div>

              {/* Drift bar */}
              <div className="h-1 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    isBuy ? 'bg-[hsl(var(--foreground))]' : 'bg-[hsl(var(--muted-foreground))]'
                  )}
                  style={{ width: `${Math.min(Math.abs(rec.drift) * 5, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
