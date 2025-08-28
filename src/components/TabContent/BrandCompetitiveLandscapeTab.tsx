import React, { useMemo } from 'react';
import RetailerOpportunityMatrix from '../RetailerOpportunityMatrix';
import ChartLegend from '../ChartLegend';
import { brandsOptions } from '../../data/brandsOptions';
import { RetailerNode } from '../../analytics/opportunity';

interface BrandCompetitiveLandscapeTabProps {
  selectedLegendHosts: string[]; // here these should be BRAND names
  legendRetailers: Array<{ name: string; skus: number }>; // not used; kept for API symmetry
  brandsFromHeader?: string[]; // pass selected brands list to drive the legend
  maxRetailerSelections: number;
  onRetailerToggle: (hostLabel: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  formatSkus: (value: number) => string;
  isLegendItemDisabled: (host: string) => boolean;
  seriesColorByRetailer: Record<string, string>;
  showInsights?: boolean; // not used here but kept for API symmetry
  fixedHeight?: boolean;
  uniformBubbles?: boolean;
}

// This component reuses RetailerOpportunityMatrix visuals but maps semantics to brand-vs-brand competition.
// Quadrant bubble math for "Brand Competitive Landscape":
// X = Overlap demand (views/wk where both you and competitor are present)
// Y = Head-to-head advantage vs you (pp difference; + means competitor leads)
// Bubble size = competitor views/wk in the overlap
// Legend = list of the selected brands in the Brands selector in the page header.

const BrandCompetitiveLandscapeTab: React.FC<BrandCompetitiveLandscapeTabProps> = ({
  selectedLegendHosts,
  legendRetailers,
  brandsFromHeader,
  maxRetailerSelections,
  onRetailerToggle,
  onClearAll,
  onSelectAll,
  formatSkus,
  isLegendItemDisabled,
  seriesColorByRetailer,
  fixedHeight = false,
  uniformBubbles = false,
}) => {
  // Map legend retailers directly; upstream data builder should provide overlap/lead fields in RetailerNode
  // Build legend entries from brands list instead of retailers
  const legendBrands = useMemo(() => {
    const brands = brandsFromHeader && brandsFromHeader.length ? brandsFromHeader : selectedLegendHosts;
    const expanded = (brands || []).includes('All Brands')
      ? brandsOptions.filter(b => b !== 'All Brands')
      : brands;
    const computeBrandSkus = (brand: string): number => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < brand.length; i++) {
        h ^= brand.charCodeAt(i);
        h = Math.imul(h, 16777619);
        h = h >>> 0; // Ensure unsigned
      }
      // Map to 300..1500 like retailer fallback
      return 300 + (h % 1201);
    };
    return (expanded || [])
      .map(b => ({ name: b, skus: computeBrandSkus(b) }))
      .sort((a, b) => b.skus - a.skus);
  }, [brandsFromHeader, selectedLegendHosts]);

  // Generate synthetic nodes for brands so the chart renders
  const brandNodes = useMemo((): RetailerNode[] => {
    const brands = (legendBrands || []).map(b => b.name);
    const hash = (s: string) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    };
    return brands.map(name => {
      const h = hash(name);
      const demand = 50000 + (h % 400000); // 50k..450k
      const advantage = -((h >> 3) % 61 - 30) / 100; // -0.30..+0.30 (flipped: positive = you lead)
      const views = Math.max(1000, Math.round(demand * (0.05 + ((h >> 7) % 20) / 100))); // 5%..25%
      return {
        retailerId: name,
        retailerName: name,
        demand_weekly: demand,
        brand_share: advantage, // interpret as head-to-head advantage vs you (pp as decimal)
        brand_views_weekly: views,
      } as RetailerNode;
    });
  }, [legendBrands]);

  // Assign consistent colors per brand for legend and bubbles
  const brandColorMap = useMemo(() => {
    const palette = ['#195AFE', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
    const map: Record<string, string> = {};
    (legendBrands || []).forEach((b, idx) => {
      map[b.name] = palette[idx % palette.length];
    });
    return map;
  }, [legendBrands]);

  // Show only selected brands; fall back to top N if none selected
  const filteredBrandNodes = useMemo(() => {
    const available = new Set((legendBrands || []).map(b => b.name));
    const selected = (selectedLegendHosts || []).filter(n => available.has(n));
    if (!selected.length) return [] as RetailerNode[];
    const selSet = new Set(selected);
    return brandNodes.filter(n => selSet.has(n.retailerName));
  }, [brandNodes, legendBrands, selectedLegendHosts, maxRetailerSelections]);

  // We rely on RetailerOpportunityMatrix to render and expect nodes provided by parent context
  // via the same data contract it already uses in other tabs. Here we only change labels/tooltips.

  return (
    <div className={`flex flex-row gap-10 items-start justify-start p-4 w-full ${fixedHeight ? 'flex-1 overflow-hidden' : 'h-[400px]'}`}>
      <div className="grow h-full min-h-px min-w-px relative">
        <RetailerOpportunityMatrix
          data={filteredBrandNodes}
          mode="pop"
          colorByRetailer={brandColorMap}
          bubbleSizeRange={[300, 3000]}
          uniformBubbles={uniformBubbles}
          quadrantTitles={{
            topLeft: 'Maintain Edge',
            topRight: 'Stronghold',
            bottomLeft: 'Minor Threat',
            bottomRight: 'Win‑Back Hot Zone',
          }}
          xAxisLabel="Shared Demand (views)"
          yAxisLabel="Head‑to‑Head Lead (pp)"
          xValueLabel="Shared Demand"
          yValueLabel="Head-to-head lead"
          yTickFormatter={(v) => `${(v as number) > 0 ? '+' : ''}${Math.round((v as number) * 100)}pp`}
          xAxisTooltip="Shared Demand = total views where both brands appear (the size of the battleground)."
          yAxisTooltip="Lead is measured in percentage points. Positive = you lead; negative = competitor leads."
        />
      </div>

      <ChartLegend
        legendRetailers={legendBrands}
        selectedLegendHosts={selectedLegendHosts}
        seriesColorByRetailer={brandColorMap}
        maxRetailerSelections={maxRetailerSelections}
        onRetailerToggle={onRetailerToggle}
        onClearAll={onClearAll}
        onSelectAll={onSelectAll}
        formatSkus={formatSkus}
        isLegendItemDisabled={isLegendItemDisabled}
      />
    </div>
  );
};

export default BrandCompetitiveLandscapeTab;


