// Unified JSON-like data structure for all brands and 7 metrics
// Top-level keys are brand names. Each metric has
// { value, share, change, shareOverTime } where share is a decimal (0..1)

import {
  brands,
  timeSeriesByMetric,
  overviewMetricKeys,
  funnelMetricKeys,
  MetricKey,
} from './unifiedBrandData';

type ShareOverTime = Record<string, number>; // e.g., { Mar: 0.13, ... }

export interface UnifiedMetric {
  value: number; // latest numeric value
  share: number; // latest market share (0..1)
  change: number; // MoM delta in share (decimal)
  shareOverTime: ShareOverTime; // month abbrev → share (0..1)
}

export type UnifiedBrandJSON = Record<string, Record<MetricKey, UnifiedMetric>>;

const allMetricKeys: MetricKey[] = [...overviewMetricKeys, ...funnelMetricKeys];


// Reuse the robust generator logic from the JSON builder to ensure
// - shares per month sum to 1
// - change bounds and variety
// - last month equals current share and last-first equals change
const monthsOrder = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const includeMonths = new Set(monthsOrder);
const MIN_CHANGE = 0.0001;
const MAX_CHANGE = 0.30;
const EPS = 1e-6;
const clamp = (value: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, value));
const pickMagnitude = () => {
  const r = Math.random();
  if (r < 0.4) return MIN_CHANGE + Math.random() * (0.03 - MIN_CHANGE);
  if (r < 0.8) return 0.03 + Math.random() * (0.15 - 0.03);
  return 0.15 + Math.random() * (MAX_CHANGE - 0.15);
};

type CategoryTotals = {
  total: number; // latest category total (last month)
  change: number; // last - first (absolute units)
  overTime: Record<string, number>; // month → absolute total
};

export const categoryTotalsByMetric: Record<MetricKey, CategoryTotals> = {} as any;

