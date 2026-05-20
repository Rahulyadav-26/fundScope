'use client';
import React from 'react';
import { RefreshCw, Bell, Upload } from 'lucide-react';
import usePortfolioStore from '@/store/portfolioStore';
import { cn } from '@/lib/utils';

export function Header() {
  const { fetchPortfolioData, isLoading, portfolio } = usePortfolioStore();

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-xl sticky top-0 z-30">
      <div>
        <h2 className="text-[hsl(var(--foreground))] font-semibold tracking-tight text-sm">
          Portfolio Overview
        </h2>
        {portfolio && (
          <p className="text-[hsl(var(--muted-foreground))] text-xs mt-0.5 font-mono">
            {portfolio.name} · {portfolio.holdings?.length} holdings
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={fetchPortfolioData}
          className={cn(
            'p-2 rounded-md border border-[hsl(var(--border))]',
            'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]',
            'transition-all duration-200 active:scale-95',
            isLoading && 'animate-spin'
          )}
          title="Refresh"
        >
          <RefreshCw size={15} />
        </button>

        <button className={cn(
          'p-2 rounded-md border border-[hsl(var(--border))]',
          'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]',
          'transition-all duration-200 active:scale-95'
        )}>
          <Bell size={15} />
        </button>

        <div className="h-6 w-px bg-[hsl(var(--border))] mx-1" />

        <button className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
          'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]',
          'hover:bg-[hsl(var(--foreground)/0.9)] active:scale-95 transition-all duration-200'
        )}>
          <Upload size={14} />
          Import
        </button>
      </div>
    </header>
  );
}
