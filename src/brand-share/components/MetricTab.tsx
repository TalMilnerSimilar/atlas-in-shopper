import React, { useState } from 'react';

interface MetricTabProps {
  label: string;
  isActive?: boolean;
  onToggle?: (isActive: boolean) => void;
  className?: string;
}

const MetricTab: React.FC<MetricTabProps> = ({ 
  label, 
  isActive = false, 
  onToggle,
  className = ""
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (onToggle) {
      onToggle(!isActive);
    }
  };

  // Base styles
  const baseStyles = "flex-1 h-[70px] flex items-center justify-center border-r border-gray-200 cursor-pointer transition-all duration-200";
  
  // State-specific styles
  const getStateStyles = () => {
    if (isActive) {
      // On State
      if (isPressed) {
        return "bg-[rgba(25,90,254,0.05)] border-b-[3px] border-b-[#195afe]";
      }
      return "bg-[rgba(25,90,254,0.05)] border-b-[3px] border-b-[#195afe]";
    } else {
      // Off State
      if (isPressed) {
        return "bg-[rgba(25,90,254,0.05)] border-b border-b-[#e6e9ec]";
      }
      return "bg-white border-b border-b-[#e6e9ec] hover:bg-[rgba(25,90,254,0.05)]";
    }
  };

  return (
    <div 
      className={`${baseStyles} ${getStateStyles()} ${className}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div className="flex items-center gap-2">
        <span className="text-base text-gray-900 font-['DM_Sans']">
          {label}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
    </div>
  );
};

export default MetricTab; 