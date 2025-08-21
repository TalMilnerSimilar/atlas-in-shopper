import React from 'react';

interface MetricTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  metricColorMap: Record<string, string>;
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({ active, payload, label, metricColorMap }) => {
  // Metric-centric charts also use percentage values (0..100) already
  
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px] max-w-[400px]">
      {/* Date */}
      <div className="mb-4">
        <span className="text-xs font-medium text-[#092540]">{label}</span>
      </div>

      {/* Metrics */}
      <div className="space-y-2">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: metricColorMap[item.dataKey] }}
              />
              <span className="text-xs text-[#3a5166]">{item.dataKey}</span>
            </div>
            <span className="text-xs font-bold text-[#092540] text-right tracking-[0.36px] w-[48px]">
              {`${Number(item.value ?? 0).toFixed(1)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricTooltip; 