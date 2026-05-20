'use client';
import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function CompareStickyBar({ funds = [], onRemove, onClear }) {
  if (funds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between z-50 animate-slide-up gap-4 md:gap-0">
      
      {/* Left */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="text-muted-foreground text-sm">
          <span className="text-foreground font-semibold">{funds.length}</span> / 3 funds selected
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {funds.map(f => (
            <div key={f._id} className="bg-secondary border border-border rounded-md px-2.5 py-1 flex items-center gap-2 text-foreground text-xs font-medium">
              <span className="truncate max-w-[120px]">{f.schemeName || f.name}</span>
              <button 
                onClick={() => onRemove(f._id)}
                className="text-muted-foreground hover:text-foreground focus:outline-none"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center">
        <button 
          onClick={onClear}
          className="text-muted-foreground text-xs hover:text-foreground underline-offset-4 hover:underline mr-4 focus:outline-none"
        >
          Clear all
        </button>
        <Link 
          href="/compare"
          className="bg-foreground text-background text-sm font-medium px-4 py-2 rounded-lg hover:bg-foreground/90 active:scale-95 transition-all inline-flex focus:outline-none focus:ring-1 focus:ring-ring"
        >
          Compare Funds
        </Link>
      </div>

    </div>
  );
}
