import React, { useEffect, useState } from 'react';

interface ToastProps {
  isVisible: boolean;
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  isVisible,
  message,
  onUndo,
  onClose,
  duration = 5000
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[10001]">
      <div className="bg-[#092540] rounded overflow-hidden relative">
        <div className="flex items-center gap-4 pl-4 pr-8 py-4">
          <div className="text-white text-[14px] leading-[20px] font-medium font-dm-sans">
            {message}
          </div>
          {onUndo && (
            <button
              className="p-1 text-[#195afe] text-[14px] leading-[20px] font-bold font-dm-sans hover:text-[#1448cc] transition-colors duration-150"
              onClick={onUndo}
            >
              Undo
            </button>
          )}
        </div>
        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-[5px] bg-[#b6bec6] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Toast;
