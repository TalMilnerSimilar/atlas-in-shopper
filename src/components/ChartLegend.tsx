import React from 'react';

interface LegendRetailer {
  name: string;
  skus: number;
}

interface ChartLegendProps {
  legendRetailers: LegendRetailer[];
  selectedLegendHosts: string[];
  seriesColorByRetailer: Record<string, string>;
  maxRetailerSelections: number;
  onRetailerToggle: (hostLabel: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  formatSkus: (skus: number) => string;
  isLegendItemDisabled: (host: string) => boolean;
}

const ChartLegend: React.FC<ChartLegendProps> = ({
  legendRetailers,
  selectedLegendHosts,
  seriesColorByRetailer,
  maxRetailerSelections,
  onRetailerToggle,
  onClearAll,
  onSelectAll,
  formatSkus,
  isLegendItemDisabled,
}) => {
  return (
    <div className="bg-white h-[347px] rounded border border-[#e6e9ec] w-[254px]">
      <div className="flex flex-col h-[347px] items-start justify-start overflow-clip p-0 w-[254px]">
        <div className="h-0 w-full relative">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
            <img alt="Legend line" className="w-full h-px" src="/assets/f1185c9a9f03d441b08c5344c528a7d18dc379f0.svg" />
          </div>
        </div>
        
        <div className="grow flex flex-col gap-1 items-start justify-start min-h-px min-w-px pb-0 pl-4 pr-0 pt-2 w-full overflow-y-auto">
          {/* Legend Items */}
          {legendRetailers.map((retailer) => {
            const isDisabled = isLegendItemDisabled(retailer.name);
            const isSelected = selectedLegendHosts.includes(retailer.name);
            
            return (
              <div key={retailer.name} className="flex items-center gap-2 text-sm py-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onRetailerToggle(retailer.name)}
                  disabled={isDisabled}
                  className={`h-4 w-4 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ accentColor: seriesColorByRetailer[retailer.name] || '#CBD1D7' }}
                />
                <span 
                  className={`${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-[#195afe]'} transition-colors`}
                  style={{ 
                    fontFamily: 'Roboto, sans-serif',
                    color: isSelected ? '#3a5166' : (isDisabled ? '#b6bec6' : '#3a5166'),
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                  onClick={() => !isDisabled && onRetailerToggle(retailer.name)}
                >
                  {retailer.name}
                  <span className="text-[#b6bec6]"> - {formatSkus(retailer.skus)} SKUs</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white flex flex-row h-8 items-start justify-between px-4 py-2 w-full border-t border-[#e6e9ec]">
          <div className="flex flex-row gap-1.5 items-start justify-start p-0 text-[12px] leading-4 whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <button 
              className={`flex flex-col justify-center text-center transition-opacity cursor-pointer ${
                selectedLegendHosts.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#195afe] hover:opacity-75'
              }`}
              onClick={onClearAll}
              disabled={selectedLegendHosts.length === 0}
            >
              Clear all
            </button>
            <div className="text-left text-[#195afe]">
              |
            </div>
            <button 
              className={`flex flex-col justify-center text-center transition-opacity cursor-pointer ${
                selectedLegendHosts.length === maxRetailerSelections ? 'text-gray-400 cursor-not-allowed' : 'text-[#195afe] hover:opacity-75'
              }`}
              onClick={onSelectAll}
              disabled={selectedLegendHosts.length === maxRetailerSelections}
            >
              Select Top
            </button>
          </div>
          <div className="flex flex-row gap-1.5 items-start justify-start p-0 text-right" style={{ fontFamily: 'Roboto, sans-serif' }}>
            <div className="text-[12px] leading-[18px] font-normal text-[#6b7c8c] whitespace-nowrap">
              {selectedLegendHosts.length}/{maxRetailerSelections}
            </div>
            <div className="flex flex-col h-[18px] justify-end text-[10px] leading-4 font-normal text-[#b6bec6] w-[42px]">
              Out of {legendRetailers.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartLegend;
