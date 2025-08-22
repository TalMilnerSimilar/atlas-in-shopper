import React, { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { RetailerNode } from '../analytics/opportunity';
import NoAggregationTab from './TabContent/NoAggregationTab';
import AggregateByBrandsTab from './TabContent/AggregateByBrandsTab';
import AggregateByRetailersTab from './TabContent/AggregateByRetailersTab';

interface TopSkusTileProps {
  retailers: RetailerNode[];
  selectedBrandName?: string;
  selectedBrandsHeader?: string[];
  showKPIs?: boolean;
  showFilters?: boolean;
}

export default function TopSkusTile({ retailers, selectedBrandName, selectedBrandsHeader, showKPIs = true, showFilters = true }: TopSkusTileProps) {
  const [tab, setTab] = useState<'none' | 'brand' | 'retailer'>('none');
  const [aggregateByBrandsEnabled, setAggregateByBrandsEnabled] = useState(true);
  const [aggregateByRetailersEnabled, setAggregateByRetailersEnabled] = useState(true);

  // Listen for aggregate tab toggles
  useEffect(() => {
    // Load initial state
    const savedBrands = localStorage.getItem('aggregateByBrandsEnabled');
    if (savedBrands !== null) {
      setAggregateByBrandsEnabled(JSON.parse(savedBrands));
    }

    const savedRetailers = localStorage.getItem('aggregateByRetailersEnabled');
    if (savedRetailers !== null) {
      setAggregateByRetailersEnabled(JSON.parse(savedRetailers));
    }

    const handleAggregateTabToggle = (event: CustomEvent) => {
      const { tabType, enabled } = event.detail;
      if (tabType === 'brands') {
        setAggregateByBrandsEnabled(enabled);
        // Switch to 'none' if current tab is disabled
        if (!enabled && tab === 'brand') {
          setTab('none');
        }
      } else if (tabType === 'retailers') {
        setAggregateByRetailersEnabled(enabled);
        // Switch to 'none' if current tab is disabled
        if (!enabled && tab === 'retailer') {
          setTab('none');
        }
      }
    };

    window.addEventListener('aggregateTabToggle', handleAggregateTabToggle as EventListener);
    
    return () => {
      window.removeEventListener('aggregateTabToggle', handleAggregateTabToggle as EventListener);
    };
  }, [tab]);

  // Check if both aggregation tabs are disabled
  const bothAggregationTabsDisabled = !aggregateByBrandsEnabled && !aggregateByRetailersEnabled;
  const showTabBar = aggregateByBrandsEnabled || aggregateByRetailersEnabled;

  const renderTabContent = () => {
    // If both aggregation tabs are disabled, always show the "No aggregation" content
    if (bothAggregationTabsDisabled) {
      return <NoAggregationTab retailers={retailers} selectedBrandName={selectedBrandName} showKPIs={showKPIs} showFilters={showFilters} />;
    }

    switch (tab) {
      case 'brand':
        return aggregateByBrandsEnabled ? <AggregateByBrandsTab retailers={retailers} selectedBrandName={selectedBrandName} selectedBrandsHeader={selectedBrandsHeader} showKPIs={showKPIs} showFilters={showFilters} /> : <NoAggregationTab retailers={retailers} selectedBrandName={selectedBrandName} showKPIs={showKPIs} showFilters={showFilters} />;
      case 'retailer':
        return aggregateByRetailersEnabled ? <AggregateByRetailersTab retailers={retailers} selectedBrandName={selectedBrandName} showKPIs={showKPIs} showFilters={showFilters} /> : <NoAggregationTab retailers={retailers} selectedBrandName={selectedBrandName} showKPIs={showKPIs} showFilters={showFilters} />;
      case 'none':
      default:
        return <NoAggregationTab retailers={retailers} selectedBrandName={selectedBrandName} showKPIs={showKPIs} showFilters={showFilters} />;
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

      {/* Tabs under header (Figma-aligned) - Only show if at least one aggregation tab is enabled */}
      {showTabBar && (
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
            
            {aggregateByBrandsEnabled && (
              <>
                <div className="w-px bg-[#E6E9EC]" />
                <div
                  className={`flex-1 p-6 flex items-center justify-center cursor-pointer transition-colors ${
                    tab === 'brand' ? 'border-b-[3px] border-[#195afe]' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setTab('brand')}
                >
                  <div className="text-[16px] leading-[22px] text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Aggregate by Brands</div>
                </div>
              </>
            )}
            
            {aggregateByRetailersEnabled && (
              <>
                <div className="w-px bg-[#E6E9EC]" />
                <div
                  className={`flex-1 p-6 flex items-center justify-center cursor-pointer transition-colors ${
                    tab === 'retailer' ? 'border-b-[3px] border-[#195afe]' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setTab('retailer')}
                >
                  <div className="text-[16px] leading-[22px] text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Aggregate by Retailers</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}