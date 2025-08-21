import React from 'react';
import LinkTile from './LinkTile';
import Tooltip from './Tooltip';

interface PromotionSectionProps {
  activeAnalysisTab: string;
  onNavigateToTab?: (tabName: string) => void;
}

export const PromotionSection: React.FC<PromotionSectionProps> = ({ activeAnalysisTab, onNavigateToTab }) => {
  const getPromotionContent = () => {
    switch (activeAnalysisTab) {
      case 'Brand Share Overview':
        return {
          title: "Dig deeper into what's moving your share",
          description: "Jump into focused views to see how shoppers find, choose, and buy your products—and pinpoint the levers to pull next.",
          links: ['Funnel Analysis', 'Brand Trend Analysis', 'Brand Sales Performance', 'Brand Search Optimization']
        };
      case 'Funnel Analysis':
        return {
          title: "Turn funnel insights into action",
          description: "Identify the steps that limit visibility or conversion, then jump to the tools that move the numbers—and measure the business impact.",
          links: ['Brand Share Overview', 'Brand Trend Analysis', 'Brand Sales Performance', 'Brand Search Optimization']
        };
      case 'Brand Trend Analysis':
        return {
          title: "Act on emerging share trends",
          description: "Spot inflection points, then jump straight to the views that explain why they happened—and what to do next.",
          links: ['Brand Share Overview', 'Funnel Analysis', 'Brand Sales Performance', 'Brand Search Optimization']
        };
      default:
        return {
          title: "Dig deeper into what's moving your share",
          description: "Jump into focused views to see how shoppers find, choose, and buy your products—and pinpoint the levers to pull next.",
          links: ['Amazon Funnel', 'Trend Analysis', 'Brand Sales Performance', 'Brand Search Optimization']
        };
    }
  };

  const { title, description, links } = getPromotionContent();

  return (
    <div className="bg-white border border-blue-600 rounded-lg p-6">
      <div className="flex items-center gap-6 mb-6">
        {/* Icon */}
        <Tooltip content="Discover additional insights and analysis tools">
          <div className="w-12 h-12 flex items-center justify-center">
              <img src="/icons/Group 131.svg" alt="Promotion Icon" className="w-full h-full" />
            </div>
        </Tooltip>

        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      </div>

      {/* Action Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {links.map((link, index) => {
          const getTabName = (linkText: string) => {
            switch (linkText) {
              case 'Brand Share Overview':
                return 'Brand Share Overview';
              case 'Funnel Analysis':
                return 'Funnel Analysis';
              case 'Brand Trend Analysis':
                return 'Brand Trend Analysis';
              default:
                return null;
            }
          };

          const tabName = getTabName(link);
          const handleClick = tabName && onNavigateToTab ? () => onNavigateToTab(tabName) : undefined;

          return (
            <LinkTile 
              key={index} 
              text={link} 
              onClick={handleClick}
            />
          );
        })}
      </div>
    </div>
  );
}; 