'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import usePortfolioStore from '@/store/portfolioStore';
import { ChartCard, Skeleton } from '../ui';
import { formatCurrency } from '@/lib/utils';

// Monochrome grayscale palette for pie slices
const GRAY_PALETTE = [
  'hsl(0 0% 90%)',
  'hsl(0 0% 72%)',
  'hsl(0 0% 55%)',
  'hsl(0 0% 40%)',
  'hsl(0 0% 28%)',
  'hsl(0 0% 20%)',
  'hsl(0 0% 14%)',
  'hsl(0 0% 8%)',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-[calc(var(--radius)-2px)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-xl text-sm max-w-[220px]">
      <p className="text-[hsl(var(--foreground))] font-medium text-xs mb-1 line-clamp-2">{d.name}</p>
      <p className="text-[hsl(var(--foreground))] font-mono font-bold">{formatCurrency(d.value)}</p>
    </div>
  );
};

export function AllocationDonut() {
  const { portfolio, isLoading } = usePortfolioStore();

  if (isLoading || !portfolio) {
    return <Skeleton className="h-full w-full rounded-[var(--radius)]" />;
  }

  const data = [...portfolio.holdings]
    .sort((a, b) => b.currentValue - a.currentValue)
    .map(h => ({ name: h.fundName, value: h.currentValue }));

  const total = data.reduce((s, x) => s + x.value, 0);

  return (
    <ChartCard title="Asset Allocation" subtitle="Current holdings distribution">
      <div className="flex flex-col h-full gap-4">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius="55%" outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={GRAY_PALETTE[i % GRAY_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto">
          {data.slice(0, 5).map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate mr-2">
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{ background: GRAY_PALETTE[i % GRAY_PALETTE.length] }}
                />
                <span className="text-[hsl(var(--muted-foreground))] truncate">
                  {d.name.split(' ').slice(0, 3).join(' ')}
                </span>
              </div>
              <span className="font-mono text-[hsl(var(--foreground))] shrink-0">
                {((d.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
          {data.length > 5 && (
            <p className="text-[hsl(var(--muted-foreground))] text-xs">+{data.length - 5} more</p>
          )}
        </div>
      </div>
    </ChartCard>
  );
}
