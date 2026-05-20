'use client';
import React, { useState, useMemo, useEffect } from 'react';
import useScreenerStore from '@/store/screenerStore';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, TrendingDown, 
  ChevronUp, ChevronDown, ChevronsUpDown 
} from 'lucide-react';

function FundAvatar({ amc = '' }) {
  const initials = amc.substring(0, 2).toUpperCase() || 'MF';
  return (
    <div className="shrink-0 w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-foreground text-xs font-bold font-mono">
      {initials}
    </div>
  );
}

function SharpeBadge({ value }) {
  const n = parseFloat(value);
  let cls = '';
  if (n >= 1.5)      cls = 'border-[hsl(var(--chart-2)/0.3)] bg-[hsl(var(--chart-2)/0.1)] text-[hsl(var(--chart-2))]';
  else if (n >= 1.0) cls = 'border-[hsl(var(--chart-1)/0.3)] bg-[hsl(var(--chart-1)/0.1)] text-[hsl(var(--chart-1))]';
  else if (n >= 0.5) cls = 'border-[hsl(var(--chart-3)/0.3)] bg-[hsl(var(--chart-3)/0.1)] text-[hsl(var(--chart-3))]';
  else               cls = 'border-[hsl(var(--chart-5)/0.3)] bg-[hsl(var(--chart-5)/0.1)] text-[hsl(var(--chart-5))]';

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium border', cls)}>
      {n.toFixed(2)}
    </span>
  );
}

function ExpenseRatio({ value }) {
  const n = parseFloat(value);
  let dot = '';
  if (n < 0.5) dot = 'bg-chart-2';
  else if (n <= 1.0) dot = 'bg-chart-3';
  else dot = 'bg-chart-5';

  return (
    <div className="flex items-center font-mono text-sm text-muted-foreground">
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', dot)} />
      {n.toFixed(2)}%
    </div>
  );
}

