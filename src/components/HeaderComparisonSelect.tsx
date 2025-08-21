import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ComparisonOption {
  main: string;
  sub: string;
}

interface HeaderComparisonSelectProps {
  label: string;
  value: string;
  options: ComparisonOption[];
  onChange: (value: string) => void;
}

const HeaderComparisonSelect: React.FC<HeaderComparisonSelectProps> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
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
        const dropdownHeight = 200; // Approximate height of dropdown
        const viewportWidth = window.innerWidth;
        const dropdownWidth = 300; // Width of dropdown
        
        // Check if dropdown would overflow bottom of viewport
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
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

  const selectedOption = options.find(opt => opt.main === value);

  return (
    <div className="relative" ref={ref}>
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-4 cursor-pointer" onClick={handleToggle}>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-sm text-gray-900" style={{ fontWeight: 400 }}>{selectedOption?.main || value}</p>
        </div>
        {open ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </div>
      {open && (
        <div className={`absolute bg-white border border-[#CBD1D7] rounded-[3px] shadow-[0px_3px_5px_rgba(42,62,82,0.12)] z-20 overflow-hidden w-[300px] outline outline-1 outline-[#CBD1D7] outline-offset-[-1px] ${
          dropdownPosition === 'bottom' ? 'mt-2' : 'mb-2 bottom-full'
        } ${
          dropdownAlignment === 'left' ? 'left-0' : 'right-0'
        }`} style={{
          maxHeight: dropdownPosition === 'bottom' && elementRect
            ? Math.min(200, window.innerHeight - elementRect.bottom - 20) 
            : dropdownPosition === 'top' && elementRect
            ? Math.min(200, elementRect.top - 20)
            : 200
        }}>
          {/* Options List */}
          <div className="py-1">
            {options.map(opt => (
              <div 
                key={opt.main} 
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                  opt.main === value ? 'bg-blue-50' : ''
                }`}
                onClick={() => { onChange(opt.main); setOpen(false); }}
              >
                <div className="text-sm font-medium text-gray-900">{opt.main}</div>
                <div className="text-xs text-gray-500 mt-1">{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderComparisonSelect;
