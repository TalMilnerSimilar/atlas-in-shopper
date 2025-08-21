// RetailerMixInsight.ts
// Picks ONE retailer from the "Retailers’ Share of the Brand" stack
// and returns a status-only insight: title + one sentence + PoP/YoY tags.

// ---------------- Types ----------------
export type MixSeries = {
  retailer: string;          // exact display name
  current: number[];         // weekly brand views (current period)
  prevPop?: number[];        // weekly brand views (previous equal-length period)
  prevYoy?: number[];        // weekly brand views (same weeks last year)
};

export type MixInsight = {
  retailer: string;
  title: string;             // short status incl. retailer name
  text: string;              // one sentence, neutral
  tags: {                    // change chips (percentage points), if available
    pop?: string;            // e.g., "PoP: +1.8 pp"
    yoy?: string;            // e.g., "YoY: −0.7 pp"
  };
};

// ---------------- Config (tweak as needed) ----------------
const MIN_AVG_WEEKLY = 1000;   // ignore tiny/noisy channels
const MATERIAL_PP = 0.010;     // ≥ 1.0 percentage point
const NEW_CUR_MIN = 0.020;     // ≥ 2.0% now
const NEW_PREV_MAX = 0.005;    // ≤ 0.5% before (~0%)
const DROPPED_CUR_MAX = 0.005; // ≤ 0.5% now
const DROPPED_PREV_MIN = 0.020;// ≥ 2.0% before

// ---------------- Helpers ----------------
const sum = (a: number[] | undefined) => (a && a.length ? a.reduce((x, y) => x + y, 0) : 0);
const fmtPct1 = (p: number) => `${(p * 100).toFixed(1)}%`;
const fmtPp = (d: number) => `${d >= 0 ? "+" : "−"}${Math.abs(d * 100).toFixed(1)}pp`;

/** Safe delta when a previous baseline may be missing */
function delta(curr: number, prev?: number) {
  if (prev === undefined) return undefined;
  return curr - prev;
}

/** Guard: average weekly volume >= floor */
function avgWeekly(curr: number[], weeks: number) {
  const t = sum(curr);
  return weeks > 0 ? t / weeks : 0;
}

type Row = {
  retailer: string;
  sNow: number;           // current share of brand
  sPop?: number;          // previous (PoP) share of brand
  sYoy?: number;          // previous (YoY) share of brand
  dPop?: number;          // pp delta vs PoP (decimal)
  dYoy?: number;          // pp delta vs YoY (decimal)
  avg: number;            // avg weekly views (volume guard)
};

// ---------------- Core API ----------------
/**
 * Selects one retailer from the stack and returns a status insight.
 * Priority: New → Dropped → Largest material share change → Stable leader.
 * Always returns one highlight.
 */
