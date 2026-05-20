'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, TrendingUp, PieChart,
  ShieldCheck, FileSpreadsheet, Settings
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',   active: true  },
  { icon: TrendingUp,      label: 'Performance', active: false },
  { icon: PieChart,        label: 'Allocation',  active: false },
  { icon: ShieldCheck,     label: 'Risk',        active: false },
];

function NavItem({ icon: Icon, label, active }) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer transition-all duration-200 group',
      active
        ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-medium'
        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
    )}>
      <Icon size={15} className="shrink-0" />
      <span>{label}</span>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[hsl(var(--foreground))] flex items-center justify-center">
            <span className="text-[hsl(var(--background))] text-[10px] font-bold select-none">MF</span>
          </div>
          <span className="font-semibold text-[hsl(var(--foreground))] tracking-tight text-sm">
            FundScope
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[hsl(var(--muted-foreground))] text-[10px] uppercase tracking-widest px-3 pt-3 pb-2">
          Main
        </p>
        {navItems.map(item => <NavItem key={item.label} {...item} />)}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[hsl(var(--border))] space-y-0.5">
        <NavItem icon={FileSpreadsheet} label="Import CSV" active={false} />
        <NavItem icon={Settings}        label="Settings"   active={false} />
      </div>
    </aside>
  );
}
