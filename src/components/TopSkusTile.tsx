import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { RetailerNode } from '../analytics/opportunity';
import NoAggregationTab from './TabContent/NoAggregationTab';
import AggregateByBrandsTab from './TabContent/AggregateByBrandsTab';
import AggregateByRetailersTab from './TabContent/AggregateByRetailersTab';

interface TopSkusTileProps {
  retailers: RetailerNode[];
  selectedBrandName?: string;
  selectedBrandsHeader?: string[];
}

export default function TopSkusTile({ retailers, selectedBrandName, selectedBrandsHeader }: TopSkusTileProps) {
  const [tab, setTab] = useState<'none' | 'brand' | 'retailer'>('none');

  const renderTabContent = () => {
    switch (tab) {
      case 'brand':
        return <AggregateByBrandsTab retailers={retailers} selectedBrandName={selectedBrandName} selectedBrandsHeader={selectedBrandsHeader} />;
      case 'retailer':
        return <AggregateByRetailersTab retailers={retailers} selectedBrandName={selectedBrandName} />;
      case 'none':
      default:
        return <NoAggregationTab retailers={retailers} selectedBrandName={selectedBrandName} />;
    }
  };

  return (
    <div className="w-full rounded-md border border-[#E6E9EC] bg-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header - Figma spec aligned */}
      <div className="relative h-[85px] w-full flex items-start justify-start border-b border-[#E6E9EC]">
        <div className="flex flex-1 items-center justify-between pr-6">
          <div className="flex flex-col gap-2 pl-6 py-4">
            <div className="flex items-center gap-1">
              <div className="text-[20px] leading-[28px] text-[#092540]">Top performing SKUs</div>
              <InformationCircleIcon className="w-4 h-4 text-[#B6BEC6]" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[14px] leading-[20px] text-[#6b7c8c]">350 SKUs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs under header (Figma-aligned) */}
      <div className="w-full border-b border-[#E6E9EC]">
        <div className="flex w-full">
          <div
            className={`flex-1 p-6 flex items-center justify-center cursor-pointer transition-colors ${
              tab === 'none' ? 'border-b-[3px] border-[#195afe]' : 'hover:bg-gray-50'
            }`}
            onClick={() => setTab('none')}
          >
            <div className="text-[16px] leading-[22px] text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>No aggregation</div>
          </div>
          <div className="w-px bg-[#E6E9EC]" />
          <div
            className={`flex-1 p-6 flex items-center justify-center cursor-pointer transition-colors ${
              tab === 'brand' ? 'border-b-[3px] border-[#195afe]' : 'hover:bg-gray-50'
            }`}
            onClick={() => setTab('brand')}
          >
            <div className="text-[16px] leading-[22px] text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Aggregate by Brands</div>
          </div>
          <div className="w-px bg-[#E6E9EC]" />
          <div
            className={`flex-1 p-6 flex items-center justify-center cursor-pointer transition-colors ${
              tab === 'retailer' ? 'border-b-[3px] border-[#195afe]' : 'hover:bg-gray-50'
            }`}
            onClick={() => setTab('retailer')}
          >
            <div className="text-[16px] leading-[22px] text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Aggregate by Retailers</div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}