function ReturnCell({ value }) {
  const n = parseFloat(value);
  const pos = n >= 0;
  return (
    <div className={cn(
      'font-mono text-sm flex items-center',
      pos ? 'text-chart-2' : 'text-chart-5'
    )}>
      {pos ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
      {pos ? '+' : ''}{n.toFixed(2)}%
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="border-b border-border/50 px-4 py-3 flex items-center gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-md skeleton shrink-0" />
      {/* Name/AMC */}
      <div className="flex flex-col gap-1.5 w-[30%]">
        <div className="w-32 h-3.5 rounded skeleton" />
        <div className="w-20 h-3 rounded skeleton" />
      </div>
      {/* Columns */}
      <div className="w-16 h-3.5 rounded skeleton flex-1" />
      <div className="w-16 h-3.5 rounded skeleton flex-1" />
      <div className="w-16 h-3.5 rounded skeleton flex-1" />
      <div className="w-16 h-3.5 rounded skeleton flex-1" />
      {/* Actions */}
      <div className="w-20 h-6 rounded skeleton" />
    </div>
  );
}

function SortIcon({ col, sortCol, dir }) {
  if (sortCol !== col) return <ChevronsUpDown size={12} className="ml-1 opacity-40 inline-block" />;
  return dir === 'asc'
    ? <ChevronUp size={12} className="ml-1 inline-block text-foreground" />
    : <ChevronDown size={12} className="ml-1 inline-block text-foreground" />;
}

const COLUMNS = [
  { key: 'fundName',       label: 'Fund',          sortable: true,  w: 'w-[30%]' },
  { key: 'aum',            label: 'AUM',           sortable: true,  w: 'flex-1' },
  { key: 'expenseRatio',   label: 'Expense',       sortable: true,  w: 'flex-1' },
  { key: 'absoluteReturn', label: '1Y Return',     sortable: true,  w: 'flex-1' },
  { key: 'sharpe',         label: 'Sharpe',        sortable: true,  w: 'flex-1' },
  { key: 'actions',        label: '',              sortable: false, w: 'w-24' },
];

export function HoldingsTable() {
  const { funds, isLoading, filters, compareList, toggleCompare, setSelectedFund, fetchFunds } = useScreenerStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (funds.length === 0) fetchFunds();
  }, [funds.length, fetchFunds]);

  const handleSort = col => {
    // Sort logic is now handled in the store, but we can call it from here
    if (filters.sortCol === col) {
      useScreenerStore.getState().updateFilters({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      useScreenerStore.getState().updateFilters({ sortCol: col, sortDir: 'desc' });
    }
  };

  const filteredData = useMemo(() => {
    return funds.filter(f => {
      if (filters.search && !f.schemeName.toLowerCase().includes(filters.search.toLowerCase()) && !f.fundHouse.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      const mappedCategory = f.category === 'Large Cap' ? 'large-cap' : 
                             f.category === 'Mid Cap' ? 'mid-cap' : 
                             f.category === 'Small Cap' ? 'small-cap' : 'all';
      if (filters.category !== 'all' && mappedCategory !== filters.category) return false;
      
      const mappedAmc = f.fundHouse.toLowerCase().includes('sbi') ? 'sbi' :
                        f.fundHouse.toLowerCase().includes('nippon') ? 'nippon' :
                        f.fundHouse.toLowerCase().includes('hdfc') ? 'hdfc' : 'all';
      if (filters.amc !== 'all' && mappedAmc !== filters.amc) return false;
      
      return true;
    }).map(f => ({
      ...f,
      fundName: f.schemeName,
      amc: f.fundHouse,
      aum: f.aum || 0,
      expenseRatio: f.expenseRatio || 0,
      sharpe: f.riskMetrics?.sharpeRatio || 0,
      absoluteReturn: f.absoluteReturn || 0,
      isCompared: !!compareList.find(c => c._id === f._id)
    }));
  }, [funds, filters, compareList]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const av = a[filters.sortCol];
      const bv = b[filters.sortCol];
      if (typeof av === 'string') return filters.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return filters.sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [filteredData, filters.sortCol, filters.sortDir]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-muted/40 border-b border-border flex items-center px-4 py-3">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            onClick={() => col.sortable && handleSort(col.key)}
            className={cn(
              'text-muted-foreground text-xs uppercase tracking-widest font-medium',
              col.w,
              col.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors',
              filters.sortCol === col.key && 'text-foreground'
            )}
          >
            {col.label}
            {col.sortable && <SortIcon col={col.key} sortCol={filters.sortCol} dir={filters.sortDir} />}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex flex-col min-h-[500px]">
        {isLoading || funds.length === 0 ? (
          [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
        ) : (
          paginatedData.map((h, i) => (
            <div key={i} className="border-b border-border/50 hover:bg-accent/40 transition-colors duration-100 animate-fade-in flex items-center px-4 py-3">
              {/* Fund */}
              <div className="w-[30%] pr-4 flex items-center gap-3">
                <FundAvatar amc={h.amc} />
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium leading-tight truncate">{h.fundName}</p>
                  <p className="text-muted-foreground text-xs mt-0.5 truncate">{h.amc}</p>
                </div>
              </div>

              {/* AUM */}
              <div className="flex-1 font-mono text-sm text-muted-foreground">
                ₹{(h.aum).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr
              </div>

              {/* Expense */}
              <div className="flex-1">
                <ExpenseRatio value={h.expenseRatio} />
              </div>

              {/* Return */}
              <div className="flex-1">
                <ReturnCell value={h.absoluteReturn} />
              </div>

              {/* Sharpe */}
              <div className="flex-1">
                <SharpeBadge value={h.sharpe} />
              </div>

              {/* Actions */}
              <div className="w-24 flex items-center justify-end gap-2 shrink-0">
                <button 
                  onClick={() => setSelectedFund(h)}
                  className="border border-border text-muted-foreground text-xs px-2.5 py-1 rounded-md hover:border-foreground/40 hover:text-foreground transition-all"
                >
                  View
                </button>
                <button 
                  onClick={() => toggleCompare(h)}
                  className={cn(
                  'text-xs px-2.5 py-1 rounded-md transition-all',
                  h.isCompared 
                    ? 'bg-foreground text-background' 
                    : 'border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                )}>
                  Compare
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-mono">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="border border-border text-muted-foreground text-xs px-3 py-1.5 rounded-md hover:border-foreground/30 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <button 
            disabled={currentPage * itemsPerPage >= filteredData.length}
            onClick={() => setCurrentPage(p => p + 1)}
            className="border border-border text-muted-foreground text-xs px-3 py-1.5 rounded-md hover:border-foreground/30 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
