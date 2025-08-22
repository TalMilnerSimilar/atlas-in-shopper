import React from 'react';
import ChartLegend from '../ChartLegend';
import InsightSection from '../InsightSection';
// Uses series from public/data/retailer_series.csv via getSeriesForRetailer passed from page

interface BrandShareTabProps {
  selectedLegendHosts: string[];
  legendRetailers: Array<{ name: string; skus: number }>;
  maxRetailerSelections: number;
  onRetailerToggle: (hostLabel: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  formatSkus: (value: number) => string;
  isLegendItemDisabled: (host: string) => boolean;
  seriesColorByRetailer: Record<string, string>;
  getSeriesForRetailer: (host: string) => number[];
  hoveredDateIdx: number | null;
  setHoveredDateIdx: (idx: number | null) => void;
  setChartHoverPos: (pos: { x: number; y: number }) => void;
  dynamicInsight: {
    headline: string;
    sentence: string;
    chips: Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }>;
  };
  showInsights?: boolean;
  fixedHeight?: boolean;
}

const BrandShareTab: React.FC<BrandShareTabProps> = ({
  selectedLegendHosts,
  legendRetailers,
  maxRetailerSelections,
  onRetailerToggle,
  onClearAll,
  onSelectAll,
  formatSkus,
  isLegendItemDisabled,
  seriesColorByRetailer,
  getSeriesForRetailer,
  hoveredDateIdx,
  setHoveredDateIdx,
  setChartHoverPos,
  dynamicInsight,
  showInsights = true,
  fixedHeight = false,
}) => {
  // Build share data from retailer_series.csv via getSeriesForRetailer
  const getMarketShareData = (): Array<{ host: string; values: number[] }> => {
    const hosts = selectedLegendHosts;
    const seriesByHost = hosts.map(host => ({ host, values: getSeriesForRetailer(host) }));

    // Totals per week across ALL retailers selected in the header (legendRetailers list)
    const allHeaderHosts = legendRetailers.map(r => r.name);
    const totals: number[] = new Array(7).fill(0);
    allHeaderHosts.forEach(h => {
      const vals = getSeriesForRetailer(h) || [];
      for (let i = 0; i < 7; i++) totals[i] += (vals[i] || 0);
    });

    // Convert absolute views to share percentages relative to header selection totals
    const percentByHost = seriesByHost.map(({ host, values }) => ({
      host,
      values: values.map((v, i) => {
        const t = totals[i] || 0;
        return t > 0 ? (v / t) * 100 : 0;
      })
    }));

    return percentByHost;
  };

  const shareData = getMarketShareData();

  // Calculate stacked positions for the area chart
  const getStackedData = () => {
    const stackedData: Array<{ host: string; values: number[]; stackedValues: number[] }> = [];
    const runningTotals = new Array(7).fill(0);

    shareData.forEach(({ host, values }) => {
      const stackedValues = values.map((value, index) => {
        const bottom = runningTotals[index];
        runningTotals[index] += value;
        return { bottom, top: runningTotals[index], value };
      });

      stackedData.push({
        host,
        values,
        stackedValues: stackedValues.map(s => s.top)
      });
    });

    return stackedData;
  };

  const stackedData = getStackedData();

  // Y-axis dynamically scales to the combined share of selected legend retailers
  const combinedSharePerWeek = Array.from({ length: 7 }, (_, i) =>
    shareData.reduce((sum, { values }) => sum + (values[i] || 0), 0)
  );
  const rawMaxPct = Math.max(0, ...combinedSharePerWeek);
  // Add 15% headroom over the highest point, cap to 100; no minimum
  const paddedMax = Math.min(100, rawMaxPct * 1.15);
  const yAxisMax = Math.ceil(paddedMax);
  // Build 5 even divisions from 0 to max (rounded labels)
  const yAxisSteps = Array.from({ length: 6 }, (_, i) => Math.round((yAxisMax * i) / 5));
  const reversedSteps = [...yAxisSteps].reverse();

  return (
          <>
        {/* Chart Content Area */}
        <div className={`flex flex-row gap-10 items-start justify-start p-4 w-full ${fixedHeight ? 'flex-1 overflow-hidden' : 'h-[400px]'}`}>
        {/* Stacked Area Chart */}
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
                      Share %
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
                        {value}%
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

          {/* Stacked Areas */}
          <div className="absolute bottom-[21px] left-[72px] right-0 top-0">
            {selectedLegendHosts.length > 0 && (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {stackedData.map(({ host, stackedValues }, hostIndex) => {
                  const color = seriesColorByRetailer[host] || '#CBD1D7';
                  const cols = stackedValues.length;
                  const stepX = cols > 1 ? 100 / (cols - 1) : 0;
                  
                  // Calculate the bottom line (previous stacked total)
                  let bottomLine = '0';
                  if (hostIndex > 0) {
                    const prevStackedValues = stackedData[hostIndex - 1].stackedValues;
                    bottomLine = prevStackedValues.map((v, i) => {
                      const x = i * stepX;
                      const y = 100 - (v / yAxisMax * 100); // Scale to Y-axis max
                      return `${x} ${y}`;
                    }).join(' L ');
                  } else {
                    // First area starts from bottom (100 in SVG coordinates)
                    bottomLine = Array.from({ length: cols }, (_, i) => {
                      const x = i * stepX;
                      return `${x} 100`;
                    }).join(' L ');
                  }
                  
                  // Calculate the top line (current stacked total)
                  const topLine = stackedValues.map((v, i) => {
                    const x = i * stepX;
                    const y = 100 - (v / yAxisMax * 100); // Scale to Y-axis max
                    return `${x} ${y}`;
                  }).join(' L ');
                  
                  // Create path: start with top line, then reverse bottom line to close the area
                  const reversedBottomLine = bottomLine.split(' L ').reverse().join(' L ');
                  const pathData = `M ${topLine} L ${reversedBottomLine} Z`;
                  
                  return (
                    <path
                      key={host}
                      d={pathData}
                      fill={color}
                      fillOpacity={1}
                      stroke="none"
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

        {/* Legend Sidebar - Same as RetailerGrowthTab */}
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

      {/* Insights Section */}
      {showInsights && <InsightSection dynamicInsight={dynamicInsight} />}
    </>
  );
};

export default BrandShareTab;
