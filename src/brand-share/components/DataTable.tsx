import React, { useState, useEffect, useMemo } from 'react';
import Button from './Button';
import ViewSwitcher from './ViewSwitcher';
import ChartView from './ChartView';
import unifiedBrands from '../data/unifiedBrands';
import {
  funnelMetricKeys,
  overviewMetricKeys,
  metricLabelMap,
  type MetricKey,
} from '../data/unifiedBrandData';
import Tooltip from './Tooltip';

// competitor brands (Nike + 4 comps) kept as UX constant
const competitorBrands = ['Adidas', 'New Balance', 'Hoka', 'Asics'];

// Function to calculate current values from unified JSON
const calculateCurrentValues = (metricIdx: number, metricKeys: readonly MetricKey[]) => {
  const currentMetricKey = metricKeys[metricIdx];
  const brandNames = Object.keys(unifiedBrands) as string[];

  return brandNames.map((brandName) => {
    const metric = (unifiedBrands as any)[brandName]?.[currentMetricKey] || {};
    const numericValue: number = metric.value ?? 0;
    const shareDecimal: number = metric.share ?? 0; // 0..1
    const changeDecimal: number = metric.change ?? 0; // 0..1 delta

    // Format value with K/M and add $ for revenue
    const isRevenue = currentMetricKey === 'revenue';
    const prefix = isRevenue ? '$' : '';
    let formattedValue: string;
    if (numericValue >= 1_000_000) {
      formattedValue = `${prefix}${(numericValue / 1_000_000).toFixed(1)}M`;
    } else if (numericValue >= 1_000) {
      formattedValue = `${prefix}${(numericValue / 1_000).toFixed(1)}K`;
    } else {
      formattedValue = `${prefix}${numericValue}`;
    }

    const shareFormatted = `${(shareDecimal * 100).toFixed(1)}%`;
    const changePP = changeDecimal * 100; // percentage points
    const changeFormatted = `${changePP >= 0 ? '+' : ''}${changePP.toFixed(1)} PP`;
    const isPositive = changeDecimal >= 0;

    return {
      brand: brandName,
      [currentMetricKey]: formattedValue,
      share: shareFormatted,
      change: changeFormatted,
      isPositive,
    } as any;
  });
};

type SortKey = MetricKey | 'share' | 'brand' | 'change';

const brandColors = [
  '#3E74FE', '#FF7A1A', '#00CA9A', '#FFB800', '#A020F0', '#FF69B4', '#008080', '#DC143C',
];

const brandColorMap = (Object.keys(unifiedBrands) as string[]).reduce((acc, brand, index) => {
  acc[brand] = brandColors[index % brandColors.length];
  return acc;
}, {} as Record<string, string>);

const parseNumber = (val: string) => {
  if (typeof val !== 'string') return Number(val) || 0;
  const cleanVal = val.replace('$', '');
  if (cleanVal.includes('M')) return parseFloat(cleanVal) * 1000000;
  if (cleanVal.includes('K')) return parseFloat(cleanVal) * 1000;
  if (cleanVal.includes('%')) return parseFloat(cleanVal);
  return parseFloat(cleanVal) || 0;
};

const monthOrder = ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const generateSparkline = (brandName: string, currentMetricKey: MetricKey) => {
  const series = (unifiedBrands as any)[brandName]?.[currentMetricKey]?.shareOverTime || {};
  const values: number[] = monthOrder.map((m) => ((series[m] ?? 0) * 100));
  const max = Math.max(...values);
  const min = Math.min(...values);

  const points = values.map((val: number, i: number) => {
    const x = i * (100 / (values.length - 1));
    const y = 15 - (11 * ((val - min) / (max - min || 1)));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return points;
};

// Build chart series map (metric -> [{ name, BrandA, BrandB, ... }]) from JSON shareOverTime
const buildCrossBrandSeriesMap = (keys: readonly MetricKey[]) => {
  const brandNames = Object.keys(unifiedBrands) as string[];
  const chartData: Record<string, Array<Record<string, number | string>>> = {};
  for (const k of keys) {
    chartData[k] = monthOrder.map((m) => {
      const row: Record<string, number | string> = { name: m };
      for (const b of brandNames) {
        const share = (unifiedBrands as any)[b]?.[k]?.shareOverTime?.[m] ?? 0;
        row[b] = Number(share) * 100;
      }
      return row;
    });
  }
  return chartData;
};

interface DataTableProps {
  activeAnalysisTab: string;
  onAnalyzeBrand: (brandName: string, metrics: string[]) => void;
}

const DataTable: React.FC<DataTableProps> = ({ activeAnalysisTab, onAnalyzeBrand }) => {
  const isFunnelAnalysis = activeAnalysisTab === 'Funnel Analysis';

  const getMetricTooltip = (metric: string) => {
    const tooltips: Record<string, string> = {
      'Product Views': 'Track customer interest and discovery - higher views mean more potential customers finding your products',
      'Units Sold': 'Monitor actual sales performance - higher units mean stronger market demand and revenue growth',
      'Revenue': 'Measure financial success and market position - higher revenue means better profitability and competitive strength',
      'Branded Search Volume': 'Gauge brand awareness and customer intent - higher volume means stronger brand recognition and customer loyalty',
      'Search Visibility': 'Assess organic reach and discoverability - higher visibility means more free traffic and reduced ad costs',
      'Share of Paid Clicks': 'Evaluate ad effectiveness and market capture - higher share means better ROI on advertising spend',
      'Share of Total Clicks': 'Measure overall search dominance - higher share means you\'re winning both organic and paid search battles'
    };
    return tooltips[metric] || 'Metric information';
  };

  const [isTableView, setIsTableView] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set(['Nike', ...competitorBrands]));

  const [metricIdx, setMetricIdx] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const { metricKeys, metricLabels, chartData: currentChartData } = useMemo(() => {
    if (isFunnelAnalysis) {
      return {
        metricKeys: funnelMetricKeys,
        metricLabels: funnelMetricKeys.map((k) => metricLabelMap[k]),
        chartData: buildCrossBrandSeriesMap(funnelMetricKeys),
      };
    }
    return {
      metricKeys: overviewMetricKeys,
      metricLabels: overviewMetricKeys.map((k) => metricLabelMap[k]),
      chartData: buildCrossBrandSeriesMap(overviewMetricKeys),
    };
  }, [isFunnelAnalysis]);

  useEffect(() => {
    setMetricIdx(0);
  }, [activeAnalysisTab]);

  const rowsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  const dynamicData = useMemo(() => calculateCurrentValues(metricIdx, metricKeys), [metricIdx, metricKeys]);
  
  const sortedData = useMemo(() => {
    const myBrand = (dynamicData as any[]).find((r) => r.brand === 'Nike');
    const others = (dynamicData as any[]).filter((r) => r.brand !== 'Nike');

    const sortedOthers = sortKey
      ? [...others].sort((a, b) => {
          if (sortKey === 'brand') {
            return sortAsc
              ? a.brand.localeCompare(b.brand)
              : b.brand.localeCompare(a.brand);
          }
           const aVal = parseNumber((a as any)[sortKey]);
           const bVal = parseNumber((b as any)[sortKey]);
          return sortAsc ? aVal - bVal : bVal - aVal;
        })
      : others;

    return myBrand ? [myBrand, ...sortedOthers] : sortedOthers;
  }, [dynamicData, sortKey, sortAsc]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  const sparkPointsArr = useMemo(() => (sortedData as any[]).map(row => generateSparkline(row.brand, metricKeys[metricIdx])), [sortedData, metricIdx, metricKeys]);

  const handleCompareClick = (brandName: string) => {
    setIsTableView(false);
    setSelectedBrands(new Set(['Nike', brandName]));
  };

  const clampPage = (p: number) => {
    if (isNaN(p) || p < 1) return 1;
    if (p > totalPages) return totalPages;
    return p;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md" style={{ marginTop: activeAnalysisTab === 'Brand Share Overview' ? '0px' : undefined }}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium text-gray-900">Overtime View</h2>
          <Tooltip content="View your brand performance over time with detailed metrics and trends">
          <img src="/icons/info-icon.svg" alt="Info" className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <ViewSwitcher isTableView={isTableView} setIsTableView={setIsTableView} />
      </div>

      <div className="flex border-b border-gray-200 select-none">
        {metricLabels.map((label, idx) => {
          const isActive = metricIdx === idx;
          return (
            <div
              key={label}
              onClick={() => setMetricIdx(idx)}
              className={`flex-1 p-6 flex items-center justify-center gap-2 cursor-pointer border-r border-gray-200 ${
                isActive ? 'border-b-[3px]' : ''
              }`}
              style={isActive ? { borderBottomColor: '#195afe', color: '#195afe' } : undefined}
            >
              <span className="text-base">{label}</span>
              <Tooltip content={getMetricTooltip(label)}>
              <img src="/icons/info-icon.svg" alt="Info" className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
          );
        })}
      </div>

      {isTableView ? (
        <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-medium text-gray-600">
              <th
                    className="text-left p-4 cursor-pointer text-[#3A5166] border-r border-gray-200"
                onClick={() => {
                  setSortKey('brand');
                  setSortAsc(sortKey === 'brand' ? !sortAsc : true);
                }}
              >
                    <Tooltip content="Click to sort by brand name">
                <div className="flex items-center gap-1">
                  <span>Brand</span>
                  {sortKey === 'brand' && (
                    <img
                      src={sortAsc ? '/icons/chevron-up.svg' : '/icons/chevron-down.svg'}
                      className="w-3 h-3 text-[#4D87F7]"
                      alt="sort"
                    />
                  )}
                </div>
                    </Tooltip>
              </th>
              <th
                    className="text-left p-4 cursor-pointer text-[#3A5166] border-r border-gray-200"
                onClick={() => {
                  const key = metricKeys[metricIdx] as SortKey;
                  setSortKey(key);
                  setSortAsc(sortKey === key ? !sortAsc : true);
                }}
              >
                    <Tooltip content={`Click to sort by ${metricLabels[metricIdx].toLowerCase()}`}>
                <div className="flex items-center gap-1">
                  <span>{metricLabels[metricIdx]}</span>
                  {sortKey === metricKeys[metricIdx] && (
                    <img
                      src={sortAsc ? '/icons/chevron-up.svg' : '/icons/chevron-down.svg'}
                      className="w-3 h-3 text-[#4D87F7]"
                      alt="sort"
                    />
                  )}
                </div>
                    </Tooltip>
              </th>
              <th
                className="text-left p-4 cursor-pointer text-[#3A5166]"
                onClick={() => {
                  setSortKey('share');
                  setSortAsc(sortKey === 'share' ? !sortAsc : true);
                }}
              >
                    <Tooltip content="Click to sort by market share percentage">
                <div className="flex items-center gap-1">
                  <span>Share</span>
                  {sortKey === 'share' && (
                    <img
                      src={sortAsc ? '/icons/chevron-up.svg' : '/icons/chevron-down.svg'}
                      className="w-3 h-3 text-[#4D87F7]"
                      alt="sort"
                    />
                  )}
                </div>
                    </Tooltip>
              </th>
              <th
                className="text-left p-4 cursor-pointer text-[#3A5166]"
                onClick={() => {
                  setSortKey('change');
                  setSortAsc(sortKey === 'change' ? !sortAsc : true);
                }}
              >
                    <Tooltip content="Click to sort by change in performance">
                <div className="flex items-center gap-1">
                  <span>Change</span>
                  {sortKey === 'change' && (
                    <img
                      src={sortAsc ? '/icons/chevron-up.svg' : '/icons/chevron-down.svg'}
                      className="w-3 h-3 text-[#4D87F7]"
                      alt="sort"
                    />
                  )}
                </div>
                    </Tooltip>
                  </th>
                                      <th className="text-left p-4 border-r border-gray-200">
                      <Tooltip content="Visual representation of share trends over time">
                        Share over time
                      </Tooltip>
              </th>
                  <th className="text-left p-4 w-0">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((row, idx) => (
                  <tr 
                      key={idx} 
                      className={`border-b border-gray-200 transition-colors duration-150 ${hoveredRow === idx ? 'bg-primary-blue-light-hover' : ''}`}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                    <td className="p-4 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={'text-sm text-[#195afe] cursor-pointer'}>
                  {row.brand}
                    </span>
                    {row.brand === 'Nike' && (
                      <span className="px-2 py-0.5 bg-[#b6bec6] text-[#ffffff] text-[10px] font-bold tracking-[0.3px] rounded-[26px] leading-[12px] font-dm-sans">My Brand</span>
                    )}
                    {competitorBrands.includes(row.brand) && (
                      <span className="px-2 py-0.5 bg-[#e8eeff] text-[#6b7c8c] text-[10px] font-bold tracking-[0.3px] rounded-[26px] leading-[12px]">Competitor</span>
                    )}
                  </div>
                </td>
                    <td className="p-4 text-sm text-gray-600 border-r border-gray-200">{(row as any)[metricKeys[metricIdx]]}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 w-40">
                    <span className="text-sm text-gray-600 min-w-[40px]">{row.share}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-blue-600 rounded"
                        style={{ width: row.share }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[26px] text-[10px] font-bold tracking-[0.3px] leading-[12px] ${
                      row.isPositive ? 'bg-[#e6faf5] text-[#009688]' : 'bg-[#ffe6e6] text-[#bb3f3f]'
                    }`}
                  >
                    {row.change}
                  </div>
                </td>
                    <td className="p-4 border-r border-gray-200">
                  <svg width="100" height="20" viewBox="0 0 100 20" className="text-blue-600">
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      points={sparkPointsArr[sortedData.indexOf(row)]}
                    />
                  </svg>
                </td>
                    <td className="p-4 w-0">
                      <div className="flex items-center gap-2">
                        <Tooltip content={row.brand === 'Nike' ? 'Cannot compare your brand to itself' : 'Switch to graph view and compare this brand with Nike'}>
                          <Button 
                            variant={(hoveredRow === idx && row.brand !== 'Nike') ? 'primary' : 'ghost'}
                            disabled={row.brand === 'Nike'}
                            onClick={() => handleCompareClick(row.brand)}
                      >
                        Compare
                          </Button>
                        </Tooltip>
                        <Tooltip content="Get detailed insights and trend analysis for this brand across all metrics">
                          <Button
                            onClick={() => {
                              const clickedMetricLabel = metricLabels[metricIdx];
                              const baseMetrics = [
                                metricLabelMap.productViews,
                                metricLabelMap.unitsSold,
                                metricLabelMap.revenue,
                              ];
                              const metricsToSend = isFunnelAnalysis
                                ? Array.from(new Set([clickedMetricLabel, ...baseMetrics]))
                                : metricLabels;
                              onAnalyzeBrand(row.brand, metricsToSend);
                            }}
                          >
                            Analyze
                          </Button>
                        </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-200 select-none">
        <div className="flex items-center gap-2">
          <button
            className="w-6 h-6 flex items-center justify-center disabled:opacity-30"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <div className="flex -space-x-1">
            <img src="/icons/chevron-left.svg" alt="First" className="w-4 h-4" />
            <img src="/icons/chevron-left.svg" alt="First" className="w-4 h-4 -ml-1" />
          </div>
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center disabled:opacity-30"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <img src="/icons/chevron-left.svg" alt="Prev" className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setCurrentPage(clampPage(parseInt(pageInput, 10)));
              }
            }}
            className="px-1.5 py-0.5 border border-gray-200 rounded text-center"
            style={{ width: '30px' }}
          />
          <span>out of</span>
          <span>{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-6 h-6 flex items-center justify-center disabled:opacity-30"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <img src="/icons/chevron-right.svg" alt="Next" className="w-4 h-4" />
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center disabled:opacity-30"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <div className="flex -space-x-1">
            <img src="/icons/chevron-right.svg" alt="Last" className="w-4 h-4" />
            <img src="/icons/chevron-right.svg" alt="Last" className="w-4 h-4 -ml-1" />
          </div>
          </button>
        </div>
      </div>
        </>
      ) : (
        <ChartView 
          brands={Object.keys(unifiedBrands) as string[]} 
          selectedBrands={selectedBrands}
          onBrandSelectionChange={setSelectedBrands}
          brandColorMap={brandColorMap}
          metricIdx={metricIdx}
          chartData={currentChartData}
          metricKeys={metricKeys as readonly string[]}
        />
      )}
    </div>
  );
};

export default DataTable;