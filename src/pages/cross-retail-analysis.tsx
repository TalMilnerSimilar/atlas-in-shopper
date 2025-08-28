import React, { useState, useEffect, useRef, useMemo } from 'react';
import { pickRetailerGrowthInsight, Series } from '../utils/RetailerGrowthInsight';
import { pickRetailerMixInsight, MixSeries } from '../utils/RetailerMixInsight';

import NavBar from '../brand-share/components/NavBar';
import HeaderSelect from '../components/HeaderSelect';
import HeaderMultiSelect from '../components/HeaderMultiSelect';
import HeaderBrandsMultiSelect from '../components/HeaderBrandsMultiSelect';
import HeaderComparisonSelect from '../components/HeaderComparisonSelect';
import DatePickerDropdown from '../components/DatePickerDropdown';
import InfoCard from '../components/InfoCard';
import KPIRow from '../components/KPIRow';
import MarketPositionChart from '../components/MarketPositionChart';
import MainChart from '../components/MainChart';
import TopSkusTile from '../components/TopSkusTile';
import RetailerBrandShareTile from '../components/RetailerBrandShareTile';
import BrandTooltip from '../components/Tooltips/BrandTooltip';
import ChartHoverTooltip from '../components/Tooltips/ChartHoverTooltip';
import { RetailerNode } from '../analytics/opportunity';

import { categoryOptions } from '../data/categoryOptions';
import { retailerOptions } from '../data/retailerOptions';
import { brandOptions } from '../data/brandOptions';
import { brandsOptions } from '../data/brandsOptions';
import { comparisonOptions } from '../data/comparisonOptions';

