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
}) => {
  return (
    <>
      {/* Chart Content Area */}
      <div className="flex flex-row gap-10 h-[400px] items-start justify-start p-4 w-full">
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
                      Views
                    </div>
                  </div>
                  <div className="grow flex items-center justify-center min-h-px min-w-px">
                    <div className="h-px bg-[#e6e9ec] w-full"></div>
                  </div>
                </div>
              </div>
              
              {reversedSteps.map((value, index) => (
                <div key={index} className="flex items-center justify-center w-full">
                  <div className="flex flex-row gap-4 h-px items-center justify-start p-0 w-full">
                    <div className="flex items-center justify-center">
                      <div className="text-[11px] leading-4 font-normal text-[#3a5166] text-right w-12" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {formatSkus(value)}
                      </div>
                    </div>
                    <div className="grow flex items-center justify-center min-h-px min-w-px">
                      <div className={`h-px w-full ${index === reversedSteps.length - 1 ? 'bg-[#cbd1d7]' : 'bg-[#e6e9ec]'}`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* X-Axis */}
            <div className="flex flex-row items-start justify-between pl-[72px] pr-0 py-0 w-full">
              {['1 Dec', '3 Dec', '5 Dec', '7 Dec', '9 Dec', '11 Dec', '13 Dec', '15 Dec', '17 Dec', '19 Dec', '21 Dec', '23 Dec', '25 Dec', '27 Dec'].map((date, index) => (
                <div key={index} className={`flex flex-col items-${index === 0 ? 'start' : index === 13 ? 'end' : 'center'} justify-start p-0 w-px`}>
                  <div className="h-1 w-px bg-[#cbd1d7]"></div>
                  <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Lines Area - data-driven from CSV */}
          <div className="absolute bottom-[21px] left-[72px] right-0 top-0">
            {selectedLegendHosts.length > 0 && (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {selectedLegendHosts.map((host) => {
                  const values = getSeriesForRetailer(host);
                  if (!values || values.length === 0) return null;
                  const min = yAxisScale.min;
                  const max = yAxisScale.max;
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
      <InsightSection dynamicInsight={dynamicInsight} />
    </>
  );
};

export default RetailerGrowthTab;
