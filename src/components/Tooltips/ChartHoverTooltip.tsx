import React from 'react';

interface ChartHoverTooltipProps {
  hoveredDateIdx: number | null;
  selectedLegendHosts: string[];
  chartHoverPos: { x: number; y: number };
  dateLabels: string[];
  getSeriesForRetailer: (host: string) => number[];
  seriesColorByRetailer: Record<string, string>;
  formatSkus: (value: number) => string;
  mode?: 'views' | 'share' | 'brandShare';
  allHeaderHosts?: string[]; // hosts included in header selection for share denominator
}

const ChartHoverTooltip: React.FC<ChartHoverTooltipProps> = ({
  hoveredDateIdx,
  selectedLegendHosts,
  chartHoverPos,
  dateLabels,
  getSeriesForRetailer,
  seriesColorByRetailer,
  formatSkus,
  mode = 'views',
  allHeaderHosts,
}) => {
  if (hoveredDateIdx === null || selectedLegendHosts.length === 0) {
    return null;
  }

  const calcTotals = () => {
    if (mode === 'brandShare') {
      // In brandShare mode, values are already percentages, so just sum them
      let selectedTotal = 0;
      selectedLegendHosts.forEach((host) => {
        const series = getSeriesForRetailer(host) || [];
        selectedTotal += series[hoveredDateIdx] || 0;
      });
      return { selectedTotal, headerTotal: 100 }; // headerTotal not used in brandShare mode
    } else {
      const headerHosts = (allHeaderHosts && allHeaderHosts.length > 0) ? allHeaderHosts : selectedLegendHosts;
      let selectedTotal = 0;
      let headerTotal = 0;
      selectedLegendHosts.forEach((host) => {
        const series = getSeriesForRetailer(host) || [];
        selectedTotal += series[hoveredDateIdx] || 0;
      });
      headerHosts.forEach((host) => {
        const series = getSeriesForRetailer(host) || [];
        headerTotal += series[hoveredDateIdx] || 0;
      });
      return { selectedTotal, headerTotal };
    }
  };

  const { selectedTotal, headerTotal } = calcTotals();

  return (
    <div
      className="fixed z-[60] bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[260px] pointer-events-none"
      style={{ left: chartHoverPos.x + 12, top: chartHoverPos.y - 12 }}
    >
      <div className="text-[14px] font-bold text-[#092540] mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        {dateLabels[hoveredDateIdx]}
      </div>
      {mode === 'views' ? (
        <div className="text-[12px] text-[#6b7c8c] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Total daily views – {formatSkus(selectedTotal)}
        </div>
      ) : mode === 'brandShare' ? (
        <div className="text-[12px] text-[#6b7c8c] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Selected share – {selectedTotal.toFixed(1)}%
        </div>
      ) : (
        <div className="text-[12px] text-[#6b7c8c] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Selected share – {headerTotal > 0 ? ((selectedTotal / headerTotal) * 100).toFixed(0) : '0'}%
        </div>
      )}
      <div className="space-y-2">
        {selectedLegendHosts.map((host) => {
          const color = seriesColorByRetailer[host] || '#CBD1D7';
          const series = getSeriesForRetailer(host);
          const value = series[hoveredDateIdx] || 0;
          return (
            <div key={host} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[13px] text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>{host}</span>
              </div>
              <div className="text-[13px] font-semibold text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {mode === 'views' ? formatSkus(value) : mode === 'brandShare' ? `${value.toFixed(1)}%` : (headerTotal > 0 ? `${((value / headerTotal) * 100).toFixed(0)}%` : '0%')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartHoverTooltip;
