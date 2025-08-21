import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.top - tooltipRect.height - 16; // 8px + 8px for arrow
        break;
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.bottom + 16; // 8px + 8px for arrow
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 16; // 8px + 8px for arrow
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        x = triggerRect.right + 16; // 8px + 8px for arrow
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        break;
    }

    // Ensure tooltip stays within viewport
    if (x < 8) x = 8;
    if (x + tooltipRect.width > viewportWidth - 8) {
      x = viewportWidth - tooltipRect.width - 8;
    }
    if (y < 8) y = 8;
    if (y + tooltipRect.height > viewportHeight - 8) {
      y = viewportHeight - tooltipRect.height - 8;
    }

    setTooltipPosition({ x, y });
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, position, updatePosition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Set a new timeout for 0.3 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    // Clear the timeout if mouse leaves before 0.5 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 -mb-2';
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-x-1/2 -mt-2';
      case 'left':
        return 'right-0 top-1/2 transform -translate-y-1/2 -mr-2';
      case 'right':
        return 'left-0 top-1/2 transform -translate-y-1/2 -ml-2';
      default:
        return 'bottom-0 left-1/2 transform -translate-x-1/2 -mb-2';
    }
  };

  const getArrowRotation = () => {
    switch (position) {
      case 'top':
        return 'rotate-0'; // Arrow points down (default triangle points down)
      case 'bottom':
        return 'rotate-180'; // Arrow points up
      case 'left':
        return 'rotate-90'; // Arrow points right
      case 'right':
        return '-rotate-90'; // Arrow points left
      default:
        return 'rotate-0'; // Arrow points down (default)
    }
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="relative">
            <div className="bg-[#092540] text-white text-xs font-normal leading-[16px] px-4 py-2 rounded shadow-[0px_3px_5px_0px_rgba(42,62,82,0.12)] max-w-[200px] whitespace-pre-wrap">
              {content}
            </div>
            {/* Arrow */}
            <div className={`absolute w-8 h-2 ${getArrowPosition()}`}>
              <svg 
                width="32" 
                height="8" 
                viewBox="0 0 32 8" 
                fill="none"
                className={getArrowRotation()}
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(42,62,82,0.12))' }}
              >
                <path d="M16 8L8 0H24L16 8Z" fill="#092540" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip; 