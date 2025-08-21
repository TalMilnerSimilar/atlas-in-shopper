import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// styles loaded globally via _app.tsx

interface BrandHeaderProps {
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ selectedDateRange, setSelectedDateRange }) => {
  const navigate = useNavigate();
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState(false);
  const [selectedCompareTo, setSelectedCompareTo] = useState('Year over Year');

  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const compareDropdownRef = useRef<HTMLDivElement>(null);

  const dateRangeOptions = [
    'Dec 2024 - Dec 2024',
    'Nov 2024 - Dec 2024',
    'Oct 2024 - Dec 2024',
    'Last 30 Days',
    'Last 90 Days',
    'Last 6 Months'
  ];

  const compareToOptions = [
    'Year over Year',
    'Previous Period',
    'Same Period Last Year',
    'Custom Range'
  ];

  const handleDateRangeSelect = (option: string) => {
    setSelectedDateRange(option);
    setIsDateDropdownOpen(false);
  };

  const handleCompareToSelect = (option: string) => {
    setSelectedCompareTo(option);
    setIsCompareDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
      if (compareDropdownRef.current && !compareDropdownRef.current.contains(event.target as Node)) {
        setIsCompareDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="shi-header">
      <div className="header-container">
        {/* Left side - Back control (icon + text) per Figma */}
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="back-icon-button"
            onClick={() => navigate('/reports')}
            aria-label="Back to all reports"
          >
            <img src="/icons/back icon.svg" alt="Back" className="w-6 h-6" />
          </button>
          <span className="text-[20px] font-medium leading-[28px] text-[#092540] select-none">Back To All Reports</span>
        </div>

        {/* Right side - Filters */}
        <div className="header-right">
          <div className="filters-container">
            <div className="filter-group">
              <span className="filter-label">For</span>
              <div className="dropdown-container" ref={dateDropdownRef}>
                <div
                  className="dropdown-header"
                  onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                >
                  <span className="dropdown-text">{selectedDateRange}</span>
                  <div className={`dropdown-icon ${isDateDropdownOpen ? 'rotated' : ''}`}>
                    <img src="/icons/chevron-down.svg" alt="Expand" />
                  </div>
                </div>
                {isDateDropdownOpen && (
                  <div className="dropdown-menu">
                    {dateRangeOptions.map((option) => (
                      <div
                        key={option}
                        className={`dropdown-item ${option === selectedDateRange ? 'selected' : ''}`}
                        onClick={() => handleDateRangeSelect(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Compared to</span>
              <div className="dropdown-container" ref={compareDropdownRef}>
                <div
                  className="dropdown-header"
                  onClick={() => setIsCompareDropdownOpen(!isCompareDropdownOpen)}
                >
                  <span className="dropdown-text">{selectedCompareTo}</span>
                  <div className={`dropdown-icon ${isCompareDropdownOpen ? 'rotated' : ''}`}>
                    <img src="/icons/chevron-down.svg" alt="Expand" />
                  </div>
                </div>
                {isCompareDropdownOpen && (
                  <div className="dropdown-menu">
                    {compareToOptions.map((option) => (
                      <div
                        key={option}
                        className={`dropdown-item ${option === selectedCompareTo ? 'selected' : ''}`}
                        onClick={() => handleCompareToSelect(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandHeader;