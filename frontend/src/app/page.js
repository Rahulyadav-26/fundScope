'use client';
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { RiskScatterChart } from '@/components/dashboard/RiskScatterChart';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import usePortfolioStore from '@/store/portfolioStore';
import useScreenerStore from '@/store/screenerStore';
import { FundDetailModal } from '@/components/modals/FundDetailModal';
import { CompareStickyBar } from '@/components/CompareStickyBar';
import useAuthStore from '@/store/authStore';

export default function HomePage() {
  const { fetchPortfolioData, portfolio } = usePortfolioStore();
  const { selectedFund, setSelectedFund, compareList, clearCompare, toggleCompare } = useScreenerStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  useEffect(() => { 
    if (isAuthenticated) {
      fetchPortfolioData(); 
    }
  }, [fetchPortfolioData, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Marketing Header */}
        <Hero />
        <StatsBar />

        {/* Screener Interface */}
        <div className="max-w-screen-2xl mx-auto px-6 py-12 space-y-6" id="screener">
          {/* Top Charts Row */}
          {!isAuthenticated ? (
            <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center">
              <h3 className="text-foreground font-semibold mb-2">Connect Your Portfolio</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">Create an account or sign in to track your investments, view risk analytics, and get rebalancing recommendations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              <RiskScatterChart />
              <PortfolioChart />
            </div>
          )}

          {/* Screener Table Section */}
          <div className="pt-6">
            <div className="mb-4">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">Fund Screener</h2>
              <p className="text-muted-foreground text-sm mt-1">Filter, analyze, and compare mutual funds.</p>
            </div>
            <FilterBar />
            <HoldingsTable />
          </div>
        </div>
      </main>

      {/* Modals & Portals */}
      <FundDetailModal 
        isOpen={!!selectedFund} 
        onClose={() => setSelectedFund(null)} 
        fund={selectedFund} 
      />

      {compareList.length > 0 && (
        <CompareStickyBar 
          funds={compareList}
          onRemove={(fundId) => toggleCompare({ _id: fundId, schemeCode: fundId })}
          onClear={clearCompare}
        />
      )}
    </div>
  );
}
