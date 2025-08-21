import React from 'react';
import TrafficShareCard from './KPICards/TrafficShareCard';
import LeadingRetailersCard from './KPICards/LeadingRetailersCard';
import BestRetailerCard from './KPICards/BestRetailerCard';

interface KPIRowProps {
  onNavigateToTab?: (tab: string) => void;
}

const KPIRow: React.FC<KPIRowProps> = ({ onNavigateToTab }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8 items-start">
      <TrafficShareCard onNavigateToTab={onNavigateToTab} />
      <LeadingRetailersCard onNavigateToTab={onNavigateToTab} />
      <BestRetailerCard onNavigateToTab={onNavigateToTab} />
    </div>
  );
};

export default KPIRow;
