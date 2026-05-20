'use client';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function MetricCard({ title, value, prefix = '', suffix = '', trend, trendLabel, className }) {
  const isPositive = trend >= 0;

  return (
    <div className={cn(
      'relative overflow-hidden rounded-[var(--radius)] p-6 border border-[hsl(var(--border))]',
      'bg-[hsl(var(--card))] group hover:border-[hsl(var(--muted-foreground)/0.3)] transition-all duration-300',
      className
    )}>
      <p className="text-[hsl(var(--muted-foreground))] text-xs uppercase tracking-widest font-medium mb-3">
        {title}
      </p>

      <div className="flex items-baseline gap-1 mb-3">
        {prefix && <span className="text-[hsl(var(--muted-foreground))] text-xl font-mono">{prefix}</span>}
        <span className="text-[hsl(var(--foreground))] text-3xl font-bold font-mono tracking-tight">{value}</span>
        {suffix && <span className="text-[hsl(var(--muted-foreground))] text-lg font-mono">{suffix}</span>}
      </div>

      {trend !== undefined && (
        <div className={cn(
          'flex items-center gap-1.5 text-sm font-medium font-mono',
          isPositive ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--muted-foreground))]'
        )}>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(var(--muted))]">
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          </span>
          {Math.abs(trend).toFixed(2)}%
          {trendLabel && (
            <span className="text-[hsl(var(--muted-foreground))] text-xs font-sans ml-1">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function ChartCard({ title, subtitle, action, children, className }) {
  return (
    <div className={cn(
      'rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6',
      'flex flex-col h-full',
      className
    )}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[hsl(var(--foreground))] font-semibold tracking-tight text-sm">{title}</h3>
          {subtitle && (
            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

/** Sharpe badge — grayscale levels only */
export function SharpeBadge({ value }) {
  const n = parseFloat(value);
  let cls = '';
  // Good → lighter gray, bad → very dim
  if (n >= 1.5)      cls = 'bg-[hsl(0_0%_22%)] text-[hsl(var(--foreground))]   border-[hsl(0_0%_32%)]';
  else if (n >= 1.0) cls = 'bg-[hsl(0_0%_16%)] text-[hsl(var(--success))]      border-[hsl(0_0%_26%)]';
  else if (n >= 0.5) cls = 'bg-[hsl(0_0%_12%)] text-[hsl(var(--warning))]      border-[hsl(0_0%_22%)]';
  else               cls = 'bg-[hsl(0_0%_10%)] text-[hsl(var(--muted-foreground))] border-[hsl(0_0%_18%)]';

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono font-medium border',
      cls
    )}>
      {n.toFixed(2)}
    </span>
  );
}
