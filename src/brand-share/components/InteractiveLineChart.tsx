import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './CustomTooltip';

interface InteractiveLineChartProps {
  selectedBrands: Set<string>;
  brandColorMap: Record<string, string>;
  metricIdx: number;
  chartData: any;
  metricKeys: readonly string[];
}

const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  selectedBrands,
  brandColorMap,
  metricIdx,
  chartData,
  metricKeys,
}) => {
  const data = chartData[metricKeys[metricIdx]];

  // Calculate dynamic domain for Y-axis based on selected brands data
  const calculateDomain = () => {
    if (!data?.length || selectedBrands.size === 0) return [0, 100];
    
    let allValues: number[] = [];
    
    Array.from(selectedBrands).forEach(brand => {
      data.forEach((point: any) => {
        const value = point[brand];
        if (typeof value === 'number') {
          allValues.push(value);
        }
      });
    });
    
    if (allValues.length === 0) return [0, 100];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    // Calculate 10% buffer below minimum, rounded to nearest 0.5, but never go below 0
    const buffer = (max - min) * 0.1;
    const rawMin = min - buffer;
    const domainMin = Math.max(0, Math.floor(rawMin * 2) / 2);
    
    // Round maximum to nearest 0.5 for consistency
    const domainMax = Math.ceil(max * 2) / 2;
    
    return [domainMin, domainMax];
  };

  const domain = calculateDomain();

  return (
    <div className="flex-1 bg-white p-4 rounded-lg h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#B6BEC6', fontSize: 11, cursor: 'default' }} tickMargin={14} />
          <YAxis axisLine={false} tick={{ fill: '#B6BEC6', fontSize: 11, cursor: 'default' }} tickMargin={14} domain={domain} />
          <Tooltip content={<CustomTooltip brandColorMap={brandColorMap} />} />
          {Array.from(selectedBrands).map((brand) => (
            <Line
              key={brand}
              type="linear"
              dataKey={brand}
              stroke={brandColorMap[brand]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InteractiveLineChart;
