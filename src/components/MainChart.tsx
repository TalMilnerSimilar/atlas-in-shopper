import React, { useState, useEffect } from 'react';
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
  
  // Tab visibility states
  const [tabVisibility, setTabVisibility] = useState({
    'retailer-growth': true,
    'brand-performance': true,
    'opportunity-matrix': true,
    'competitive-landscape': true,
  });

  // Graph insights visibility state
  const [graphInsightsEnabled, setGraphInsightsEnabled] = useState(true);

  // Bubble sizes state
  const [bubbleSizesEnabled, setBubbleSizesEnabled] = useState(true);

  // Load saved states and listen for toggle events
  useEffect(() => {
    // Load initial states
    const loadTabState = (tabId: string, key: string) => {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : true;
    };

    setTabVisibility({
      'retailer-growth': loadTabState('retailer-growth', 'retailerGrowthTabEnabled'),
      'brand-performance': loadTabState('brand-performance', 'brandPerformanceTabEnabled'),
      'opportunity-matrix': loadTabState('opportunity-matrix', 'opportunityMatrixTabEnabled'),
      'competitive-landscape': loadTabState('competitive-landscape', 'competitiveLandscapeTabEnabled'),
    });

    // Load graph insights state
    const savedGraphInsights = localStorage.getItem('graphInsightsEnabled');
    if (savedGraphInsights !== null) {
      setGraphInsightsEnabled(JSON.parse(savedGraphInsights));
    }

    // Load bubble sizes state
    const savedBubbleSizes = localStorage.getItem('bubbleSizesEnabled');
    if (savedBubbleSizes !== null) {
      setBubbleSizesEnabled(JSON.parse(savedBubbleSizes));
    }

    // Listen for toggle events
    const handleGraphTabToggle = (event: CustomEvent) => {
      const { tabId, enabled } = event.detail;
      setTabVisibility(prev => {
        const newVisibility = {
          ...prev,
          [tabId]: enabled
        };

        // If the current active tab is being disabled, switch to the first available tab
        if (!enabled && activeTab === tabId) {
          const availableTabs = Object.entries(newVisibility).filter(([, visible]) => visible);
          if (availableTabs.length > 0) {
            setActiveTab(availableTabs[0][0]);
          }
        }

        return newVisibility;
      });
    };

    // Listen for insights toggle events
    const handleGraphInsightsToggle = (event: CustomEvent) => {
      setGraphInsightsEnabled(event.detail.enabled);
    };

    // Listen for bubble sizes toggle events
    const handleBubbleSizesToggle = (event: CustomEvent) => {
      setBubbleSizesEnabled(event.detail.enabled);
    };

    window.addEventListener('graphTabToggle', handleGraphTabToggle as EventListener);
    window.addEventListener('graphInsightsToggle', handleGraphInsightsToggle as EventListener);
    window.addEventListener('bubbleSizesToggle', handleBubbleSizesToggle as EventListener);
    
    return () => {
      window.removeEventListener('graphTabToggle', handleGraphTabToggle as EventListener);
      window.removeEventListener('graphInsightsToggle', handleGraphInsightsToggle as EventListener);
      window.removeEventListener('bubbleSizesToggle', handleBubbleSizesToggle as EventListener);
    };
  }, [activeTab, setActiveTab]);

  const tabTooltips = {
    'retailer-growth': 'Track how each retailer\'s views are trending over time. Shows absolute view counts and growth patterns.',
    'brand-performance': 'See what percentage of your brand each retailer represents. Shows relative market share distribution.',
    'opportunity-matrix': 'Identify which retailers offer the best growth opportunities based on demand vs. your current presence.',
    'competitive-landscape': 'Analyze head-to-head competition with other brands across different retailers.'
  };
      return (
      <div className={`bg-white border border-gray-200 rounded-lg mb-8 ${!graphInsightsEnabled ? 'h-[526px] flex flex-col' : ''}`}>
        {/* Tab Header */}
      <div className="flex flex-col items-start justify-start p-0 w-full">
        <div className="flex flex-row items-center justify-between p-0 w-full border-b border-[#e6e9ec]">
          <div className="flex flex-row w-full items-start justify-start min-h-px min-w-px p-0">
            {/* Render tabs dynamically with separators */}
            {[
              { id: 'retailer-growth', title: 'Retailer Growth Over Time' },
              { id: 'brand-performance', title: 'Retailers\' Share of the Brand' },
              { id: 'opportunity-matrix', title: 'Retailer Opportunity Matrix' },
              { id: 'competitive-landscape', title: 'Brand Competitive landscape' },
            ].filter(tab => tabVisibility[tab.id as keyof typeof tabVisibility]).map((tab, index, visibleTabs) => (
              <React.Fragment key={tab.id}>
                <div 
                  className={`flex flex-col gap-3 flex-1 items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                    activeTab === tab.id ? 'border-b-[3px] border-[#195afe]' : ''
                  } relative`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="flex flex-row gap-2 items-center justify-center p-0">
                    <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {tab.title}
                    </div>
                    <div className="relative">
                      <InformationCircleIcon 
                        className="w-4 h-4 text-[#6b7c8c] cursor-help hover:text-[#195afe]"
                        onMouseEnter={() => setTooltipVisible(tab.id)}
                        onMouseLeave={() => setTooltipVisible(null)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {tooltipVisible === tab.id && (
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 w-64 z-50 pointer-events-none">
                          {tabTooltips[tab.id as keyof typeof tabTooltips]}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Add separator if not the last visible tab */}
                {index < visibleTabs.length - 1 && (
                  <div className="flex items-center justify-center self-stretch">
                    <div className="h-[70px] w-px bg-[#cbd1d7]"></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className={!graphInsightsEnabled ? 'flex-1 flex flex-col overflow-hidden' : ''}>
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
            showInsights={graphInsightsEnabled}
            fixedHeight={!graphInsightsEnabled}
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
            showInsights={graphInsightsEnabled}
            fixedHeight={!graphInsightsEnabled}
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
            showInsights={graphInsightsEnabled}
            fixedHeight={!graphInsightsEnabled}
            uniformBubbles={!bubbleSizesEnabled}
          />
        )}
        {activeTab === 'competitive-landscape' && (
          <CompetitiveLandscapeTab 
            selectedBrandName={selectedBrandName}
            showInsights={graphInsightsEnabled}
            fixedHeight={!graphInsightsEnabled}
            uniformBubbles={!bubbleSizesEnabled}
          />
        )}
      </div>
    </div>
  );
};

export default MainChart;
