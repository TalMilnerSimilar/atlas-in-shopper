import React from 'react';

interface BestRetailerCardProps {
  onNavigateToTab?: (tab: string) => void;
  fixedHeight?: boolean;
}

const BestRetailerCard: React.FC<BestRetailerCardProps> = ({ onNavigateToTab, fixedHeight }) => {
  return (
    <div className={`bg-white border border-[#e6e9ec] rounded-[6px] ${fixedHeight ? 'h-[300px] flex flex-col' : ''}`}>
      {/* Header */}
      <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
        <h3 className="text-base font-medium text-[#092540] leading-5">My Best Retailer</h3>
        <span className="text-sm text-[#6b7c8c] leading-4">Top retailer performance metrics</span>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-[#e6e9ec] w-full"></div>
      
      {/* Content */}
      <div className={`px-6 pt-4 pb-4 ${fixedHeight ? 'flex-1 flex flex-col' : ''}`}>
        {/* Retailer Name */}
        <div className="mb-4">
          <span className="text-sm font-bold text-[#092540]">eBay.com</span>
        </div>
        
        {/* Metrics */}
        <div className="space-y-3 mb-8" style={{ marginBottom: 28 }}>
          {/* Metric 1: My Brand Traffic share */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#e8eeff] text-[#195afe] text-[10px] font-medium rounded-[8px] w-4 h-4 flex items-center justify-center">1</div>
              <span className="text-sm text-[#092540]">My Brand Traffic share</span>
            </div>
            <div className="flex items-center gap-[17px]">
              <span className="text-sm text-[#092540]">21.2%</span>
              <span className="bg-[#e6faf5] text-[#009688] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px]">+1.1PP</span>
            </div>
          </div>
          
          {/* Metric 2: My brand Share of Shelf */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#e8eeff] text-[#195afe] text-[10px] font-medium rounded-[8px] w-4 h-4 flex items-center justify-center">2</div>
              <span className="text-sm text-[#092540]">My brand Share of Shelf</span>
            </div>
            <div className="flex items-center gap-[17px]">
              <span className="text-sm text-[#092540]">3.3%</span>
              <span className="bg-[#ffe6e6] text-[#bb3f3f] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px]">-1.2PP</span>
            </div>
          </div>
          
          {/* Metric 3: Retailer Total Traffic */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#e8eeff] text-[#195afe] text-[10px] font-medium rounded-[8px] w-4 h-4 flex items-center justify-center">3</div>
              <span className="text-sm text-[#092540]">Retailer Total Traffic</span>
            </div>
            <div className="flex items-center gap-[17px]">
              <span className="text-sm text-[#092540]">142K</span>
              <span className="bg-[#f7f7f8] text-[#6b7c8c] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] min-w-[44px] text-center">-</span>
            </div>
          </div>
        </div>
        
        {/* Footer Link */}
        {onNavigateToTab && (
          <div className="border-t border-[#e6e9ec] pt-4 mt-4 text-center">
            <button 
              className="text-[#195afe] text-sm hover:underline"
              onClick={() => onNavigateToTab('opportunity-matrix')}
            >
              Search for additional retailers to consider
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestRetailerCard;
