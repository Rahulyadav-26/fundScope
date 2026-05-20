'use client';
import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Search, ChevronDown, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import useScreenerStore from '@/store/screenerStore';

export function SelectFilter({ placeholder, options, value, onValueChange }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground hover:border-foreground/30 transition-colors focus:outline-none focus:ring-1 focus:ring-ring flex items-center justify-between gap-2 min-w-36">
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDown size={14} className="text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content
          className="bg-popover border border-border rounded-lg shadow-xl overflow-hidden p-1 z-50 animate-fade-in"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport>
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="text-sm text-foreground px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer focus:bg-accent outline-none flex items-center justify-between"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={14} className="text-foreground" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default function FilterBar() {
  const { filters, updateFilters, resetFilters } = useScreenerStore();

  const handleSort = (col) => {
    if (filters.sortCol === col) {
      updateFilters({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      updateFilters({ sortCol: col, sortDir: 'desc' });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 mb-4 flex items-center gap-2 flex-wrap animate-fade-in">
      {/* Search Input */}
      <div className="flex-1 min-w-48 relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          placeholder="Search funds by name or AMC..."
          className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Selects */}
      <SelectFilter
        placeholder="All Categories"
        value={filters.category}
        onValueChange={(val) => updateFilters({ category: val })}
        options={[
          { label: 'All Categories', value: 'all' },
          { label: 'Equity Large Cap', value: 'large-cap' },
          { label: 'Equity Mid Cap', value: 'mid-cap' },
          { label: 'Equity Small Cap', value: 'small-cap' },
          { label: 'Debt Liquid', value: 'liquid' },
        ]}
      />
      <SelectFilter
        placeholder="All AMCs"
        value={filters.amc}
        onValueChange={(val) => updateFilters({ amc: val })}
        options={[
          { label: 'All AMCs', value: 'all' },
          { label: 'SBI Mutual Fund', value: 'sbi' },
          { label: 'HDFC Mutual Fund', value: 'hdfc' },
          { label: 'ICICI Prudential', value: 'icici' },
          { label: 'Nippon India', value: 'nippon' },
        ]}
      />

      {/* Sort toggle */}
      <div className="bg-background border border-border rounded-md p-0.5 flex gap-0.5">
        <button 
          onClick={() => handleSort('aum')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1',
            filters.sortCol === 'aum' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent'
          )}
        >
          AUM
          {filters.sortCol === 'aum' && (filters.sortDir === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
        </button>
        <button 
          onClick={() => handleSort('return')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1',
            filters.sortCol === 'return' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent'
          )}
        >
          Return
          {filters.sortCol === 'return' && (filters.sortDir === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
        </button>
      </div>

      {/* Reset */}
      <button 
        onClick={resetFilters}
        className="text-muted-foreground text-xs hover:text-foreground transition-colors ml-auto underline-offset-4 hover:underline"
      >
        Reset filters
      </button>
    </div>
  );
}