export function pickRetailerMixInsight(series: MixSeries[], opts?: { eligible?: Set<string> }): MixInsight {
  // Precompute totals
  const W = series[0]?.current?.length ?? 0;

  // Totals across retailers for current & baselines
  const T_all = series.reduce((acc, r) => acc + sum(r.current), 0);
  const T_pop_all = series.reduce((acc, r) => acc + sum(r.prevPop), 0);
  const T_yoy_all = series.reduce((acc, r) => acc + sum(r.prevYoy), 0);

  // Build rows with shares & deltas
  const rows: Row[] = series.map(r => {
    const T = sum(r.current);
    const Tpop = sum(r.prevPop);
    const Tyoy = sum(r.prevYoy);

    const sNow = T_all > 0 ? T / T_all : 0;
    const sPop = T_pop_all > 0 && r.prevPop ? Tpop / T_pop_all : undefined;
    const sYoy = T_yoy_all > 0 && r.prevYoy ? Tyoy / T_yoy_all : undefined;

    const dPop = delta(sNow, sPop);
    const dYoy = delta(sNow, sYoy);

    return {
      retailer: r.retailer,
      sNow,
      sPop,
      sYoy,
      dPop,
      dYoy,
      avg: avgWeekly(r.current, W),
    };
  });

  // Restrict to eligible (selected) retailers if provided
  const base = opts?.eligible ? rows.filter(r => opts!.eligible!.has(r.retailer)) : rows;

  // Volume guard
  const eligible = base.filter(r => r.avg >= MIN_AVG_WEEKLY);
  const pool = eligible.length ? eligible : base; // if all tiny, fallback to constrained set

  // Helper: pick with tiebreakers
  const by = <T>(items: T[], score: (x: T) => number, tiebreak?: (a: T, b: T) => number) =>
    items.slice().sort((a, b) => {
      const s = score(b) - score(a);
      if (s !== 0) return s;
      return tiebreak ? tiebreak(a, b) : 0;
    })[0];

  const material = (x?: number) => x !== undefined && Math.abs(x) >= MATERIAL_PP;

  // ---------- A) New in the mix ----------
  const newOnes = pool.filter(r => {
    const isNewPop = r.sPop !== undefined && r.sPop <= NEW_PREV_MAX && r.sNow >= NEW_CUR_MIN;
    const isNewYoy = r.sYoy !== undefined && r.sYoy <= NEW_PREV_MAX && r.sNow >= NEW_CUR_MIN;
    return isNewPop || isNewYoy;
  });
  if (newOnes.length) {
    const picked = by(newOnes, r => r.sNow, (a, b) => b.avg - a.avg);
    return {
      retailer: picked.retailer,
      title: `New in the mix: ${picked.retailer}`,
      text: `Now <strong>${fmtPct1(picked.sNow)}</strong> of brand views after <strong>~0%</strong> previously; most notable new entrant this period.`,
      tags: {
        ...(picked.dPop !== undefined ? { pop: `${fmtPp(picked.dPop)} PoP` } : {}),
        ...(picked.dYoy !== undefined ? { yoy: `${fmtPp(picked.dYoy)} YoY` } : {}),
      },
    };
  }

  // ---------- B) Dropped from the mix ----------
  const dropped = pool.filter(r => {
    const isDroppedPop = r.sPop !== undefined && r.sNow <= DROPPED_CUR_MAX && r.sPop >= DROPPED_PREV_MIN;
    const isDroppedYoy = r.sYoy !== undefined && r.sNow <= DROPPED_CUR_MAX && r.sYoy >= DROPPED_PREV_MIN;
    return isDroppedPop || isDroppedYoy;
  });
  if (dropped.length) {
    const picked = by(
      dropped,
      r => Math.max(r.sPop ?? 0, r.sYoy ?? 0),
      (a, b) => b.avg - a.avg
    );
    const was = Math.max(picked.sPop ?? 0, picked.sYoy ?? 0);
    return {
      retailer: picked.retailer,
      title: `Dropped from the mix: ${picked.retailer}`,
      text: `Now <strong>~0%</strong> of brand views (was <strong>${fmtPct1(was)}</strong>); effectively absent this period.`,
      tags: {
        ...(picked.dPop !== undefined ? { pop: `${fmtPp(picked.dPop)} PoP` } : {}),
        ...(picked.dYoy !== undefined ? { yoy: `${fmtPp(picked.dYoy)} YoY` } : {}),
      },
    };
  }

  // ---------- C) Largest material share change (gain or loss) ----------
  const movers = pool.filter(r => material(r.dPop) || material(r.dYoy));
  if (movers.length) {
    const magnitude = (r: Row) =>
      Math.max(Math.abs(r.dPop ?? 0), Math.abs(r.dYoy ?? 0));
    const picked = by(movers, magnitude, (a, b) => b.sNow - a.sNow || b.avg - a.avg);
    const rising = Math.max(picked.dPop ?? -Infinity, picked.dYoy ?? -Infinity) >= MATERIAL_PP;
    const title = rising ? `Share rising on ${picked.retailer}` : `Share declining on ${picked.retailer}`;
    const text = rising
      ? `Now <strong>${fmtPct1(picked.sNow)}</strong> of brand views — the largest percentage-point gain among retailers.`
      : `Now <strong>${fmtPct1(picked.sNow)}</strong> of brand views — the steepest percentage-point drop in the set.`;
    return {
      retailer: picked.retailer,
      title,
      text,
      tags: {
        ...(picked.dPop !== undefined ? { pop: `${fmtPp(picked.dPop)} PoP` } : {}),
        ...(picked.dYoy !== undefined ? { yoy: `${fmtPp(picked.dYoy)} YoY` } : {}),
      },
    };
  }

  // ---------- D) Stable mix fallback (always fires) ----------
  const leader = by(pool, r => r.sNow, (a, b) => b.avg - a.avg);
  return {
    retailer: leader.retailer,
    title: `Mix stable — ${leader.retailer} leads`,
    text: `<strong>${leader.retailer}</strong> holds <strong>${fmtPct1(leader.sNow)}</strong> of brand views with only minor movement versus both periods.`,
    tags: {
      ...(leader.dPop !== undefined ? { pop: `${fmtPp(leader.dPop)} PoP` } : {}),
      ...(leader.dYoy !== undefined ? { yoy: `${fmtPp(leader.dYoy)} YoY` } : {}),
    },
  };
}

// ---------------- Example (remove or keep as a doc) ----------------
// const insight = pickRetailerMixInsight([
//   { retailer: "Amazon", current: [120,130,140], prevPop: [118,126,134], prevYoy: [100,110,120] },
//   { retailer: "Walmart", current: [70,75,80],    prevPop: [60,62,64],    prevYoy: [65,66,67] },
//   { retailer: "eBay",    current: [0,0,0],       prevPop: [8,8,8],       prevYoy: [9,9,9] },
// ]);
// console.log(insight);
