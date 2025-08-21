import React, { useState } from 'react';
import MetricTab from './MetricTab';

const MetricTabDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Sales');

  const demoTabs = [
    { id: 'Sales', name: 'Sales' },
    { id: 'Marketing', name: 'Marketing' },
    { id: 'Operations', name: 'Operations' },
    { id: 'Finance', name: 'Finance' }
  ];

  const handleTabToggle = (tabId: string, isActive: boolean) => {
    if (isActive) {
      setActiveTab(tabId);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md">
      <div className="flex border-b border-gray-200">
        {demoTabs.map((tab, index) => (
          <MetricTab
            key={tab.id}
            label={tab.name}
            isActive={activeTab === tab.id}
            onToggle={(isActive) => handleTabToggle(tab.id, isActive)}
            className={index === demoTabs.length - 1 ? '' : 'border-r border-gray-200'}
          />
        ))}
      </div>
      <div className="p-6">
        <div className="text-gray-600">
          {activeTab === 'Sales' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Sales Metrics</h3>
              <p>Sales performance metrics and KPIs will be displayed here.</p>
            </div>
          )}
          {activeTab === 'Marketing' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Marketing Metrics</h3>
              <p>Marketing campaign performance and ROI metrics will be displayed here.</p>
            </div>
          )}
          {activeTab === 'Operations' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Operations Metrics</h3>
              <p>Operational efficiency and process metrics will be displayed here.</p>
            </div>
          )}
          {activeTab === 'Finance' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Finance Metrics</h3>
              <p>Financial performance and budget metrics will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricTabDemo; 