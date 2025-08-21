import React, { useRef, useState, useEffect } from 'react';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface TrafficShareCardProps {
  onNavigateToTab?: (tab: string) => void;
}

const TrafficShareCard: React.FC<TrafficShareCardProps> = ({ onNavigateToTab }) => {
  const sparklineContainerRef = useRef<HTMLDivElement | null>(null);
  const [sparklineWidth, setSparklineWidth] = useState<number>(0);

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
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
        <h3 className="text-base font-medium text-gray-900 leading-5">My Brand Traffic Share</h3>
        <span className="text-sm text-gray-500 leading-4">Brand views trend</span>
      </div>
      <div className="border-t border-gray-200 pt-4 px-6 pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-medium text-gray-900 tracking-wide">24.3K</span>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">+2.2%</span>
            </div>
            <span className="text-xs text-gray-500">3 May - 30 Jul</span>
          </div>
          <div ref={sparklineContainerRef} className="w-full mb-4" style={{ height: '64px' }}>
            {sparklineWidth > 0 && (
              <Sparklines data={[15, 10, 5, 20, 8, 15]} width={sparklineWidth} height={64} margin={2} min={0} max={30} preserveAspectRatio="none">
                <SparklinesLine color="blue" />
              </Sparklines>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4 text-center">
          <button 
            className="text-blue-600 text-sm hover:text-blue-700"
            onClick={() => onNavigateToTab?.('brand-performance')}
          >
            View detailed traffic analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrafficShareCard;
