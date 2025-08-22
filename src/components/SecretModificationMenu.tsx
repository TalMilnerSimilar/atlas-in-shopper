import React, { useState, useEffect } from 'react';

interface ToggleItemProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  accentColor?: 'blue' | 'emerald' | 'purple' | 'orange' | 'green';
}

const ToggleItem: React.FC<ToggleItemProps> = ({ 
  id, label, description, checked, onChange, disabled = false, accentColor = 'blue' 
}) => {
  return (
    <div className={`group p-4 rounded border transition-all duration-200 max-w-[396px] ${
      disabled ? 'bg-[#F5F8FF]/50 opacity-60 border-[#E6E9EC]' : 'bg-[#F5F8FF] hover:bg-white border-[#E6E9EC] hover:border-[#195afe]/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <label 
            htmlFor={id}
            className={`block text-[14px] leading-[20px] font-medium cursor-pointer ${
              disabled ? 'text-[#6b7c8c]' : 'text-[#092540]'
            }`}
          >
            {label}
          </label>
          <p className={`text-[12px] leading-[16px] mt-1 ${disabled ? 'text-[#B6BEC6]' : 'text-[#6b7c8c]'}`}>
            {description}
          </p>
        </div>
        
        {/* Custom Toggle Switch */}
        <button
          type="button"
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#195afe]/20 ${
            disabled ? 'cursor-not-allowed bg-[#E6E9EC]' : `cursor-pointer ${checked ? 'bg-[#195afe]' : 'bg-[#E6E9EC]'}`
          }`}
          role="switch"
          aria-checked={checked}
          aria-labelledby={id}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

interface SecretModificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecretModificationMenu: React.FC<SecretModificationMenuProps> = ({ isOpen, onClose }) => {
  const [kpiLinksEnabled, setKpiLinksEnabled] = useState(true);
  const [marketPositionEnabled, setMarketPositionEnabled] = useState(true);
  const [marketPositionInsightEnabled, setMarketPositionInsightEnabled] = useState(true);
  
  // Graph tab states
  const [retailerGrowthTabEnabled, setRetailerGrowthTabEnabled] = useState(true);
  const [brandPerformanceTabEnabled, setBrandPerformanceTabEnabled] = useState(true);
  const [opportunityMatrixTabEnabled, setOpportunityMatrixTabEnabled] = useState(true);
  const [competitiveLandscapeTabEnabled, setCompetitiveLandscapeTabEnabled] = useState(true);
  
  // Graph insights state
  const [graphInsightsEnabled, setGraphInsightsEnabled] = useState(true);
  
  // Bubble sizes state
  const [bubbleSizesEnabled, setBubbleSizesEnabled] = useState(true);
  
  // Table KPIs state
  const [tableKPIsEnabled, setTableKPIsEnabled] = useState(true);
  
  // Table filters state
  const [tableFiltersEnabled, setTableFiltersEnabled] = useState(true);
  
  // Table aggregation states
  const [aggregateByBrandsEnabled, setAggregateByBrandsEnabled] = useState(true);
  const [aggregateByRetailersEnabled, setAggregateByRetailersEnabled] = useState(true);
  
  // Header controls state
  const [groupedByRegionEnabled, setGroupedByRegionEnabled] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    const savedKpiLinks = localStorage.getItem('kpiLinksEnabled');
    if (savedKpiLinks !== null) {
      setKpiLinksEnabled(JSON.parse(savedKpiLinks));
    }
    
    const savedMarketPosition = localStorage.getItem('marketPositionEnabled');
    if (savedMarketPosition !== null) {
      setMarketPositionEnabled(JSON.parse(savedMarketPosition));
    }
    
    const savedMarketPositionInsight = localStorage.getItem('marketPositionInsightEnabled');
    if (savedMarketPositionInsight !== null) {
      setMarketPositionInsightEnabled(JSON.parse(savedMarketPositionInsight));
    }

    // Load graph tab states
    const savedRetailerGrowth = localStorage.getItem('retailerGrowthTabEnabled');
    if (savedRetailerGrowth !== null) {
      setRetailerGrowthTabEnabled(JSON.parse(savedRetailerGrowth));
    }

    const savedBrandPerformance = localStorage.getItem('brandPerformanceTabEnabled');
    if (savedBrandPerformance !== null) {
      setBrandPerformanceTabEnabled(JSON.parse(savedBrandPerformance));
    }

    const savedOpportunityMatrix = localStorage.getItem('opportunityMatrixTabEnabled');
    if (savedOpportunityMatrix !== null) {
      setOpportunityMatrixTabEnabled(JSON.parse(savedOpportunityMatrix));
    }

    const savedCompetitiveLandscape = localStorage.getItem('competitiveLandscapeTabEnabled');
    if (savedCompetitiveLandscape !== null) {
      setCompetitiveLandscapeTabEnabled(JSON.parse(savedCompetitiveLandscape));
    }

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

    // Load table KPIs state
    const savedTableKPIs = localStorage.getItem('tableKPIsEnabled');
    if (savedTableKPIs !== null) {
      setTableKPIsEnabled(JSON.parse(savedTableKPIs));
    }

    // Load table filters state
    const savedTableFilters = localStorage.getItem('tableFiltersEnabled');
    if (savedTableFilters !== null) {
      setTableFiltersEnabled(JSON.parse(savedTableFilters));
    }

    // Load table aggregation states
    const savedAggregateByBrands = localStorage.getItem('aggregateByBrandsEnabled');
    if (savedAggregateByBrands !== null) {
      setAggregateByBrandsEnabled(JSON.parse(savedAggregateByBrands));
    }

    const savedAggregateByRetailers = localStorage.getItem('aggregateByRetailersEnabled');
    if (savedAggregateByRetailers !== null) {
      setAggregateByRetailersEnabled(JSON.parse(savedAggregateByRetailers));
    }

    // Load grouped by region state
    const savedGroupedByRegion = localStorage.getItem('groupedByRegionEnabled');
    if (savedGroupedByRegion !== null) {
      setGroupedByRegionEnabled(JSON.parse(savedGroupedByRegion));
    }
  }, []);

  const handleKpiLinksToggle = (enabled: boolean) => {
    setKpiLinksEnabled(enabled);
    localStorage.setItem('kpiLinksEnabled', JSON.stringify(enabled));
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('kpiLinksToggle', {
      detail: { enabled }
    }));
  };

  const handleMarketPositionToggle = (enabled: boolean) => {
    setMarketPositionEnabled(enabled);
    localStorage.setItem('marketPositionEnabled', JSON.stringify(enabled));
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('marketPositionToggle', {
      detail: { enabled }
    }));
  };

  const handleMarketPositionInsightToggle = (enabled: boolean) => {
    setMarketPositionInsightEnabled(enabled);
    localStorage.setItem('marketPositionInsightEnabled', JSON.stringify(enabled));
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('marketPositionInsightToggle', {
      detail: { enabled }
    }));
  };

  // Graph tab handlers
  const handleRetailerGrowthTabToggle = (enabled: boolean) => {
    setRetailerGrowthTabEnabled(enabled);
    localStorage.setItem('retailerGrowthTabEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('graphTabToggle', {
      detail: { tabId: 'retailer-growth', enabled }
    }));
  };

  const handleBrandPerformanceTabToggle = (enabled: boolean) => {
    setBrandPerformanceTabEnabled(enabled);
    localStorage.setItem('brandPerformanceTabEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('graphTabToggle', {
      detail: { tabId: 'brand-performance', enabled }
    }));
  };

  const handleOpportunityMatrixTabToggle = (enabled: boolean) => {
    setOpportunityMatrixTabEnabled(enabled);
    localStorage.setItem('opportunityMatrixTabEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('graphTabToggle', {
      detail: { tabId: 'opportunity-matrix', enabled }
    }));
  };

  const handleCompetitiveLandscapeTabToggle = (enabled: boolean) => {
    setCompetitiveLandscapeTabEnabled(enabled);
    localStorage.setItem('competitiveLandscapeTabEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('graphTabToggle', {
      detail: { tabId: 'competitive-landscape', enabled }
    }));
  };

  const handleGraphInsightsToggle = (enabled: boolean) => {
    setGraphInsightsEnabled(enabled);
    localStorage.setItem('graphInsightsEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('graphInsightsToggle', {
      detail: { enabled }
    }));
  };

  const handleBubbleSizesToggle = (enabled: boolean) => {
    setBubbleSizesEnabled(enabled);
    localStorage.setItem('bubbleSizesEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('bubbleSizesToggle', {
      detail: { enabled }
    }));
  };

  const handleTableKPIsToggle = (enabled: boolean) => {
    setTableKPIsEnabled(enabled);
    localStorage.setItem('tableKPIsEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('tableKPIsToggle', {
      detail: { enabled }
    }));
  };

  const handleTableFiltersToggle = (enabled: boolean) => {
    setTableFiltersEnabled(enabled);
    localStorage.setItem('tableFiltersEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('tableFiltersToggle', {
      detail: { enabled }
    }));
  };

  const handleAggregateByBrandsToggle = (enabled: boolean) => {
    setAggregateByBrandsEnabled(enabled);
    localStorage.setItem('aggregateByBrandsEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('aggregateTabToggle', {
      detail: { tabType: 'brands', enabled }
    }));
  };

  const handleAggregateByRetailersToggle = (enabled: boolean) => {
    setAggregateByRetailersEnabled(enabled);
    localStorage.setItem('aggregateByRetailersEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('aggregateTabToggle', {
      detail: { tabType: 'retailers', enabled }
    }));
  };

  const handleGroupedByRegionToggle = (enabled: boolean) => {
    setGroupedByRegionEnabled(enabled);
    localStorage.setItem('groupedByRegionEnabled', JSON.stringify(enabled));
    
    window.dispatchEvent(new CustomEvent('groupedByRegionToggle', {
      detail: { enabled }
    }));
  };

  const handleResetAll = () => {
    // Reset all states to their default values (true)
    setKpiLinksEnabled(true);
    setMarketPositionEnabled(true);
    setMarketPositionInsightEnabled(true);
    setRetailerGrowthTabEnabled(true);
    setBrandPerformanceTabEnabled(true);
    setOpportunityMatrixTabEnabled(true);
    setCompetitiveLandscapeTabEnabled(true);
    setGraphInsightsEnabled(true);
    setBubbleSizesEnabled(true);
    setTableKPIsEnabled(true);
    setTableFiltersEnabled(true);
    setAggregateByBrandsEnabled(true);
    setAggregateByRetailersEnabled(true);
    setGroupedByRegionEnabled(true);

    // Clear all localStorage
    localStorage.removeItem('kpiLinksEnabled');
    localStorage.removeItem('marketPositionEnabled');
    localStorage.removeItem('marketPositionInsightEnabled');
    localStorage.removeItem('retailerGrowthTabEnabled');
    localStorage.removeItem('brandPerformanceTabEnabled');
    localStorage.removeItem('opportunityMatrixTabEnabled');
    localStorage.removeItem('competitiveLandscapeTabEnabled');
    localStorage.removeItem('graphInsightsEnabled');
    localStorage.removeItem('bubbleSizesEnabled');
    localStorage.removeItem('tableKPIsEnabled');
    localStorage.removeItem('tableFiltersEnabled');
    localStorage.removeItem('aggregateByBrandsEnabled');
    localStorage.removeItem('aggregateByRetailersEnabled');
    localStorage.removeItem('groupedByRegionEnabled');

    // Dispatch events to notify all components
    window.dispatchEvent(new CustomEvent('kpiLinksToggle', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('marketPositionToggle', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('marketPositionInsightToggle', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('graphTabToggle', { detail: { tabId: 'retailer-growth', enabled: true } }));
    window.dispatchEvent(new CustomEvent('graphTabToggle', { detail: { tabId: 'brand-performance', enabled: true } }));
    window.dispatchEvent(new CustomEvent('graphTabToggle', { detail: { tabId: 'opportunity-matrix', enabled: true } }));
    window.dispatchEvent(new CustomEvent('graphTabToggle', { detail: { tabId: 'competitive-landscape', enabled: true } }));
    window.dispatchEvent(new CustomEvent('graphInsightsToggle', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('bubbleSizesToggle', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('tableKPIsToggle', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('tableFiltersToggle', { detail: { enabled: true } }));
    window.dispatchEvent(new CustomEvent('aggregateTabToggle', { detail: { tabType: 'brands', enabled: true } }));
    window.dispatchEvent(new CustomEvent('aggregateTabToggle', { detail: { tabType: 'retailers', enabled: true } }));
    window.dispatchEvent(new CustomEvent('groupedByRegionToggle', { detail: { enabled: true } }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#092540]/60"
      onClick={onClose}
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      <div 
        className="bg-white rounded-md shadow-xl w-[850px] max-h-[85vh] overflow-hidden border border-[#E6E9EC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#E6E9EC] p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#195afe] rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-[20px] leading-[28px] text-[#092540] font-medium">Page Controls</h2>
                <p className="text-[14px] leading-[20px] text-[#6b7c8c]">Customize dashboard display</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetAll}
                className="px-3 py-2 bg-[#F5F8FF] hover:bg-white border border-[#E6E9EC] hover:border-[#195afe]/20 text-[#092540] rounded text-[14px] font-medium transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 hover:bg-gray-50 rounded flex items-center justify-center transition-colors text-[#6b7c8c] hover:text-[#092540]"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <div className="space-y-4">
            
            {/* Header Controls Section */}
            <div className="border-b border-[#E6E9EC] pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#195afe] rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-[16px] leading-[22px] font-medium text-[#092540]">Page Header</h3>
              </div>
              
              <div className="space-y-2">
                <ToggleItem
                  id="grouped-by-region"
                  label="Grouped by Region"
                  description="Show regional grouping in the retailer selector"
                  checked={groupedByRegionEnabled}
                  onChange={handleGroupedByRegionToggle}
                />
              </div>
            </div>

            {/* KPI Section */}
            <div className="border-b border-[#E6E9EC] pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#195afe] rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-[16px] leading-[22px] font-medium text-[#092540]">KPI Controls</h3>
              </div>
              
              <div className="space-y-2">
                <ToggleItem
                  id="kpi-links"
                  label="KPI Links"
                  description="Enable or disable clickable links on KPI cards"
                  checked={kpiLinksEnabled}
                  onChange={handleKpiLinksToggle}
                />
              </div>
            </div>

            {/* Market Position Section */}
            <div className="border-b border-[#E6E9EC] pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#195afe] rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-[16px] leading-[22px] font-medium text-[#092540]">Market Position</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <ToggleItem
                  id="market-position"
                  label="Brand Market Position Tile"
                  description="Show or hide the entire market position chart"
                  checked={marketPositionEnabled}
                  onChange={handleMarketPositionToggle}
                />
                
                <ToggleItem
                  id="market-position-insight"
                  label="Market Position Insights"
                  description={`Show or hide the insight summary card ${!marketPositionEnabled ? '(requires tile to be enabled)' : ''}`}
                  checked={marketPositionInsightEnabled}
                  onChange={handleMarketPositionInsightToggle}
                  disabled={!marketPositionEnabled}
                />
              </div>
            </div>

            {/* Analytics Section */}
            <div className="border-b border-[#E6E9EC] pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#195afe] rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-[16px] leading-[22px] font-medium text-[#092540]">Analytics & Charts</h3>
              </div>
              
              <div className="space-y-3">
                                      <div className="mb-4">
                        <h4 className="text-[14px] leading-[20px] font-medium text-[#6b7c8c] mb-3 pl-4">Graph Tabs Visibility</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <ToggleItem
                            id="retailer-growth-tab"
                            label="Retailer Growth Over Time"
                            description="Show growth trends across retailers"
                            checked={retailerGrowthTabEnabled}
                            onChange={handleRetailerGrowthTabToggle}
                          />
                          
                          <ToggleItem
                            id="brand-performance-tab"
                            label="Retailers' Share of the Brand"
                            description="View market share distribution"
                            checked={brandPerformanceTabEnabled}
                            onChange={handleBrandPerformanceTabToggle}
                          />
                          
                          <ToggleItem
                            id="opportunity-matrix-tab"
                            label="Retailer Opportunity Matrix"
                            description="Identify growth opportunities"
                            checked={opportunityMatrixTabEnabled}
                            onChange={handleOpportunityMatrixTabToggle}
                          />
                          
                          <ToggleItem
                            id="competitive-landscape-tab"
                            label="Brand Competitive Landscape"
                            description="Analyze competitive positioning"
                            checked={competitiveLandscapeTabEnabled}
                            onChange={handleCompetitiveLandscapeTabToggle}
                          />
                        </div>
                      </div>
                
                <div className="border-t border-[#E6E9EC] pt-4">
                  <h4 className="text-[14px] leading-[20px] font-medium text-[#6b7c8c] mb-3 pl-4">Display Options</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <ToggleItem
                      id="graph-insights"
                      label="Graph Insights"
                      description="Show AI-powered insights across all charts"
                      checked={graphInsightsEnabled}
                      onChange={handleGraphInsightsToggle}
                    />
                    
                    <ToggleItem
                      id="bubble-sizes"
                      label="Variable Bubble Sizes"
                      description="Dynamic bubble sizing in matrix charts"
                      checked={bubbleSizesEnabled}
                      onChange={handleBubbleSizesToggle}
                    />
                  </div>
                                  </div>
                </div>
              </div>
  
              {/* Data Tables Section */}
              <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#195afe] rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V7a2 2 0 012-2h8a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V10z" />
                  </svg>
                </div>
                <h3 className="text-[16px] leading-[22px] font-medium text-[#092540]">Data Tables</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <ToggleItem
                  id="table-kpis"
                  label="Table KPIs"
                  description="Show or hide KPI metrics in the performance tables"
                  checked={tableKPIsEnabled}
                  onChange={handleTableKPIsToggle}
                />
                
                <ToggleItem
                  id="table-filters"
                  label="Table Filters"
                  description="Show or hide filter chips for data refinement"
                  checked={tableFiltersEnabled}
                  onChange={handleTableFiltersToggle}
                />
                
                <ToggleItem
                  id="aggregate-by-brands"
                  label="Aggregate by Brands"
                  description="Show table aggregation tab grouped by brands"
                  checked={aggregateByBrandsEnabled}
                  onChange={handleAggregateByBrandsToggle}
                />
                
                <ToggleItem
                  id="aggregate-by-retailers"
                  label="Aggregate by Retailers"
                  description="Show table aggregation tab grouped by retailers"
                  checked={aggregateByRetailersEnabled}
                  onChange={handleAggregateByRetailersToggle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretModificationMenu;
