'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import usePortfolioStore from '@/store/portfolioStore';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isPos = d.return >= 0;

  return (
    <div className="bg-card border border-border rounded-lg shadow-2xl p-3 text-xs min-w-[200px]">
      <div className="text-foreground font-medium text-sm mb-2 pb-2 border-b border-border/50">
        {d.name}
      </div>
      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        <span className="text-muted-foreground">Return (1Y)</span>
        <span className={cn('font-mono text-right', isPos ? 'text-chart-2' : 'text-chart-5')}>
          {isPos ? '+' : ''}{d.return.toFixed(2)}%
        </span>
        
        <span className="text-muted-foreground">Risk (StdDev)</span>
        <span className="font-mono text-foreground text-right">{d.risk.toFixed(2)}%</span>
        
        <span className="text-muted-foreground">Sharpe Ratio</span>
        <span className="font-mono text-foreground text-right">{d.sharpe.toFixed(2)}</span>
        
        <span className="text-muted-foreground">AUM</span>
        <span className="font-mono text-foreground text-right">{formatCurrency(d.aum)}</span>
      </div>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const { sharpe, aum } = payload;
  
  // Calculate radius based on AUM (scale between 4 and 18 using sqrt)
  // Assuming max AUM around 100,000 Cr for scaling
  const minR = 4;
  const maxR = 18;
  const normalizedAum = Math.min(Math.max(aum / 50000, 0), 1);
  const r = minR + (Math.sqrt(normalizedAum) * (maxR - minR));

  // Determine color based on Sharpe
  let fill, stroke;
  if (sharpe >= 1.5) {
    fill = 'hsl(142 71% 45%)';
    stroke = 'hsl(142 71% 65%)'; // lighter
  } else if (sharpe >= 1.0) {
    fill = 'hsl(221 83% 63%)';
    stroke = 'hsl(221 83% 83%)';
  } else if (sharpe >= 0.5) {
    fill = 'hsl(38 92% 50%)';
    stroke = 'hsl(38 92% 70%)';
  } else {
    fill = 'hsl(0 84% 60%)';
    stroke = 'hsl(0 84% 80%)';
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
      fillOpacity={0.85}
      className="transition-all duration-200 hover:fill-opacity-100 hover:stroke-[hsl(0_0%_98%)] hover:stroke-[1.5px] cursor-pointer drop-shadow-[0_0_6px_currentColor]"
      style={{ color: fill }}
    />
  );
};

export function RiskScatterChart() {
  const { portfolio } = usePortfolioStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => { setIsMounted(true); }, []);
  
  // Generate mock data for the scatter plot
  const data = React.useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const risk = (Math.random() * 15) + 5; // 5% to 20%
      const ret = (risk * 0.8) + (Math.random() * 10) - 5; // correlated return with noise
      const sharpe = (ret - 6) / risk; // simple sharpe proxy assuming 6% risk free
      const aum = (Math.random() * 80000) + 1000;
      
      return {
        id: i,
        name: `Fund ${i + 1}`,
        risk,
        return: ret,
        sharpe,
        aum,
      };
    });
  }, []);

  const medianRisk = data.reduce((acc, curr) => acc + curr.risk, 0) / data.length;
  const medianReturn = data.reduce((acc, curr) => acc + curr.return, 0) / data.length;

  return (
    <div className="bg-card border border-border rounded-lg p-6 animate-fade-in flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-foreground font-semibold text-sm">Risk vs Return</h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            Each bubble is one fund. Size shows AUM. Color shows Sharpe ratio.
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span className="w-2 h-2 rounded-full bg-chart-2" /> Excellent
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span className="w-2 h-2 rounded-full bg-chart-1" /> Good
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span className="w-2 h-2 rounded-full bg-chart-3" /> Average
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <span className="w-2 h-2 rounded-full bg-chart-5" /> Poor
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 w-full relative">
        {!isMounted ? null : (
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 14%)" horizontal vertical />
            <XAxis 
              type="number" 
              dataKey="risk" 
              name="Risk (StdDev)" 
              unit="%" 
              stroke="hsl(0 0% 20%)" 
              tick={{ fill: 'hsl(0 0% 45%)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="return" 
              name="Return" 
              unit="%" 
              stroke="hsl(0 0% 20%)" 
              tick={{ fill: 'hsl(0 0% 45%)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'hsl(0 0% 25%)' }} />
            
            <ReferenceLine x={medianRisk} stroke="hsl(0 0% 25%)" strokeDasharray="5 3">
              <text x={medianRisk + 0.5} y={20} fill="hsl(0 0% 55%)" fontSize={10}>Median Risk</text>
            </ReferenceLine>
            <ReferenceLine y={medianReturn} stroke="hsl(0 0% 25%)" strokeDasharray="5 3">
              <text x={5} y={medianReturn - 0.5} fill="hsl(0 0% 55%)" fontSize={10}>Median Return</text>
            </ReferenceLine>

            {/* Sweet spot label - low risk, high return quadrant */}
            <text x={5} y={25} fill="hsl(142 71% 45%)" fontSize={10} opacity={0.7} fontWeight="bold">
              Sweet Spot
            </text>
            
            <Scatter name="Funds" data={data} shape={<CustomDot />} />
          </ScatterChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
