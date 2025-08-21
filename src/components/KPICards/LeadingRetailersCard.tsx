import React from 'react';

interface LeadingRetailersCardProps {
  onNavigateToTab?: (tab: string) => void;
}

const LeadingRetailersCard: React.FC<LeadingRetailersCardProps> = ({ onNavigateToTab }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
        <h3 className="text-base font-medium text-gray-900 leading-5">Leading Retailers in category by Views</h3>
        <span className="text-sm text-gray-500 leading-4">Category views split by retailer</span>
      </div>
      <div className="border-t border-gray-200 pt-4 px-6 pb-4">
        <div className="flex items-center gap-4 mb-4" style={{ height: '136px' }}>
          <div className="w-[105px] h-[105px]">
            <img src="/assets/a644a1d71ad8cc9cf565e595fd6501551f1f4ef9.svg" alt="Retailer chart" className="w-full h-full" />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px]">
                  <img src="/assets/01e295c52274f3848620593ef43c0094ba9d21fd.svg" alt="" className="w-full h-full" />
                </div>
                <span className="text-xs text-gray-900 font-medium">35%</span>
                <span className="text-xs text-gray-500">Amazon.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">1M</span>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px]">
                  <img src="/assets/08f4a05d46d0b4a00f0baec4e42bd7c69dd61cb6.svg" alt="" className="w-full h-full" />
                </div>
                <span className="text-xs text-gray-900 font-medium">25%</span>
                <span className="text-xs text-gray-500">Walmart.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">714K</span>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px]">
                  <img src="/assets/c47addf3e686f1568df327e0c31664782f3eb468.svg" alt="" className="w-full h-full" />
                </div>
                <span className="text-xs text-gray-900 font-medium">20%</span>
                <span className="text-xs text-gray-500">Bestbuy.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">571K</span>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">-3%</span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px]">
                  <img src="/assets/3919bd618661a0f02c6ed8d1faa60217015ee892.svg" alt="" className="w-full h-full" />
                </div>
                <span className="text-xs text-gray-900 font-medium">10%</span>
                <span className="text-xs text-gray-500">Ebay.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">286K</span>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+5%</span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px]">
                  <img src="/assets/5539226077f9ec8c8a3a63adbed9ef313903da99.svg" alt="" className="w-full h-full" />
                </div>
                <span className="text-xs text-gray-900 font-medium">10%</span>
                <span className="text-xs text-gray-500">Samsung.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">286K</span>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">-7%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 text-center">
          <button 
            className="text-blue-600 text-sm hover:text-blue-700"
            onClick={() => onNavigateToTab?.('retailer-growth')}
          >
            Analyze the retailers' change over time
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadingRetailersCard;
