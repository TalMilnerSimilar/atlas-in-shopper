import React, { useEffect, useRef, useState } from 'react';
// styles loaded globally via _app.tsx

const SelectionHeader: React.FC = () => {
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('amazon.com');
  const domainDropdownRef = useRef<HTMLDivElement>(null);

  const domainOptions = [
    { label: 'amazon.com', flag: '/icons/us-flag.svg' },
    { label: 'amazon.co.uk', flag: '/icons/uk-flag.svg' },
    { label: 'amazon.de', flag: '/icons/de-flag.svg' },
    { label: 'amazon.fr', flag: '/icons/fr-flag.svg' },
    { label: 'amazon.it', flag: '/icons/it-flag.svg' },
    { label: 'amazon.es', flag: '/icons/es-flag.svg' },
    { label: 'amazon.ca', flag: '/icons/ca-flag.svg' },
    { label: 'amazon.com.mx', flag: '/icons/mx-flag.svg' },
    { label: 'amazon.co.jp', flag: '/icons/jp-flag.svg' },
    { label: 'amazon.com.au', flag: '/icons/au-flag.svg' },
    { label: 'amazon.in', flag: '/icons/in-flag.svg' },
  ];

  const handleDomainSelect = (value: string) => {
    setSelectedDomain(value);
    setIsDomainDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (domainDropdownRef.current && !domainDropdownRef.current.contains(event.target as Node)) {
        setIsDomainDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="shi-header">
      <div className="header-container">
        {/* Left side - Title only */}
        <div className="header-left" style={{ gap: 16, display: 'flex', alignItems: 'center' }}>
          <div className="brand-share-title">Cross Retail Analysis</div>
        </div>

        {/* Right side - Filters */}
        <div className="header-right">
          <div className="filters-container">
            <div className="filter-group">
              <span className="filter-label">For</span>
              <div className="dropdown-container">
                <div className="dropdown-header">
                  <span className="dropdown-text">Jun 2024 - Jul 2024</span>
                  <div className="dropdown-icon">
                    <img src="/icons/chevron-down.svg" alt="Expand" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="filter-group">
              <span className="filter-label">Compared to</span>
              <div className="dropdown-container">
                <div className="dropdown-header">
                  <span className="dropdown-text">Year over Year</span>
                  <div className="dropdown-icon">
                    <img src="/icons/chevron-down.svg" alt="Expand" />
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Category</span>
              <div className="dropdown-container">
                <div className="dropdown-header">
                  <span className="dropdown-text">Appliances &gt; Dishwashers</span>
                  <div className="dropdown-icon">
                    <img src="/icons/chevron-down.svg" alt="Expand" />
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Across</span>
              <div className="dropdown-container">
                <div className="dropdown-header">
                  <span className="dropdown-text">All Retailers</span>
                  <div className="dropdown-icon">
                    <img src="/icons/chevron-down.svg" alt="Expand" />
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">For my brand</span>
              <div className="dropdown-container">
                <div className="dropdown-header">
                  <span className="dropdown-text">Nike</span>
                  <div className="dropdown-icon">
                    <img src="/icons/chevron-down.svg" alt="Expand" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionHeader;


