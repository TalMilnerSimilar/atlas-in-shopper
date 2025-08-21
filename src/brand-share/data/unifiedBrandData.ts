// Centralized, brand-centric data module
// Builds a unified structure combining all 7 metrics across time, and provides
// helpers for latest value, share, change, and per-month series.

// Canonical time-series live here (single source of truth)
// Product Views data
export const productViewsData = [
  { name: 'Mar 20', Nike: 22000, Adidas: 18000, 'New Balance': 14000, Hoka: 9000, Asics: 7000, Brooks: 4000, Saucony: 3000, 'Under Armour': 2000, Puma: 2000, Reebok: 1000, Fila: 1000, Mizuno: 1000, Skechers: 1000, Converse: 1000, Jordan: 1000, Vans: 1000, 'DC Shoes': 1000, Columbia: 1000, Salomon: 1000, Merrell: 1000, Timberland: 1000, 'La Sportiva': 1000, 'The North Face': 1000, Anta: 1000 },
  { name: 'Apr 20', Nike: 18500, Adidas: 22500, 'New Balance': 16800, Hoka: 13200, Asics: 9200, Brooks: 5800, Saucony: 4200, 'Under Armour': 2800, Puma: 1800, Reebok: 2200, Fila: 1200, Mizuno: 1100, Skechers: 1100, Converse: 1100, Jordan: 1100, Vans: 1100, 'DC Shoes': 1100, Columbia: 1100, Salomon: 1100, Merrell: 1100, Timberland: 1100, 'La Sportiva': 1100, 'The North Face': 1100, Anta: 1100 },
  { name: 'May 20', Nike: 26800, Adidas: 16200, 'New Balance': 19500, Hoka: 10800, Asics: 8400, Brooks: 5200, Saucony: 6800, 'Under Armour': 4200, Puma: 3200, Reebok: 800, Fila: 2400, Mizuno: 1200, Skechers: 1200, Converse: 1200, Jordan: 1200, Vans: 1200, 'DC Shoes': 1200, Columbia: 1200, Salomon: 1200, Merrell: 1200, Timberland: 1200, 'La Sportiva': 1200, 'The North Face': 1200, Anta: 1200 },
  { name: 'Jun 20', Nike: 31200, Adidas: 25800, 'New Balance': 11800, Hoka: 16800, Asics: 13200, Brooks: 7800, Saucony: 5200, 'Under Armour': 7200, Puma: 4800, Reebok: 3800, Fila: 2800, Mizuno: 1400, Skechers: 1400, Converse: 1400, Jordan: 1400, Vans: 1400, 'DC Shoes': 1400, Columbia: 1400, Salomon: 1400, Merrell: 1400, Timberland: 1400, 'La Sportiva': 1400, 'The North Face': 1400, Anta: 1400 },
  { name: 'Jul 20', Nike: 28400, Adidas: 29800, 'New Balance': 19200, Hoka: 15200, Asics: 14800, Brooks: 9200, Saucony: 7800, 'Under Armour': 5800, Puma: 6200, Reebok: 4800, Fila: 3600, Mizuno: 2400, Skechers: 1600, Converse: 1600, Jordan: 1600, Vans: 1600, 'DC Shoes': 1600, Columbia: 1600, Salomon: 1600, Merrell: 1600, Timberland: 1600, 'La Sportiva': 1600, 'The North Face': 1600, Anta: 1600 },
  { name: 'Aug 20', Nike: 25600, Adidas: 32400, 'New Balance': 22800, Hoka: 18400, Asics: 11200, Brooks: 10400, Saucony: 6800, 'Under Armour': 8400, Puma: 4400, Reebok: 3600, Fila: 3200, Mizuno: 2800, Skechers: 1800, Converse: 1800, Jordan: 1800, Vans: 1800, 'DC Shoes': 1800, Columbia: 1800, Salomon: 1800, Merrell: 1800, Timberland: 1800, 'La Sportiva': 1800, 'The North Face': 1800, Anta: 1800 },
  { name: 'Sep 20', Nike: 35600, Adidas: 21800, 'New Balance': 27200, Hoka: 20400, Asics: 16800, Brooks: 12800, Saucony: 9200, 'Under Armour': 7200, Puma: 7200, Reebok: 6200, Fila: 4800, Mizuno: 3600, Skechers: 2400, Converse: 2000, Jordan: 2000, Vans: 2000, 'DC Shoes': 2000, Columbia: 2000, Salomon: 2000, Merrell: 2000, Timberland: 2000, 'La Sportiva': 2000, 'The North Face': 2000, Anta: 2000 },
  { name: 'Oct 20', Nike: 29800, Adidas: 34600, 'New Balance': 18400, Hoka: 22800, Asics: 13600, Brooks: 11600, Saucony: 10400, 'Under Armour': 9600, Puma: 5800, Reebok: 5200, Fila: 4000, Mizuno: 2800, Skechers: 2800, Converse: 2200, Jordan: 2200, Vans: 2200, 'DC Shoes': 2200, Columbia: 2200, Salomon: 2200, Merrell: 2200, Timberland: 2200, 'La Sportiva': 2200, 'The North Face': 2200, Anta: 2200 },
  { name: 'Nov 20', Nike: 37800, Adidas: 29200, 'New Balance': 24800, Hoka: 21600, Asics: 18400, Brooks: 14400, Saucony: 8000, 'Under Armour': 10800, Puma: 7200, Reebok: 6400, Fila: 5200, Mizuno: 4000, Skechers: 3200, Converse: 2400, Jordan: 2400, Vans: 2400, 'DC Shoes': 2400, Columbia: 2400, Salomon: 2400, Merrell: 2400, Timberland: 2400, 'La Sportiva': 2400, 'The North Face': 2400, Anta: 2400 },
  { name: 'Dec 20', Nike: 41200, Adidas: 36800, 'New Balance': 30400, Hoka: 26400, Asics: 20800, Brooks: 16800, Saucony: 13200, 'Under Armour': 12000, Puma: 8400, Reebok: 7600, Fila: 6400, Mizuno: 5200, Skechers: 4000, Converse: 3200, Jordan: 3200, Vans: 3200, 'DC Shoes': 3200, Columbia: 3200, Salomon: 3200, Merrell: 3200, Timberland: 3200, 'La Sportiva': 3200, 'The North Face': 3200, Anta: 3200 },
];

// Units Sold data
export const unitsSoldData = [
  { name: 'Mar 20', Nike: 15000, Adidas: 13000, 'New Balance': 9000, Hoka: 6000, Asics: 4000, Brooks: 3000, Saucony: 2000, 'Under Armour': 2000, Puma: 1000, Reebok: 1000, Fila: 1000, Mizuno: 1000, Skechers: 1000, Converse: 1000, Jordan: 1000, Vans: 1000, 'DC Shoes': 1000, Columbia: 1000, Salomon: 1000, Merrell: 1000, Timberland: 1000, 'La Sportiva': 1000, 'The North Face': 1000, Anta: 1000 },
  { name: 'Apr 20', Nike: 11800, Adidas: 17200, 'New Balance': 11400, Hoka: 8400, Asics: 5200, Brooks: 4200, Saucony: 3200, 'Under Armour': 1800, Puma: 2200, Reebok: 800, Fila: 1200, Mizuno: 1200, Skechers: 1200, Converse: 1200, Jordan: 1200, Vans: 1200, 'DC Shoes': 1200, Columbia: 1200, Salomon: 1200, Merrell: 1200, Timberland: 1200, 'La Sportiva': 1200, 'The North Face': 1200, Anta: 1200 },
  { name: 'May 20', Nike: 19200, Adidas: 13600, 'New Balance': 12800, Hoka: 7200, Asics: 6800, Brooks: 2800, Saucony: 4800, 'Under Armour': 3600, Puma: 2400, Reebok: 600, Fila: 2400, Mizuno: 1600, Skechers: 1600, Converse: 1600, Jordan: 1600, Vans: 1600, 'DC Shoes': 1600, Columbia: 1600, Salomon: 1600, Merrell: 1600, Timberland: 1600, 'La Sportiva': 1600, 'The North Face': 1600, Anta: 1600 },
  { name: 'Jun 20', Nike: 22800, Adidas: 20400, 'New Balance': 6400, Hoka: 14400, Asics: 7600, Brooks: 5800, Saucony: 4800, 'Under Armour': 6400, Puma: 3600, Reebok: 2800, Fila: 1600, Mizuno: 2400, Skechers: 2000, Converse: 2000, Jordan: 2000, Vans: 2000, 'DC Shoes': 2000, Columbia: 2000, Salomon: 2000, Merrell: 2000, Timberland: 2000, 'La Sportiva': 2000, 'The North Face': 2000, Anta: 2000 },
  { name: 'Jul 20', Nike: 26400, Adidas: 23600, 'New Balance': 15200, Hoka: 10800, Asics: 10400, Brooks: 7200, Saucony: 5600, 'Under Armour': 4800, Puma: 5200, Reebok: 4000, Fila: 2800, Mizuno: 1200, Skechers: 2400, Converse: 2400, Jordan: 2400, Vans: 2400, 'DC Shoes': 2400, Columbia: 2400, Salomon: 2400, Merrell: 2400, Timberland: 2400, 'La Sportiva': 2400, 'The North Face': 2400, Anta: 2400 },
  { name: 'Aug 20', Nike: 18400, Adidas: 28400, 'New Balance': 17600, Hoka: 15200, Asics: 8800, Brooks: 8400, Saucony: 7200, 'Under Armour': 6400, Puma: 3600, Reebok: 4000, Fila: 3600, Mizuno: 3200, Skechers: 2800, Converse: 2800, Jordan: 2800, Vans: 2800, 'DC Shoes': 2800, Columbia: 2800, Salomon: 2800, Merrell: 2800, Timberland: 2800, 'La Sportiva': 2800, 'The North Face': 2800, Anta: 2800 },
  { name: 'Sep 20', Nike: 29600, Adidas: 22400, 'New Balance': 20800, Hoka: 18400, Asics: 13200, Brooks: 10800, Saucony: 8000, 'Under Armour': 7200, Puma: 6400, Reebok: 5600, Fila: 4400, Mizuno: 4000, Skechers: 3200, Converse: 3200, Jordan: 3200, Vans: 3200, 'DC Shoes': 3200, Columbia: 3200, Salomon: 3200, Merrell: 3200, Timberland: 3200, 'La Sportiva': 3200, 'The North Face': 3200, Anta: 3200 },
  { name: 'Oct 20', Nike: 24800, Adidas: 30800, 'New Balance': 14400, Hoka: 19600, Asics: 11200, Brooks: 9600, Saucony: 10400, 'Under Armour': 8800, Puma: 4800, Reebok: 5600, Fila: 5200, Mizuno: 3600, Skechers: 4000, Converse: 3600, Jordan: 3600, Vans: 3600, 'DC Shoes': 3600, Columbia: 3600, Salomon: 3600, Merrell: 3600, Timberland: 3600, 'La Sportiva': 3600, 'The North Face': 3600, Anta: 3600 },
  { name: 'Nov 20', Nike: 33200, Adidas: 25600, 'New Balance': 22400, Hoka: 18400, Asics: 14400, Brooks: 12800, Saucony: 7200, 'Under Armour': 10400, Puma: 8000, Reebok: 7200, Fila: 6400, Mizuno: 5200, Skechers: 4800, Converse: 4000, Jordan: 4000, Vans: 4000, 'DC Shoes': 4000, Columbia: 4000, Salomon: 4000, Merrell: 4000, Timberland: 4000, 'La Sportiva': 4000, 'The North Face': 4000, Anta: 4000 },
  { name: 'Dec 20', Nike: 36800, Adidas: 34400, 'New Balance': 25600, Hoka: 23200, Asics: 16800, Brooks: 15200, Saucony: 12800, 'Under Armour': 11200, Puma: 9200, Reebok: 8800, Fila: 8000, Mizuno: 7200, Skechers: 6400, Converse: 5600, Jordan: 5600, Vans: 5600, 'DC Shoes': 5600, Columbia: 5600, Salomon: 5600, Merrell: 5600, Timberland: 5600, 'La Sportiva': 5600, 'The North Face': 5600, Anta: 5600 },
];

// Revenue data
export const revenueData = [
  { name: 'Mar 20', Nike: 1800, Adidas: 1400, 'New Balance': 1100, Hoka: 700, Asics: 500, Brooks: 300, Saucony: 200, 'Under Armour': 150, Puma: 120, Reebok: 80, Fila: 60, Mizuno: 50, Skechers: 40, Converse: 30, Jordan: 25, Vans: 20, 'DC Shoes': 15, Columbia: 12, Salomon: 10, Merrell: 8, Timberland: 6, 'La Sportiva': 5, 'The North Face': 4, Anta: 3 },
  { name: 'Apr 20', Nike: 1440, Adidas: 1820, 'New Balance': 1320, Hoka: 840, Asics: 620, Brooks: 420, Saucony: 320, 'Under Armour': 180, Puma: 220, Reebok: 160, Fila: 120, Mizuno: 110, Skechers: 110, Converse: 110, Jordan: 110, Vans: 110, 'DC Shoes': 110, Columbia: 110, Salomon: 110, Merrell: 110, Timberland: 110, 'La Sportiva': 110, 'The North Face': 110, Anta: 110 },
  { name: 'May 20', Nike: 2176, Adidas: 1360, 'New Balance': 1600, Hoka: 720, Asics: 680, Brooks: 280, Saucony: 544, 'Under Armour': 360, Puma: 240, Reebok: 120, Fila: 240, Mizuno: 160, Skechers: 160, Converse: 160, Jordan: 160, Vans: 160, 'DC Shoes': 160, Columbia: 160, Salomon: 160, Merrell: 160, Timberland: 160, 'La Sportiva': 160, 'The North Face': 160, Anta: 160 },
  { name: 'Jun 20', Nike: 2496, Adidas: 2040, 'New Balance': 640, Hoka: 1440, Asics: 760, Brooks: 580, Saucony: 480, 'Under Armour': 640, Puma: 360, Reebok: 280, Fila: 160, Mizuno: 240, Skechers: 200, Converse: 200, Jordan: 200, Vans: 200, 'DC Shoes': 200, Columbia: 200, Salomon: 200, Merrell: 200, Timberland: 200, 'La Sportiva': 200, 'The North Face': 200, Anta: 200 },
  { name: 'Jul 20', Nike: 2272, Adidas: 2384, 'New Balance': 1536, Hoka: 1216, Asics: 1184, Brooks: 736, Saucony: 624, 'Under Armour': 464, Puma: 496, Reebok: 384, Fila: 288, Mizuno: 240, Skechers: 160, Converse: 160, Jordan: 160, Vans: 160, 'DC Shoes': 160, Columbia: 160, Salomon: 160, Merrell: 160, Timberland: 160, 'La Sportiva': 160, 'The North Face': 160, Anta: 160 },
  { name: 'Aug 20', Nike: 2048, Adidas: 2592, 'New Balance': 1920, Hoka: 1472, Asics: 896, Brooks: 832, Saucony: 544, 'Under Armour': 672, Puma: 288, Reebok: 320, Fila: 288, Mizuno: 280, Skechers: 180, Converse: 180, Jordan: 180, Vans: 180, 'DC Shoes': 180, Columbia: 180, Salomon: 180, Merrell: 180, Timberland: 180, 'La Sportiva': 180, 'The North Face': 180, Anta: 180 },
  { name: 'Sep 20', Nike: 2912, Adidas: 1792, 'New Balance': 2176, Hoka: 1632, Asics: 1344, Brooks: 1024, Saucony: 736, 'Under Armour': 576, Puma: 576, Reebok: 496, Fila: 384, Mizuno: 320, Skechers: 240, Converse: 200, Jordan: 200, Vans: 200, 'DC Shoes': 200, Columbia: 200, Salomon: 200, Merrell: 200, Timberland: 200, 'La Sportiva': 200, 'The North Face': 200, Anta: 200 },
  { name: 'Oct 20', Nike: 2432, Adidas: 2768, 'New Balance': 1472, Hoka: 1856, Asics: 1088, Brooks: 928, Saucony: 832, 'Under Armour': 768, Puma: 464, Reebok: 416, Fila: 320, Mizuno: 224, Skechers: 224, Converse: 176, Jordan: 176, Vans: 176, 'DC Shoes': 176, Columbia: 176, Salomon: 176, Merrell: 176, Timberland: 176, 'La Sportiva': 176, 'The North Face': 176, Anta: 176 },
  { name: 'Nov 20', Nike: 3072, Adidas: 2048, 'New Balance': 1984, Hoka: 1472, Asics: 1184, Brooks: 1024, Saucony: 576, 'Under Armour': 832, Puma: 640, Reebok: 576, Fila: 448, Mizuno: 320, Skechers: 256, Converse: 192, Jordan: 192, Vans: 192, 'DC Shoes': 192, Columbia: 192, Salomon: 192, Merrell: 192, Timberland: 192, 'La Sportiva': 192, 'The North Face': 192, Anta: 192 },
  { name: 'Dec 20', Nike: 3328, Adidas: 2752, 'New Balance': 2432, Hoka: 1856, Asics: 1344, Brooks: 1088, Saucony: 1024, 'Under Armour': 896, Puma: 736, Reebok: 704, Fila: 640, Mizuno: 576, Skechers: 512, Converse: 448, Jordan: 448, Vans: 448, 'DC Shoes': 448, Columbia: 448, Salomon: 448, Merrell: 448, Timberland: 448, 'La Sportiva': 448, 'The North Face': 448, Anta: 448 },
];

export type MetricKey =
  | 'productViews'
  | 'unitsSold'
  | 'revenue'
  | 'brandedSearchVolume'
  | 'searchVisibility'
  | 'shareOfPaidClicks'
  | 'shareOfTotalClicks';

export const metricLabelMap: Record<MetricKey, string> = {
  productViews: 'Product Views',
  unitsSold: 'Units Sold',
  revenue: 'Revenue',
  brandedSearchVolume: 'Branded Search Volume',
  searchVisibility: 'Search Visibility',
  shareOfPaidClicks: 'Share of Paid Clicks',
  shareOfTotalClicks: 'Share of Total Clicks',
};

export const overviewMetricKeys: readonly MetricKey[] = [
  'productViews',
  'unitsSold',
  'revenue',
] as const;

export const funnelMetricKeys: readonly MetricKey[] = [
  'brandedSearchVolume',
  'searchVisibility',
  'shareOfPaidClicks',
  'shareOfTotalClicks',
] as const;

// Keep a metric→time-series map that matches components expecting
// [{ name, BrandA, BrandB, ...}] arrays per metric.
// Funnel metrics (start from Jan 20, then generate volatile months)
export const brandedSearchVolumeData: Array<Record<string, number | string>> = [
  { name: 'Jan 20', Nike: 4000, Adidas: 2400, 'New Balance': 2000, Hoka: 2780, Asics: 1890, Brooks: 1200, Saucony: 800, Puma: 2390, Reebok: 3490, Vans: 2000, Converse: 2100, Skechers: 2200, Fila: 2300, 'Under Armour': 2400, 'The North Face': 2500, Columbia: 2600, Mizuno: 2700, Merrell: 2800, Timberland: 2900, 'La Sportiva': 3000, Anta: 3100, 'DC Shoes': 3200, Jordan: 3300 },
];
export const searchVisibilityData: Array<Record<string, number | string>> = [
  { name: 'Jan 20', Nike: 2400, Adidas: 1398, 'New Balance': 9800, Hoka: 3908, Asics: 4800, Brooks: 2400, Saucony: 1600, Puma: 3800, Reebok: 4300, Vans: 2000, Converse: 2100, Skechers: 2200, Fila: 2300, 'Under Armour': 2400, 'The North Face': 2500, Columbia: 2600, Mizuno: 2700, Merrell: 2800, Timberland: 2900, 'La Sportiva': 3000, Anta: 3100, 'DC Shoes': 3200, Jordan: 3300 },
];
export const shareOfPaidClicksData: Array<Record<string, number | string>> = [
  { name: 'Jan 20', Nike: 1400, Adidas: 4398, 'New Balance': 2800, Hoka: 1908, Asics: 2800, Brooks: 1400, Saucony: 900, Puma: 1800, Reebok: 2300, Vans: 3000, Converse: 3100, Skechers: 3200, Fila: 3300, 'Under Armour': 3400, 'The North Face': 3500, Columbia: 3600, Mizuno: 3700, Merrell: 3800, Timberland: 3900, 'La Sportiva': 4000, Anta: 4100, 'DC Shoes': 4200, Jordan: 4300 },
];
export const shareOfTotalClicksData: Array<Record<string, number | string>> = [
  { name: 'Jan 20', Nike: 3400, Adidas: 2398, 'New Balance': 5800, Hoka: 2908, Asics: 3800, Brooks: 3200, Saucony: 2100, Puma: 2800, Reebok: 3300, Vans: 4000, Converse: 4100, Skechers: 4200, Fila: 4300, 'Under Armour': 4400, 'The North Face': 4500, Columbia: 4600, Mizuno: 4700, Merrell: 4800, Timberland: 4900, 'La Sportiva': 5000, Anta: 5100, 'DC Shoes': 5200, Jordan: 5300 },
];

