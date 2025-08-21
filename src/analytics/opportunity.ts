// src/analytics/opportunity.ts

export type CompareMode = 'pop' | 'yoy';

export interface RetailerNode {
  retailerId: string;
  retailerName: string;

  // X axis (demand)
  demand_weekly: number;               // avg weekly category views

  // Y axis (presence)
  brand_share: number;                 // 0..1 (your brand views / category views)

  // Bubble size
  brand_views_weekly: number;          // avg weekly brand views

  // Optional deltas for coloring / tags
  demand_growth_pop?: number;          // decimal, e.g. 0.12 for +12%
  demand_growth_yoy?: number;
  brand_share_delta_pop?: number;      // decimal pp, e.g. 0.004 for +0.4 pp
  brand_share_delta_yoy?: number;
}

export interface OppConfig {
  highDemandPercentile?: number; // default 0.70 (70th percentile)
  lowPresenceThreshold?: number; // default 0.05  (5% share)
  shareCapForScore?: number;     // default 0.30 (caps share inside score)
  minDemandFloor?: number;       // default 1000 (views/wk) - hide very tiny nodes
}

export interface ScoredRetailer extends RetailerNode {
  score: number;
  potential_weekly?: number;     // views/wk you could add at peer-median share
  quadrant: 'Opportunity' | 'Performing' | 'Over-indexed' | 'Low priority';
}

export interface ChannelInsight {
  retailerId?: string;
  retailerName?: string;
  title: string;     // short, status-style
  text: string;      // one sentence, neutral
  tags: string[];    // e.g., ["Demand +12% PoP", "Share +0.3 pp YoY"]
}

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const percentile = (arr: number[], p: number) => {
  if (!arr.length) return 0;
  const a = arr.slice().sort((x, y) => x - y);
  const pos = (a.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  return a[base] + (a[Math.min(base + 1, a.length - 1)] - a[base]) * rest;
};
const median = (xs: number[]) => percentile(xs, 0.5);

export function scoreRetailers(
  nodes: RetailerNode[],
  cfg: OppConfig = {}
): { scored: ScoredRetailer[]; xThreshold: number; yThreshold: number; targetShare?: number } {
  const {
    highDemandPercentile = 0.70,
    lowPresenceThreshold = 0.05,
    shareCapForScore = 0.30,
    minDemandFloor = 1000,
  } = cfg;

  const filtered = nodes.filter(n => n.demand_weekly >= minDemandFloor);
  const demands = filtered.map(n => n.demand_weekly);
  const xThreshold = percentile(demands, highDemandPercentile) || 0;
  const yThreshold = lowPresenceThreshold;

  // Peer-median target share = median share where you already sell (>0)
  const haveShare = filtered.filter(n => n.brand_share > 0).map(n => n.brand_share);
  const targetShare = haveShare.length ? median(haveShare) : undefined;

  const scored: ScoredRetailer[] = filtered.map(n => {
    const pres = Math.min(n.brand_share, shareCapForScore);
    const score = n.demand_weekly * (1 - pres);

    // Potential views/wk if you reached peer-median share
    const potential =
      targetShare !== undefined ? Math.max(0, n.demand_weekly * (targetShare - n.brand_share)) : undefined;

    let quadrant: ScoredRetailer['quadrant'] = 'Low priority';
    if (n.demand_weekly >= xThreshold && n.brand_share < yThreshold) quadrant = 'Opportunity';
    else if (n.demand_weekly >= xThreshold && n.brand_share >= yThreshold) quadrant = 'Performing';
    else if (n.demand_weekly < xThreshold && n.brand_share >= yThreshold) quadrant = 'Over-indexed';
    else quadrant = 'Low priority';

    return { ...n, score, potential_weekly: potential, quadrant };
  });

  return { scored, xThreshold, yThreshold, targetShare };
}

/** Rank Opportunity quadrant for the sidebar & auto insight */
export function rankOpportunities(
  scored: ScoredRetailer[],
  targetShare?: number
): ScoredRetailer[] {
  const opp = scored.filter(s => s.quadrant === 'Opportunity');
  // Sort by potential desc -> score desc -> demand desc
  return opp.sort((a, b) =>
    (b.potential_weekly ?? -1) - (a.potential_weekly ?? -1) ||
    b.score - a.score ||
    b.demand_weekly - a.demand_weekly
  );
}

/** Build the small auto insight (status-only, no prescriptions) */
export function buildChannelOpportunityInsight(
  scored: ScoredRetailer[],
  mode: CompareMode = 'pop',
  targetShare?: number
): ChannelInsight {
  const byOpp = rankOpportunities(scored, targetShare);

  // If no "Opportunity" points, fall back to the highest score overall (still status-only)
  const chosen = byOpp[0] ?? scored.slice().sort((a,b)=>b.score - a.score)[0];
  if (!chosen) return { title: 'No data', text: 'Not enough volume to evaluate retailers.', tags: [] };

  const growth =
    mode === 'yoy' ? chosen.demand_growth_yoy : chosen.demand_growth_pop;
  const shareDelta =
    mode === 'yoy' ? chosen.brand_share_delta_yoy : chosen.brand_share_delta_pop;

  const tagA = growth !== undefined ? `${growth >= 0 ? '+' : ''}${(growth*100).toFixed(0)}% ${mode.toUpperCase()}` : '';
  const tagB = shareDelta !== undefined ? `${shareDelta >= 0 ? '+' : ''}${(shareDelta*100).toFixed(1)}pp ${mode.toUpperCase()}` : '';

  const title =
    chosen.brand_share === 0 && chosen.quadrant === 'Opportunity'
      ? `High-priority opportunity: ${chosen.retailerName}`
      : chosen.quadrant === 'Opportunity'
      ? `Growth opportunity: ${chosen.retailerName}`
      : `Channel performing: ${chosen.retailerName}`;

  const potentialText =
    targetShare !== undefined && chosen.potential_weekly !== undefined
      ? ` (~${abbr(chosen.potential_weekly)} views/week potential at peer-median share)`
      : '';

  const text = chosen.brand_share === 0 
    ? `<strong>Zero brand presence</strong> with <strong>${abbr(chosen.demand_weekly)}</strong> weekly category demand${potentialText}.`
    : `Currently <strong>${(chosen.brand_share*100).toFixed(1)}%</strong> share with <strong>${abbr(chosen.demand_weekly)}</strong> weekly demand${potentialText}.`;

  return {
    retailerId: chosen.retailerId,
    retailerName: chosen.retailerName,
    title,
    text,
    tags: [tagA, tagB].filter(Boolean),
  };
}

export function abbr(n: number | undefined) {
  if (n === undefined) return '';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${Math.round(n)}`;
}


