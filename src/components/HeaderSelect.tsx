import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface HeaderSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const HeaderSelect: React.FC<HeaderSelectProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownAlignment, setDropdownAlignment] = useState<'left' | 'right'>('left');
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleToggle = () => {
    if (!open) {
      // Check viewport position before opening
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 320; // Approximate height of dropdown
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Check if dropdown would overflow bottom of viewport
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const viewportWidth = window.innerWidth;
        const dropdownWidth = 600; // Width of dropdown
        
        // Vertical positioning
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
        
        // Horizontal positioning
        if (rect.left + dropdownWidth > viewportWidth) {
          setDropdownAlignment('right');
        } else {
          setDropdownAlignment('left');
        }
        
        setElementRect(rect);
      }
    }
    setOpen(!open);
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-4 cursor-pointer" onClick={handleToggle}>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-sm text-gray-900">{value}</p>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </div>
                        {open && (
                    <div className={`absolute bg-white border border-[#CBD1D7] rounded-[3px] shadow-[0px_3px_5px_rgba(42,62,82,0.12)] z-20 overflow-hidden w-[600px] outline outline-1 outline-[#CBD1D7] outline-offset-[-1px] ${
                      dropdownPosition === 'bottom' ? 'mt-2' : 'mb-2 bottom-full'
                    } ${
                      dropdownAlignment === 'left' ? 'left-0' : 'right-0'
                                         }`} style={{
                       maxHeight: dropdownPosition === 'bottom' && elementRect
                         ? Math.min(320, window.innerHeight - elementRect.bottom - 20) 
                         : dropdownPosition === 'top' && elementRect
                         ? Math.min(320, elementRect.top - 20)
                         : 320
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
              placeholder="Search or select your category"
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
            {filteredOptions.map(opt => (
              <div 
                key={opt} 
                className={`h-11 relative w-full bg-white cursor-pointer ${opt === value ? 'bg-blue-50' : 'hover:bg-gray-50'}`} 
                onClick={() => { onChange(opt); setOpen(false); setSearchTerm(''); }}
              >
                <div className="left-4 top-3 absolute justify-start items-center gap-2 inline-flex">
                  <div className="text-[#092540] text-[14px] font-normal leading-[20px] word-wrap break-word" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {opt}
                  </div>
                </div>
                <div className="h-6 left-[472px] top-[10px] absolute justify-start items-center gap-1 inline-flex"></div>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="h-11 relative w-full bg-white flex items-center px-4">
                <div className="text-[#B6BEC6] text-[14px] font-normal leading-[20px] word-wrap break-word" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  No categories found
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSelect;