// a function to generate more volatile data for the rest of the months
const generateNextMonthData = (previousData: any) => {
  const newData = { ...previousData };
  Object.keys(newData).forEach((key) => {
    if (key !== 'name') {
      const value = newData[key];
      // Much more volatile changes - between -50% and +100% of current value
      const volatilityFactor = Math.random() * 1.5 - 0.5;
      const change = value * volatilityFactor;
      newData[key] = Math.max(0, Math.round(value + change));
    }
  });
  return newData;
};

const monthsFunnel = ['Feb 20', 'Mar 20', 'Apr 20', 'May 20', 'Jun 20', 'Jul 20', 'Aug 20', 'Sep 20', 'Oct 20', 'Nov 20', 'Dec 20'];

[brandedSearchVolumeData, searchVisibilityData, shareOfPaidClicksData, shareOfTotalClicksData].forEach(
  (arr) => {
    let lastMonthData = arr[0];
    for (const month of monthsFunnel) {
      const nextMonthData = generateNextMonthData(lastMonthData);
      (nextMonthData as any).name = month;
      arr.push(nextMonthData);
      lastMonthData = nextMonthData;
    }
  }
);

export const timeSeriesByMetric: Record<MetricKey, Array<Record<string, number | string>>> = {
  productViews: productViewsData,
  unitsSold: unitsSoldData,
  revenue: revenueData,
  brandedSearchVolume: brandedSearchVolumeData,
  searchVisibility: searchVisibilityData,
  shareOfPaidClicks: shareOfPaidClicksData,
  shareOfTotalClicks: shareOfTotalClicksData,
};

