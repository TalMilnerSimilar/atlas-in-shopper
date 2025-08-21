import React from 'react';

const IconInfo16Px: React.FC = () => (
  <div className="relative w-4 h-4">
    <div className="absolute inset-1">
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14z" fill="#b6bec6"/>
        <path d="M7 6h2v5H7V6zm0-2h2v2H7V4z" fill="#b6bec6"/>
      </svg>
    </div>
  </div>
);

const InfoIcon: React.FC = () => (
  <div className="relative w-3 h-3">
    <div className="absolute inset-0.5">
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 11A5 5 0 1 0 6 1a5 5 0 0 0 0 10z" fill="#b6bec6"/>
        <path d="M5.5 4.5h1v3h-1v-3zm0-1.5h1v1h-1V3z" fill="#b6bec6"/>
      </svg>
    </div>
  </div>
);

export const DataColumn: React.FC = () => {
  return (
    <div className="bg-white border border-[#e6e9ec] rounded-md relative">
      {/* Main container with border */}
      <div className="absolute border border-[#e6e9ec] border-solid inset-[-0.5px] pointer-events-none rounded-[6.5px]" />
      
      {/* Negative data section */}
      <div className="relative w-full">
        <div className="px-4 py-4">
          <div className="bg-[#fff5f8] h-[91px] relative rounded border border-[#ffe6e6]">
            <div className="flex flex-col items-center justify-center h-full px-4">
              {/* Header with title and info icon */}
              <div className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[#092540] font-['DM_Sans']">
                    <span className="font-bold">Product Views</span>
                    <span className="font-normal"> - My Brand Share</span>
                  </span>
                  <IconInfo16Px />
                </div>
                
                {/* Main value */}
                <div className="flex items-center justify-center">
                  <span className="text-[20px] font-medium text-[#092540] font-['DM_Sans'] tracking-[1px] leading-[24px]">
                    29.2%
                  </span>
                </div>
                
                {/* Context tag */}
                <div className="bg-[#ffe6e6] mix-blend-multiply rounded w-full">
                  <div className="flex items-center justify-center px-2 py-0.5">
                    <span className="text-[10px] font-bold text-[#bb3f3f] font-['DM_Sans'] tracking-[0.3px] leading-[12px]">
                      -0.1% YoY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Positive data row */}
      <div className="relative w-full">
        <div className="flex items-center px-4 pb-4">
          <div className="flex gap-2 items-center w-full">
            {/* Category Total */}
            <div className="flex-1 text-center">
              <div className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[#092540] font-['DM_Sans'] font-normal leading-[20px]">
                    Category Total
                  </span>
                  <InfoIcon />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-medium text-[#092540] font-['DM_Sans'] leading-[28px]">
                    155.9K
                  </span>
                  <div className="bg-[#ffe6e6] mix-blend-multiply px-2 py-0.5 rounded-[26px]">
                    <span className="text-[10px] font-bold text-[#bb3f3f] font-['DM_Sans'] tracking-[0.3px] leading-[12px]">
                      -1.2%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Competitors' AVG */}
            <div className="flex-1 text-center">
              <div className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-[#092540] font-['DM_Sans'] font-normal leading-[20px]">
                    Competitors' AVG
                  </span>
                  <InfoIcon />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-medium text-[#092540] font-['DM_Sans'] leading-[28px]">
                    11.1%
                  </span>
                  <div className="bg-[#e6faf5] mix-blend-multiply px-2 py-0.5 rounded-[26px]">
                    <span className="text-[10px] font-bold text-[#009688] font-['DM_Sans'] tracking-[0.3px] leading-[12px]">
                      +0.5PP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 