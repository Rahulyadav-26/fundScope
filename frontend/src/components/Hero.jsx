'use client';
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="py-24 px-6 text-center max-w-4xl mx-auto animate-fade-in">
      {/* Top pill */}
      <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground mb-8">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-2" />
        </span>
        Live — 14,000+ Indian funds tracked.
      </div>

      {/* Heading */}
      <h1 className="text-5xl font-bold tracking-tighter leading-none text-foreground">
        Screen Smarter.<br />Invest Better.
      </h1>

      {/* Subheading */}
      <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-4 leading-relaxed">
        Institutional-grade mutual fund analysis. Sharpe ratios, risk-return scatter, and live NAV data for 14,000 Indian schemes.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <Link href="#screener" className="w-full sm:w-auto bg-foreground text-background text-base font-medium px-8 py-3.5 rounded-lg hover:bg-foreground/90 active:scale-95 transition-all flex items-center justify-center gap-2 group">
          Start Screening
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link href="/compare" className="w-full sm:w-auto bg-card text-foreground border border-border text-base font-medium px-8 py-3.5 rounded-lg hover:bg-accent active:scale-95 transition-all flex items-center justify-center">
          Compare Funds
        </Link>
      </div>

      {/* Stats row below buttons */}
      <div className="mt-12 flex items-center justify-center gap-8">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-mono text-foreground">14,523</span>
          <span className="text-muted-foreground text-xs uppercase tracking-widest mt-1 font-medium">Funds</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-mono text-foreground">51</span>
          <span className="text-muted-foreground text-xs uppercase tracking-widest mt-1 font-medium">AMCs</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold font-mono text-foreground">36</span>
          <span className="text-muted-foreground text-xs uppercase tracking-widest mt-1 font-medium">Categories</span>
        </div>
      </div>
    </section>
  );
}