// Derive brand list from any metric's first month
const firstMonth = timeSeriesByMetric.productViews[0] || {};
export const brands: string[] = Object.keys(firstMonth).filter((k) => k !== 'name');

// Prefer productViews months as the canonical month labels
export const months: string[] = timeSeriesByMetric.productViews.map((d) => String(d.name));

export interface SeriesPoint {
  name: string;
  value: number;
  share: number; // percentage 0..100
}

export interface BrandMetricSnapshot {
  value: number; // latest absolute value
  share: number; // latest share percentage 0..100
  change: number; // delta vs previous absolute value
}

export function getBrandMetricSeries(brand: string, metric: MetricKey): SeriesPoint[] {
  const series = timeSeriesByMetric[metric] || [];
  return series.map((row) => {
    // Sum across brands for this month
    const total = brands.reduce((sum, b) => {
      const v = Number(row[b as keyof typeof row]);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
    const value = Number(row[brand as keyof typeof row]) || 0;
    const share = total > 0 ? (value / total) * 100 : 0;
    return { name: String(row.name), value, share };
  });
}

export function getBrandMetricSnapshot(brand: string, metric: MetricKey): BrandMetricSnapshot {
  const series = getBrandMetricSeries(brand, metric);
  const n = series.length;
  if (n === 0) return { value: 0, share: 0, change: 0 };
  const latest = series[n - 1];
  const prev = series[n - 2] || { value: latest.value, share: latest.share };
  return {
    value: latest.value,
    share: latest.share,
    change: latest.value - prev.value,
  };
}


