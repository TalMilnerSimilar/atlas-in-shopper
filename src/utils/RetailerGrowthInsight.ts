type Mode = 'pop' | 'yoy';

export type Series = {
  retailer: string;           // retailer name to print in copy
  current: number[];          // weekly brand views in the current period
  previous: number[];         // weekly brand views in the comparison period (same length)
};

export type Insight =
  | { type: 'MOMENTUM'; retailer: string; headline: string; sentence: string; viewsPct: number }
  | { type: 'REVERSAL'; retailer: string; headline: string; sentence: string; viewsPct: number }
  | { type: 'DECLINE';  retailer: string; headline: string; sentence: string; viewsPct: number };

// Helpers
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const pct = (curr: number, prev: number) => (curr - prev) / Math.max(prev, 1);

export function pickRetailerGrowthInsight(
  data: Series[],
  mode: Mode = 'pop'
): Insight {
  // Calculate metrics for each retailer
  const retailers = data.map(series => {
    const totalNow = sum(series.current);
    const totalPrev = sum(series.previous);
    const avgWeekly = totalNow / series.current.length;
    const growth = pct(totalNow, totalPrev);
    const slopeNow = series.current[series.current.length - 1] - series.current[0];
    const slopePrev = series.previous[series.previous.length - 1] - series.previous[0];
    const reversed = slopeNow * slopePrev < 0;

    return {
      retailer: series.retailer,
      totalNow,
      totalPrev,
      avgWeekly,
      growth,
      slopeNow,
      slopePrev,
      reversed
    };
  });

  // Apply volume floor - if no retailers qualify, use all retailers
  let qualified = retailers.filter(r => r.avgWeekly >= 1000);
  if (qualified.length === 0) {
    qualified = retailers;
  }

  // If still no retailers (empty data), pick the first one with fallback values
  if (qualified.length === 0) {
    return {
      type: 'DECLINE',
      retailer: 'Unknown',
      headline: 'Decline alert on Unknown',
      sentence: 'Views down 0% POP on Unknown.',
      viewsPct: 0
    };
  }

  // Set thresholds based on mode (lowered for more varied insights)
  const posThreshold = mode === 'pop' ? 0.02 : 0.03; // +2% for PoP, +3% for YoY
  const negThreshold = mode === 'pop' ? -0.02 : -0.03; // -2% for PoP, -3% for YoY

  // Debug: Log growth data to understand why we always get momentum
  console.log('Insight Debug:', {
    mode,
    posThreshold,
    negThreshold,
    retailers: qualified.map(r => ({
      retailer: r.retailer,
      growth: r.growth,
      reversed: r.reversed,
      avgWeekly: r.avgWeekly
    }))
  });

  // Helper to format weekly averages
  const formatWeekly = (avg: number): string => {
    if (avg >= 1000) {
      return `${(avg / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return Math.round(avg).toString();
  };

  // 1. REVERSAL: choose any reversed === true, break ties by higher absolute growth
  const reversals = qualified.filter(r => r.reversed);
  if (reversals.length > 0) {
    const chosen = reversals.reduce((a, b) => 
      Math.abs(a.growth) > Math.abs(b.growth) ? a : b
    );
    const growthPct = Math.abs(chosen.growth * 100).toFixed(0);
    const modeStr = mode.toUpperCase();
    const avgWeeklyFmt = formatWeekly(chosen.avgWeekly);
    
    return {
      type: 'REVERSAL',
      retailer: chosen.retailer,
      headline: `Trend reversal on ${chosen.retailer}`,
      sentence: `Views on <strong>${chosen.retailer}</strong> swung from decline to growth: <strong>+${growthPct}% ${modeStr}</strong>, now ~${avgWeeklyFmt} views/week.`,
      viewsPct: chosen.growth
    };
  }

  // 2. MOMENTUM: highest growth where growth >= posThreshold
  const momentum = qualified.filter(r => r.growth >= posThreshold);
  if (momentum.length > 0) {
    const chosen = momentum.reduce((a, b) => a.growth > b.growth ? a : b);
    const growthPct = (chosen.growth * 100).toFixed(0);
    const modeStr = mode.toUpperCase();
    const avgWeeklyFmt = formatWeekly(chosen.avgWeekly);
    
    return {
      type: 'MOMENTUM',
      retailer: chosen.retailer,
      headline: `Momentum leader: ${chosen.retailer}`,
      sentence: `Views up <strong>+${growthPct}% ${modeStr}</strong> on <strong>${chosen.retailer}</strong>, reaching ~${avgWeeklyFmt} views/week.`,
      viewsPct: chosen.growth
    };
  }

  // 3. DECLINE: most negative growth where growth <= negThreshold
  const declines = qualified.filter(r => r.growth <= negThreshold);
  if (declines.length > 0) {
    const chosen = declines.reduce((a, b) => a.growth < b.growth ? a : b);
    const growthPct = Math.abs(chosen.growth * 100).toFixed(0);
    const modeStr = mode.toUpperCase();
    const avgWeeklyFmt = formatWeekly(chosen.avgWeekly);
    
    return {
      type: 'DECLINE',
      retailer: chosen.retailer,
      headline: `Decline alert on ${chosen.retailer}`,
      sentence: `Views down <strong>${growthPct}% ${modeStr}</strong> on <strong>${chosen.retailer}</strong>, averaging ~${avgWeeklyFmt} views/week.`,
      viewsPct: chosen.growth
    };
  }

  // 4. Fallback: pick the retailer with the highest absolute growth (most interesting)
  const fallback = qualified.reduce((a, b) => 
    Math.abs(a.growth) > Math.abs(b.growth) ? a : b
  );
  
  // Determine type based on growth direction
  const avgWeeklyFmt = formatWeekly(fallback.avgWeekly);
  const modeStr = mode.toUpperCase();
  
  if (fallback.growth >= 0) {
    const growthPct = (fallback.growth * 100).toFixed(0);
    
    return {
      type: 'MOMENTUM',
      retailer: fallback.retailer,
      headline: `Momentum leader: ${fallback.retailer}.`,
      sentence: `Views up <strong>+${growthPct}% ${modeStr}</strong> on <strong>${fallback.retailer}</strong>, reaching ~${avgWeeklyFmt} views/week.`,
      viewsPct: fallback.growth
    };
  } else {
    const growthPct = Math.abs(fallback.growth * 100).toFixed(0);
    
    return {
      type: 'DECLINE',
      retailer: fallback.retailer,
      headline: `Decline alert on ${fallback.retailer}.`,
      sentence: `Views down <strong>${growthPct}% ${modeStr}</strong> on <strong>${fallback.retailer}</strong>, averaging ~${avgWeeklyFmt} views/week.`,
      viewsPct: fallback.growth
    };
  }
}
