const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const retailersTsPath = path.join(ROOT, 'src/data/retailerOptions.ts');
const csvOutPath = path.join(ROOT, 'public/data/retailer_series.csv');

const content = fs.readFileSync(retailersTsPath, 'utf8');
// crude parse: find array of strings
const matches = [...content.matchAll(/'([^']+)'/g)].map(m => m[1]);
let hosts = matches.filter(s => s && !/^all\s/i.test(s));

// Deduplicate
hosts = [...new Set(hosts.map(h => h.trim().toLowerCase()))];

// Seeded RNG utilities
function hashString(str) {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed) {
  let state = (seed || 1) >>> 0;
  return () => {
    // LCG
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function scaleByHeuristic(host, base) {
  const h = host;
  let factor = 1;
  if (h.includes('amazon')) factor *= 1.7 + (hashString(h+'a') % 30) / 100; // 1.7..2.0
  if (h.includes('walmart')) factor *= 1.4 + (hashString(h+'w') % 20) / 100; // 1.4..1.6
  if (h.includes('target')) factor *= 1.3 + (hashString(h+'t') % 15) / 100; // 1.3..1.45
  if (h.includes('apple')) factor *= 1.4 + (hashString(h+'p') % 15) / 100;
  if (h.includes('ebay')) factor *= 1.2 + (hashString(h+'e') % 15) / 100;
  if (h.includes('nike')) factor *= 1.1 + (hashString(h+'n') % 15) / 100;
  if (h.includes('bestbuy')) factor *= 1.1 + (hashString(h+'b') % 10) / 100;
  if (h.includes('homedepot') || h.includes('lowes')) factor *= 1.0 + (hashString(h+'h') % 10) / 100;
  if (h.includes('carrefour') || h.includes('fnac') || h.includes('otto') || h.includes('saturn')) factor *= 0.7 + (hashString(h+'c') % 30) / 100; // 0.7..1.0
  if (h.includes('harveynorman')) factor *= 0.6 + (hashString(h+'hn') % 20) / 100; // 0.6..0.8
  return Math.max(0.4, factor) * base;
}

function generateSeriesForHost(host) {
  const seed = hashString(host);
  const rand = rng(seed);
  // pick a base between 40k and 220k
  let base = 40000 + Math.floor(rand() * 180000);
  base = scaleByHeuristic(host, base);

  // trend -15%..+18% across the 7 points
  const trend = -0.15 + rand() * 0.33;
  // volatility amplitude 6%..14%
  const vol = 0.06 + rand() * 0.08;
  // sinusoid amplitude 2%..8% and random phase
  const sinAmp = 0.02 + rand() * 0.06;
  const phase = rand() * Math.PI * 2;

  const out = [];
  for (let i = 0; i < 7; i++) {
    const p = i / 6; // 0..1
    const trendFactor = 1 + trend * p;
    const noise = (rand() * 2 - 1) * vol; // +/- vol
    const sin = Math.sin(p * Math.PI * 2 + phase) * sinAmp;
    let v = base * trendFactor * (1 + noise + sin);
    v = Math.max(8000, Math.round(v / 1000) * 1000);
    out.push(v);
  }

  // Ensure non-monotonic: count direction changes
  const diffs = out.slice(1).map((v, i) => v - out[i]);
  const signs = diffs.map(d => (d === 0 ? 0 : d > 0 ? 1 : -1));
  const changes = signs.reduce((acc, s, idx) => acc + (idx>0 && s!==0 && s !== signs[idx-1] ? 1 : 0), 0);
  if (changes === 0) {
    // force a mid bump/dip
    const mid = 3;
    out[mid] = Math.round(out[mid] * (1 + (trend >= 0 ? -0.12 : 0.12)) / 1000) * 1000;
  }

  // Ensure uniqueness by perturbing a random point if hash collides (not expected)
  return out;
}

const header = '# key, then 7 weekly values (views). Values are absolute; UI formats to K.';
const cols = 'key,w1,w2,w3,w4,w5,w6,w7';
const lines = [header, cols];

for (const host of hosts) {
  const series = generateSeriesForHost(host);
  lines.push([host, ...series].join(','));
}

fs.writeFileSync(csvOutPath, lines.join('\n') + '\n', 'utf8');
console.log('Wrote', csvOutPath, 'with', hosts.length, 'hosts');
