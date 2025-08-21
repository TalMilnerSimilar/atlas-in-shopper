import React from 'react';

interface BrandTooltipProps {
  hoveredBrand: string | null;
  brandData: Record<string, any>;
  tooltipPosition: { x: number; y: number };
}

const BrandTooltip: React.FC<BrandTooltipProps> = ({
  hoveredBrand,
  brandData,
  tooltipPosition,
}) => {
  if (!hoveredBrand || !brandData[hoveredBrand]) {
    return null;
  }

  return (
    <div 
      className="fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
      style={{ 
        left: tooltipPosition.x + 10, 
        top: tooltipPosition.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="text-sm font-bold text-gray-900 mb-1">{brandData[hoveredBrand].name}</div>
      <div className="text-xs text-gray-600 space-y-1">
        <div><span className="font-medium">Percentile:</span> {brandData[hoveredBrand].percentile}th</div>
        <div><span className="font-medium">Rank:</span> {brandData[hoveredBrand].rank} of {brandData[hoveredBrand].total}</div>
        <div><span className="font-medium">Status:</span> {brandData[hoveredBrand].status}</div>
        <div><span className="font-medium">Views:</span> {brandData[hoveredBrand].views}</div>
      </div>
    </div>
  );
};

export default BrandTooltip;
