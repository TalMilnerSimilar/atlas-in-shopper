import React from 'react';
import Tooltip from './Tooltip';

interface LinkTileProps {
  text: string;
  onClick?: () => void;
}

const LinkTile: React.FC<LinkTileProps> = ({ text, onClick }) => {
  const getBenefitTooltip = (linkText: string) => {
    const benefits: Record<string, string> = {
      'Funnel Analysis': 'Identify conversion bottlenecks and optimize your customer journey to increase sales',
      'Brand Trend Analysis': 'Spot emerging trends early and adjust your strategy before competitors do',
      'Brand Sales Performance': 'Track revenue growth and identify your most profitable product categories',
      'Brand Search Optimization': 'Improve your search visibility and capture more organic traffic'
    };
    return benefits[linkText] || `Navigate to ${linkText} analysis`;
  };
  return (
    <Tooltip content={getBenefitTooltip(text)}>
      <div
        className="
          bg-white border border-blue-600 rounded-lg p-3 flex items-center gap-2
          cursor-pointer
          transition-all duration-150
          hover:border-primary-blue-hover
          active:border-[#0235b6]
        "
        onClick={onClick}
      >
        <div className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <span className="text-xs text-gray-900">{text}</span>
      </div>
    </Tooltip>
  );
};

export default LinkTile;