const CrossRetailAnalysis: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('retailer-growth');
  const [isNavbarPinned, setIsNavbarPinned] = useState(true);
  const [isNavbarHovered, setIsNavbarHovered] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedChartRetailers, setSelectedChartRetailers] = useState<Set<string>>(new Set());
  const [selectedLegendHosts, setSelectedLegendHosts] = useState<string[]>([]);
  const [hoveredDateIdx, setHoveredDateIdx] = useState<number | null>(null);
  const [chartHoverPos, setChartHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [marketPositionEnabled, setMarketPositionEnabled] = useState(true);
  const [brandStrongholdsEnabled, setBrandStrongholdsEnabled] = useState(true);

  // Form state
  const [dateRange, setDateRange] = useState('Jun 2024 - Jul 2024');
  const [compareTo, setCompareTo] = useState('Year over Year');
  const [category, setCategory] = useState('Appliances > Dishwashers');
                const [selectedRetailers, setSelectedRetailers] = useState<string[]>(['All Retailers']);
              const [selectedBrands, setSelectedBrands] = useState<string[]>(['All Brands']);
              const [brandSel, setBrandSel] = useState('Nike');

  // Chart configuration
  const colorPalette: string[] = ['#195AFE', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
  const [seriesColorByRetailer, setSeriesColorByRetailer] = useState<Record<string, string>>({});
  const [lineTemplateIndexByHost, setLineTemplateIndexByHost] = useState<Record<string, number>>({});
  const [legendRetailers, setLegendRetailers] = useState<{ name: string; skus: number }[]>([]);
  const maxRetailerSelections = 7;

  // CSV data for chart lines
  const [seriesCsvMap, setSeriesCsvMap] = useState<Record<string, { current: number[]; prevPop: number[]; prevYoy: number[] }>>({});
  const seriesCacheRef = useRef<Record<string, number[]>>({});

  // Load CSV data
  useEffect(() => {
    let isMounted = true;
    fetch('/data/retailer_series.csv', { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        const map: Record<string, { current: number[]; prevPop: number[]; prevYoy: number[] }> = {};
        text.split(/\r?\n/).forEach(line => {
          const trimmed = (line || '').trim();
          if (!trimmed || trimmed.startsWith('#') || /^key\b/i.test(trimmed)) return;
          const parts = trimmed.split(',').map(s => s.trim());
          if (parts.length < 22) return; // Need key + 7 current + 7 PoP + 7 YoY
          const key = parts[0];
          const current = parts.slice(1, 8).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          const prevPop = parts.slice(8, 15).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          const prevYoy = parts.slice(15, 22).map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          if (key && current.length === 7 && prevPop.length === 7 && prevYoy.length === 7) {
            map[key.toLowerCase()] = { current, prevPop, prevYoy };
          }
        });
        if (isMounted) setSeriesCsvMap(map);
      })
      .catch(() => {})
      .finally(() => { /* no-op */ });
    return () => { isMounted = false; };
  }, []);

  // Listen for market position toggle
  useEffect(() => {
    // Load initial state
    const saved = localStorage.getItem('marketPositionEnabled');
    if (saved !== null) {
      setMarketPositionEnabled(JSON.parse(saved));
    }

    // Listen for toggle events
    const handleMarketPositionToggle = (event: CustomEvent) => {
      setMarketPositionEnabled(event.detail.enabled);
    };

    window.addEventListener('marketPositionToggle', handleMarketPositionToggle as EventListener);
    
    return () => {
      window.removeEventListener('marketPositionToggle', handleMarketPositionToggle as EventListener);
    };
  }, []);

  // Listen for Brand Strongholds toggle
  useEffect(() => {
    const saved = localStorage.getItem('brandStrongholdsEnabled');
    if (saved !== null) {
      setBrandStrongholdsEnabled(JSON.parse(saved));
    }

    const handleBrandStrongholdsToggle = (event: CustomEvent) => {
      setBrandStrongholdsEnabled(event.detail.enabled);
    };

    window.addEventListener('brandStrongholdsToggle', handleBrandStrongholdsToggle as EventListener);
    return () => window.removeEventListener('brandStrongholdsToggle', handleBrandStrongholdsToggle as EventListener);
  }, []);

  // Listen for scroll-to-Brand-Strongholds event
  useEffect(() => {
    const handleScrollToStrongholds = () => {
      const el = document.querySelector('[data-strongholds-section]') as HTMLElement | null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('scrollToBrandStrongholds', handleScrollToStrongholds as EventListener);
    return () => window.removeEventListener('scrollToBrandStrongholds', handleScrollToStrongholds as EventListener);
  }, []);

  // Table KPIs state and listener
  const [tableKPIsEnabled, setTableKPIsEnabled] = useState(true);
  
  useEffect(() => {
    // Load initial state
    const saved = localStorage.getItem('tableKPIsEnabled');
    if (saved !== null) {
      setTableKPIsEnabled(JSON.parse(saved));
    }

    // Listen for toggle events
    const handleTableKPIsToggle = (event: CustomEvent) => {
      setTableKPIsEnabled(event.detail.enabled);
    };

    window.addEventListener('tableKPIsToggle', handleTableKPIsToggle as EventListener);
    
    return () => {
      window.removeEventListener('tableKPIsToggle', handleTableKPIsToggle as EventListener);
    };
  }, []);

  // Table filters state and listener
  const [tableFiltersEnabled, setTableFiltersEnabled] = useState(true);
  
  useEffect(() => {
    // Load initial state
    const saved = localStorage.getItem('tableFiltersEnabled');
    if (saved !== null) {
      setTableFiltersEnabled(JSON.parse(saved));
    }

    // Listen for toggle events
    const handleTableFiltersToggle = (event: CustomEvent) => {
      setTableFiltersEnabled(event.detail.enabled);
    };

    window.addEventListener('tableFiltersToggle', handleTableFiltersToggle as EventListener);
    
    return () => {
      window.removeEventListener('tableFiltersToggle', handleTableFiltersToggle as EventListener);
    };
  }, []);

  // Grouped by region state and listener
  const [groupedByRegionEnabled, setGroupedByRegionEnabled] = useState(true);
  
  useEffect(() => {
    // Load initial state
    const saved = localStorage.getItem('groupedByRegionEnabled');
    if (saved !== null) {
      setGroupedByRegionEnabled(JSON.parse(saved));
    }

    // Listen for toggle events
    const handleGroupedByRegionToggle = (event: CustomEvent) => {
      setGroupedByRegionEnabled(event.detail.enabled);
    };

    window.addEventListener('groupedByRegionToggle', handleGroupedByRegionToggle as EventListener);
    
    return () => {
      window.removeEventListener('groupedByRegionToggle', handleGroupedByRegionToggle as EventListener);
    };
  }, []);

  // Utility functions
  const expandSelectedHosts = (vals: string[]): string[] => {
    const isAll = (s: string) => /^all\s+retailers$/i.test((s || '').trim());
    const regionMatch = (s: string) => /^all\s+(us|uk|german|french|canadian|australian)\s+retailers$/i.exec((s || '').trim());
    const allIndividuals = retailerOptions.filter(r => !/^all\s+/i.test(r));

    if (vals.some(isAll)) return allIndividuals;

    const regions = new Set<string>();
    vals.forEach(v => { const m = regionMatch(v); if (m) regions.add(m[1].toLowerCase()); });

    const preds: ((h: string) => boolean)[] = [];
    const addPred = (cb: (h: string) => boolean) => preds.push(cb);
    if (regions.has('us')) addPred(h => h.endsWith('.com'));
    if (regions.has('uk')) addPred(h => h.endsWith('.co.uk'));
    if (regions.has('german')) addPred(h => h.endsWith('.de'));
    if (regions.has('french')) addPred(h => h.endsWith('.fr'));
    if (regions.has('canadian')) addPred(h => h.endsWith('.ca'));
    if (regions.has('australian')) addPred(h => h.endsWith('.com.au'));

    const norm = (s: string) => (s || '').trim().toLowerCase();
    const individuals = new Set(
      vals.filter(v => !/^all\s+/i.test(v)).map(v => norm(v))
    );

    const out: string[] = [];
    for (const host of allIndividuals) {
      const h = norm(host);
      if (individuals.has(h) || (preds.length > 0 && preds.some(p => p(h)))) out.push(host);
    }
    return out;
  };

  const computeSkusForHost = (host: string): number => {
    const h = (host || '').toLowerCase();
    if (h.includes('amazon')) return 5846;
    if (h.includes('walmart')) return 3425;
    if (h.includes('samsung')) return 1468;
    if (h.includes('bestbuy')) return 968;
    if (h.includes('ebay')) return 846;
    if (h.includes('newegg')) return 725;
    if (h.includes('homedepot')) return 709;
    if (h.includes('costco')) return 650;
    if (h.includes('tesco')) return 645;
    if (h.includes('lowes')) return 599;
    // fallback: hash-based 300..1500
    let hash = 0;
    for (let i = 0; i < h.length; i++) hash = (hash * 31 + h.charCodeAt(i)) >>> 0;
    return 300 + (hash % 1201);
  };

  const formatSkus = (skus: number): string => {
    if (skus >= 1000) {
      return `${(skus / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return skus.toString();
  };

  const resolveChartKey = (label: string): string => {
    const l = (label || '').toLowerCase();
    if (l.includes('amazon')) return 'Amazon.com';
    if (l.includes('walmart')) return 'Walmart.com';
    if (l.includes('samsung')) return 'Samsung.com';
    if (l.includes('bestbuy')) return 'Bestbuy.com';
    if (l.includes('ebay')) return 'Ebay.com';
    if (l.includes('newegg')) return 'Newegg.com';
    if (l.includes('homedepot')) return 'Homedepot.com';
    if (l.includes('costco')) return 'Costco.com';
    if (l.includes('tesco')) return 'Tesco.com';
    if (l.includes('lowes')) return 'Lowes.com';
    return label;
  };

  // Chart data functions
  const hashString = (s: string): number => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const randFromSeed = (seed: number) => {
    let state = (seed || 1) >>> 0;
    return () => {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  };

  const generateSeriesForKey = (key: string): number[] => {
    const seed = hashString((key || '').toLowerCase());
    const rnd = randFromSeed(seed);
    const base = 80000 + Math.floor(rnd() * 160000);
    const trend = -0.18 + rnd() * 0.40;
    const out: number[] = [];
    for (let i = 0; i < 7; i++) {
      const progress = i / 6;
      const noise = (rnd() - 0.5) * 0.10;
      const factor = 1 + trend * progress + noise;
      out.push(Math.max(1000, Math.round((base * factor) / 1000) * 1000));
    }
    return out;
  };

  const getSeriesForRetailer = (hostLabel: string): number[] => {
    const csvMap = seriesCsvMap;
    const hostKey = (hostLabel || '').trim().toLowerCase();
    if (csvMap[hostKey] && csvMap[hostKey].current.length > 0) return csvMap[hostKey].current;
    const resolved = (resolveChartKey(hostLabel) || '').trim();
    if (csvMap[resolved]) return csvMap[resolved].current;
    const resolvedLower = resolved.toLowerCase();
    if (csvMap[resolvedLower]) return csvMap[resolvedLower].current;
    const cache = seriesCacheRef.current;
    if (!cache[hostKey]) cache[hostKey] = generateSeriesForKey(hostKey);
    return cache[hostKey];
  };

  // Build lightweight nodes for TopSkusTile from ALL legend hosts (not just selected)
  const nodesForSkus = (): RetailerNode[] => {
    const hosts = legendRetailers.map(r => r.name);
    return hosts.map((host) => {
      const series = getSeriesForRetailer(host);
      const demand = series.reduce((a, b) => a + b, 0) / Math.max(1, series.length);
      const hash = host.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const share = Math.max(0.01, Math.min(0.6, 0.02 + ((hash % 140) / 1000)));
      const views = Math.round(demand * share);
      return {
        retailerId: host,
        retailerName: host,
        demand_weekly: Math.round(demand),
        brand_share: share,
        brand_views_weekly: views,
      } as RetailerNode;
    });
  };

  // Brand position functions
  const computeBrandMetrics = (brand: string) => {
    const total = 60;
    let hash = 0;
    for (let i = 0; i < brand.length; i++) {
      hash = (hash * 31 + brand.charCodeAt(i)) >>> 0;
    }
    const raw = 10 + (hash % 86);
    const percentile = Math.max(10, Math.min(95, Math.round(raw)));
    const rank = Math.max(1, Math.min(total, Math.round(((100 - percentile) / 100) * total)));
    let status: 'market leader' | 'ahead' | 'median' | 'behind' | 'trailing';
    if (percentile >= 95) status = 'market leader';
    else if (percentile >= 60) status = 'ahead';
    else if (percentile >= 45) status = 'median';
    else if (percentile >= 25) status = 'behind';
    else status = 'trailing';
    const minViews = 1.5;
    const maxViews = 18.7;
    const viewsNum = minViews + (percentile / 100) * (maxViews - minViews);
    const views = `${viewsNum.toFixed(1)}M`;
    const leftPercent = Math.max(2, Math.min(98, percentile));
    return { position: `${leftPercent}%`, percentile, rank, total, status, views };
  };

  const getOrdinal = (n: number): string => {
    const rem10 = n % 10;
    const rem100 = n % 100;
    if (rem10 === 1 && rem100 !== 11) return `${n}st`;
    if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
    if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
    return `${n}th`;
  };

  const getBrandHeadline = (status: string, brand: string): string => {
    switch (status) {
      case 'market leader':
        return `${brand} is the market leader`;
      case 'ahead':
        return `${brand} is ahead of the median`;
      case 'median':
        return `${brand} is around the median`;
      case 'behind':
        return `${brand} is behind the median`;
      case 'trailing':
        return `${brand} is trailing the category`;
      default:
        return `${brand} performance insight`;
    }
  };

  const currentBrandData = computeBrandMetrics(brandSel);

  const brandData = {
    'Co': { name: 'Coca-Cola', percentile: 10, rank: 54, total: 60, status: 'trailing', views: '1.8M' },
    'Pu': { name: 'Puma', percentile: 25, rank: 45, total: 60, status: 'behind', views: '3.2M' },
    'DM': { name: 'Dior & Moët', percentile: 40, rank: 36, total: 60, status: 'behind', views: '5.1M' },
    'Ad': { name: 'Adidas', percentile: 50, rank: 30, total: 60, status: 'median', views: '7.4M' },
    [brandSel]: { name: brandSel, percentile: currentBrandData.percentile, rank: currentBrandData.rank, total: currentBrandData.total, status: currentBrandData.status, views: currentBrandData.views },
    'NB': { name: 'New Balance', percentile: 95, rank: 3, total: 60, status: 'market leader', views: '18.7M' }
  };

  // Event handlers
  const handleRetailerSelectionChange = (vals: string[]) => {
    setSelectedRetailers(vals);
    const hosts = expandSelectedHosts(vals);
    const items = hosts.map(name => ({ name, skus: computeSkusForHost(name) }));
    items.sort((a, b) => b.skus - a.skus);
    setLegendRetailers(items);
    const defaults = items.slice(0, Math.min(4, items.length)).map(i => i.name);
    setSelectedLegendHosts(defaults);
    setSelectedChartRetailers(new Set(defaults.map(h => resolveChartKey(h))));
    const colorMap: Record<string, string> = {};
    defaults.forEach((h, idx) => { colorMap[h] = colorPalette[idx % colorPalette.length]; });
    setSeriesColorByRetailer(colorMap);
    const idxMap: Record<string, number> = {};
    defaults.forEach((h, idx) => { idxMap[h] = idx % 7; });
    setLineTemplateIndexByHost(idxMap);
  };

  const handleBrandHover = (brand: string, event: React.MouseEvent) => {
    setHoveredBrand(brand);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleBrandLeave = () => {
    setHoveredBrand(null);
  };

  const handleRetailerToggle = (hostLabel: string) => {
    setSelectedLegendHosts(prevHosts => {
      const exists = prevHosts.includes(hostLabel);
      const nextHosts = exists ? prevHosts.filter(h => h !== hostLabel) : (prevHosts.length < maxRetailerSelections ? [...prevHosts, hostLabel] : prevHosts);
      setSelectedChartRetailers(new Set(nextHosts.map(h => resolveChartKey(h))));
      const used: Record<string, string> = {};
      nextHosts.forEach((h, idx) => { used[h] = colorPalette[idx % colorPalette.length]; });
      setSeriesColorByRetailer(used);
      const idxMap: Record<string, number> = {};
      nextHosts.forEach((h, idx) => { idxMap[h] = idx % 7; });
      setLineTemplateIndexByHost(idxMap);
      return nextHosts;
    });
  };

  const isLegendItemDisabled = (host: string) => {
    return !selectedLegendHosts.includes(host) && selectedLegendHosts.length >= maxRetailerSelections;
  };

  const handleClearAll = () => {
    setSelectedLegendHosts([]);
    setSelectedChartRetailers(new Set());
    setSeriesColorByRetailer({});
  };

  const handleSelectAll = () => {
    const hostsToSelect = legendRetailers.slice(0, maxRetailerSelections).map(r => r.name);
    setSelectedLegendHosts(hostsToSelect);
    const keys = hostsToSelect.map(h => resolveChartKey(h));
    setSelectedChartRetailers(new Set(keys));
    const map: Record<string, string> = {};
    hostsToSelect.forEach((host, idx) => { map[host] = colorPalette[idx % colorPalette.length]; });
    setSeriesColorByRetailer(map);
    const idxMap: Record<string, number> = {};
    hostsToSelect.forEach((h, idx) => { idxMap[h] = idx % 7; });
    setLineTemplateIndexByHost(idxMap);
  };

  // Chart calculations
  const calculateYAxisScale = () => {
    if (selectedLegendHosts.length === 0) return { min: 0, max: 100, steps: [0, 25, 50, 75, 100] };
    
    const sampleData = selectedLegendHosts.map(h => getSeriesForRetailer(h)).flat();
    const min = Math.min(...sampleData);
    const max = Math.max(...sampleData);
    
    const range = max - min;
    const paddedMin = Math.max(0, Math.floor(min - range * 0.1));
    const paddedMax = Math.ceil(max + range * 0.1);
    
    const stepSize = (paddedMax - paddedMin) / 6;
    const steps = Array.from({ length: 7 }, (_, i) => Math.round(paddedMin + stepSize * i));
    
    return { min: paddedMin, max: paddedMax, steps };
  };
  
  const yAxisScale = calculateYAxisScale();
  const reversedSteps = [...yAxisScale.steps].reverse();

  // Dynamic insight generation
  const modeLabel = compareTo === 'Year over Year' ? 'YoY' : 'PoP';

  const getInsightSeries = (): Series[] => {
    return selectedLegendHosts.map(host => {
      const current = getSeriesForRetailer(host);
      const isYoY = modeLabel === 'YoY';
      
      const hostHash = host.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const baseMultiplier = 0.85 + (hostHash % 30) / 100;
      const trendFactor = ((hostHash % 7) - 3) / 100;
      
      const previous = current.map((value, idx) => {
        const periodFactor = isYoY ? baseMultiplier : (0.95 + (hostHash + idx) % 10 / 100);
        const trendAdjustment = trendFactor * idx;
        const finalMultiplier = periodFactor + trendAdjustment;
        return Math.round(value * Math.max(0.5, Math.min(1.5, finalMultiplier)));
      });
      
      return {
        retailer: host,
        current,
        previous
      };
    });
  };

  const dynamicInsight = useMemo(() => {
    if (selectedLegendHosts.length === 0) {
      return {
        headline: 'No retailers selected.',
        sentence: 'Select retailers from the legend to see insights.',
        chips: [] as Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }>
      };
    }

    if (activeTab === 'brand-performance') {
      // Build mix series for ALL header-selected retailers (denominator)
      const allHosts = legendRetailers.map(r => r.name);
      const mixSeries: MixSeries[] = allHosts.map(host => {
        const current = getSeriesForRetailer(host);
        const hostKey = host.toLowerCase();
        const csvData = seriesCsvMap[hostKey];
        
        let prevPop: number[] = [];
        let prevYoy: number[] = [];
        
        if (csvData) {
          prevPop = csvData.prevPop;
          prevYoy = csvData.prevYoy;
        } else {
          // Fallback to synthetic data if not in CSV
          const hostHash = host.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          const trendFactor = ((hostHash % 7) - 3) / 100;
          
          prevPop = current.map((value, idx) => {
            if (value === 0 && (hostHash % 3) === 0) return 50000 + (hostHash % 20000);
            if (value > 0 && (hostHash % 4) === 1) return 0;
            const periodFactor = 1 + ((((hostHash >> 2) + idx) % 21) - 10) / 100;
            const trendAdjustment = trendFactor * idx;
            const finalMultiplier = periodFactor + trendAdjustment;
            return Math.round(value * Math.max(0.5, Math.min(1.5, finalMultiplier)));
          });
          
          const baseMultiplier = 1 + ((hostHash % 51) - 25) / 100;
          prevYoy = current.map((value, idx) => {
            if (value === 0 && (hostHash % 5) === 0) return 40000 + (hostHash % 15000);
            if (value > 0 && (hostHash % 6) === 2) return 0;
            const trendAdjustment = trendFactor * idx;
            const finalMultiplier = baseMultiplier + trendAdjustment;
            return Math.round(value * Math.max(0.5, Math.min(1.5, finalMultiplier)));
          });
        }
        
        return { retailer: host, current, prevPop, prevYoy };
      });

      // Highlight only among the currently stacked series
      const insight = pickRetailerMixInsight(mixSeries, { eligible: new Set(selectedLegendHosts) });
      const chips: Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }> = [];
      if (insight.tags.pop) {
        const tone: 'pos' | 'neg' | 'neu' = insight.tags.pop.startsWith('+') ? 'pos' : insight.tags.pop.startsWith('−') ? 'neg' : 'neu';
        chips.push({ text: insight.tags.pop, tone });
      }
      if (insight.tags.yoy) {
        const tone: 'pos' | 'neg' | 'neu' = insight.tags.yoy.startsWith('+') ? 'pos' : insight.tags.yoy.startsWith('−') ? 'neg' : 'neu';
        chips.push({ text: insight.tags.yoy, tone });
      }
      return {
        headline: insight.title,
        sentence: insight.text,
        chips,
      };
    }

    const series = getInsightSeries();
    const mode = modeLabel.toLowerCase() as 'pop' | 'yoy';
    const insight = pickRetailerGrowthInsight(series, mode);

    const selectedRetailer = insight.retailer;
    const current = getSeriesForRetailer(selectedRetailer);
    
    const hostHash = selectedRetailer.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const trendFactor = ((hostHash % 7) - 3) / 100;
    const popPrevious = current.map((value, idx) => {
      const periodFactor = 0.95 + (hostHash + idx) % 10 / 100;
      const trendAdjustment = trendFactor * idx;
      const finalMultiplier = periodFactor + trendAdjustment;
      return Math.round(value * Math.max(0.5, Math.min(1.5, finalMultiplier)));
    });
    
    const baseMultiplier = 0.85 + (hostHash % 30) / 100;
    const yoyPrevious = current.map((value, idx) => {
      const trendAdjustment = trendFactor * idx;
      const finalMultiplier = baseMultiplier + trendAdjustment;
      return Math.round(value * Math.max(0.5, Math.min(1.5, finalMultiplier)));
    });

    const sumCurrent = current.reduce((a, b) => a + b, 0);
    const sumPopPrev = popPrevious.reduce((a, b) => a + b, 0);
    const sumYoyPrev = yoyPrevious.reduce((a, b) => a + b, 0);
    
    const popGrowth = (sumCurrent - sumPopPrev) / Math.max(sumPopPrev, 1);
    const yoyGrowth = (sumCurrent - sumYoyPrev) / Math.max(sumYoyPrev, 1);

    const chips: Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }> = [];
    
    const popPct = (popGrowth * 100).toFixed(0);
    const popSign = popGrowth > 0 ? '+' : '';
    const popTone: 'pos' | 'neg' | 'neu' = popGrowth > 0 ? 'pos' : popGrowth < 0 ? 'neg' : 'neu';
    chips.push({ text: `${popSign}${popPct}% PoP`, tone: popTone });
    
    const yoyPct = (yoyGrowth * 100).toFixed(0);
    const yoySign = yoyGrowth > 0 ? '+' : '';
    const yoyTone: 'pos' | 'neg' | 'neu' = yoyGrowth > 0 ? 'pos' : yoyGrowth < 0 ? 'neg' : 'neu';
    chips.push({ text: `${yoySign}${yoyPct}% YoY`, tone: yoyTone });

    return {
      headline: insight.headline,
      sentence: insight.sentence,
      chips
    };
  }, [selectedLegendHosts, compareTo, activeTab]);

  // Initialize legend on load
  useEffect(() => {
    const hosts = expandSelectedHosts(selectedRetailers);
    const items = hosts.map(name => ({ name, skus: computeSkusForHost(name) }));
    items.sort((a, b) => b.skus - a.skus);
    setLegendRetailers(items);
    const defaults = items.slice(0, Math.min(4, items.length)).map(i => i.name);
    setSelectedLegendHosts(defaults);
    setSelectedChartRetailers(new Set(defaults.map(h => resolveChartKey(h))));
    const colorMap: Record<string, string> = {};
    defaults.forEach((h, idx) => { colorMap[h] = colorPalette[idx % colorPalette.length]; });
    setSeriesColorByRetailer(colorMap);
    const idxMap: Record<string, number> = {};
    defaults.forEach((h, idx) => { idxMap[h] = idx % 7; });
    setLineTemplateIndexByHost(idxMap);
  }, []);

  // Listen for navbar events
  useEffect(() => {
    const checkNavbarState = () => {
      const storedPinStatus = localStorage.getItem('navbarPinned');
      setIsNavbarPinned(storedPinStatus !== 'false');
    };

    checkNavbarState();

    const handleNavbarChange = (event: CustomEvent) => {
      setIsNavbarPinned(event.detail.isPinned);
    };

    const handleNavbarHoverChange = (event: CustomEvent) => {
      setIsNavbarHovered(event.detail.isHovered);
    };

    window.addEventListener('navbarPinChange', handleNavbarChange as EventListener);
    window.addEventListener('navbarHoverChange', handleNavbarHoverChange as EventListener);

    return () => {
      window.removeEventListener('navbarPinChange', handleNavbarChange as EventListener);
      window.removeEventListener('navbarHoverChange', handleNavbarHoverChange as EventListener);
    };
  }, []);

  // Handle scroll for header minimization
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      const scrollTop = target.scrollTop;
      setIsHeaderMinimized(scrollTop > 100);
    };

    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll);
      return () => contentArea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Calculate sidebar width
  const getSidebarWidth = () => {
    if (isNavbarPinned) return 'w-64';
    if (isNavbarHovered) return 'w-64';
    return 'w-12';
  };

  const dateLabels7 = ['1 Dec', '5 Dec', '9 Dec', '13 Dec', '17 Dec', '21 Dec', '27 Dec'];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Navigation Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${getSidebarWidth()} ${isNavbarPinned ? 'relative' : isNavbarHovered ? 'absolute z-50' : 'relative'}`}>
        <NavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`transition-all duration-300 ${
          isNavbarPinned ? 'px-16' : 'px-8'
        } ${isHeaderMinimized ? 'py-3 bg-[#f7f7f8]' : 'py-4 bg-gray-50'}`}>
          <div className={`transition-all duration-300 ${
            isHeaderMinimized ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
          }`}>
                                <div className="flex items-center justify-between">
                        <h1 className="text-xl font-medium text-gray-900">Cross Retail Analysis</h1>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#6B7C8C] leading-[16px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>For</span>
                            <DatePickerDropdown value={dateRange} onDateChange={(startDate, endDate) => {
                              const formatDate = (date: Date) => {
                                return date.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                });
                              };
                              setDateRange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
                            }} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#6B7C8C] leading-[16px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Compared to</span>
                            <HeaderComparisonSelect label="" value={compareTo} options={comparisonOptions} onChange={setCompareTo} />
                </div>
                          </div>
                        </div>
                      </div>
          
          <div className={`transition-all duration-300 ${
            isHeaderMinimized ? 'mt-0' : 'mt-4'
          }`}>
            <div className="flex items-center gap-4">
                        <HeaderSelect label="Category" value={category} options={categoryOptions} onChange={setCategory} />
                        <span className="text-sm text-gray-500">Across</span>
              <HeaderMultiSelect label="Retailers" value={selectedRetailers} options={retailerOptions} onChange={handleRetailerSelectionChange} showGroupedByRegion={groupedByRegionEnabled} />
                        <span className="text-sm text-gray-500">For</span>
                        <HeaderBrandsMultiSelect label="Brands" value={selectedBrands} options={brandsOptions} onChange={setSelectedBrands} />
                        <span className="text-sm text-gray-500">Against my brand</span>
                        <HeaderSelect label="My Brand" value={brandSel} options={brandOptions} onChange={setBrandSel} />
            </div>
                      </div>
        </div>

        {/* Content Area */}
        <div className={`content-area flex-1 overflow-y-auto transition-all duration-300 ${
          isNavbarPinned ? 'px-16 py-8' : 'px-16 py-6'
        }`}>
          <InfoCard />
          <KPIRow onNavigateToTab={(tab) => {
            setActiveTab(tab);
            // Scroll to MainChart section
            setTimeout(() => {
              const chartElement = document.querySelector('[data-chart-section]');
              if (chartElement) {
                chartElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }} />
          {marketPositionEnabled && (
            <MarketPositionChart
              brandSel={brandSel}
              currentBrandData={currentBrandData}
              brandData={brandData}
              onBrandHover={handleBrandHover}
              onBrandLeave={handleBrandLeave}
              getOrdinal={getOrdinal}
              getBrandHeadline={getBrandHeadline}
            />
          )}
          <div data-chart-section>
            <MainChart
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              retailerSelectedLegendHosts={selectedLegendHosts}
              brandSelectedLegendHosts={[]}
              selectedBrandName={brandSel}
              yAxisScale={yAxisScale}
              reversedSteps={reversedSteps}
              formatSkus={formatSkus}
              getSeriesForRetailer={getSeriesForRetailer}
              seriesColorByRetailer={seriesColorByRetailer}
              hoveredDateIdx={hoveredDateIdx}
              setHoveredDateIdx={setHoveredDateIdx}
              setChartHoverPos={setChartHoverPos}
              legendRetailers={legendRetailers}
              maxRetailerSelections={maxRetailerSelections}
              onRetailerLegendToggle={handleRetailerToggle}
              onBrandLegendToggle={() => {}}
              onRetailerClearAll={handleClearAll}
              onBrandClearAll={() => {}}
              onRetailerSelectAll={handleSelectAll}
              onBrandSelectAll={() => {}}
              isRetailerLegendItemDisabled={isLegendItemDisabled}
              isBrandLegendItemDisabled={() => false}
              dynamicInsight={dynamicInsight}
              brandsFromHeader={selectedBrands}
            />
          </div>

          {/* Brand Strongholds Tile (feature-flagged) */}
          {brandStrongholdsEnabled && (
            <div className="mt-10" data-strongholds-section>
              <RetailerBrandShareTile
                legendRetailers={legendRetailers}
                selectedBrandName={brandSel}
                selectedBrandsHeader={selectedBrands}
                getSeriesForRetailer={getSeriesForRetailer}
                dateRange={dateRange}
              />
            </div>
          )}

          {/* New full-width tile below the entire graph/tabs: Top performing SKUs */}
          <div className="mt-10">
            <TopSkusTile retailers={nodesForSkus()} selectedBrandName={brandSel} selectedBrandsHeader={selectedBrands} showKPIs={tableKPIsEnabled} showFilters={tableFiltersEnabled} />
          </div>
        </div>
      </div>

      {/* Tooltips */}
      <BrandTooltip
        hoveredBrand={hoveredBrand}
        brandData={brandData}
        tooltipPosition={tooltipPosition}
      />
      
      <ChartHoverTooltip
        hoveredDateIdx={hoveredDateIdx}
        selectedLegendHosts={selectedLegendHosts}
        chartHoverPos={chartHoverPos}
        dateLabels={dateLabels7}
        getSeriesForRetailer={getSeriesForRetailer}
        seriesColorByRetailer={seriesColorByRetailer}
        formatSkus={formatSkus}
        mode={activeTab === 'brand-performance' ? 'share' : 'views'}
        allHeaderHosts={legendRetailers.map(r => r.name)}
      />
    </div>
  );
};

export default CrossRetailAnalysis;
