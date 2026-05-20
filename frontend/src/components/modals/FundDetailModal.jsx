'use client';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { PortfolioChart } from '../dashboard/PortfolioChart';

function MetricCard({ label, value, isReturn, isSharpe }) {
  const n = parseFloat(value);
  let valColor = 'text-foreground';
  let Icon = null;

  if (isReturn) {
    valColor = n >= 0 ? 'text-chart-2' : 'text-chart-5';
    Icon = n >= 0 ? TrendingUp : TrendingDown;
  } else if (isSharpe) {
    if (n >= 1.5) valColor = 'text-chart-2';
    else if (n >= 1.0) valColor = 'text-chart-1';
    else if (n >= 0.5) valColor = 'text-chart-3';
    else valColor = 'text-chart-5';
  }

  return (
    <div className="bg-background border border-border rounded-lg p-3">
      <div className="text-muted-foreground text-xs uppercase tracking-widest">{label}</div>
      <div className={cn('font-mono font-bold text-xl mt-1 flex items-center gap-1', valColor)}>
        {Icon && <Icon size={16} />}
        {isReturn && n >= 0 ? '+' : ''}{value}
      </div>
    </div>
  );
}

export function FundDetailModal({ isOpen, onOpenChange, fund }) {
  if (!fund) return null;
  const initials = (fund.amc || 'MF').substring(0, 2).toUpperCase();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-background/70 backdrop-blur-sm fixed inset-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-slide-up z-50 focus:outline-none">
          
          <Dialog.Close className="absolute top-4 right-4 w-7 h-7 rounded-md bg-secondary hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
            <X size={14} />
          </Dialog.Close>

          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-foreground font-bold font-mono text-sm">
              {initials}
            </div>
            <div>
              <Dialog.Title className="text-foreground font-semibold text-base leading-tight">
                {fund.fundName}
              </Dialog.Title>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground text-xs">{fund.amc}</span>
                <span className="border border-border rounded text-muted-foreground text-xs px-2 py-0.5">
                  {fund.category || 'Equity'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-4" />

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="NAV" value={`₹${fund.currentNav?.toFixed(2) || '0.00'}`} />
            <MetricCard label="1Y Return" value={`${fund.absoluteReturn?.toFixed(2) || '0.00'}%`} isReturn />
            <MetricCard label="Sharpe" value={fund.sharpe?.toFixed(2) || '1.20'} isSharpe />
            <MetricCard label="Expense" value={`${fund.expenseRatio?.toFixed(2) || '0.55'}%`} />
          </div>

          {/* Chart Wrapper (reusing PortfolioChart logic for now) */}
          <div className="mt-4">
            <PortfolioChart />
          </div>

          <div className="h-px bg-border my-4" />

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'AUM', value: fund.aum ? `₹${fund.aum.toLocaleString('en-IN')} Cr` : '₹42,500 Cr' },
              { label: 'Min SIP', value: '₹500' },
              { label: 'Exit Load', value: '1% within 1Y' },
              { label: 'Fund Manager', value: 'Rahul Singh' },
              { label: 'Inception Date', value: '12 Jan 2010' },
              { label: 'Benchmark', value: 'Nifty 50 TRI' },
            ].map(m => (
              <div key={m.label} className="bg-background border border-border rounded-md px-3 py-2.5">
                <div className="text-muted-foreground text-xs">{m.label}</div>
                <div className="font-mono text-foreground text-sm font-medium mt-0.5">{m.value}</div>
              </div>
            ))}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
