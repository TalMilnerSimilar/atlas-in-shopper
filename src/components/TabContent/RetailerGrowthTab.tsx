import React from 'react';
import ChartLegend from '../ChartLegend';
import InsightSection from '../InsightSection';

interface RetailerGrowthTabProps {
  selectedLegendHosts: string[];
  yAxisScale: {
    min: number;
    max: number;
    steps: number[];
  };
  reversedSteps: number[];
  formatSkus: (value: number) => string;
  getSeriesForRetailer: (host: string) => number[];
  seriesColorByRetailer: Record<string, string>;
  hoveredDateIdx: number | null;
  setHoveredDateIdx: (idx: number | null) => void;
  setChartHoverPos: (pos: { x: number; y: number }) => void;
  legendRetailers: Array<{ name: string; skus: number }>;
  maxRetailerSelections: number;
  onRetailerToggle: (hostLabel: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  isLegendItemDisabled: (host: string) => boolean;
  dynamicInsight: {
    headline: string;
    sentence: string;
    chips: Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }>;
  };
  showInsights?: boolean;
  fixedHeight?: boolean;
  valueMode?: 'views' | 'brandShare';
  selectedBrandName?: string;
}

const RetailerGrowthTab: React.FC<RetailerGrowthTabProps> = ({
  selectedLegendHosts,
  yAxisScale,
  reversedSteps,
  formatSkus,
  getSeriesForRetailer,
  seriesColorByRetailer,
  hoveredDateIdx,
  setHoveredDateIdx,
  setChartHoverPos,
  legendRetailers,
  maxRetailerSelections,
  onRetailerToggle,
  onClearAll,
  onSelectAll,
  isLegendItemDisabled,
  dynamicInsight,
  showInsights = true,
  fixedHeight = false,
  valueMode = 'views',
  selectedBrandName = 'Brand',
}) => {
  // Build values depending on mode
  const hosts = selectedLegendHosts;
  const seriesByHost = hosts.map(host => ({ host, values: getSeriesForRetailer(host) }));

  const computeBrandShareForHost = (host: string, retailerSeries: number[]): number[] => {
    // Deterministic seed from brand+host
    const key = `${selectedBrandName}|${host}`;
    let hash = 2166136261 >>> 0;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const rnd = () => {
      hash ^= hash << 13; hash ^= hash >>> 17; hash ^= hash << 5; return ((hash >>> 0) % 10000) / 10000;
    };
    const baseShare = 0.06 + rnd() * 0.18; // 6% - 24%
    return retailerSeries.map((total, i) => {
      const noise = (Math.sin(i * 0.7 + hash) * 0.02); // ±2pp
      const share = Math.max(0.01, Math.min(0.6, baseShare + noise));
      // Always return share percentage, even if retailer total is 0 (represents potential/target share)
      return share * 100; // percent
    });
  };

  const modeValuesByHost = valueMode === 'brandShare'
    ? seriesByHost.map(({ host, values }) => ({ host, values: computeBrandShareForHost(host, values) }))
    : seriesByHost;

  // Determine Y-axis scale - truly dynamic
  let localMin, localMax;
  if (valueMode === 'brandShare') {
    const allValues = modeValuesByHost.flatMap(s => s.values).filter(v => v > 0);
    if (allValues.length === 0) {
      localMin = 0;
      localMax = 10;
    } else {
      const dataMin = Math.min(...allValues);
      const dataMax = Math.max(...allValues);
      // If minimum is close to 0 (within 5% of range), start from 0
      const range = dataMax - dataMin;
      localMin = (dataMin <= range * 0.05) ? 0 : Math.max(0, dataMin - range * 0.1);
      localMax = dataMax + range * 0.1;
    }
  } else {
    localMin = yAxisScale.min;
    localMax = yAxisScale.max;
  }
  
  const localSteps = valueMode === 'brandShare'
    ? Array.from({ length: 6 }, (_, i) => Math.round((localMin + (localMax - localMin) * i / 5) * 10) / 10)
    : yAxisScale.steps;
  const localReversedSteps = [...localSteps].reverse();

  return (
    <>
      {/* Chart Content Area */}
      <div className={`flex flex-row gap-10 items-start justify-start p-4 w-full ${fixedHeight ? 'flex-1 overflow-hidden' : 'h-[400px]'}`}>
        {/* Line Chart */}
        <div className="grow h-full min-h-px min-w-px relative">
          {/* Y-Axis and Chart Area */}
          <div className="absolute inset-0 flex flex-col">
            {/* Y-Axis */}
            <div className="flex flex-col grow items-start justify-between min-h-px min-w-px p-0 w-full">
              {/* Y-axis labels and grid lines */}
              <div className="flex items-center justify-center w-full">
                <div className="flex flex-row gap-4 h-px items-center justify-start p-0 w-full">
                  <div className="flex items-center justify-center">
                    <div className="text-[11px] leading-4 font-normal text-[#3a5166] text-right w-12" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {valueMode === 'brandShare' ? 'Share %' : 'Views'}
                    </div>
                  </div>
                  <div className="grow flex items-center justify-center min-h-px min-w-px">
                    <div className="h-px bg-[#e6e9ec] w-full"></div>
                  </div>
                </div>
              </div>
              
              {localReversedSteps.map((value, index) => (
                <div key={index} className="flex items-center justify-center w-full">
                  <div className="flex flex-row gap-4 h-px items-center justify-start p-0 w-full">
                    <div className="flex items-center justify-center">
                      <div className="text-[11px] leading-4 font-normal text-[#3a5166] text-right w-12" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {valueMode === 'brandShare' ? `${value}%` : formatSkus(value)}
                      </div>
                    </div>
                    <div className="grow flex items-center justify-center min-h-px min-w-px">
                      <div className={`h-px w-full ${index === localReversedSteps.length - 1 ? 'bg-[#cbd1d7]' : 'bg-[#e6e9ec]'}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* X-Axis */}
            <div className="flex flex-row items-start justify-between pl-[72px] pr-0 py-0 w-full">
              {['1 Dec', '5 Dec', '9 Dec', '13 Dec', '17 Dec', '21 Dec', '27 Dec'].map((date, index) => (
                <div key={index} className={`flex flex-col items-${index === 0 ? 'start' : index === 13 ? 'end' : 'center'} justify-start p-0 w-px`}>
                  <div className="h-1 w-px bg-[#cbd1d7]"></div>
                  <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Lines Area */}
          <div className="absolute bottom-[21px] left-[72px] right-0 top-0">
            {modeValuesByHost.length > 0 && (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {modeValuesByHost.map(({ host, values }) => {
                  if (!values || values.length === 0) return null;
                  const min = localMin;
                  const max = localMax;
                  const denom = Math.max(1, max - min);
                  const cols = values.length;
                  const stepX = cols > 1 ? 100 / (cols - 1) : 0;
                  const d = values.map((v, i) => {
                    const x = i * stepX;
                    const ratio = (v - min) / denom;
                    const y = 100 - ratio * 100;
                    return (i === 0 ? 'M' : 'L') + ' ' + x + ' ' + y;
                  }).join(' ');
                  const color = seriesColorByRetailer[host] || '#CBD1D7';
                  return (
                    <path
                      key={host}
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth={1.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                      shapeRendering="geometricPrecision"
                    />
                  );
                })}
              </svg>
            )}
          </div>

          {/* Hover overlay for tooltip and guideline */}
          <div
            className="absolute bottom-[21px] left-[72px] right-0 top-0 z-[10]"
            onMouseMove={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              const rect = target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setChartHoverPos({ x: e.clientX, y: e.clientY });
              const columns = 7;
              const idx = Math.max(0, Math.min(columns - 1, Math.round((x / rect.width) * (columns - 1))));
              setHoveredDateIdx(idx);
            }}
            onMouseLeave={() => setHoveredDateIdx(null)}
          >
            {hoveredDateIdx !== null && (
              <>
                {/* vertical guideline */}
                <div
                  className="absolute top-0 bottom-0 border-l border-dashed border-[#cbd1d7]"
                  style={{ left: `${(hoveredDateIdx / 6) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>

        {/* Legend Sidebar */}
        <ChartLegend
          legendRetailers={legendRetailers}
          selectedLegendHosts={selectedLegendHosts}
          seriesColorByRetailer={seriesColorByRetailer}
          maxRetailerSelections={maxRetailerSelections}
          onRetailerToggle={onRetailerToggle}
          onClearAll={onClearAll}
          onSelectAll={onSelectAll}
          formatSkus={formatSkus}
          isLegendItemDisabled={isLegendItemDisabled}
        />
      </div>

      {/* Insights Section (dynamic) */}
      {showInsights && <InsightSection dynamicInsight={dynamicInsight} />}
    </>
  );
};

export default RetailerGrowthTab;
