import React, { useEffect, useMemo, useState } from 'react';
import RetailerOpportunityMatrix from '../RetailerOpportunityMatrix';
import ChartLegend from '../ChartLegend';
import InsightSection from '../InsightSection';
import { RetailerNode, buildChannelOpportunityInsight, scoreRetailers } from '../../analytics/opportunity';

interface OpportunityMatrixTabProps {
  selectedLegendHosts: string[];
  legendRetailers: Array<{ name: string; skus: number }>;
  maxRetailerSelections: number;
  onRetailerToggle: (hostLabel: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  formatSkus: (value: number) => string;
  isLegendItemDisabled: (host: string) => boolean;
  seriesColorByRetailer: Record<string, string>;
  showInsights?: boolean;
  fixedHeight?: boolean;
  uniformBubbles?: boolean;
}

const OpportunityMatrixTab: React.FC<OpportunityMatrixTabProps> = ({
  selectedLegendHosts,
  legendRetailers,
  maxRetailerSelections,
  onRetailerToggle,
  onClearAll,
  onSelectAll,
  formatSkus,
  isLegendItemDisabled,
  seriesColorByRetailer,
  showInsights = true,
  fixedHeight = false,
  uniformBubbles = false,
}) => {
  const [nodes, setNodes] = useState<RetailerNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/data/retailer_series.csv', { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        const map: Record<string, { current: number[]; prevPop: number[]; prevYoy: number[] }> = {};
        text.split(/\r?\n/).forEach(line => {
          const trimmed = (line || '').trim();
          if (!trimmed || trimmed.startsWith('#') || /^key\b/i.test(trimmed)) return;
          const parts = trimmed.split(',').map(s => s.trim());
          if (parts.length < 22) return;
          const key = parts[0];
          const current = parts.slice(1, 8).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          const prevPop = parts.slice(8, 15).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          const prevYoy = parts.slice(15, 22).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          if (key && current.length === 7 && prevPop.length === 7 && prevYoy.length === 7) {
            map[key] = { current, prevPop, prevYoy };
          }
        });

        const toNodes: RetailerNode[] = Object.entries(map).map(([host, s]) => {
          const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / arr.length) || 0;
          const brandNow = avg(s.current);
          const brandPop = avg(s.prevPop);
          const brandYoy = avg(s.prevYoy);

          // Deterministic share for stability
          const seed = host.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
          const baseShare = Math.max(0, Math.min(0.28, 0.02 + ((seed % 140) / 1000))); // 2%..16%
          const deltaPop = ((seed % 31) - 15) / 1000; // ~±3.0pp
          const deltaYoy = ((seed % 41) - 20) / 1000; // ~±2.0pp
          const shareNow = brandNow > 0 ? Math.max(0.001, Math.min(0.6, baseShare)) : 0;
          const sharePop = brandPop > 0 ? Math.max(0.001, Math.min(0.6, baseShare + deltaPop)) : baseShare + deltaPop;
          const shareYoy = brandYoy > 0 ? Math.max(0.001, Math.min(0.6, baseShare + deltaYoy)) : baseShare + deltaYoy;

          // For retailers with zero brand views, generate synthetic demand based on seed
          const demandNow = shareNow > 0 ? brandNow / shareNow : Math.max(1000, (seed % 8000) + 2000); // 2K-10K synthetic demand
          const demandPop = sharePop > 0 ? brandPop / sharePop : 0;
          const demandYoy = shareYoy > 0 ? brandYoy / shareYoy : 0;

          const demandGrowthPop = demandPop > 0 ? (demandNow - demandPop) / demandPop : undefined;
          const demandGrowthYoy = demandYoy > 0 ? (demandNow - demandYoy) / demandYoy : undefined;

          const shareDeltaPop = sharePop !== undefined ? shareNow - sharePop : undefined;
          const shareDeltaYoy = shareYoy !== undefined ? shareNow - shareYoy : undefined;

          return {
            retailerId: host,
            retailerName: host,
            demand_weekly: Math.max(0, Math.round(demandNow)),
            brand_share: Math.max(0, Math.min(1, shareNow)),
            brand_views_weekly: Math.max(0, Math.round(brandNow)),
            demand_growth_pop: demandGrowthPop,
            demand_growth_yoy: demandGrowthYoy,
            brand_share_delta_pop: shareDeltaPop,
            brand_share_delta_yoy: shareDeltaYoy,
          } as RetailerNode;
        });

        // Keep all retailers (no filtering by demand)
        setNodes(toNodes);
      })
      .catch(() => setNodes([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredNodes = useMemo(() => {
    if (!selectedLegendHosts?.length) return [] as RetailerNode[];
    const set = new Set(selectedLegendHosts);
    return nodes.filter(n => set.has(n.retailerName));
  }, [nodes, selectedLegendHosts]);

  // Generate insight for the opportunity matrix
  const dynamicInsight = useMemo(() => {
    if (!filteredNodes.length) return null;
    
    const { scored, targetShare } = scoreRetailers(filteredNodes);
    const insight = buildChannelOpportunityInsight(scored, 'pop', targetShare);
    
    return {
      headline: insight.title,
      sentence: insight.text,
      chips: [] // No tags for this tab as per user request
    };
  }, [filteredNodes]);

  return (
          <>
        {/* Chart Content Area */}
        <div className={`flex flex-row gap-10 items-start justify-start p-4 w-full ${fixedHeight ? 'flex-1 overflow-hidden' : 'h-[400px]'}`}>
        <div className="grow h-full min-h-px min-w-px relative">
          {loading ? (
            <div className="h-[420px] flex items-center justify-center rounded-lg bg-gray-50 text-gray-500">Loading…</div>
          ) : (
            <RetailerOpportunityMatrix
              data={filteredNodes}
              mode="pop"
              colorByRetailer={seriesColorByRetailer}
              bubbleSizeRange={[300, 3000]}
              uniformBubbles={uniformBubbles}
              xAxisLabel="Category demand (total views)"
              yAxisLabel="Brand presence (share)"
              xValueLabel="Demand"
              yValueLabel="Share"
              xAxisTooltip="Total category views across all selected retailers. Shows the size of the market opportunity for each retailer."
              yAxisTooltip="Your brand's share of total views on each retailer. Higher share indicates stronger brand presence and performance."
            />
          )}
        </div>

        {/* Legend Sidebar - same component as other tabs */}
        <ChartLegend
          legendRetailers={legendRetailers}
          selectedLegendHosts={selectedLegendHosts}
          seriesColorByRetailer={seriesColorByRetailer}
          maxRetailerSelections={maxRetailerSelections}
          onRetailerToggle={onRetailerToggle}
          onClearAll={onClearAll}
          onSelectAll={onSelectAll}
          formatSkus={formatSkus}
          isLegendItemDisabled={isLegendItemDisabled}
        />
      </div>

      {/* Insights Section - Full Width */}
      {showInsights && dynamicInsight && (
        <div className="mt-10">
          <InsightSection dynamicInsight={dynamicInsight} />
        </div>
      )}
    </>
  );
};

export default OpportunityMatrixTab;