const buildUnified = (): UnifiedBrandJSON => {
  const out: UnifiedBrandJSON = {} as any;
  for (const b of brands) out[b] = {} as any;

  const monthAbbrev = (name: string): string => String(name).split(' ')[0];

  for (let mIdx = 0; mIdx < allMetricKeys.length; mIdx++) {
    const metric = allMetricKeys[mIdx];
    const series = timeSeriesByMetric[metric] || [];
    const monthToRow: Record<string, Record<string, number | string>> = {};
    for (const rowAny of series) {
      const row = rowAny as Record<string, number | string>;
      const mk = monthAbbrev(String(row.name));
      if (includeMonths.has(mk)) monthToRow[mk] = row;
    }
    const lastMonthKey = [...monthsOrder].reverse().find((mo) => monthToRow[mo]) || monthsOrder[monthsOrder.length - 1];
    const lastRow = monthToRow[lastMonthKey] || {} as Record<string, number | string>;

    // Start from empirical shares, then jitter to regenerate shares each load
    const totalLast = brands.reduce((s, b) => s + (Number(lastRow[b]) || 0), 0);
    let lastShareByBrand: Record<string, number> = {} as Record<string, number>;
    for (const b of brands) {
      const v = Number(lastRow[b]) || 0;
      const baseShare = totalLast > 0 ? v / totalLast : 0;
      lastShareByBrand[b] = baseShare;
    }
    // Normalize
    let sumShares0 = brands.reduce((s, b) => s + lastShareByBrand[b], 0) || 1;
    for (const b of brands) lastShareByBrand[b] = lastShareByBrand[b] / sumShares0;
    // Apply jitter (± up to 20% of base share, bounded)
    const jittered: Record<string, number> = {} as any;
    for (const b of brands) {
      const s0 = lastShareByBrand[b];
      const jitterFrac = (Math.random() * 0.4) - 0.2; // [-0.2, +0.2]
      jittered[b] = clamp(s0 * (1 + jitterFrac), EPS, 1 - EPS);
    }
    // Renormalize and correct residual
    let sumJ = brands.reduce((s, b) => s + jittered[b], 0) || 1;
    for (const b of brands) jittered[b] = jittered[b] / sumJ;
    const resid = 1 - brands.reduce((s, b) => s + jittered[b], 0);
    jittered[brands[brands.length - 1]] = clamp(jittered[brands[brands.length - 1]] + resid, EPS, 1 - EPS);
    lastShareByBrand = jittered;

    // Generate a random category total around empirical total, then derive last values from shares
    const baseTotal = totalLast || 100000; // fallback for safety
    const totalFactor = 0.85 + Math.random() * 0.5; // [0.85, 1.35]
    let newTotal = Math.max(1, Math.round(baseTotal * totalFactor));
    const latestValueByBrand: Record<string, number> = {} as any;
    let assigned = 0;
    for (let i = 0; i < brands.length - 1; i++) {
      const b = brands[i];
      const v = Math.max(0, Math.round(newTotal * lastShareByBrand[b]));
      latestValueByBrand[b] = v;
      assigned += v;
    }
    // Assign residual to last brand to make sums match total
    const lastB = brands[brands.length - 1];
    latestValueByBrand[lastB] = Math.max(0, newTotal - assigned);

    // Category totals over time and change (randomized sign/magnitude)
    const minTotChange = 0.0001; // 0.01%
    const maxTotChange = 0.30;   // 30%
    const sign = Math.random() < 0.5 ? 1 : -1;
    const r = Math.random();
    const mag = r < 0.4 ? minTotChange + Math.random() * (0.03 - minTotChange)
              : r < 0.8 ? 0.03 + Math.random() * (0.15 - 0.03)
                         : 0.15 + Math.random() * (maxTotChange - 0.15);
    const changeAbs = Math.round(newTotal * (sign * mag));
    const firstTotal = Math.max(1, newTotal - changeAbs);
    const totOverTime: Record<string, number> = {};
    const Mtot = monthsOrder.length;
    for (let t = 0; t < Mtot; t++) {
      const frac = Mtot === 1 ? 1 : t / (Mtot - 1);
      totOverTime[monthsOrder[t]] = Math.max(1, Math.round(firstTotal + changeAbs * frac));
    }
    categoryTotalsByMetric[metric] = { total: newTotal, change: changeAbs, overTime: totOverTime };

    const changes: Record<string, number> = {};
    const maxPos: Record<string, number> = {};
    const maxNeg: Record<string, number> = {};
    for (const b of brands) {
      const ls = lastShareByBrand[b];
      maxPos[b] = clamp(ls - EPS, 0, MAX_CHANGE);
      maxNeg[b] = clamp(1 - ls - EPS, 0, MAX_CHANGE);
      changes[b] = 0;
    }
    let anchorIdx = 0;
    let anchorCap = -Infinity;
    for (let i = 0; i < brands.length; i++) {
      const b = brands[i];
      const cap = Math.max(maxPos[b], maxNeg[b]);
      if (cap > anchorCap) { anchorCap = cap; anchorIdx = i; }
    }
    const anchorBrand = brands[anchorIdx];
    for (let i = 0; i < brands.length; i++) {
      if (i === anchorIdx) continue;
      const b = brands[i];
      let sign = Math.random() < 0.5 ? 1 : -1;
      if (sign > 0 && maxPos[b] < MIN_CHANGE) sign = -1;
      if (sign < 0 && maxNeg[b] < MIN_CHANGE) sign = 1;
      if ((sign > 0 && maxPos[b] < MIN_CHANGE) || (sign < 0 && maxNeg[b] < MIN_CHANGE)) { changes[b] = 0; continue; }
      const mag = clamp(pickMagnitude(), MIN_CHANGE, sign > 0 ? maxPos[b] : maxNeg[b]);
      changes[b] = sign * mag;
    }
    let sumNonAnchor = brands.reduce((s, b, i) => (i === anchorIdx ? s : s + changes[b]), 0);
    let desiredAnchor = -sumNonAnchor;
    const capAnchor = desiredAnchor >= 0 ? maxPos[anchorBrand] : maxNeg[anchorBrand];
    if (Math.abs(desiredAnchor) > capAnchor) {
      const scale = capAnchor / Math.max(Math.abs(desiredAnchor), EPS);
      for (let i = 0; i < brands.length; i++) {
        if (i === anchorIdx) continue;
        changes[brands[i]] *= scale;
        if (Math.abs(changes[brands[i]]) < MIN_CHANGE) {
          const sgn = Math.sign(changes[brands[i]]) || 1;
          const feasible = sgn > 0 ? maxPos[brands[i]] : maxNeg[brands[i]];
          changes[brands[i]] = sgn * Math.min(MIN_CHANGE, feasible);
        }
      }
      sumNonAnchor = brands.reduce((s, b, i) => (i === anchorIdx ? s : s + changes[b]), 0);
      desiredAnchor = -sumNonAnchor;
    }
    changes[anchorBrand] = clamp(desiredAnchor, -maxNeg[anchorBrand], maxPos[anchorBrand]);

    // Build base linear series first
    const M = monthsOrder.length;
    const baseSeries: Record<string, number[]> = {};
    for (const b of brands) {
      const lastShare = lastShareByBrand[b];
      const change = changes[b];
      const firstShare = clamp(lastShare - change, 0 + EPS, 1 - EPS);
      baseSeries[b] = [];
      for (let t = 0; t < M; t++) {
        const frac = M === 1 ? 1 : t / (M - 1);
        baseSeries[b][t] = firstShare + change * frac;
      }
    }
    // Multi-frequency wiggles per brand
    const sharesByMonth: Array<Record<string, number>> = Array.from({ length: M }, () => ({}));
    const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) % 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    const rand = rng(mIdx + 1337);
    const ampByBrand: Record<string, number> = {};
    const freqListByBrand: Record<string, number[]> = {};
    const phaseListByBrand: Record<string, number[]> = {};
    const weightListByBrand: Record<string, number[]> = {};
    for (const b of brands) {
      const changeAbs = Math.abs(changes[b]);
      ampByBrand[b] = clamp(0.25 * changeAbs + 0.02 * rand(), 0, 0.08 + 0.4 * changeAbs);
      const K = 2 + Math.floor(rand() * 4); // 2..5
      const freqs: number[] = [], phases: number[] = [], weightsRaw: number[] = [];
      for (let k = 0; k < K; k++) { freqs.push(1 + Math.floor(rand() * 4)); phases.push(rand() * Math.PI * 2); weightsRaw.push(0.2 + rand()); }
      const sumW = weightsRaw.reduce((s, x) => s + x, 0) || 1;
      const weights = weightsRaw.map((x) => x / sumW);
      freqListByBrand[b] = freqs; phaseListByBrand[b] = phases; weightListByBrand[b] = weights;
    }
    // endpoints exact
    for (const b of brands) { sharesByMonth[0][b] = baseSeries[b][0]; sharesByMonth[M - 1][b] = baseSeries[b][M - 1]; }
    // internal months with normalization
    for (let t = 1; t < M - 1; t++) {
      const frac = t / (M - 1);
      const envelope = Math.sin(Math.PI * frac);
      const proposed: Record<string, number> = {}; const wigg: Record<string, number> = {}; let wiggleSum = 0;
      for (const b of brands) {
        const A = ampByBrand[b] * envelope; const freqs = freqListByBrand[b]; const phases = phaseListByBrand[b]; const weights = weightListByBrand[b];
        let w = 0; for (let k = 0; k < freqs.length; k++) { w += weights[k] * Math.sin(2 * Math.PI * freqs[k] * frac + phases[k]); }
        w = A * w; wigg[b] = w; wiggleSum += w;
      }
      const meanW = wiggleSum / brands.length;
      for (const b of brands) proposed[b] = baseSeries[b][t] + (wigg[b] - meanW);
      const lower = EPS, upper = 1 - EPS; let sumS = 0; const sNow: Record<string, number> = {}; const capGrow: Record<string, number> = {}; const capShrink: Record<string, number> = {};
      for (const b of brands) { const s = clamp(proposed[b], lower, upper); sNow[b] = s; capGrow[b] = upper - s; capShrink[b] = s - lower; sumS += s; }
      let residual = 1 - sumS; let guard = 0;
      while (Math.abs(residual) > 1e-9 && guard++ < 5) {
        if (residual > 0) { let totalCap = 0; for (const b of brands) totalCap += capGrow[b]; if (totalCap <= 0) break; for (const b of brands) { if (capGrow[b] <= 0) continue; const add = residual * (capGrow[b] / totalCap); const actual = Math.min(add, capGrow[b]); sNow[b] += actual; capGrow[b] -= actual; capShrink[b] += actual; residual -= actual; } }
        else { let totalCap = 0; for (const b of brands) totalCap += capShrink[b]; if (totalCap <= 0) break; for (const b of brands) { if (capShrink[b] <= 0) continue; const rem = (-residual) * (capShrink[b] / totalCap); const actual = Math.min(rem, capShrink[b]); sNow[b] -= actual; capShrink[b] -= actual; capGrow[b] += actual; residual += actual; } }
      }
      for (const b of brands) sharesByMonth[t][b] = sNow[b];
    }
    // write out (value/share/change all from regenerated series)
    for (const b of brands) {
      const shareOverTime: ShareOverTime = {};
      for (let t = 0; t < M; t++) shareOverTime[monthsOrder[t]] = sharesByMonth[t][b];
      const share = sharesByMonth[M - 1][b];
      const first = sharesByMonth[0][b];
      const change = share - first;
      (out[b] as any)[metric] = { value: latestValueByBrand[b] || 0, share, change, shareOverTime };
    }
  }

  // Final assure current shares sum to 1
  for (const metric of allMetricKeys) {
    let sum = 0; for (const b of brands) sum += (out[b][metric]?.share || 0);
    if (sum > 0) {
      for (const b of brands) if (out[b][metric]) { out[b][metric].share = out[b][metric].share / sum; out[b][metric].shareOverTime[monthsOrder[monthsOrder.length - 1]] = out[b][metric].share; }
      let newSum = 0; for (const b of brands) newSum += (out[b][metric]?.share || 0);
      const residual = 1 - newSum; const lastB = brands[brands.length - 1]; if (out[lastB][metric]) { out[lastB][metric].share += residual; out[lastB][metric].shareOverTime[monthsOrder[monthsOrder.length - 1]] = out[lastB][metric].share; }
    }
  }
  return out;
};

export const unifiedBrands: UnifiedBrandJSON = buildUnified();
export default unifiedBrands;


