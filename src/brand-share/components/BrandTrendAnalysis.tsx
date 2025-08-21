import React, { useState, useRef, useEffect } from 'react';
import unifiedBrands from '../data/unifiedBrands';
import BrandTrendChart from './BrandTrendChart';
import MetricLegendListbox from './MetricLegendListbox';
import { metrics } from '../data/brandTrendData';
import Tooltip from './Tooltip';
import '../components/BrandHeader.css';

interface BrandTrendAnalysisProps {
  selectedBrandProp: string | null;
  selectedMetricsProp?: string[];
}

const BrandTrendAnalysis: React.FC<BrandTrendAnalysisProps> = ({ selectedBrandProp, selectedMetricsProp }) => {
  const [selectedBrand, setSelectedBrand] = useState<string>(selectedBrandProp || 'Nike');
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    selectedMetricsProp && selectedMetricsProp.length > 0
      ? new Set(selectedMetricsProp)
      : new Set(metrics)
  );
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setIsBrandDropdownOpen(false);
  };

  // Keep internal state in sync when parent passes new props
  useEffect(() => {
    if (selectedBrandProp) {
      setSelectedBrand(selectedBrandProp);
    }
  }, [selectedBrandProp]);

  useEffect(() => {
    if (selectedMetricsProp && selectedMetricsProp.length > 0) {
      setSelectedMetrics(new Set(selectedMetricsProp));
    }
  }, [selectedMetricsProp]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Chart container */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-medium text-gray-900">My Brand Funnel</h2>
                <Tooltip content="Analyze your brand's performance across all metrics over time">
                  <img src="/icons/info-icon.svg" alt="Info" className="w-4 h-4 text-gray-400" />
                </Tooltip>
                <div className="flex items-center gap-2">
                    <span className="filter-label">For</span>
                    <div className="dropdown-container" ref={dropdownRef}>
                        <div 
                            className="dropdown-header"
                            onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                        >
                            <span className="dropdown-text">{selectedBrand}</span>
                            <div className={`dropdown-icon ${isBrandDropdownOpen ? 'rotated' : ''}`}>
                                <img src="/icons/chevron-down.svg" alt="Expand" />
                            </div>
                        </div>
                        {isBrandDropdownOpen && (
                            <div className="dropdown-menu">
                                {/* My Brand Section */}
                                <div className="dropdown-section">
                                    <div className="dropdown-section-header">My Brand</div>
                                    <div
                                        className={`dropdown-item ${selectedBrand === 'Nike' ? 'selected' : ''}`}
                                        onClick={() => handleBrandSelect('Nike')}
                                    >
                                        Nike
                                    </div>
                                </div>
                                
                                {/* Competitors Section */}
                                <div className="dropdown-section">
                                    <div className="dropdown-section-header">Competitors</div>
                                    {['Adidas', 'New Balance', 'Hoka', 'Asics'].map((brand) => (
                                        <div
                                            key={brand}
                                            className={`dropdown-item ${brand === selectedBrand ? 'selected' : ''}`}
                                            onClick={() => handleBrandSelect(brand)}
                                        >
                                            {brand}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Other Brands Section */}
                                <div className="dropdown-section">
                                    <div className="dropdown-section-header">Other Brands</div>
                                    {(Object.keys(unifiedBrands) as string[])
                                        .filter(brand => 
                                            brand !== 'Nike' && 
                                            !['Adidas', 'New Balance', 'Hoka', 'Asics'].includes(brand)
                                        )
                                        .sort((a, b) => a.localeCompare(b))
                                        .map((brand) => (
                                            <div
                                                key={brand}
                                                className={`dropdown-item ${brand === selectedBrand ? 'selected' : ''}`}
                                                onClick={() => handleBrandSelect(brand)}
                                            >
                                                {brand}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex gap-4 p-6">
          <BrandTrendChart selectedBrand={selectedBrand} selectedMetrics={selectedMetrics} />
          <MetricLegendListbox selectedMetrics={selectedMetrics} onMetricSelectionChange={setSelectedMetrics} />
        </div>
      </div>
    </div>
  );
};

export default BrandTrendAnalysis;