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
import { brandTrendData, metricColorMap } from '../data/brandTrendData';
import MetricTooltip from './MetricTooltip';

interface BrandTrendChartProps {
    selectedBrand: string;
    selectedMetrics: Set<string>;
}

const BrandTrendChart: React.FC<BrandTrendChartProps> = ({
  selectedBrand,
  selectedMetrics,
}) => {
  const data = brandTrendData[selectedBrand] || [];
  const metricsArray = Array.from(selectedMetrics);

  const tickStyle = { fill: '#B6BEC6', fontSize: 11 as const, cursor: 'default' as const };

  // Calculate dynamic domain for Y-axes based on data
  const calculateDomain = (metricKey?: string) => {
    if (!data.length) return [0, 100];
    
    const metricsToCheck = metricKey ? [metricKey] : metricsArray;
    let allValues: number[] = [];
    
    metricsToCheck.forEach(metric => {
      data.forEach(point => {
        const value = point[metric];
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

  const renderYAxes = () => {
    const count = metricsArray.length;
    if (count === 1) {
      const domain = calculateDomain(metricsArray[0]);
      return (
        <YAxis
          yAxisId={0 as any}
          orientation="left"
          axisLine={false}
          tick={tickStyle}
          tickMargin={14}
          domain={domain}
        />
      );
    }
    if (count === 2) {
      const leftDomain = calculateDomain(metricsArray[0]);
      const rightDomain = calculateDomain(metricsArray[1]);
      return (
        <>
          <YAxis
            yAxisId={0 as any}
            orientation="left"
            axisLine={false}
            tick={tickStyle}
            tickMargin={14}
            domain={leftDomain}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tick={tickStyle}
            tickMargin={14}
            domain={rightDomain}
          />
        </>
      );
    }
    // Keep a dedicated visible axis for grid ticks, but make labels white (invisible)
    const gridTickStyle = { fill: '#FFFFFF', fontSize: 11 as const, cursor: 'default' as const };
    const gridTicks = [0, 20, 40, 60, 80, 100];
    return (
      <>
        <YAxis
          yAxisId={0 as any}
          orientation="left"
          axisLine={false}
          tick={gridTickStyle}
          tickMargin={14}
          tickLine={false}
          domain={[0, 100]}
          ticks={gridTicks}
          allowDecimals={false}
        />
        {/* Hidden per-metric axes for independent scales with dynamic domains */}
        {metricsArray.map((m) => {
          const domain = calculateDomain(m);
          return (
            <YAxis 
              key={m} 
              yAxisId={m} 
              hide 
              axisLine={false} 
              domain={domain}
            />
          );
        })}
      </>
    );
  };

  const getAxisIdForMetric = (metric: string, index: number) => {
    const count = metricsArray.length;
    if (count === 1) return 0 as any; // default axis id
    if (count === 2) return index === 0 ? (0 as any) : 'right';
    return metric; // bind to hidden per-metric axis; grid uses visible axis id=0
  };

  // Calculate fixed horizontal line positions (5 lines equally spaced) - only for >2 metrics
  const chartHeight = 328;
  const lineCount = 5;
  const horizontalLinePositions = Array.from({ length: lineCount }, (_, i) => 
    (chartHeight * i) / (lineCount - 1)
  );

  const shouldUseFixedLines = metricsArray.length > 2;

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
          {/* Use fixed lines for >2 metrics, default grid for 1-2 metrics */}
          {shouldUseFixedLines ? (
            <CartesianGrid 
              vertical={false} 
              horizontal={true}
              horizontalPoints={horizontalLinePositions}
              stroke="#ccc"
            />
          ) : (
            <CartesianGrid vertical={false} stroke="#ccc" />
          )}
          {renderYAxes()}
          <XAxis dataKey="name" tick={{ fill: '#B6BEC6', fontSize: 11, cursor: 'default' }} tickMargin={14} />
          <Tooltip content={<MetricTooltip metricColorMap={metricColorMap} />} />
          {metricsArray.map((metric, idx) => (
            <Line
              key={metric}
              type="linear"
              dataKey={metric}
              stroke={metricColorMap[metric]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              yAxisId={getAxisIdForMetric(metric, idx)}
            />
          ))}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrandTrendChart;