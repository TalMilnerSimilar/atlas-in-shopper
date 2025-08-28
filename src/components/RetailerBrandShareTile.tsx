import React, { useMemo } from 'react';
import { brandsOptions } from '../data/brandsOptions';

interface RetailerBrandShareTileProps {
  legendRetailers: { name: string; skus: number }[];
  selectedBrandName: string;
  selectedBrandsHeader: string[];
  getSeriesForRetailer: (hostLabel: string) => number[];
  dateRange?: string;
}

type RetailerShareSnapshot = {
  retailer: string;
  myBrandSharePct: number; // percent (0..100)
  myBrandChangePp: number; // percentage points vs first period
  competitors: Array<{ brand: string; sharePct: number; changePp: number }>; // sorted desc by share
};

const colorPalette: string[] = ['#195AFE', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

function computeShareSeriesForBrandOnHost(brand: string, host: string, retailerSeries: number[]): number[] {
  const key = `${brand}|${host}`;
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const rnd = () => {
    hash ^= hash << 13;
    hash ^= hash >>> 17;
    hash ^= hash << 5;
    return ((hash >>> 0) % 10000) / 10000;
  };
  const baseShare = 0.06 + rnd() * 0.18; // 6% - 24%
  return retailerSeries.map((_, i) => {
    const noise = Math.sin(i * 0.7 + hash) * 0.02; // ±2pp
    const share = Math.max(0.01, Math.min(0.6, baseShare + noise));
    return share * 100; // percent
  });
}

const RetailerBrandShareTile: React.FC<RetailerBrandShareTileProps> = ({
  legendRetailers,
  selectedBrandName,
  selectedBrandsHeader,
  getSeriesForRetailer,
  dateRange,
}) => {
  const topRetailerSnapshots: RetailerShareSnapshot[] = useMemo(() => {
    const allHosts = legendRetailers.map(r => r.name);
    if (allHosts.length === 0) return [];

    const competitorUniverse = (selectedBrandsHeader.includes('All Brands')
      ? brandsOptions.filter(b => b !== 'All Brands')
      : selectedBrandsHeader
    ).filter(b => b !== selectedBrandName);

    const snapshots: RetailerShareSnapshot[] = allHosts.map(host => {
      const retailerSeries = getSeriesForRetailer(host) || [];
      const mySeries = computeShareSeriesForBrandOnHost(selectedBrandName, host, retailerSeries);
      const myLatest = mySeries[mySeries.length - 1] ?? 0;
      const myFirst = mySeries[0] ?? myLatest;
      const myChange = (myLatest - myFirst);

      // Build competitor shares and pick top by latest
      const compShares = competitorUniverse.slice(0, 12).map(brand => {
        const s = computeShareSeriesForBrandOnHost(brand, host, retailerSeries);
        const latest = s[s.length - 1] ?? 0;
        const first = s[0] ?? latest;
        return { brand, latest, change: (latest - first) };
      });
      compShares.sort((a, b) => b.latest - a.latest);
      const topCompetitors = compShares.slice(0, 3).map(c => ({ brand: c.brand, sharePct: c.latest, changePp: c.change }));

      return {
        retailer: host,
        myBrandSharePct: myLatest,
        myBrandChangePp: myChange,
        competitors: topCompetitors,
      };
    });

    // Make the selection match the KPI tile (Leading Retailers) order
    const normalize = (s: string) => (s || '').toLowerCase();
    const kpiTopRetailers = ['amazon.com', 'bestbuy.com', 'walmart.com', 'ebay.com'];

    const chosen: RetailerShareSnapshot[] = [];
    for (const host of kpiTopRetailers) {
      const snap = snapshots.find(s => normalize(s.retailer) === host);
      if (snap) chosen.push(snap);
    }

    if (chosen.length < 4) {
      const remaining = snapshots
        .filter(s => !chosen.some(c => normalize(c.retailer) === normalize(s.retailer)))
        .sort((a, b) => b.myBrandSharePct - a.myBrandSharePct);
      chosen.push(...remaining.slice(0, 4 - chosen.length));
    }

    return chosen.slice(0, 4);
  }, [legendRetailers, selectedBrandName, selectedBrandsHeader, getSeriesForRetailer]);

  // Figma-aligned palette: primary, deep-blue, orange, teal, gray
  const legendColors = ['#3E74FE', '#435993', '#FF7A1A', '#00CA9A', '#B6BEC6'];
  const brandToColor = (brand: string, fallbackIdx?: number): string => {
    if (fallbackIdx !== undefined) return legendColors[Math.abs(fallbackIdx) % legendColors.length];
    let sum = 0;
    for (let i = 0; i < brand.length; i++) sum += brand.charCodeAt(i);
    const idx = Math.abs(sum) % legendColors.length;
    return legendColors[idx];
  };

  // Hover state to highlight a specific segment per retailer card when hovering rows
  const [hovered, setHovered] = React.useState<{ retailer: string; segment: number } | null>(null);
  const [barTooltip, setBarTooltip] = React.useState<{ retailer: string; index: number; x: number; y: number } | null>(null);

  if (topRetailerSnapshots.length === 0) return null;

  const formatPp = (v: number) => {
    const rounded = Math.round(v);
    if (rounded === 0) return '0pp';
    const sign = rounded > 0 ? '+' : '';
    return `${sign}${rounded}pp`;
  };

  const changeTagClass = (v: number) => {
    const rounded = Math.round(v);
    if (rounded === 0) return 'bg-[#f7f7f8] text-[#6b7c8c]';
    return rounded > 0 ? 'bg-[#e6faf5] text-[#009688]' : 'bg-[#ffe6e6] text-[#bb3f3f]';
  };

  const formatPct = (v: number) => `${Math.round(v)}%`;

  return (
    <div className="mt-8 bg-white border border-[#E6E9EC] rounded-[6px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header - match table header style */}
      <div className="relative h-[85px] w-full flex items-start justify-start border-b border-[#E6E9EC]">
        <div className="flex flex-1 items-center justify-between pr-6">
          <div className="flex flex-col gap-2 pl-6 py-4">
            <div className="flex items-center gap-1">
              <div className="text-[20px] leading-[28px] text-[#092540]">Brand Strongholds</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[14px] leading-[20px] text-[#6b7c8c]">Top 4 retailers by {selectedBrandName}'s view share</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {topRetailerSnapshots.map((snap, idx) => (
            <div key={snap.retailer} className="rounded-[6px] border border-[#e6e9ec] relative" data-rbt-card>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6e9ec]">
                <div className="text-[#092540] text-[16px] leading-[20px] font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>{snap.retailer}</div>
                <div className="text-[14px] leading-[16px] text-[#6b7c8c]" style={{ fontFamily: 'Roboto, sans-serif' }}>#{idx + 1}</div>
              </div>

              <div className="px-6 py-4 flex flex-col gap-2">
                {/* My brand row */}
                <div
                  className="flex items-center justify-between w-full"
                  onMouseEnter={() => { setHovered({ retailer: snap.retailer, segment: 0 }); setBarTooltip(null); }}
                  onMouseLeave={() => { setHovered(null); setBarTooltip(null); }}
                >
                  <div className="flex items-center gap-1">
                    <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: brandToColor(selectedBrandName, 0) }}></div>
                    <span className="text-xs text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>{selectedBrandName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#6b7c8c]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatPct(snap.myBrandSharePct)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] ${changeTagClass(snap.myBrandChangePp)}`}>{formatPp(snap.myBrandChangePp)}</span>
                  </div>
                </div>

                {/* Competitors */}
                <div className="h-px bg-[#e6e9ec] my-1" />
                {snap.competitors.map((c, cIdx) => (
                  <div
                    key={c.brand}
                    className="flex items-center justify-between w-full"
                    onMouseEnter={() => { setHovered({ retailer: snap.retailer, segment: cIdx + 1 }); setBarTooltip(null); }}
                    onMouseLeave={() => { setHovered(null); setBarTooltip(null); }}
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: brandToColor(c.brand, cIdx + 1) }}></div>
                      <span className="text-xs text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>{c.brand}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#6b7c8c]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatPct(c.sharePct)}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] ${changeTagClass(c.changePp)}`}>{formatPp(c.changePp)}</span>
                    </div>
                  </div>
                ))}

                {/* All other brands */}
                {(() => {
                  const others = Math.max(0, 100 - (snap.myBrandSharePct + snap.competitors.reduce((a, b) => a + b.sharePct, 0)));
                  const includedChange = snap.myBrandChangePp + snap.competitors.reduce((a, b) => a + b.changePp, 0);
                  const othersChange = -includedChange;
                  return (
                    <div
                      className="flex items-center justify-between w-full"
                      onMouseEnter={() => { const segIndex = 1 + snap.competitors.length; setHovered({ retailer: snap.retailer, segment: segIndex }); setBarTooltip(null); }}
                      onMouseLeave={() => { setHovered(null); setBarTooltip(null); }}
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: legendColors[4] }}></div>
                        <span className="text-xs text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>All other brands</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#6b7c8c]" style={{ fontFamily: 'Roboto, sans-serif' }}>{formatPct(others)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] ${changeTagClass(othersChange)}`}>{formatPp(othersChange)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="h-px bg-[#e6e9ec] my-1" />

                {/* Segmented composition bar */}
                {(() => {
                  const segs = [
                    { w: snap.myBrandSharePct, c: legendColors[0] },
                    ...snap.competitors.map((c, cIdx) => ({ w: c.sharePct, c: legendColors[(cIdx + 1) % legendColors.length] })),
                  ];
                  const others = Math.max(0, 100 - segs.reduce((s, x) => s + x.w, 0));
                  segs.push({ w: others, c: legendColors[4] });
                  return (
                    <div className="mt-2 h-2 w-full bg-white rounded overflow-hidden relative"
                      onMouseMove={(e) => {
                        if (!hovered || hovered.retailer !== snap.retailer) return;
                        const card = (e.currentTarget.closest('[data-rbt-card]') as HTMLElement) || (e.currentTarget as HTMLDivElement);
                        const rect = card.getBoundingClientRect();
                        setBarTooltip({ retailer: snap.retailer, index: hovered.segment, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 12 });
                      }}
                      onMouseLeave={() => { setHovered(null); setBarTooltip(null); }}
                    >
                      <div className="flex h-2 w-full group">
                        {segs.map((s, i) => (
                          <div
                            key={i}
                            className="transition-opacity duration-300 opacity-100 group-hover:opacity-25 group-hover:hover:opacity-100"
                            style={{
                              width: `${Math.max(2, s.w)}%`,
                              backgroundColor: s.c,
                              boxShadow: i < segs.length - 1 ? 'inset -1px 0 0 #ffffff' : undefined,
                              opacity: hovered && hovered.retailer === snap.retailer ? (hovered.segment === i ? 1 : 0.25) : undefined,
                            }}
                            onMouseEnter={(e) => {
                              setHovered({ retailer: snap.retailer, segment: i });
                              const card = (e.currentTarget.closest('[data-rbt-card]') as HTMLElement) || (e.currentTarget.parentElement as HTMLElement);
                              const rect = card.getBoundingClientRect();
                              setBarTooltip({ retailer: snap.retailer, index: i, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 12 });
                            }}
                            onMouseMove={(e) => {
                              if (!hovered || hovered.retailer !== snap.retailer) return;
                              const card = (e.currentTarget.closest('[data-rbt-card]') as HTMLElement) || (e.currentTarget.parentElement as HTMLElement);
                              const rect = card.getBoundingClientRect();
                              setBarTooltip({ retailer: snap.retailer, index: i, x: e.clientX - rect.left + 12, y: e.clientY - rect.top - 12 });
                            }}
                            onMouseLeave={() => { setHovered(null); setBarTooltip(null); }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              {(() => {
                const segsForTooltip = [
                  { label: selectedBrandName, value: snap.myBrandSharePct, change: snap.myBrandChangePp, color: legendColors[0] },
                  ...snap.competitors.map((c, cIdx) => ({ label: c.brand, value: c.sharePct, change: c.changePp, color: legendColors[(cIdx + 1) % legendColors.length] })),
                  (() => {
                    const others = Math.max(0, 100 - (snap.myBrandSharePct + snap.competitors.reduce((a, b) => a + b.sharePct, 0)));
                    const includedChange = snap.myBrandChangePp + snap.competitors.reduce((a, b) => a + b.changePp, 0);
                    const othersChange = -includedChange;
                    return { label: 'All other brands', value: others, change: othersChange, color: legendColors[4] };
                  })(),
                ];
                const t = barTooltip && hovered && barTooltip.retailer === snap.retailer ? segsForTooltip[barTooltip.index] : null;
                return t ? (
                  <div
                    className="pointer-events-none absolute z-10 bg-white rounded-[4px] shadow-[0px_1px_8px_rgba(9,37,64,0.08),0px_5px_24px_rgba(9,37,64,0.08)] p-4"
                    style={{ left: barTooltip!.x, top: barTooltip!.y, width: 300 }}
                  >
                    <div className="flex flex-col gap-1 mb-3">
                      <span className="text-[12px] font-medium text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>Brand share in {snap.retailer}</span>
                      <span className="text-[12px] text-[#3a5166]" style={{ fontFamily: 'Roboto, sans-serif' }}>{dateRange || '[selected time frame]'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-[9px] h-[9px] rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="text-xs text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>{t.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#092540] font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>{t.value.toFixed(1)}%</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[26px] tracking-[0.3px] ${changeTagClass(t.change)}`}>{formatPp(t.change)}</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RetailerBrandShareTile;


