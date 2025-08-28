import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';

interface LeadingRetailersCardProps {
  onNavigateToTab?: (tab: string) => void;
  fixedHeight?: boolean;
  dateRange?: string;
}

const LeadingRetailersCard: React.FC<LeadingRetailersCardProps> = ({ onNavigateToTab, fixedHeight, dateRange }) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [tooltip, setTooltip] = React.useState<{ index: number; x: number; y: number } | null>(null);

  // Data for the donut chart matching Figma design
  const chartData = [
    { title: 'Amazon.com', value: 24.8, color: '#3e74fe' },
    { title: 'Bestbuy.com', value: 20.2, color: '#ff7a1a' },
    { title: 'Walmart.com', value: 15.4, color: '#435993' },
    { title: 'Ebay.com', value: 9.8, color: '#00ca9a' },
    { title: 'Samsung.com', value: 9.1, color: '#ffb800' },
    { title: 'Others', value: 20.7, color: '#b6bec6' }
  ];

  const onLegendEnter = (title: string) => {
    const idx = chartData.findIndex(d => d.title === title);
    if (idx !== -1) setHoveredIndex(idx);
  };

  const onLegendLeave = () => setHoveredIndex(null);

  const getDeltaFor = (title: string): { text: string; positive: boolean } => {
    switch (title) {
      case 'Amazon.com':
        return { text: '+1.6PP', positive: true };
      case 'Walmart.com':
        return { text: '+0.5PP', positive: true };
      case 'Bestbuy.com':
        return { text: '+3.5PP', positive: true };
      case 'Ebay.com':
        return { text: '+1.4PP', positive: true };
      case 'Samsung.com':
        return { text: '+0.3PP', positive: true };
      case 'Others':
        return { text: '-7.3PP', positive: false };
      default:
        return { text: '—', positive: true };
    }
  };

  return (
    <div className={`bg-white border border-[#e6e9ec] rounded-[6px] ${fixedHeight ? 'h-[300px] flex flex-col' : ''}`}>
      {/* Header */}
      <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
        <h3 className="text-base font-medium text-[#092540] leading-5">Leading Retailers in category (by View Share)</h3>
        <span className="text-sm text-[#6b7c8c] leading-4">Category view share for all selected brands by retailer</span>
      </div>
      
      {/* Divider */}
      <div className="h-px bg-[#e6e9ec] w-full"></div>
      
      {/* Content */}
      <div className={`px-6 pt-4 pb-4 ${fixedHeight ? 'flex-1 flex flex-col' : ''}`}>
        <div className="flex items-center gap-4 mb-8" style={{ marginBottom: 25 }}>
          {/* Donut Chart */}
          <div
            className="w-[105px] h-[105px] shrink-0 relative"
            onMouseMove={(e) => {
              if (hoveredIndex === null) return;
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              setTooltip({ index: hoveredIndex, x, y });
            }}
          >
            <PieChart
              data={chartData}
              lineWidth={35}
              startAngle={-90}
              lengthAngle={360}
              radius={45}
              viewBoxSize={[115, 115]}
              center={[52.5, 52.5]}
              animate={true}
              animationDuration={300}
              animationEasing="ease-out"
              paddingAngle={1}
              segmentsStyle={(index) => ({
                transition: 'opacity 300ms ease',
                opacity: hoveredIndex === null
                  ? 1
                  : hoveredIndex === index
                  ? 1
                  : 0.25
              })}
              onMouseOver={(e: any, index: number) => {
                setHoveredIndex(index);
                if (e && e.clientX != null && e.clientY != null) {
                  const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setTooltip({ index, x, y });
                }
              }}
              onMouseOut={() => {
                setHoveredIndex(null);
                setTooltip(null);
              }}
            />
            {tooltip && hoveredIndex !== null && tooltip.index === hoveredIndex && (
              <div
                className="pointer-events-none absolute z-10 bg-white rounded-[4px] shadow-[0px_1px_8px_rgba(9,37,64,0.08),0px_5px_24px_rgba(9,37,64,0.08)] p-4"
                style={{
                  left: tooltip.x + 12,
                  top: tooltip.y - 12,
                  width: 300
                }}
              >
                {/* Title + Subtitle */}
                <div className="flex flex-col gap-1 mb-3">
                  <span className="text-[12px] font-medium text-[#092540]">Leading Retailers in category (by View Share)</span>
                  <span className="text-[12px] text-[#3a5166]">{dateRange || '[selected time frame]'}</span>
                </div>
                {/* Legend row: dot + name, value + change chip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-[9px] h-[9px] rounded-full"
                      style={{ backgroundColor: chartData[hoveredIndex].color }}
                    />
                    <span className="text-xs text-[#092540]">
                      {chartData[hoveredIndex].title === 'Others' ? 'All Other Retailers' : chartData[hoveredIndex].title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#092540] font-bold">{chartData[hoveredIndex].value.toFixed(1)}%</span>
                    {(() => {
                      const delta = getDeltaFor(chartData[hoveredIndex].title);
                      return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] ${
                          delta.positive ? 'bg-[#e6faf5] text-[#009688]' : 'bg-[#ffe6e6] text-[#bb3f3f]'
                        }`}>
                          {delta.text}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Legend/List */}
          <div className="flex flex-col gap-2 flex-1 w-[233px]">
            {/* Amazon.com */}
            <div className="flex items-center justify-between w-full" onMouseEnter={() => onLegendEnter('Amazon.com')} onMouseLeave={onLegendLeave}>
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: '#3e74fe' }}></div>
                <span className="text-xs text-[#092540]">Amazon.com</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6b7c8c]">24.8%</span>
                <span className="bg-[#e6faf5] text-[#009688] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px]">+1.6PP</span>
              </div>
            </div>
            
            {/* Walmart.com */}
            <div className="flex items-center justify-between w-full" onMouseEnter={() => onLegendEnter('Walmart.com')} onMouseLeave={onLegendLeave}>
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: '#435993' }}></div>
                <span className="text-xs text-[#092540]">Walmart.com</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6b7c8c]">15.4%</span>
                <span className="bg-[#e6faf5] text-[#009688] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px]">+0.5PP</span>
              </div>
            </div>
            
            {/* Bestbuy.com */}
            <div className="flex items-center justify-between w-full" onMouseEnter={() => onLegendEnter('Bestbuy.com')} onMouseLeave={onLegendLeave}>
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: '#ff7a1a' }}></div>
                <span className="text-xs text-[#092540]">Bestbuy.com</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6b7c8c]">20.2%</span>
                <span className="bg-[#e6faf5] text-[#009688] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px]">+3.5PP</span>
              </div>
            </div>
            
            {/* Ebay.com */}
            <div className="flex items-center justify-between w-full" onMouseEnter={() => onLegendEnter('Ebay.com')} onMouseLeave={onLegendLeave}>
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: '#00ca9a' }}></div>
                <span className="text-xs text-[#092540]">Ebay.com</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6b7c8c]">9.8%</span>
                <span className="bg-[#e6faf5] text-[#009688] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px]">+1.4PP</span>
              </div>
            </div>
            
            {/* Samsung.com */}
            <div className="flex items-center justify-between w-full" onMouseEnter={() => onLegendEnter('Samsung.com')} onMouseLeave={onLegendLeave}>
              <div className="flex items-center gap-1">
                <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: '#ffb800' }}></div>
                <span className="text-xs text-[#092540]">Samsung.com</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#6b7c8c]">9.1%</span>
                <span className="bg-[#e6faf5] text-[#009688] text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px]">+0.3PP</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Link */}
        {onNavigateToTab && (
          <div className="border-t border-[#e6e9ec] pt-4 mt-4 text-center">
            <button 
              className="text-[#195afe] text-sm hover:underline"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('scrollToBrandStrongholds'));
              }}
            >
              Analyze which brands lead each retailer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadingRetailersCard;
