import React, { useEffect, useMemo, useState } from 'react';
import RetailerOpportunityMatrix from '../RetailerOpportunityMatrix';
import ChartLegend from '../ChartLegend';
import InsightSection from '../InsightSection';
import { brandsOptions } from '../../data/brandsOptions';
import { RetailerNode } from '../../analytics/opportunity';
import { pickCompetitorLandscapeInsight, CompetitorRow } from '../../analytics/CompetitorLandscapeInsight';

const palette = ['#195AFE', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#10B981', '#EC4899', '#14B8A6'];

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRand(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const formatSkus = (skus: number): string => {
  if (skus >= 1000) return `${(skus / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${skus}`;
};

const CompetitiveLandscapeTab: React.FC<{ selectedBrandName: string }> = ({ selectedBrandName }) => {
  const [nodes, setNodes] = useState<RetailerNode[]>([]);
  const [selectedLegendHosts, setSelectedLegendHosts] = useState<string[]>([]);
  const [legendBrands, setLegendBrands] = useState<{ name: string; skus: number }[]>([]);
  const [colorByBrand, setColorByBrand] = useState<Record<string, string>>({});
  const maxSelections = 7;

  // Build synthetic brand landscape
  useEffect(() => {
    const brands = brandsOptions.filter(b => b !== 'All Brands');
    const items = brands.map(name => {
      const h = hashString(name.toLowerCase());
      // Pseudo SKU count for legend display
      const skus = 600 + (h % 5800);
      return { name, skus };
    });
    items.sort((a, b) => b.skus - a.skus);
    setLegendBrands(items);

    // Default select top 4 brands
    const defaults = items.slice(0, Math.min(4, items.length)).map(i => i.name);
    setSelectedLegendHosts(defaults);

    // Colors per brand
    const colors: Record<string, string> = {};
    items.forEach((it, idx) => {
      colors[it.name] = palette[idx % palette.length];
    });
    setColorByBrand(colors);

    // Generate brand nodes
    const genNodes: RetailerNode[] = items.map(({ name, skus }) => {
      const seed = hashString(name);
      const rnd = seededRand(seed);
      // Overlap demand range ~2M..15M for category demand where both brands compete
      const overlapDemand = 2_000_000 + Math.floor(rnd() * 13_000_000);
      
      // Generate competitor and your shares in the overlap more realistically
      const compShare = 0.10 + rnd() * 0.60; // 10%-70% for competitor
      const yourShare = 0.10 + rnd() * 0.60; // 10%-70% for you
      
      const compViews = Math.round(overlapDemand * compShare);
      const yourViews = Math.round(overlapDemand * yourShare);
      
      // Calculate head-to-head lead: (comp - you) / (comp + you)
      const totalViews = compViews + yourViews;
      const leadDecimal = totalViews > 0 ? (compViews - yourViews) / totalViews : 0;
      
      const dgPop = (rnd() - 0.5) * 0.30; // ~±30%
      const dgYoy = (rnd() - 0.5) * 0.40; // ~±40%
      const sdPop = (rnd() - 0.5) * 0.02; // ±2pp
      const sdYoy = (rnd() - 0.5) * 0.03; // ±3pp
      // Simulate shared retailers count (3-15 retailers where both brands are present)
      const sharedRetailers = Math.floor(3 + (seed % 13));
      
      return {
        retailerId: name,
        retailerName: name,
        demand_weekly: overlapDemand, // X-axis: overlap demand
        brand_share: leadDecimal, // Y-axis: head-to-head lead
        brand_views_weekly: compViews, // Bubble size: competitor views
        demand_growth_pop: dgPop,
        demand_growth_yoy: dgYoy,
        brand_share_delta_pop: sdPop,
        brand_share_delta_yoy: sdYoy,
        shared_retailers_count: sharedRetailers,
        skus,
        your_overlap_views: yourViews, // Store your views for insight calculation
      } as RetailerNode & { shared_retailers_count: number; skus: number; your_overlap_views: number };
    });
    setNodes(genNodes);
  }, []);

  const filteredNodes = useMemo(() => {
    if (!selectedLegendHosts.length) return [] as RetailerNode[];
    const set = new Set(selectedLegendHosts);
    return nodes.filter(n => set.has(n.retailerName));
  }, [nodes, selectedLegendHosts]);

  // Build competitive insight using TOTAL-overlap logic
  const dynamicInsight = useMemo(() => {
    if (!filteredNodes.length) return null;
    const rows: CompetitorRow[] = filteredNodes.map(n => {
      const overlapCategoryViews = Math.max(0, n.demand_weekly || 0);
      const compViewsOverlap = Math.max(0, n.brand_views_weekly || 0);
      // Use the stored your_overlap_views from synthetic data
      const myViewsOverlap = Math.max(0, (n as any).your_overlap_views || 0);
      return {
        brand: n.retailerName,
        overlapCategoryViews,
        myViewsOverlap,
        compViewsOverlap,
      };
    });
    const insight = pickCompetitorLandscapeInsight(rows);
    return {
      headline: insight.title,
      sentence: insight.text,
      chips: [],
    };
  }, [filteredNodes]);

  const onToggle = (name: string) => {
    setSelectedLegendHosts(prev => {
      const exists = prev.includes(name);
      if (exists) return prev.filter(n => n !== name);
      if (prev.length >= maxSelections) return prev; // respect max selections
      return [...prev, name];
    });
  };

  const onClearAll = () => setSelectedLegendHosts([]);
  const onSelectAll = () => setSelectedLegendHosts(legendBrands.slice(0, maxSelections).map(b => b.name));
  const isItemDisabled = (name: string) => !selectedLegendHosts.includes(name) && selectedLegendHosts.length >= maxSelections;

  return (
    <>
      {/* Chart Content Area */}
      <div className="flex flex-row gap-10 h-[400px] items-start justify-start p-4 w-full">
        <div className="grow h-full min-h-px min-w-px relative">
          <RetailerOpportunityMatrix
            data={filteredNodes}
            mode="pop"
            colorByRetailer={colorByBrand}
            quadrantTitles={{
              topLeft: 'Niche rival',
              topRight: 'Strong rival',
              bottomLeft: 'Low overlap',
              bottomRight: 'Your stronghold'
            }}
            xAxisLabel="Overlap demand (total views)"
            yAxisLabel="Head-to-head lead vs you (pp)"
            xValueLabel="Overlap demand"
            yValueLabel={`Lead against ${selectedBrandName}`}
            yTickFormatter={(v)=>`${Math.round(v*100)}pp`}
            xAxisTooltip="The size of the battleground between you and a competitor. Sum of total category views in all selected retailers where both of you are present."
            yAxisTooltip="Shows who's winning in head-to-head competition. Calculated as competitor's share minus your share in retailers where you both sell. Positive values mean they lead, negative means you lead."
            bubbleSizeRange={[300, 3000]}
          />
        </div>

        {/* Legend Sidebar */}
        <ChartLegend
          legendRetailers={legendBrands}
          selectedLegendHosts={selectedLegendHosts}
          seriesColorByRetailer={colorByBrand}
          maxRetailerSelections={maxSelections}
          onRetailerToggle={onToggle}
          onClearAll={onClearAll}
          onSelectAll={onSelectAll}
          formatSkus={formatSkus}
          isLegendItemDisabled={isItemDisabled}
        />
      </div>

      {/* Insights Section - Full Width */}
      {dynamicInsight && (
        <div className="mt-10">
          <InsightSection dynamicInsight={dynamicInsight} />
        </div>
      )}
    </>
  );
};

export default CompetitiveLandscapeTab;
