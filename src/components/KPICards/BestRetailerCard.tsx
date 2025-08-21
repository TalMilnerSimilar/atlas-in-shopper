import React from 'react';

interface BestRetailerCardProps {
  onNavigateToTab?: (tab: string) => void;
}

const BestRetailerCard: React.FC<BestRetailerCardProps> = ({ onNavigateToTab }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
        <h3 className="text-base font-medium text-gray-900 leading-5">My Best retailer</h3>
        <span className="text-sm text-gray-500 leading-4">Top retailer performance metrics</span>
      </div>
      <div className="border-t border-gray-200 pt-4 px-6 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-bold text-gray-900">eBay.com</span>
          <div className="w-4 h-4">
            <img src="/assets/4c906a76851dd45819a9104dd0fc0f361509528d.svg" alt="Info icon" className="w-full h-full" />
          </div>
        </div>
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-600 text-xs font-medium px-0 py-0 rounded w-4 h-4 flex items-center justify-center">1</div>
              <span className="text-sm text-gray-900">Total Brand Views</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-900">142K</span>
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+15%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-600 text-xs font-medium px-0 py-0 rounded w-4 h-4 flex items-center justify-center">2</div>
              <span className="text-sm text-gray-900">Traffic Share</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-900">21.2%</span>
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+1.1PP</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-600 text-xs font-medium px-0 py-0 rounded w-4 h-4 flex items-center justify-center">3</div>
              <span className="text-sm text-gray-900">Share of Shelf</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-900">13.3%</span>
              <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">-3.1PP</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 mt-4 text-center">
          <button 
            className="text-blue-600 text-sm hover:text-blue-700"
            onClick={() => onNavigateToTab?.('opportunity-matrix')}
          >
            Search for additional retailers to consider
          </button>
        </div>
      </div>
    </div>
  );
};

export default BestRetailerCard;
