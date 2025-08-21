import React from 'react';
// styles loaded globally via _app.tsx
import Tooltip from './Tooltip';

interface AnalysisTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = ['Brand Share Overview', 'Funnel Analysis', 'Brand Trend Analysis'];

const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[#092540]">Analysis View:</span>
      <div className="flex gap-1">
        {TABS.map(tab => {
          const getTabTooltip = (tabName: string) => {
            const tooltips: Record<string, string> = {
              'Brand Share Overview': 'View overall brand performance and market share',
              'Funnel Analysis': 'Analyze customer journey and conversion metrics',
              'Brand Trend Analysis': 'Track brand performance trends over time'
            };
            return tooltips[tabName] || 'Analysis view';
          };

          return (
            <Tooltip key={tab} content={getTabTooltip(tab)}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`analysis-tab-button ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisTabs;