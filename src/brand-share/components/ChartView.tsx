import React from 'react';
import BrandLegendListbox from './BrandLegendListbox';
import InteractiveLineChart from './InteractiveLineChart';

interface ChartViewProps {
  brands: string[];
  selectedBrands: Set<string>;
  onBrandSelectionChange: (selected: Set<string>) => void;
  brandColorMap: Record<string, string>;
  metricIdx: number;
  chartData: any;
  metricKeys: readonly string[];
}

const ChartView: React.FC<ChartViewProps> = ({
  brands,
  selectedBrands,
  onBrandSelectionChange,
  brandColorMap,
  metricIdx,
  chartData,
  metricKeys,
}) => {
  return (
    <div className="flex gap-4 p-6">
      <InteractiveLineChart
        selectedBrands={selectedBrands}
        brandColorMap={brandColorMap}
        metricIdx={metricIdx}
        chartData={chartData}
        metricKeys={metricKeys}
      />
      <BrandLegendListbox
        brands={brands}
        selectedBrands={selectedBrands}
        onBrandSelectionChange={onBrandSelectionChange}
        brandColorMap={brandColorMap}
      />
    </div>
  );
};

export default ChartView;
