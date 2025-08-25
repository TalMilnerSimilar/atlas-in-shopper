// RetailerPerformanceInsight.ts
// Insights for the Retailer Performance Analysis bubble chart.
// X = Total views for retailer (within category and selected brands)
// Y = YoY growth percentage points (positive above 0, negative below 0)
// Bubble size = Total views for your brand within that retailer

// ---------- Types ----------
export type RetailerPerformanceRow = {
  retailer: string;           // retailer name (exact label)
  totalViews: number;         // X: total views for retailer in category
  yoyGrowthPP: number;        // Y: YoY growth in percentage points (-100..+100)
  yourBrandViews: number;     // bubble size: your brand's views within this retailer
};

export type Insight = {
  retailer: string;
  title: string; // short status incl. retailer name + quadrant cue
  text: string;  // one sentence explaining performance & position
};

// ---------- Config (tweak if needed) ----------
const HIGH_VIEWS_PERCENTILE = 0.70;      // p70 of total views = vertical line
const STRONG_GROWTH_THRESHOLD = 5;        // +5 pp = "strong growth"
const STRONG_DECLINE_THRESHOLD = -5;      // -5 pp = "strong decline"
const MIN_VIEWS_FLOOR = 50_000;           // ignore retailers with very low views

// ---------- Helpers ----------
const percentile = (arr: number[], p: number) => {
  if (!arr.length) return 0;
  const a = arr.slice().sort((x, y) => x - y);
  const pos = (a.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  return a[base] + (a[Math.min(base + 1, a.length - 1)] - a[base]) * rest;
};

const abbr = (n: number) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(Math.round(n));
};

const formatGrowth = (growthPP: number) => {
  const sign = growthPP > 0 ? "+" : "";
  return `${sign}${growthPP.toFixed(1)}pp`;
};

// ---------- Core API ----------
/**
 * Pick ONE retailer and return a performance insight.
 * Quadrants:
 *   - Growth leaders:    high views & positive YoY growth (Y > 0)
 *   - Rising stars:      low views & positive YoY growth 
 *   - Declining giants:  high views & negative YoY growth (Y < 0)
 *   - Underperformers:   low views & negative YoY growth
 * Priority:
 *   1) Strong growth leaders (high views + growth ≥ +5pp, rank by total impact)
 *   2) Major declining giants (high views + decline ≤ -5pp, rank by views)
 *   3) Rising stars with momentum (low views + strong growth, rank by growth rate)
 *   4) Fallback: highest total views overall
 */
export function pickRetailerPerformanceInsight(rows: RetailerPerformanceRow[]): Insight {
  if (!rows.length) {
    return { retailer: "", title: "No data", text: "Not enough retailer data to analyze performance." };
  }

  // Compute per-retailer metrics
  const enriched = rows.map(r => {
    const x = Math.max(0, r.totalViews);
    const y = r.yoyGrowthPP;
    return {
      retailer: r.retailer,
      x,                                    // total views
      y,                                    // YoY growth pp
      yourViews: Math.max(0, r.yourBrandViews),
      impact: x * Math.max(0, y / 100),     // total views × positive growth rate
      marketShare: x > 0 ? r.yourBrandViews / x : 0
    };
  });

  // Volume guard
  const eligible = enriched.filter(e => e.x >= MIN_VIEWS_FLOOR);
  const pool = eligible.length ? eligible : enriched;

  // Horizontal threshold for "high views"
  const xThreshold = percentile(pool.map(p => p.x), HIGH_VIEWS_PERCENTILE);

  // Partition by quadrant
  const growthLeaders    = pool.filter(p => p.x >= xThreshold && p.y > 0);
  const decliningGiants  = pool.filter(p => p.x >= xThreshold && p.y <= 0);
  const risingStars      = pool.filter(p => p.x <  xThreshold && p.y > 0);
  const underperformers  = pool.filter(p => p.x <  xThreshold && p.y <= 0);

  // Selection priority

  // 1) Strong growth leaders
  const strongGrowthLeader = growthLeaders
    .filter(p => p.y >= STRONG_GROWTH_THRESHOLD)
    .sort((a, b) => b.impact - a.impact)[0];

  if (strongGrowthLeader) {
    const growthStr = formatGrowth(strongGrowthLeader.y);
    const viewsStr = abbr(strongGrowthLeader.x);
    const shareStr = (strongGrowthLeader.marketShare * 100).toFixed(1);
    return {
      retailer: strongGrowthLeader.retailer,
      title: `${strongGrowthLeader.retailer} is a growth leader`,
      text: `<strong>${strongGrowthLeader.retailer}</strong> shows strong momentum with <strong>${growthStr}</strong> YoY growth across <strong>${viewsStr}</strong> total views, where your brand holds a <strong>${shareStr}%</strong> share.`
    };
  }

  // 2) Major declining giants  
  const majorDecliningGiant = decliningGiants
    .filter(p => p.y <= STRONG_DECLINE_THRESHOLD)
    .sort((a, b) => b.x - a.x)[0];

  if (majorDecliningGiant) {
    const declineStr = formatGrowth(majorDecliningGiant.y);
    const viewsStr = abbr(majorDecliningGiant.x);
    const shareStr = (majorDecliningGiant.marketShare * 100).toFixed(1);
    return {
      retailer: majorDecliningGiant.retailer,
      title: `${majorDecliningGiant.retailer} faces headwinds`,
      text: `Despite <strong>${viewsStr}</strong> total views, <strong>${majorDecliningGiant.retailer}</strong> shows concerning <strong>${declineStr}</strong> YoY decline, though your brand maintains <strong>${shareStr}%</strong> share there.`
    };
  }

  // 3) Rising stars with momentum
  const risingStar = risingStars
    .filter(p => p.y >= STRONG_GROWTH_THRESHOLD)
    .sort((a, b) => b.y - a.y)[0];

  if (risingStar) {
    const growthStr = formatGrowth(risingStar.y);
    const viewsStr = abbr(risingStar.x);
    const shareStr = (risingStar.marketShare * 100).toFixed(1);
    return {
      retailer: risingStar.retailer,
      title: `${risingStar.retailer} shows promise`,
      text: `<strong>${risingStar.retailer}</strong> is a rising star with impressive <strong>${growthStr}</strong> YoY growth, though still building scale at <strong>${viewsStr}</strong> total views (your brand: <strong>${shareStr}%</strong> share).`
    };
  }

  // 4) Fallback: highest total views overall
  const fallback = pool.slice().sort((a, b) => b.x - a.x)[0];
  const growthStr = formatGrowth(fallback.y);
  const viewsStr = abbr(fallback.x);
  const shareStr = (fallback.marketShare * 100).toFixed(1);
  
  const quadrant = fallback.x >= xThreshold
    ? (fallback.y > 0 ? "Growth leader" : "Declining giant")
    : (fallback.y > 0 ? "Rising star" : "Underperformer");

  return {
    retailer: fallback.retailer,
    title: `${fallback.retailer} dominates by volume`,
    text: `<strong>${fallback.retailer}</strong> leads with <strong>${viewsStr}</strong> total views and <strong>${growthStr}</strong> YoY performance, classified as <strong>${quadrant}</strong> (your brand: <strong>${shareStr}%</strong> share).`
  };
}
