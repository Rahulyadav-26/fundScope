'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { ChevronRight, Search, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

import useScreenerStore from '@/store/screenerStore';

// Mock chart data for visual since we don't have historical NAV in mock store format right now
const mockChartData = Array.from({ length: 12 }).map((_, i) => ({
  date: `2023-${(i + 1).toString().padStart(2, '0')}`,
  fund0: 100 + (i * 3.5) + (Math.random() * 5),
  fund1: 100 + (i * 2.8) + (Math.random() * 4),
  fund2: 100 + (i * 2.2) + (Math.random() * 3),
}));

export default function ComparePage() {
  const { compareList: funds, toggleCompare } = useScreenerStore();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => { setIsMounted(true); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-screen-xl mx-auto pb-12">
        {/* Header */}
        <div className="pt-24 pb-8 px-6 border-b border-border">
          <div className="text-muted-foreground text-xs flex items-center gap-1.5 mb-3 font-medium">
            <span>Screener</span>
            <ChevronRight size={12} />
            <span className="text-foreground">Compare Funds</span>
          </div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Fund Comparison</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Compare up to 3 funds head-to-head on performance, risk, and cost.
          </p>
        </div>

        <div className="px-6 py-8">
          {/* Fund selector bar */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3 animate-fade-in">
            <div className="flex-1 relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
              <input
                type="text"
                placeholder="Add another fund to compare..."
                className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {funds.map((f, i) => (
                <div key={f._id} className="bg-secondary border border-border rounded-md px-2.5 py-1 flex items-center gap-2 text-foreground text-xs font-medium">
                  <span className="truncate max-w-[150px]">{f.schemeName}</span>
                  <button onClick={() => toggleCompare(f)} className="text-muted-foreground hover:text-foreground">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* NAV Overlay Chart */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6 animate-fade-in">
            <div className="mb-6">
              <h3 className="text-foreground font-semibold text-sm">Fund Performance Comparison</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Normalized to 100 at start date</p>
            </div>
            
            <div className="h-[300px] w-full mb-4">
              {!isMounted ? null : (
              <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                <LineChart data={mockChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'var(--font-mono)' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'var(--font-mono)' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ fontFamily: 'var(--font-mono)' }}
                  />
                  {funds.map((f, i) => (
                    <Line key={f._id} type="monotone" dataKey={`fund${i}`} stroke={`hsl(var(--chart-${i+1}))`} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {funds.map((f, i) => (
                <div key={f._id} className="flex items-center gap-2">
                  <div className="w-3 h-0.5" style={{ backgroundColor: `hsl(var(--chart-${i+1}))` }} />
                  <span className="text-muted-foreground text-xs">{f.schemeName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-card border border-border rounded-lg overflow-x-auto animate-fade-in">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-widest px-4 py-3 font-medium w-1/4">
                    Metric
                  </th>
                  {funds.map(f => (
                    <th key={f._id} className="bg-background px-4 py-3 font-normal border-l border-border/30 w-[25%]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-foreground font-medium text-sm leading-tight">{f.schemeName}</div>
                          <div className="text-muted-foreground text-xs mt-0.5">{f.fundHouse}</div>
                        </div>
                        <button onClick={() => toggleCompare(f)} className="text-muted-foreground hover:text-chart-5 transition-colors focus:outline-none">
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* 1Y Return */}
                <tr className="border-b border-border/50 bg-transparent">
                  <td className="px-4 py-3 text-muted-foreground text-xs uppercase tracking-widest font-sans font-medium">
                    1Y Return
                  </td>
                  {funds.map(f => (
                    <td key={f._id} className="px-4 py-3 font-mono text-sm border-l border-border/30 text-foreground">
                      {f.absoluteReturn >= 0 ? '+' : ''}{f.absoluteReturn?.toFixed(2)}%
                    </td>
                  ))}
                </tr>
                {/* Sharpe Ratio */}
                <tr className="border-b border-border/50 bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground text-xs uppercase tracking-widest font-sans font-medium">
                    Sharpe Ratio
                  </td>
                  {funds.map(f => (
                    <td key={f._id} className="px-4 py-3 font-mono text-sm border-l border-border/30 text-foreground">
                      {f.riskMetrics?.sharpeRatio?.toFixed(2)}
                    </td>
                  ))}
                </tr>
                {/* Expense Ratio */}
                <tr className="border-b border-border/50 bg-transparent">
                  <td className="px-4 py-3 text-muted-foreground text-xs uppercase tracking-widest font-sans font-medium">
                    Expense Ratio
                  </td>
                  {funds.map(f => (
                    <td key={f._id} className="px-4 py-3 font-mono text-sm border-l border-border/30 text-foreground">
                      {f.expenseRatio?.toFixed(2)}%
                    </td>
                  ))}
                </tr>
                {/* AUM */}
                <tr className="border-b border-border/50 bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground text-xs uppercase tracking-widest font-sans font-medium">
                    AUM
                  </td>
                  {funds.map(f => (
                    <td key={f._id} className="px-4 py-3 font-mono text-sm border-l border-border/30 text-foreground">
                      ₹{f.aum?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI Recommendation */}
          <div className="bg-card border border-border rounded-xl p-6 mt-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-chart-1" />
              <h3 className="text-foreground font-semibold text-sm">AI Recommendation</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded font-medium w-36 text-center">Best Returns</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-chart-2" />
                  <span className="text-foreground text-sm font-medium">Quant Small Cap Fund</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded font-medium w-36 text-center">Best Risk-Adjusted</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-chart-1" />
                  <span className="text-foreground text-sm font-medium">Quant Small Cap Fund</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded font-medium w-36 text-center">Lowest Cost</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-chart-3" />
                  <span className="text-foreground text-sm font-medium">SBI Small Cap Fund</span>
                </div>
              </div>
            </div>

            <div className="text-muted-foreground text-sm leading-relaxed mt-4 border-t border-border pt-4">
              <strong className="text-foreground font-medium">Verdict: </strong> 
              Quant Small Cap provides the strongest alpha generation and Sharpe ratio, offsetting its slightly higher expense ratio compared to SBI. Nippon sits comfortably in the middle, offering a balanced risk profile with significant AUM liquidity.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
