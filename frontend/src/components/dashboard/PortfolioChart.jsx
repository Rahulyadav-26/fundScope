'use client';
import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import usePortfolioStore from '@/store/portfolioStore';
import { Skeleton } from '../ui';
import { formatCurrency, cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-2xl p-3 text-xs min-w-[150px]">
      <p className="text-muted-foreground text-xs mb-2">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">NAV</span>
        <span className="font-mono font-semibold text-chart-1 text-sm">
          {formatCurrency(payload[0].value)}
        </span>
      </div>
    </div>
  );
};

export function PortfolioChart() {
  const { analytics, isLoading } = usePortfolioStore();
  const [range, setRange] = useState('1Y');
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted || isLoading || !analytics.history) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />;
  }

  const data = analytics.history.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    value: Math.round(item.value),
  }));

  const latestNav = data[data.length - 1]?.value || 0;
  const prevNav = data[data.length - 2]?.value || latestNav;
  const change = ((latestNav - prevNav) / prevNav) * 100 || 0;
  const isPos = change >= 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-foreground font-semibold text-sm">Portfolio NAV</h3>
          <div className="flex items-baseline mt-1">
            <span className="font-mono text-foreground text-2xl font-bold">
              {formatCurrency(latestNav)}
            </span>
            <span className={cn(
              'ml-2 text-sm font-mono',
              isPos ? 'text-chart-2' : 'text-chart-5'
            )}>
              {isPos ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-md">
          {['1M', '3M', '6M', '1Y', '3Y'].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'text-xs font-mono px-2 py-1 rounded transition-colors',
                range === r ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(0 0% 45%)', fontSize: 11 }}
              axisLine={false} tickLine={false} minTickGap={32} tickMargin={10}
            />
            <YAxis
              tick={{ fill: 'hsl(0 0% 45%)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickFormatter={v => `₹${(v / 1e5).toFixed(0)}L`}
              axisLine={false} tickLine={false} width={58}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#navFill)"
              activeDot={{ r: 4, fill: 'hsl(var(--chart-1))', stroke: 'hsl(0 0% 6%)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
