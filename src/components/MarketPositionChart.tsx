import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface MarketPositionChartProps {
  brandSel: string;
  currentBrandData: {
    position: string;
    percentile: number;
    rank: number;
    total: number;
    status: string;
    views: string;
  };
  brandData: Record<string, any>;
  onBrandHover: (brand: string, event: React.MouseEvent) => void;
  onBrandLeave: () => void;
  getOrdinal: (n: number) => string;
  getBrandHeadline: (status: string, brand: string) => string;
}

const MarketPositionChart: React.FC<MarketPositionChartProps> = ({
  brandSel,
  currentBrandData,
  brandData,
  onBrandHover,
  onBrandLeave,
  getOrdinal,
  getBrandHeadline,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-8">
      <div className="px-6 pt-4 pb-4 border-b border-[#E6E9EC]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <h3 className="text-[20px] leading-6 font-medium text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: '500', lineHeight: '24px' }}>{brandSel}'s Market Position by views</h3>
              <div className="relative">
                <InformationCircleIcon 
                  className="w-4 h-4 text-[#B6BEC6] cursor-help hover:text-[#195afe]"
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                />
                {tooltipVisible && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 w-64 z-50 pointer-events-none">
                    Shows your brand's competitive position relative to other brands in the category. Higher percentile indicates stronger market performance.
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <img src="/assets/f743f0cc589b750074a9fe613e2a212fb32ce333.svg" alt="" className="w-4 h-4" />
              <span className="text-[13px] leading-4 text-[#B6BEC6]" style={{ fontFamily: 'Roboto, sans-serif' }}>Jul 2020 - May 2023</span>
            </div>
          </div>
        </div>
      </div>
    
      <div className="px-6 py-4">
        {/* Brand Position axis */}
        <div className="flex items-start justify-start gap-4 h-12 mb-4">
          <div className="flex flex-col justify-center h-6 w-10 text-[12px] text-[#092540] font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Trailing
          </div>
          <div className="flex-1 relative">
            <div className="flex flex-col gap-3 items-center justify-start mt-2.5 w-full">
              {/* Gradient axis */}
              <div className="h-[5px] bg-gradient-to-r from-[#e6e9ec] to-[#82affe] w-full"></div>
              
              {/* Axis labels */}
              <div className="flex justify-center items-start gap-[107px] text-[12px] text-[#3A5166] font-normal w-full" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <span className="text-right flex-1">Behind</span>
                <span className="text-center flex-1">Median</span>
                <span className="text-left flex-1">Ahead</span>
              </div>
            </div>
            
            {/* Competitor markers positioned absolutely */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-start">
              <div 
                className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                onMouseEnter={(e) => onBrandHover('Co', e)}
                onMouseLeave={onBrandLeave}
              >
                <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Co</span>
              </div>
              <div 
                className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                onMouseEnter={(e) => onBrandHover('Pu', e)}
                onMouseLeave={onBrandLeave}
              >
                <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pu</span>
              </div>
              <div 
                className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                onMouseEnter={(e) => onBrandHover('DM', e)}
                onMouseLeave={onBrandLeave}
              >
                <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>DM</span>
              </div>
              <div 
                className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                onMouseEnter={(e) => onBrandHover('Ad', e)}
                onMouseLeave={onBrandLeave}
              >
                <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Ad</span>
              </div>
              <div 
                className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                onMouseEnter={(e) => onBrandHover('NB', e)}
                onMouseLeave={onBrandLeave}
              >
                <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>NB</span>
              </div>
              {/* Current brand marker - positioned dynamically */}
              <div 
                className="absolute w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-400 transition-all duration-300" 
                style={{ 
                  width: '26px', 
                  height: '26px',
                  left: currentBrandData.position,
                  transform: 'translateX(-50%)',
                  top: '0'
                }}
                onMouseEnter={(e) => onBrandHover(brandSel, e)}
                onMouseLeave={onBrandLeave}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ width: '8px', height: '8px' }}></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center h-6 w-[77px] text-[12px] text-[#092540] font-normal text-right whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Market Leader
          </div>
        </div>
        
        {/* Summary card */}
        <div className="bg-[#f5f8ff] rounded-lg p-4 w-full">
          <div className="flex flex-col items-start justify-start w-full">
            <h4 className="text-[20px] leading-7 font-bold text-[#092540] text-center w-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {getBrandHeadline(currentBrandData.status, brandSel)}
            </h4>
          </div>
          <div className="h-px w-full my-2">
            <img src="/assets/dc289e6a6ffaf06d2e064fa9fe8267366e41a94d.svg" alt="" className="w-full h-px" />
          </div>
          <div className="relative">
            <p className="text-[14px] leading-5 text-[#092540] text-center flex items-center justify-center gap-2 flex-wrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span>You're in the <span className="font-bold">{getOrdinal(currentBrandData.percentile)}</span> percentile (rank {currentBrandData.rank} of {currentBrandData.total}).</span>
              <span className="bg-[#e6faf5] text-[#009688] text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">+3PP PoP</span>
              <span className="bg-[#ffe6e6] text-[#bb3f3f] text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">-2PP YoY</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPositionChart;
