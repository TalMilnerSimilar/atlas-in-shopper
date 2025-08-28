import React, { useRef, useState, useEffect } from 'react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface TrafficShareCardProps {
  onNavigateToTab?: (tab: string) => void;
  fixedHeight?: boolean;
  selectedBrandName?: string;
  dateRange?: string;
}

const TrafficShareCard: React.FC<TrafficShareCardProps> = ({ onNavigateToTab, fixedHeight, selectedBrandName, dateRange }) => {
  const sparklineContainerRef = useRef<HTMLDivElement | null>(null);
  const [sparklineWidth, setSparklineWidth] = useState<number>(0);
  const [trafficShare, setTrafficShare] = useState<string>('—');
  const [trendChange, setTrendChange] = useState<string>('—');
  const [isPositiveTrend, setIsPositiveTrend] = useState<boolean>(true);
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [weeklyPrevShares, setWeeklyPrevShares] = useState<number[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [currentSharePctNum, setCurrentSharePctNum] = useState<number>(0);
  const [overallChangeInPP, setOverallChangeInPP] = useState<number>(0);
  const [weeklyTotals, setWeeklyTotals] = useState<number[]>([]);

  // Calculate traffic share from retailer data
  useEffect(() => {
    fetch('/data/retailer_series.csv', { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        const map: Record<string, { current: number[]; prevPop: number[] }> = {};
        text.split(/\r?\n/).forEach(line => {
          const trimmed = (line || '').trim();
          if (!trimmed || trimmed.startsWith('#') || /^key\b/i.test(trimmed)) return;
          const parts = trimmed.split(',').map(s => s.trim());
          if (parts.length < 15) return;
          const key = parts[0];
          const current = parts.slice(1, 8).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          const prevPop = parts.slice(8, 15).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          if (key && current.length === 7 && prevPop.length === 7) {
            map[key] = { current, prevPop };
          }
        });

        // Calculate total views across all retailers for current and previous periods
        const allRetailers = Object.keys(map);
        const totalCurrentViews = new Array(7).fill(0);
        const totalPrevViews = new Array(7).fill(0);
        
        allRetailers.forEach(retailer => {
          const data = map[retailer];
          data.current.forEach((views, i) => totalCurrentViews[i] += views);
          data.prevPop.forEach((views, i) => totalPrevViews[i] += views);
        });

        // Simulate "your brand" views with realistic variation between periods
        // Seed by selected brand so the line responds to user selection
        const seedLabel = (selectedBrandName || 'Apple');
        const brandSeed = seedLabel.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const baseShareAssumption = Math.max(0.15, Math.min(0.45, 0.25 + ((brandSeed % 100) / 500))); // 15-45% range
        
        // Add realistic variation between current and previous periods
        const growthFactor = 1 + ((brandSeed % 50) - 25) / 1000; // -2.5% to +2.5% variation
        const currentShareAssumption = baseShareAssumption * growthFactor;
        const prevShareAssumption = baseShareAssumption;
        
        const brandCurrentViews = totalCurrentViews.map((total, i) => {
          // Add weekly variation to make sparkline more realistic
          const weeklyVariation = 1 + (Math.sin(i * 0.5 + brandSeed) * 0.03); // ±3% weekly variation
          return Math.round(total * currentShareAssumption * weeklyVariation);
        });
        const brandPrevViews = totalPrevViews.map(total => Math.round(total * prevShareAssumption));

        // Calculate current period share percentage
        const currentTotalViews = totalCurrentViews.reduce((sum, views) => sum + views, 0);
        const currentBrandViews = brandCurrentViews.reduce((sum, views) => sum + views, 0);
        const currentSharePct = currentTotalViews > 0 ? (currentBrandViews / currentTotalViews) * 100 : 0;

        // Calculate previous period share percentage
        const prevTotalViews = totalPrevViews.reduce((sum, views) => sum + views, 0);
        const prevBrandViews = brandPrevViews.reduce((sum, views) => sum + views, 0);
        const prevSharePct = prevTotalViews > 0 ? (prevBrandViews / prevTotalViews) * 100 : 0;

        // Calculate percentage point change
        const changeInPP = currentSharePct - prevSharePct;

        // Set the calculated values
        setTrafficShare(currentSharePct < 0.1 ? '<0.1%' : `${currentSharePct.toFixed(1)}%`);
        setTrendChange(`${changeInPP >= 0 ? '+' : ''}${changeInPP.toFixed(1)}pp`);
        setIsPositiveTrend(changeInPP >= 0);
        setCurrentSharePctNum(currentSharePct);
        setOverallChangeInPP(changeInPP);

        // Create sparkline data reflecting actual weekly share
        const baseWeeklyShare = currentSharePct;
        const weeklyShares = brandCurrentViews.map((brandViews, i) => {
          const totalViews = totalCurrentViews[i];
          const actualShare = totalViews > 0 ? (brandViews / totalViews) * 100 : baseWeeklyShare;
          return Math.max(0, actualShare);
        });
        setSparklineData(weeklyShares);

        // Create previous-period weekly shares for delta on hover
        const prevWeeklyShares = totalPrevViews.map((total, i) => {
          if (total <= 0) return 0;
          return Math.max(0, (brandPrevViews[i] / total) * 100);
        });
        setWeeklyPrevShares(prevWeeklyShares);
        setWeeklyTotals(totalCurrentViews);
      })
      .catch(err => {
        console.error('Error loading traffic share data:', err);
        setTrafficShare('—');
        setTrendChange('—');
      });
  }, [selectedBrandName, dateRange]);

  // Measure sparkline container width to make the chart responsive
  useEffect(() => {
    const el = sparklineContainerRef.current;
    if (!el) return;

    const measure = () => {
      setSparklineWidth(el.clientWidth);
    };
    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  // Determine displayed values (hovered vs aggregate)
  const isHoveringPoint = hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < sparklineData.length;
  const displayShare = isHoveringPoint
    ? sparklineData[hoveredIdx as number]
    : currentSharePctNum;
  const displayPrevShare = isHoveringPoint
    ? (weeklyPrevShares[hoveredIdx as number] ?? displayShare)
    : currentSharePctNum - overallChangeInPP;
  const displayDelta = displayShare - displayPrevShare;
  const displayShareStr = displayShare < 0.1 ? '<0.1%' : `${displayShare.toFixed(1)}%`;
  const displayChangeStr = `${displayDelta >= 0 ? '+' : ''}${displayDelta.toFixed(1)}pp`;
  const displayIsPositive = displayDelta >= 0;

  const formatShort = (n: number): string => {
    if (!Number.isFinite(n)) return '—';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return Math.round(n).toString();
  };

  return (
    <div className={`bg-white border border-[#e6e9ec] rounded-[6px] ${fixedHeight ? 'h-[300px] flex flex-col' : ''}`}>
      <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
        <h3 className="text-base font-medium text-[#092540] leading-5">My Brand Traffic Share</h3>
        <span className="text-sm text-[#6b7c8c] leading-4">{selectedBrandName ? `${selectedBrandName}’s View trend` : 'Brand views trend'}</span>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-[#e6e9ec] w-full"></div>
      
      <div className={`px-6 pt-4 pb-4 ${fixedHeight ? 'flex-1 flex flex-col' : ''}`}>
        <div className="flex flex-col gap-2 mb-8" style={{ marginBottom: 16 }}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-[#092540] tracking-wide">{displayShareStr}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] ${
                displayIsPositive 
                  ? 'bg-[#e6faf5] text-[#009688]' 
                  : 'bg-[#ffe6e6] text-[#bb3f3f]'
              }`}>
                {displayChangeStr}
              </span>
            </div>
            <span className="text-xs text-[#6b7c8c]">{dateRange || '[selected time range]'}</span>
          </div>
          <div
            ref={sparklineContainerRef}
            className="w-full mb-4 relative"
            style={{ height: '64px' }}
            onMouseMove={(e) => {
              const el = sparklineContainerRef.current;
              if (!el || sparklineWidth <= 0 || sparklineData.length === 0) return;
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const idx = Math.max(0, Math.min(sparklineData.length - 1, Math.round((x / Math.max(1, rect.width)) * (sparklineData.length - 1))));
              setHoveredIdx(idx);
            }}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {sparklineWidth > 0 && sparklineData.length > 0 && (
              <Sparklines 
                data={sparklineData} 
                width={sparklineWidth} 
                height={64} 
                margin={2} 
                preserveAspectRatio="none"
              >
                <SparklinesLine color="#3B82F6" />
              </Sparklines>
            )}
            {isHoveringPoint && (() => {
              const n = sparklineData.length;
              const minV = Math.min(...sparklineData);
              const maxV = Math.max(...sparklineData);
              const h = 64;
              const x = (hoveredIdx as number) / Math.max(1, n - 1) * sparklineWidth;
              const val = sparklineData[hoveredIdx as number];
              const y = maxV === minV ? h / 2 : h - ((val - minV) / (maxV - minV)) * h;
              const tipWidth = 300;
              const tipHeight = 88;
              const tipLeft = Math.max(0, Math.min(Math.round(x) + 8, sparklineWidth - tipWidth));
              const tipTop = Math.max(0, Math.min(Math.round(y) - 8 - tipHeight, h - tipHeight));
              const totalAtPoint = weeklyTotals[hoveredIdx as number] ?? 0;
              return (
                <>
                  <div
                    className="absolute"
                    style={{ left: Math.round(x) - 3, top: Math.round(y) - 3, width: 6, height: 6, borderRadius: 9999, backgroundColor: '#3B82F6', boxShadow: '0 0 0 2px #ffffff' }}
                  />
                  <div
                    className="absolute pointer-events-none z-10 bg-white rounded-[4px] shadow-[0px_1px_8px_rgba(9,37,64,0.08),0px_5px_24px_rgba(9,37,64,0.08)] p-4"
                    style={{ left: tipLeft, top: tipTop, width: tipWidth }}
                  >
                    {/* Title + Subtitle */}
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="text-[12px] font-medium text-[#092540]">My Brand Traffic Share</span>
                      <span className="text-[12px] text-[#3a5166]">{dateRange || 'Selected time frame'}</span>
                    </div>
                    {/* Rows */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] text-[#3a5166]">Traffic Share</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#092540] font-bold">{displayShareStr}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] ${displayIsPositive ? 'bg-[#e6faf5] text-[#009688]' : 'bg-[#ffe6e6] text-[#bb3f3f]'}`}>{displayChangeStr}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#3a5166]">Total Traffic</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#092540] font-bold">{formatShort(totalAtPoint)}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] bg-[#f7f7f8] text-[#6b7c8c]">-</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        {onNavigateToTab && (
          <div className="border-t border-[#e6e9ec] pt-4 mt-4 text-center">
            <button 
              className="text-[#195afe] text-sm hover:underline"
              onClick={() => onNavigateToTab('retailer-growth')}
            >
              See {selectedBrandName || 'your brand'}'s share across different retailers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficShareCard;
