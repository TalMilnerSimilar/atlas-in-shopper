import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import BrandShareTab from './TabContent/BrandShareTab';
import RetailerGrowthTab from './TabContent/RetailerGrowthTab';
import OpportunityMatrixTab from './TabContent/OpportunityMatrixTab';
import CompetitiveLandscapeTab from './TabContent/CompetitiveLandscapeTab';

interface MainChartProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLegendHosts: string[];
  selectedBrandName: string;
  yAxisScale: {
    min: number;
    max: number;
    steps: number[];
  };
  reversedSteps: number[];
  formatSkus: (value: number) => string;
  getSeriesForRetailer: (host: string) => number[];
  seriesColorByRetailer: Record<string, string>;
  hoveredDateIdx: number | null;
  setHoveredDateIdx: (idx: number | null) => void;
  setChartHoverPos: (pos: { x: number; y: number }) => void;
  legendRetailers: Array<{ name: string; skus: number }>;
  maxRetailerSelections: number;
  onRetailerToggle: (hostLabel: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  isLegendItemDisabled: (host: string) => boolean;
  dynamicInsight: {
    headline: string;
    sentence: string;
    chips: Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }>;
  };
}

const MainChart: React.FC<MainChartProps> = ({
  activeTab,
  setActiveTab,
  selectedLegendHosts,
  selectedBrandName,
  yAxisScale,
  reversedSteps,
  formatSkus,
  getSeriesForRetailer,
  seriesColorByRetailer,
  hoveredDateIdx,
  setHoveredDateIdx,
  setChartHoverPos,
  legendRetailers,
  maxRetailerSelections,
  onRetailerToggle,
  onClearAll,
  onSelectAll,
  isLegendItemDisabled,
  dynamicInsight,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  const tabTooltips = {
    'retailer-growth': 'Track how each retailer\'s views are trending over time. Shows absolute view counts and growth patterns.',
    'brand-performance': 'See what percentage of your brand each retailer represents. Shows relative market share distribution.',
    'opportunity-matrix': 'Identify which retailers offer the best growth opportunities based on demand vs. your current presence.',
    'competitive-landscape': 'Analyze head-to-head competition with other brands across different retailers.'
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-8">
      {/* Tab Header */}
      <div className="flex flex-col items-start justify-start p-0 w-full">
        <div className="flex flex-row items-center justify-between p-0 w-full border-b border-[#e6e9ec]">
          <div className="flex flex-row w-full items-start justify-start min-h-px min-w-px p-0">
            {/* Tab 1 - Retailer Growth Over Time */}
            <div 
              className={`flex flex-col gap-3 flex-1 items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                activeTab === 'retailer-growth' ? 'border-b-[3px] border-[#195afe]' : ''
              } relative`}
              onClick={() => setActiveTab('retailer-growth')}
            >
              <div className="flex flex-row gap-2 items-center justify-center p-0">
                <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Retailer Growth Over Time
                </div>
                <div className="relative">
                  <InformationCircleIcon 
                    className="w-4 h-4 text-[#6b7c8c] cursor-help hover:text-[#195afe]"
                    onMouseEnter={() => setTooltipVisible('retailer-growth')}
                    onMouseLeave={() => setTooltipVisible(null)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {tooltipVisible === 'retailer-growth' && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 w-64 z-50 pointer-events-none">
                      {tabTooltips['retailer-growth']}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center self-stretch">
              <div className="h-[70px] w-px bg-[#cbd1d7]"></div>
            </div>

            {/* Tab 2 - Brand Performance Across Retailers */}
            <div 
              className={`flex flex-col gap-3 flex-1 items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                activeTab === 'brand-performance' ? 'border-b-[3px] border-[#195afe]' : ''
              } relative`}
              onClick={() => setActiveTab('brand-performance')}
            >
              <div className="flex flex-row gap-2 items-center justify-center p-0">
                <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Retailers' Share of the Brand
                </div>
                <div className="relative">
                  <InformationCircleIcon 
                    className="w-4 h-4 text-[#6b7c8c] cursor-help hover:text-[#195afe]"
                    onMouseEnter={() => setTooltipVisible('brand-performance')}
                    onMouseLeave={() => setTooltipVisible(null)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {tooltipVisible === 'brand-performance' && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 w-64 z-50 pointer-events-none">
                      {tabTooltips['brand-performance']}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center self-stretch">
              <div className="h-[70px] w-px bg-[#cbd1d7]"></div>
            </div>

            {/* Tab 3 - Retailer Opportunity Matrix */}
            <div 
              className={`flex flex-col gap-3 flex-1 items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                activeTab === 'opportunity-matrix' ? 'border-b-[3px] border-[#195afe]' : ''
              } relative`}
              onClick={() => setActiveTab('opportunity-matrix')}
            >
              <div className="flex flex-row gap-2 items-center justify-center p-0">
                <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Retailer Opportunity Matrix
                </div>
                <div className="relative">
                  <InformationCircleIcon 
                    className="w-4 h-4 text-[#6b7c8c] cursor-help hover:text-[#195afe]"
                    onMouseEnter={() => setTooltipVisible('opportunity-matrix')}
                    onMouseLeave={() => setTooltipVisible(null)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {tooltipVisible === 'opportunity-matrix' && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 w-64 z-50 pointer-events-none">
                      {tabTooltips['opportunity-matrix']}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center self-stretch">
              <div className="h-[70px] w-px bg-[#cbd1d7]"></div>
            </div>

            {/* Tab 4 - Brand Competitive landscape */}
            <div 
              className={`flex flex-col gap-3 flex-1 items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                activeTab === 'competitive-landscape' ? 'border-b-[3px] border-[#195afe]' : ''
              } relative`}
              onClick={() => setActiveTab('competitive-landscape')}
            >
              <div className="flex flex-row gap-2 items-center justify-center p-0">
                <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Brand Competitive landscape
                </div>
                <div className="relative">
                  <InformationCircleIcon 
                    className="w-4 h-4 text-[#6b7c8c] cursor-help hover:text-[#195afe]"
                    onMouseEnter={() => setTooltipVisible('competitive-landscape')}
                    onMouseLeave={() => setTooltipVisible(null)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {tooltipVisible === 'competitive-landscape' && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 w-64 z-50 pointer-events-none">
                      {tabTooltips['competitive-landscape']}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'brand-performance' && (
        <BrandShareTab
          selectedLegendHosts={selectedLegendHosts}
          legendRetailers={legendRetailers}
          maxRetailerSelections={maxRetailerSelections}
          onRetailerToggle={onRetailerToggle}
          onClearAll={onClearAll}
          onSelectAll={onSelectAll}
          formatSkus={formatSkus}
          isLegendItemDisabled={isLegendItemDisabled}
          seriesColorByRetailer={seriesColorByRetailer}
          getSeriesForRetailer={getSeriesForRetailer}
          hoveredDateIdx={hoveredDateIdx}
          setHoveredDateIdx={setHoveredDateIdx}
          setChartHoverPos={setChartHoverPos}
          dynamicInsight={dynamicInsight}
        />
      )}
      {activeTab === 'retailer-growth' && (
        <RetailerGrowthTab
          selectedLegendHosts={selectedLegendHosts}
          yAxisScale={yAxisScale}
          reversedSteps={reversedSteps}
          formatSkus={formatSkus}
          getSeriesForRetailer={getSeriesForRetailer}
          seriesColorByRetailer={seriesColorByRetailer}
          hoveredDateIdx={hoveredDateIdx}
          setHoveredDateIdx={setHoveredDateIdx}
          setChartHoverPos={setChartHoverPos}
          legendRetailers={legendRetailers}
          maxRetailerSelections={maxRetailerSelections}
          onRetailerToggle={onRetailerToggle}
          onClearAll={onClearAll}
          onSelectAll={onSelectAll}
          isLegendItemDisabled={isLegendItemDisabled}
          dynamicInsight={dynamicInsight}
        />
      )}
      {activeTab === 'opportunity-matrix' && (
        <OpportunityMatrixTab
          selectedLegendHosts={selectedLegendHosts}
          legendRetailers={legendRetailers}
          maxRetailerSelections={maxRetailerSelections}
          onRetailerToggle={onRetailerToggle}
          onClearAll={onClearAll}
          onSelectAll={onSelectAll}
          formatSkus={formatSkus}
          isLegendItemDisabled={isLegendItemDisabled}
          seriesColorByRetailer={seriesColorByRetailer}
        />
      )}
      {activeTab === 'competitive-landscape' && <CompetitiveLandscapeTab selectedBrandName={selectedBrandName} />}
    </div>
  );
};

export default MainChart;
