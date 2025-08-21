// src/components/RetailerOpportunityMatrix.tsx
import React, { useMemo, useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label, ReferenceArea
} from 'recharts';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

import {
  RetailerNode, OppConfig, scoreRetailers, CompareMode, abbr
} from '../analytics/opportunity';

export default function RetailerOpportunityMatrix({
  data,
  mode = 'pop',
  config,
  colorByRetailer,
  quadrantTitles,
  xAxisLabel,
  yAxisLabel,
  yValueLabel,
  xValueLabel,
  yDomain,
  yTickFormatter,
  xAxisTooltip,
  yAxisTooltip,
  bubbleSizeRange,
}: {
  data: RetailerNode[];
  mode?: CompareMode;
  config?: OppConfig;
  colorByRetailer: Record<string, string>;
  quadrantTitles?: { topLeft?: string; topRight?: string; bottomLeft?: string; bottomRight?: string };
  xAxisLabel?: string;
  yAxisLabel?: string;
  yValueLabel?: string;
  xValueLabel?: string;
  yDomain?: [number, number];
  yTickFormatter?: (v: number) => string;
  xAxisTooltip?: string;
  yAxisTooltip?: string;
  bubbleSizeRange?: [number, number];
}) {
  const { scored } = useMemo(() => scoreRetailers(data, config), [data, config]);

  // Bubble size domain - high contrast scaling
  const zValues = scored.map(d => d.brand_views_weekly || 0).filter(v => v > 0);
  const zMin = Math.min(...zValues) || 1;
  const zMax = Math.max(...zValues) || 1;
  
  // Bubble sizes (px area range) - can be provided by the tab
  const [bubbleMin, bubbleMax] = bubbleSizeRange ?? [300, 3000];
  // Dynamic X-axis: compute min and max from actual data
  const xValues = scored.map(d => d.demand_weekly || 0).filter(v => v > 0);
  const xMinRaw = Math.min(...xValues) || 0;
  const xMaxRaw = Math.max(...xValues) || 1;
  
  // Add padding and round to nice values
  const xRange = xMaxRaw - xMinRaw;
  const xPadding = xRange * 0.1; // 10% padding on each side
  const xMinNice = Math.max(0, Math.floor((xMinRaw - xPadding) / 1000) * 1000);
  const xMaxNice = Math.ceil((xMaxRaw + xPadding) / 1000) * 1000;
  const xMid = (xMinNice + xMaxNice) / 2;
  
  // Dynamic Y-axis: compute min and max from actual data (supports negative for head-to-head lead)
  const yValues = scored.map(d => (Number.isFinite(d.brand_share as number) ? (d.brand_share as number) : 0));
  const yMinRaw = yValues.length ? Math.min(...yValues) : -0.1;
  const yMaxRaw = yValues.length ? Math.max(...yValues) : 0.1;
  const yRange = yMaxRaw - yMinRaw;
  // Add padding; if range is zero (flat line), give a minimal band so quadrants/backgrounds render fully
  const yPadding = yRange === 0 ? Math.max(0.05, Math.abs(yMaxRaw) * 0.1) : yRange * 0.1;
  const yMinNice = Math.floor((yMinRaw - yPadding) * 20) / 20; // Round to nearest 0.05 without clamping to 0
  const yMaxNice = Math.ceil((yMaxRaw + yPadding) * 20) / 20;  // Round to nearest 0.05 without clamping to 0
  const yDomainToUse: [number, number] = yDomain ?? [yMinNice, yMaxNice];
  const yMid = (yDomainToUse[0] + yDomainToUse[1]) / 2;

  const yTickFmt = yTickFormatter || ((v: number) => `${(v * 100).toFixed(0)}%`);

  const labels = {
    topLeft: 'Over-indexed',
    topRight: 'Performing',
    bottomLeft: 'Low priority',
    bottomRight: 'Opportunity',
    ...(quadrantTitles || {})
  };

  const [xTooltipVisible, setXTooltipVisible] = useState(false);
  const [yTooltipVisible, setYTooltipVisible] = useState(false);

  return (
    <div className="h-[420px] w-full relative">
      {/* Custom X-axis label with info icon */}
      {xAxisTooltip && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-auto">
          <span className="text-[11px] text-[#6b7c8c]" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {xAxisLabel || 'Category demand (views/week)'}
          </span>
          <div className="relative">
            <InformationCircleIcon 
              className="w-4 h-4 text-[#6b7c8c] cursor-help hover:text-[#195afe]"
              onMouseEnter={() => setXTooltipVisible(true)}
              onMouseLeave={() => setXTooltipVisible(false)}
            />
            {xTooltipVisible && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 w-80 z-50 pointer-events-none">
                {xAxisTooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Y-axis label with info icon */}
      {yAxisTooltip && (
        <>
          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 z-10 pointer-events-auto">
            <div className="flex items-center gap-1 -rotate-90 origin-center">
              <span className="text-[11px] text-[#3a5166]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {yAxisLabel || 'Brand presence (share)'}
              </span>
              <InformationCircleIcon 
                className="w-4 h-4 text-[#3a5166] cursor-help hover:text-[#195afe]"
                onMouseEnter={() => setYTooltipVisible(true)}
                onMouseLeave={() => setYTooltipVisible(false)}
              />
            </div>
          </div>
          
          {/* Y-axis tooltip - separate from rotated container */}
          {yTooltipVisible && (
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-3 py-2 max-w-xs z-50 pointer-events-none">
              {yAxisTooltip}
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </>
      )}

      <ResponsiveContainer>
        <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 48 }}>

          <XAxis
            type="number"
            dataKey="demand_weekly"
            name="Demand (total views)"
            tickFormatter={abbr}
            domain={[xMinNice, xMaxNice]}
            tick={{ fill: '#6b7c8c', fontSize: 11, fontFamily: 'Roboto, sans-serif' }}
            axisLine={{ stroke: '#cbd1d7' }}
            tickLine={{ stroke: '#cbd1d7' }}
            tickMargin={8}
          >
            {!xAxisTooltip && (
              <Label value={xAxisLabel || 'Category demand (views/week)'} position="insideBottom" dy={16} style={{ fill: '#6b7c8c', fontSize: '11px', fontFamily: 'Roboto, sans-serif' }}/>
            )}
          </XAxis>

          <YAxis
            type="number"
            dataKey="brand_share"
            name="Head-to-head lead"
            tickFormatter={yTickFmt}
            domain={yDomainToUse}
            tick={{ fill: '#3a5166', fontSize: 11, fontFamily: 'Roboto, sans-serif' }}
            axisLine={{ stroke: '#cbd1d7' }}
            tickLine={{ stroke: '#cbd1d7' }}
            width={56}
            tickMargin={6}
          >
            {!yAxisTooltip && (
              <Label value={yAxisLabel || 'Brand presence (share)'} angle={-90} position="insideLeft" dx={-8} style={{ fill: '#3a5166', fontSize: '11px', fontFamily: 'Roboto, sans-serif' }}/>
            )}
          </YAxis>

          <ZAxis type="number" dataKey="brand_views_weekly" range={[bubbleMin, bubbleMax]} domain={[zMin, zMax]} />

          {/* Quadrant background areas (cover entire quarter) */}
          <ReferenceArea x1={xMinNice} x2={xMid} y1={yMid} y2={yDomainToUse[1]} fill="#F7F7F8" fillOpacity={1} />
          <ReferenceArea x1={xMid} x2={xMaxNice} y1={yDomainToUse[0]} y2={yMid} fill="#F7F7F8" fillOpacity={1} />

          {/* Quadrant lines centered */}
          <ReferenceLine x={xMid} stroke="#cbd5e1" strokeDasharray="4 4" />
          <ReferenceLine y={yMid} stroke="#cbd5e1" strokeDasharray="4 4" />

          {/* Quadrant titles */}
          <text x="11%" y="8%" textAnchor="start" dominantBaseline="hanging" fill="#64748b" fontSize="12" fontFamily="Roboto, sans-serif" fontWeight="500">{labels.topLeft}</text>
          <text x="97%" y="8%" textAnchor="end" dominantBaseline="hanging" fill="#64748b" fontSize="12" fontFamily="Roboto, sans-serif" fontWeight="500">{labels.topRight}</text>
          <text x="11%" y="86%" textAnchor="start" dominantBaseline="text-after-edge" fill="#64748b" fontSize="12" fontFamily="Roboto, sans-serif" fontWeight="500">{labels.bottomLeft}</text>
          <text x="97%" y="86%" textAnchor="end" dominantBaseline="text-after-edge" fill="#64748b" fontSize="12" fontFamily="Roboto, sans-serif" fontWeight="500">{labels.bottomRight}</text>

          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(val, key, node: any) => {
              if (key === 'demand_weekly') return [abbr(val as number), xValueLabel || 'Demand (total views)'];
              if (key === 'brand_share') return [yTickFmt(val as number), yValueLabel || 'Brand share'];
              if (key === 'brand_views_weekly') return [abbr(val as number), 'Brand total views'];
              return [val as any, key as string];
            }}
            labelFormatter={() => '' }
            content={({ payload }) => {
              const p = payload && payload[0] && (payload[0].payload as any);
              if (!p) return null;
              const g = mode === 'yoy' ? p.demand_growth_yoy : p.demand_growth_pop;
              const sd = mode === 'yoy' ? p.brand_share_delta_yoy : p.brand_share_delta_pop;
              const dotColor = colorByRetailer[p.retailerName] || '#60a5fa';
              const skus = p.skus as number | undefined;
              return (
                <div className="rounded bg-white p-4 text-[12px] shadow-[0px_1px_8px_rgba(9,37,64,0.08),0px_5px_24px_rgba(9,37,64,0.08)] border border-[#E6E9EC] w-[300px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {/* Title */}
                  <div className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                    <div className="text-[#092540] font-medium leading-4">{p.retailerName}</div>
                  </div>
                  {skus !== undefined && (
                    <div className="text-[#3a5166] leading-4">{abbr(skus)} SKUs</div>
                  )}

                  {/* Legends two-column (grid to keep rows aligned when labels wrap) */}
                  <div className="mt-1 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 items-start">
                    <div className="text-[#3a5166] leading-4">Brand Total Views (Bubble size)</div>
                    <div className="text-[#092540] font-bold text-right leading-4">{abbr(p.brand_views_weekly)}</div>

                    <div className="text-[#3a5166] leading-4">{xValueLabel || 'Overlap demand'}</div>
                    <div className="text-[#092540] font-bold text-right leading-4">{abbr(p.demand_weekly)}</div>

                    <div className="text-[#3a5166] leading-4">{yValueLabel || 'Lead vs you'}</div>
                    <div className="text-[#092540] font-bold text-right leading-4">{yTickFmt(p.brand_share)}</div>

                    {p.shared_retailers_count !== undefined && (
                      <>
                        <div className="text-[#3a5166] leading-4">Shared Retailers</div>
                        <div className="text-[#092540] font-bold text-right leading-4">{p.shared_retailers_count}</div>
                      </>
                    )}
                  </div>
                </div>
              );
            }}
          />

          <Scatter
            data={scored}
            fill="#60a5fa"
            shape={(props: any) => {
              const { cx, cy } = props;
              const d = props.payload as RetailerNode;
              const fill = colorByRetailer[d.retailerName] || '#60a5fa';
              const r = Math.sqrt((props.size as number) / Math.PI);
              return <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.9} stroke="#334155" strokeOpacity={0.25} />;
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}


