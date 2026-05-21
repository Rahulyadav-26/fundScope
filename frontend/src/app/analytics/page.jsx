'use client';
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import usePortfolioStore from '@/store/portfolioStore';
import useAuthStore from '@/store/authStore';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, PieChart as PieChartIcon, TrendingUp, AlertTriangle } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-xl p-6 h-full animate-pulse">
    <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
    <div className="h-40 bg-muted/50 rounded w-full"></div>
  </div>
);

const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
        <h4 className="text-3xl font-bold text-foreground tracking-tight">{value}</h4>
        {subtitle && (
          <p className={`text-sm mt-2 flex items-center ${trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : trend < 0 ? <ArrowDownRight className="w-4 h-4 mr-1" /> : null}
            {subtitle}
          </p>
        )}
      </div>
      <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
  </motion.div>
);

export default function AnalyticsPage() {
  const { fetchPortfolioData, analytics, isLoading } = usePortfolioStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolioData();
    }
  }, [isAuthenticated, fetchPortfolioData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-screen-xl mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to view your portfolio analytics.</p>
        </div>
      </div>
    );
  }

  const hasData = analytics.returns && analytics.history && !isLoading;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  
  // Format dates for history chart
  const historyData = analytics.history?.map(d => ({
    ...d,
    dateStr: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })) || [];

  const marketCapData = analytics.factors?.marketCap ? Object.entries(analytics.factors.marketCap).filter(([_,v])=>v>0).map(([name, value]) => ({ name, value })) : [];
  const assetClassData = analytics.factors?.assetClass ? Object.entries(analytics.factors.assetClass).filter(([_,v])=>v>0).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Portfolio Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep dive into your investment performance, risk, and allocation.</p>
        </div>

        {!hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Value" 
                value={formatCurrency(analytics.returns.currentValue)}
                subtitle={`${analytics.returns.absoluteReturn.toFixed(2)}% All Time`}
                trend={analytics.returns.absoluteReturn}
                icon={Activity}
              />
              <StatCard 
                title="XIRR (Annualized)" 
                value={`${analytics.returns.xirr.toFixed(2)}%`}
                subtitle="Internal Rate of Return"
                trend={analytics.returns.xirr}
                icon={TrendingUp}
              />
              <StatCard 
                title="Sharpe Ratio" 
                value={analytics.risk.sharpeRatio.toFixed(2)}
                subtitle="Risk-adjusted return"
                trend={analytics.risk.sharpeRatio - 1} // >1 is good
                icon={Activity}
              />
              <StatCard 
                title="Max Drawdown" 
                value={`${(analytics.risk.maxDrawdown * 100).toFixed(2)}%`}
                subtitle="Historical peak-to-trough"
                trend={-1}
                icon={AlertTriangle}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Growth Chart */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Portfolio Growth vs Benchmark
                </h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBench" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="dateStr" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                        formatter={(value) => [formatCurrency(value)]}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Area type="monotone" dataKey="value" name="Portfolio" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      <Area type="monotone" dataKey="benchmark" name="Benchmark (Nifty)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorBench)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Allocation Pies */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Market Cap Allocation
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={marketCapData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {marketCapData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(1)}%`]} 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                    Asset Class
                  </h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={assetClassData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {assetClassData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(1)}%`]} 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Rebalance Section */}
            {analytics.rebalance && analytics.rebalance.recommendations.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Rebalancing Recommendations</h3>
                  <p className="text-sm text-muted-foreground mt-1">These funds have drifted significantly from your target allocation.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                      <tr>
                        <th className="px-6 py-3 rounded-tl-lg">Fund Name</th>
                        <th className="px-6 py-3">Current %</th>
                        <th className="px-6 py-3">Target %</th>
                        <th className="px-6 py-3">Drift</th>
                        <th className="px-6 py-3">Action</th>
                        <th className="px-6 py-3 rounded-tr-lg">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.rebalance.recommendations.map((rec, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-medium text-foreground">{rec.fundName}</td>
                          <td className="px-6 py-4">{rec.currentAllocation.toFixed(2)}%</td>
                          <td className="px-6 py-4">{rec.targetAllocation.toFixed(2)}%</td>
                          <td className="px-6 py-4">
                            <span className={rec.drift > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {rec.drift > 0 ? '+' : ''}{rec.drift.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rec.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {rec.action}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatCurrency(rec.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
