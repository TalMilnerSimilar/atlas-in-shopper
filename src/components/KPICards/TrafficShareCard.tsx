import React, { useRef, useState, useEffect } from 'react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface TrafficShareCardProps {
  onNavigateToTab?: (tab: string) => void;
  fixedHeight?: boolean;
}

const TrafficShareCard: React.FC<TrafficShareCardProps> = ({ onNavigateToTab, fixedHeight }) => {
  const sparklineContainerRef = useRef<HTMLDivElement | null>(null);
  const [sparklineWidth, setSparklineWidth] = useState<number>(0);
  const [trafficShare, setTrafficShare] = useState<string>('—');
  const [trendChange, setTrendChange] = useState<string>('—');
  const [isPositiveTrend, setIsPositiveTrend] = useState<boolean>(true);
  const [sparklineData, setSparklineData] = useState<number[]>([]);

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
        // In a real app, this would come from selected brand data
        const brandSeed = 'Apple'.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
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

        // Create sparkline data from weekly brand share percentages
        const weeklyShares = brandCurrentViews.map((brandViews, i) => {
          const totalViews = totalCurrentViews[i];
          return totalViews > 0 ? (brandViews / totalViews) * 100 : 0;
        });
        setSparklineData(weeklyShares);
      })
      .catch(err => {
        console.error('Error loading traffic share data:', err);
        setTrafficShare('—');
        setTrendChange('—');
      });
  }, []);

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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${fixedHeight ? 'h-[259px] flex flex-col' : ''}`}>
      <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
        <h3 className="text-base font-medium text-gray-900 leading-5">My Brand Traffic Share</h3>
        <span className="text-sm text-gray-500 leading-4">Brand views trend</span>
      </div>
      <div className={`border-t border-gray-200 pt-4 px-6 pb-4 ${fixedHeight ? 'flex-1 flex flex-col' : ''}`}>
        <div className={`flex flex-col gap-2 ${fixedHeight ? 'flex-1' : ''}`}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-gray-900 tracking-wide">{trafficShare}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isPositiveTrend 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {trendChange}
              </span>
            </div>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
          <div ref={sparklineContainerRef} className="w-full mb-4" style={{ height: '64px' }}>
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
          </div>
        </div>
        {onNavigateToTab && (
          <div className="border-t border-gray-200 pt-4 mt-4 text-center">
            <button 
              className="text-blue-600 text-sm hover:text-blue-700"
              onClick={() => onNavigateToTab('brand-performance')}
            >
              View detailed traffic analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrafficShareCard;
