import React from 'react';
import { metrics, metricColorMap } from '../data/brandTrendData';
import Tooltip from './Tooltip';

interface MetricLegendListboxProps {
  selectedMetrics: Set<string>;
  onMetricSelectionChange: (selected: Set<string>) => void;
}

const MetricLegendListbox: React.FC<MetricLegendListboxProps> = ({
  selectedMetrics,
  onMetricSelectionChange,
}) => {
  const handleMetricToggle = (metricName: string) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(metricName)) {
      newSelected.delete(metricName);
    } else {
      newSelected.add(metricName);
    }
    onMetricSelectionChange(newSelected);
  };

  const handleSelectAllMetrics = () => {
    onMetricSelectionChange(new Set(metrics));
  };

  return (
    <div className="flex flex-col bg-white p-4 rounded-lg border border-border-gray w-64 h-[400px]">
      <div className="flex-grow overflow-y-auto space-y-2 mb-4" style={{ marginBottom: '0px' }}>
        {metrics.map((metric) => (
          <div key={metric} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedMetrics.has(metric)}
              onChange={() => handleMetricToggle(metric)}
              className="h-4 w-4"
              style={{ accentColor: metricColorMap[metric] }}
            />
            <span className="text-text-dark">
              {metric}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-border-gray flex justify-between items-center text-xs -mx-4 -mb-4 px-4 pb-4" style={{ paddingBottom: '8px' }}>
        <Tooltip content="Select all available metrics for comprehensive analysis">
          <button
            className={`font-bold ${selectedMetrics.size === metrics.length ? 'text-gray-400 cursor-not-allowed' : 'text-primary-blue'}`}
            onClick={handleSelectAllMetrics}
            disabled={selectedMetrics.size === metrics.length}
          >
            Select All Metrics
          </button>
        </Tooltip>
        <span className="text-text-secondary">{selectedMetrics.size}/{metrics.length}</span>
      </div>
    </div>
  );
};

export default MetricLegendListbox;