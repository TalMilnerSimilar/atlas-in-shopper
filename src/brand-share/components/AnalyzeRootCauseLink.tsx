import React from 'react';
import Tooltip from './Tooltip';

interface AnalyzeRootCauseLinkProps {
  onNavigateToFunnel: () => void;
  activeAnalysisTab: string;
}

const AnalyzeRootCauseLink: React.FC<AnalyzeRootCauseLinkProps> = ({ onNavigateToFunnel, activeAnalysisTab }) => {
  return (
    <div className="flex items-center justify-center py-4" style={{ marginTop: activeAnalysisTab === 'Brand Share Overview' ? '0px' : undefined }}>
      <div className="flex items-center w-full">
        {/* Left line */}
        <div className="flex-1 h-px bg-[#e6e9ec]"></div>
        
        {/* Button */}
        <div className="flex items-center px-1 py-1 mx-2">
          <Tooltip content="Jump into Funnel Analysis to identify what's driving this performance and where to act">
            <button
              onClick={onNavigateToFunnel}
              className="font-bold text-[#195afe] text-[14px] leading-[20px] hover:opacity-80 transition-opacity"
            >
              What’s driving this? Open Funnel Analysis
            </button>
          </Tooltip>
        </div>
        
        {/* Right line */}
        <div className="flex-1 h-px bg-[#e6e9ec]"></div>
      </div>
    </div>
  );
};

export default AnalyzeRootCauseLink; 