import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import DatePicker from './DatePicker';

interface DatePickerDropdownProps {
  value: string;
  onDateChange?: (startDate: Date, endDate: Date) => void;
}

const DatePickerDropdown: React.FC<DatePickerDropdownProps> = ({ value, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [dropdownAlignment, setDropdownAlignment] = useState<'left' | 'right'>('left');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      // Check viewport position before opening
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = 600; // Approximate height of date picker
        const dropdownWidth = 893; // Width of date picker from the component
        
        // Vertical positioning
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
        
        // Horizontal positioning
        const spaceRight = viewportWidth - rect.left;
        const spaceLeft = rect.right;
        
        if (spaceRight < dropdownWidth && spaceLeft > dropdownWidth) {
          setDropdownAlignment('right');
        } else {
          setDropdownAlignment('left');
        }
      }
    }
    setIsOpen(!isOpen);
  };

  const handleDateChange = (startDate: Date, endDate: Date) => {
    // Format the date range for display
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    };
    
    const newValue = `${formatDate(startDate)} - ${formatDate(endDate)}`;
    setSelectedValue(newValue);
    
    if (onDateChange) {
      onDateChange(startDate, endDate);
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Date Selector Button */}
      <div 
        className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-4 cursor-pointer"
        onClick={handleToggle}
      >
        <div>
          <p className="text-sm text-gray-900">{selectedValue}</p>
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Date Picker Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 ${
          dropdownPosition === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
        } ${
          dropdownAlignment === 'left' ? 'left-0' : 'right-0'
        }`}>
          <DatePicker 
            timeFrame="Month"
            showGranularity={true}
            onDateChange={handleDateChange}
            onApply={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default DatePickerDropdown;
