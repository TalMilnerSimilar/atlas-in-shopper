import unifiedBrands from './unifiedBrands';
import { metricLabelMap } from './unifiedBrandData';

const metricLabels = {
  productViews: metricLabelMap.productViews,
  unitsSold: metricLabelMap.unitsSold,
  revenue: metricLabelMap.revenue,
  brandedSearchVolume: metricLabelMap.brandedSearchVolume,
  searchVisibility: metricLabelMap.searchVisibility,
  shareOfPaidClicks: metricLabelMap.shareOfPaidClicks,
  shareOfTotalClicks: metricLabelMap.shareOfTotalClicks,
};

const monthOrder = ['Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const transformDataForBrand = (brandName: string) => {
  const brandBlock = (unifiedBrands as any)[brandName] || {};
  return monthOrder.map((m) => {
    const dataPoint: Record<string, number | string> = { name: m };
    for (const k of Object.keys(metricLabels) as Array<keyof typeof metricLabels>) {
      const label = metricLabels[k];
      const share = brandBlock[k]?.shareOverTime?.[m] ?? 0; // decimal
      dataPoint[label] = Number(share) * 100; // percent for charting
    }
    return dataPoint;
  });
};

export const brandTrendData: Record<string, any[]> = (Object.keys(unifiedBrands) as string[]).reduce(
  (acc, brandName) => {
    acc[brandName] = transformDataForBrand(brandName);
    return acc;
  },
  {} as Record<string, any[]>
);


export const metrics = Object.values(metricLabels);

export const metricColors = [
  '#3E74FE',
  '#FF7A1A',
  '#00CA9A',
  '#FFB800',
  '#A020F0',
  '#FF69B4',
  '#008080',
];

export const metricColorMap = metrics.reduce((acc, metric, index) => {
  acc[metric] = metricColors[index % metricColors.length];
  return acc;
}, {} as Record<string, string>);