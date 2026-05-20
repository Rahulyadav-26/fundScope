'use client';

export default function StatsBar() {
  const stats = [
    { label: 'Total AUM Tracked', value: '₹42,51,000 Cr' },
    { label: 'Active AMCs',       value: '51' },
    { label: 'Market Cap Index',  value: 'Nifty 50' },
  ];

  return (
    <div className="w-full border-y border-border bg-card py-3 px-6 overflow-x-auto">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between min-w-max gap-8 md:gap-0">
        {stats.map((s, i) => (
          <div key={s.label} className="flex items-center gap-8 flex-1 justify-center first:justify-start last:justify-end">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                {s.label}
              </span>
              <span className="text-foreground font-mono font-semibold text-sm mt-0.5">
                {s.value}
              </span>
            </div>
            {i < stats.length && (
              <div className="w-px h-8 bg-border hidden md:block" />
            )}
          </div>
        ))}
        {/* Updated stat */}
        <div className="flex flex-col justify-end text-right">
          <span className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
            Updated
          </span>
          <span className="text-foreground font-mono font-semibold text-sm mt-0.5 flex items-center justify-end">
            <span className="relative flex h-1.5 w-1.5 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-2" />
            </span>
            Today
          </span>
        </div>
      </div>
    </div>
  );
}
