import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface HeaderBrandsMultiSelectProps {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

const HeaderBrandsMultiSelect: React.FC<HeaderBrandsMultiSelectProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleDropdownToggle = () => {
    if (!open) {
      // Check viewport position before opening
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 320; // Approximate height of dropdown
        
        // Check if dropdown would overflow bottom of viewport
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    }
    setOpen(!open);
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (option: string) => {
    // Handle "All Brands" - special behavior
    if (option === 'All Brands') {
      // If "All Brands" is currently active, do nothing (can't uncheck by clicking)
      if (value.length === 1 && value.includes('All Brands')) {
        return;
      } else {
        // Switch to "All Brands" mode (uncheck everything else)
        onChange(['All Brands']);
      }
      return;
    }

    // Handle individual brand selection
    const newValue = value.filter(v => v !== 'All Brands');
    if (newValue.includes(option)) {
      const updatedValue = newValue.filter(v => v !== option);
      // If no individual selections remain, switch to "All Brands"
      if (updatedValue.length === 0) {
        onChange(['All Brands']);
      } else {
        onChange(updatedValue);
      }
    } else {
      // Remove "All Brands" when adding individual selections
      const valueWithoutAllBrands = value.filter(v => v !== 'All Brands');
      onChange([...valueWithoutAllBrands, option]);
    }
  };

  const displayValue = value.length === 0 ? 'Select brands...' : 
    (value.length === 1 && value.includes('All Brands')) ? 'All Brands' : 
    value.length === 1 ? value[0] : 
    value.length <= 3 ? value.join(', ') :
    `${value.length} brands selected`;

  return (
    <div className="relative" ref={ref}>
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-4 cursor-pointer" onClick={handleDropdownToggle}>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-sm text-gray-900">{displayValue}</p>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </div>
      {open && (
        <div className={`absolute left-0 right-0 bg-white border border-[#CBD1D7] rounded-[3px] shadow-[0px_3px_5px_rgba(42,62,82,0.12)] z-20 overflow-hidden w-[600px] outline outline-1 outline-[#CBD1D7] outline-offset-[-1px] ${
          dropdownPosition === 'bottom' ? 'mt-2' : 'mb-2 bottom-full'
        }`} style={{
          maxHeight: dropdownPosition === 'bottom' ? 280 : 280
        }}>
          {/* Search Bar */}
          <div className="h-10 relative w-full overflow-hidden">
            <div className="w-6 h-6 left-4 top-2 absolute">
              <svg className="w-6 h-6" fill="none" stroke="#B6BEC6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search or select brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[528px] left-12 top-[10px] absolute text-[#B6BEC6] text-[14px] font-normal leading-[20px] border-0 focus:outline-none focus:ring-0 bg-transparent placeholder-[#B6BEC6]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="w-px h-4 left-12 top-3 absolute">
              <div className="w-px h-4 left-0 top-0 absolute bg-[#3A5166]"></div>
            </div>
          </div>
          
          {/* Blue Separator */}
          <div className="px-[10px] py-0 bg-white overflow-hidden">
            <div className="h-px bg-[#3E74FE] w-full"></div>
          </div>
          
          {/* Options List */}
          <div className="px-px py-0 max-h-64 overflow-auto">
            {/* "All Brands" section */}
            {filteredOptions.filter(opt => opt === 'All Brands').map(opt => (
              <div 
                key={opt} 
                className="h-11 relative w-full bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-between px-4 py-3" 
                onClick={() => handleToggle(opt)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 relative">
                    {value.length === 1 && value.includes('All Brands') ? (
                      <div className="w-5 h-5 bg-[#3E74FE] rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-gray-300 rounded"></div>
                    )}
                  </div>
                  <div className="text-[#092540] text-[14px] font-normal leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {opt}
                  </div>
                </div>
              </div>
            ))}

            {/* Individual brands section header */}
            {filteredOptions.some(opt => opt !== 'All Brands') && (
              <div className="h-11 relative w-full bg-white flex items-center px-4 py-3">
                <div className="text-[#B6BEC6] text-[14px] font-medium leading-[20px] uppercase" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Individual brands
                </div>
              </div>
            )}

            {/* Individual brand options */}
            {filteredOptions.filter(opt => opt !== 'All Brands').map(opt => (
              <div 
                key={opt} 
                className="h-11 relative w-full bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-between px-4 py-3" 
                onClick={() => handleToggle(opt)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 relative">
                    {value.includes(opt) ? (
                      <div className="w-5 h-5 bg-[#3E74FE] rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-gray-300 rounded"></div>
                    )}
                  </div>
                  <div className="text-[#092540] text-[14px] font-normal leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {opt}
                  </div>
                </div>
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="h-11 relative w-full bg-white flex items-center px-4">
                <div className="text-[#B6BEC6] text-[14px] font-normal leading-[20px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  No brands found
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderBrandsMultiSelect;
