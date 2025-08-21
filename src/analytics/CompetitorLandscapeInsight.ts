// CompetitorLandscapeInsight.ts
// Status-only insight for the Brand Competitive Landscape bubble chart.
// X = Overlap demand (TOTAL category views where both are active)
// Y = Head-to-head lead vs you, in percentage points (-100..+100)
// Bubble size = competitor TOTAL views inside the overlap
// No PoP/YoY — totals only. Always returns one highlight.

// ---------- Types ----------
export type CompetitorRow = {
  brand: string;                // competitor brand name (exact label)
  overlapCategoryViews: number; // X: TOTAL category views across retailers where both brands are active
  myViewsOverlap: number;       // your TOTAL brand views within that overlap
  compViewsOverlap: number;     // competitor's TOTAL brand views within that overlap
};

export type Insight = {
  brand: string;
  title: string; // short status incl. brand name + quadrant cue
  text: string;  // one neutral sentence explaining lead & overlap (why in that quadrant)
};

// ---------- Config (tweak if needed) ----------
const HIGH_OVERLAP_PERCENTILE = 0.70; // p70 of overlap across competitors = vertical line
const LEAD_THRESHOLD = 0.10;          // ±10 pp = "clear lead"
const MIN_OVERLAP_FLOOR = 10_000;     // ignore vanishing overlaps (TOTAL category views)

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

// Head-to-head lead vs you in decimal pp: (comp - you) / (comp + you) ∈ [-1..+1]
function leadVsMe(my: number, comp: number) {
  const denom = my + comp;
  return denom > 0 ? (comp - my) / denom : 0;
}
const pp = (x: number) => `${Math.abs(x * 100).toFixed(1)} pp`;

// ---------- Core API ----------
/**
 * Pick ONE competitor and return a status insight.
 * Quadrants:
 *   - Strong rival:    high overlap & competitor leads (Y > 0)
 *   - Your stronghold: high overlap & you lead (Y <= 0)
 *   - Niche rival:     low overlap  & competitor leads
 *   - Low overlap:     low overlap  & you lead/near parity
 * Priority:
 *   1) Dominant rival (Strong rival with lead ≥ 10 pp, rank by overlap * lead)
 *   2) Your stronghold (lead ≤ −10 pp, rank by overlap)
 *   3) Niche rival (competitor leads, rank by overlap)
 *   4) Fallback: largest overlap overall (Competitive highlight)
 */
export function pickCompetitorLandscapeInsight(rows: CompetitorRow[]): Insight {
  if (!rows.length) {
    return { brand: "", title: "No data", text: "Not enough overlap to compare competitors." };
  }

  // Compute per-competitor axes
  const enriched = rows.map(r => {
    const x = Math.max(0, r.overlapCategoryViews);
    const yDec = leadVsMe(r.myViewsOverlap, r.compViewsOverlap); // decimal
    return {
      brand: r.brand,
      x,                          // overlap demand (TOTAL category views)
      y: yDec,                    // lead vs you (decimal)
      yAbs: Math.abs(yDec),
      threat: x * Math.max(0, yDec) // overlap × (positive lead)
    };
  });

  // Volume guard
  const eligible = enriched.filter(e => e.x >= MIN_OVERLAP_FLOOR);
  const pool = eligible.length ? eligible : enriched;

  // Vertical threshold for "high overlap"
  const xThreshold = percentile(pool.map(p => p.x), HIGH_OVERLAP_PERCENTILE);

  // Partition by quadrant
  const strongRival    = pool.filter(p => p.x >= xThreshold && p.y > 0);
  const yourStronghold = pool.filter(p => p.x >= xThreshold && p.y <= 0);
  const nicheRival     = pool.filter(p => p.x <  xThreshold && p.y > 0);

  // Selection priority
  const dominant = strongRival
    .filter(p => p.y >= LEAD_THRESHOLD)
    .sort((a, b) => b.threat - a.threat)[0];

  if (dominant) {
    const leadStr = pp(dominant.y);
    const overlapStr = abbr(dominant.x);
    return {
      brand: dominant.brand,
      title: `Strong competition from ${dominant.brand}`,
      text: `<strong>${dominant.brand}</strong> leads your brand by <strong>${leadStr}</strong> across ~<strong>${overlapStr}</strong> total overlapping views — placing it in Strong rival (high overlap, competitor ahead).`
    };
  }

  const fortress = yourStronghold
    .filter(p => p.y <= -LEAD_THRESHOLD)
    .sort((a, b) => b.x - a.x)[0];

  if (fortress) {
    const leadStr = pp(fortress.y); // pp() now handles absolute value internally
    const overlapStr = abbr(fortress.x);
    return {
      brand: fortress.brand,
      title: `You lead key market vs ${fortress.brand}`,
      text: `You lead by <strong>${leadStr}</strong> across ~<strong>${overlapStr}</strong> total overlapping views — classified as Your stronghold (high overlap, you ahead).`
    };
  }

  const niche = nicheRival.sort((a, b) => b.x - a.x)[0];
  if (niche) {
    const leadStr = pp(niche.y);
    const overlapStr = abbr(niche.x);
    return {
      brand: niche.brand,
      title: `${niche.brand} leads in small market`,
      text: `<strong>${niche.brand}</strong> leads by <strong>${leadStr}</strong>, but the shared market is small (~<strong>${overlapStr}</strong> total views), hence Niche rival (low overlap).`
    };
  }

  // Fallback: largest overlap overall (even near parity)
  const fallback = pool.slice().sort((a, b) => b.x - a.x)[0];
  const leadStr = pp(fallback.y);
  const overlapStr = abbr(fallback.x);
  const quadrant = fallback.x >= xThreshold
    ? (fallback.y > 0 ? "Strong rival" : "Your stronghold")
    : (fallback.y > 0 ? "Niche rival" : "Low overlap");

  return {
    brand: fallback.brand,
    title: `Neck and neck with ${fallback.brand}`,
    text: `Near parity at <strong>${leadStr}</strong> over ~<strong>${overlapStr}</strong> total overlapping views — positioned as <strong>${quadrant}</strong>.`
  };
}


