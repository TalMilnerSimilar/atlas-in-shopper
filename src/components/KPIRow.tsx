import React, { useState, useEffect } from 'react';
import TrafficShareCard from './KPICards/TrafficShareCard';
import LeadingRetailersCard from './KPICards/LeadingRetailersCard';
import BestRetailerCard from './KPICards/BestRetailerCard';

interface KPIRowProps {
  onNavigateToTab?: (tab: string) => void;
}

const KPIRow: React.FC<KPIRowProps> = ({ onNavigateToTab }) => {
  const [kpiLinksEnabled, setKpiLinksEnabled] = useState(true);

  useEffect(() => {
    // Load initial state
    const saved = localStorage.getItem('kpiLinksEnabled');
    if (saved !== null) {
      setKpiLinksEnabled(JSON.parse(saved));
    }

    // Listen for toggle events
    const handleKpiLinksToggle = (event: CustomEvent) => {
      setKpiLinksEnabled(event.detail.enabled);
    };

    window.addEventListener('kpiLinksToggle', handleKpiLinksToggle as EventListener);
    
    return () => {
      window.removeEventListener('kpiLinksToggle', handleKpiLinksToggle as EventListener);
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 mb-8 items-start">
      <TrafficShareCard 
        onNavigateToTab={kpiLinksEnabled ? onNavigateToTab : undefined} 
        fixedHeight={!kpiLinksEnabled}
      />
      <BestRetailerCard 
        onNavigateToTab={kpiLinksEnabled ? onNavigateToTab : undefined} 
        fixedHeight={!kpiLinksEnabled}
      />
      <LeadingRetailersCard 
        onNavigateToTab={kpiLinksEnabled ? onNavigateToTab : undefined} 
        fixedHeight={!kpiLinksEnabled}
      />
    </div>
  );
};

export default KPIRow;
