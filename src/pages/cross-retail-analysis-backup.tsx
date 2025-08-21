import React, { useState, useEffect, useRef, useMemo } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { pickRetailerGrowthInsight, Series } from '../utils/RetailerGrowthInsight';

import NavBar from '../brand-share/components/NavBar';
import HeaderSelect from '../components/HeaderSelect';
import HeaderMultiSelect from '../components/HeaderMultiSelect';
import HeaderBrandsMultiSelect from '../components/HeaderBrandsMultiSelect';
import HeaderComparisonSelect from '../components/HeaderComparisonSelect';
import DatePickerDropdown from '../components/DatePickerDropdown';
import { categoryOptions } from '../data/categoryOptions';
import { retailerOptions } from '../data/retailerOptions';
import { brandOptions } from '../data/brandOptions';
import { brandsOptions } from '../data/brandsOptions';
import { comparisonOptions } from '../data/comparisonOptions';

// Inline SVG renderer with enforced stroke width and color
const InlineColoredSvg: React.FC<{ src: string; color: string; strokeWidth?: number; className?: string }>
= ({ src, color, strokeWidth = 2, className }) => {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    // fetch from public assets (same-origin)
    fetch(src)
      .then(r => r.text())
      .then(text => {
        if (!isMounted) return;
        // Base cleanup of filters and defs
        let s = text
          .replace(/filter="url\(#.*?\)"/g, '')
          .replace(/filter:[^;"']*;?/g, '')
          .replace(/<defs>[\s\S]*?<\/defs>/g, '');

        // Replace stroke attributes and style properties directly
        s = s
          .replace(/stroke="#[^"]*"/g, `stroke="${color}"`)
          .replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`)
          .replace(/fill="#[^"]*"/g, 'fill="none"')
          .replace(/stroke\s*:\s*[^;"']+/g, `stroke:${color}`)
          .replace(/stroke-width\s*:\s*[^;"']+/g, `stroke-width:${strokeWidth}`)
          .replace(/fill\s*:\s*[^;"']+/g, 'fill:none');

        // Add consistent stroke properties to path elements
        s = s.replace(/<(path|polyline|line)([^>]*?)>/g, (match, tag, attrs) => {
          // Remove existing stroke and fill attributes to avoid conflicts
          let cleanAttrs = attrs
            .replace(/\s*stroke="[^"]*"/g, '')
            .replace(/\s*stroke-width="[^"]*"/g, '')
            .replace(/\s*fill="[^"]*"/g, '')
            .replace(/\s*vector-effect="[^"]*"/g, '')
            .replace(/\s*stroke-linecap="[^"]*"/g, '')
            .replace(/\s*stroke-linejoin="[^"]*"/g, '');
          
          return `<${tag}${cleanAttrs} stroke="${color}" stroke-width="${strokeWidth}" fill="none" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round">`;
        });

        setSvgMarkup(s);
      })
      .catch(() => setSvgMarkup(null));
    return () => { isMounted = false; };
  }, [src, color, strokeWidth]);

  if (!svgMarkup) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: svgMarkup }} />;
};

const CrossRetailAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('retailer-growth');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isNavbarPinned, setIsNavbarPinned] = useState(true);
  const [isNavbarHovered, setIsNavbarHovered] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);
  const sparklineContainerRef = useRef<HTMLDivElement | null>(null);
  const [sparklineWidth, setSparklineWidth] = useState<number>(0);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedChartRetailers, setSelectedChartRetailers] = useState<Set<string>>(new Set());
  // Track which legend host labels are checked
  const [selectedLegendHosts, setSelectedLegendHosts] = useState<string[]>([]);
  // Fixed 7-color palette (selection order)
  const colorPalette: string[] = ['#195AFE', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];
  // Assigned color per selected retailer
  const [seriesColorByRetailer, setSeriesColorByRetailer] = useState<Record<string, string>>({});
  const [lineTemplateIndexByHost, setLineTemplateIndexByHost] = useState<Record<string, number>>({});
  const [hoveredDateIdx, setHoveredDateIdx] = useState<number | null>(null);
  const [chartHoverPos, setChartHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [dateRange, setDateRange] = useState('Jun 2024 - Jul 2024');
  const [compareTo, setCompareTo] = useState('Year over Year');
  const [category, setCategory] = useState('Appliances > Dishwashers');
                const [selectedRetailers, setSelectedRetailers] = useState<string[]>(['All Retailers']);
              const [selectedBrands, setSelectedBrands] = useState<string[]>(['All Brands']);
              const [brandSel, setBrandSel] = useState('Nike');

  // Expand selected tokens into concrete individual hosts (from retailerOptions only)
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

  // Deterministically compute SKUs per host for sorting and display
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

  const handleRetailerSelectionChange = (vals: string[]) => {
    setSelectedRetailers(vals);
    const hosts = expandSelectedHosts(vals);
    const items = hosts.map(name => ({ name, skus: computeSkusForHost(name) }));
    items.sort((a, b) => b.skus - a.skus);
    setLegendRetailers(items);
    // Default-select first up to 4 hosts
    const defaults = items.slice(0, Math.min(4, items.length)).map(i => i.name);
    setSelectedLegendHosts(defaults);
    setSelectedChartRetailers(new Set(defaults.map(h => resolveChartKey(h))));
    const colorMap: Record<string, string> = {};
    defaults.forEach((h, idx) => { colorMap[h] = colorPalette[idx % colorPalette.length]; });
    setSeriesColorByRetailer(colorMap);
    const idxMap: Record<string, number> = {};
    defaults.forEach((h, idx) => { idxMap[h] = idx % lineTemplates.length; });
    setLineTemplateIndexByHost(idxMap);
  };

  // Compute brand metrics deterministically for ANY selected brand
  const computeBrandMetrics = (brand: string) => {
    const total = 60;
    // simple deterministic hash from brand name
    let hash = 0;
    for (let i = 0; i < brand.length; i++) {
      hash = (hash * 31 + brand.charCodeAt(i)) >>> 0;
    }
    // Map hash to percentile in [10, 95]
    const raw = 10 + (hash % 86);
    const percentile = Math.max(10, Math.min(95, Math.round(raw)));
    // Rank: higher percentile => better rank (closer to 1)
    const rank = Math.max(1, Math.min(total, Math.round(((100 - percentile) / 100) * total)));
    // Status buckets
    let status: 'market leader' | 'ahead' | 'median' | 'behind' | 'trailing';
    if (percentile >= 95) status = 'market leader';
    else if (percentile >= 60) status = 'ahead';
    else if (percentile >= 45) status = 'median';
    else if (percentile >= 25) status = 'behind';
    else status = 'trailing';
    // Views between 1.5M and 18.7M proportional to percentile
    const minViews = 1.5;
    const maxViews = 18.7;
    const viewsNum = minViews + (percentile / 100) * (maxViews - minViews);
    const views = `${viewsNum.toFixed(1)}M`;
    // Position along the axis (as CSS left %), clamp to avoid overflow
    const leftPercent = Math.max(2, Math.min(98, percentile));
    return { position: `${leftPercent}%`, percentile, rank, total, status, views };
  };

  const currentBrandData = computeBrandMetrics(brandSel);

  // Chart retailers data with colors
  const chartRetailers = [
    { name: 'Amazon.com', skus: '5,846', color: '#ff9500' },
    { name: 'Walmart.com', skus: '3,425', color: '#0071ce' },
    { name: 'Samsung.com', skus: '1,468', color: '#1428a0' },
    { name: 'Bestbuy.com', skus: '968', color: '#fff200' },
    { name: 'Ebay.com', skus: '846', color: '#e53238' },
    { name: 'Newegg.com', skus: '725', color: '#ff6900' },
    { name: 'Homedepot.com', skus: '709', color: '#f96302' },
    { name: 'Costco.com', skus: '650', color: '#00529b' },
    { name: 'Tesco.com', skus: '645', color: '#00539f' },
    { name: 'Lowes.com', skus: '599', color: '#004990' }
  ];

  // Distinct line templates to avoid overlapping when multiple hosts resolve to the same brand key
  const lineTemplates: Array<{ svg: string; container: string; position: string }> = [
    { svg: '/assets/27a25a881c874940f0324830aacaa454479dea95.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[7.46%] left-0 right-[0.5px] top-[66.96%]' },
    { svg: '/assets/77cc625b54ecd1f2e01a6c27ee364b6c646b7ac4.svg', container: 'absolute bottom-[15px] h-[189px] left-0 right-[-1px]', position: 'absolute bottom-[3.29%] left-0 right-[0.5px] top-[72.56%]' },
    { svg: '/assets/e11fa9ae68eadb1107a509b6cec755208c492232.svg', container: 'absolute bottom-[15px] h-[189px] left-0 right-[-1px]', position: 'absolute inset-[69%_0.5px_24.96%_0.5px]' },
    { svg: '/assets/affc442613351178b5ba12a1ee1e643aefc57fe1.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[7.11%] left-[0.5px] right-px top-[74.87%]' },
    { svg: '/assets/27a25a881c874940f0324830aacaa454479dea95.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[20%] left-0 right-[0.5px] top-[55%]' },
    { svg: '/assets/77cc625b54ecd1f2e01a6c27ee364b6c646b7ac4.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[35%] left-0 right-[0.5px] top-[40%]' },
    { svg: '/assets/e11fa9ae68eadb1107a509b6cec755208c492232.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[25%] left-0 right-[0.5px] top-[50%]' },
    { svg: '/assets/affc442613351178b5ba12a1ee1e643aefc57fe1.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[40%] left-0 right-[0.5px] top-[35%]' },
    { svg: '/assets/27a25a881c874940f0324830aacaa454479dea95.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[30%] left-0 right-[0.5px] top-[45%]' },
    { svg: '/assets/77cc625b54ecd1f2e01a6c27ee364b6c646b7ac4.svg', container: 'absolute h-[189px] left-0 right-[-1px] top-4', position: 'absolute bottom-[45%] left-0 right-[0.5px] top-[30%]' }
  ];

  // Map a selected host label to a known chart series key (for the prebuilt lines)
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
    return label; // fallback: no mapped chart line
  };

  const [legendRetailers, setLegendRetailers] = useState<{ name: string; skus: number }[]>([]);

  // Expand selectedRetailers into concrete host list deterministically
  useEffect(() => {
    // Ensure initial legend when page loads and default selection is present
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
    defaults.forEach((h, idx) => { idxMap[h] = idx % lineTemplates.length; });
    setLineTemplateIndexByHost(idxMap);
  }, []);

  // Helpers for insight content
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

  // Brand position data based on visual positions (left to right = worst to best)
  const brandData = {
    'Co': { name: 'Coca-Cola', percentile: 10, rank: 54, total: 60, status: 'trailing', views: '1.8M' },
    'Pu': { name: 'Puma', percentile: 25, rank: 45, total: 60, status: 'behind', views: '3.2M' },
    'DM': { name: 'Dior & Moët', percentile: 40, rank: 36, total: 60, status: 'behind', views: '5.1M' },
    'Ad': { name: 'Adidas', percentile: 50, rank: 30, total: 60, status: 'median', views: '7.4M' },
    [brandSel]: { name: brandSel, percentile: currentBrandData.percentile, rank: currentBrandData.rank, total: currentBrandData.total, status: currentBrandData.status, views: currentBrandData.views },
    'NB': { name: 'New Balance', percentile: 95, rank: 3, total: 60, status: 'market leader', views: '18.7M' }
  };

  const handleBrandHover = (brand: string, event: React.MouseEvent) => {
    setHoveredBrand(brand);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleBrandLeave = () => {
    setHoveredBrand(null);
  };

  // Handle retailer selection in chart legend
  const maxRetailerSelections = 7;
  
  const handleRetailerToggle = (hostLabel: string) => {
    const key = resolveChartKey(hostLabel);
    setSelectedLegendHosts(prevHosts => {
      const exists = prevHosts.includes(hostLabel);
      const nextHosts = exists ? prevHosts.filter(h => h !== hostLabel) : (prevHosts.length < maxRetailerSelections ? [...prevHosts, hostLabel] : prevHosts);
      // Derive chart series keys from hosts to ensure a line per host
      setSelectedChartRetailers(new Set(nextHosts.map(h => resolveChartKey(h))));
      // Maintain palette assignment consistently per series key order
      const used: Record<string, string> = {};
      nextHosts.forEach((h, idx) => { used[h] = colorPalette[idx % colorPalette.length]; });
      setSeriesColorByRetailer(used);
      // Assign a distinct line template per host based on its order
      const idxMap: Record<string, number> = {};
      nextHosts.forEach((h, idx) => { idxMap[h] = idx % lineTemplates.length; });
      setLineTemplateIndexByHost(idxMap);
      return nextHosts;
    });
  };

  // Disable legend item when max selected reached and this host is not already selected
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
    hostsToSelect.forEach((h, idx) => { idxMap[h] = idx % lineTemplates.length; });
    setLineTemplateIndexByHost(idxMap);
  };

  // Handle scroll for header minimization
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      const scrollTop = target.scrollTop;
      setIsHeaderMinimized(scrollTop > 100);
    };

    // Find the content area element
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll);
      return () => contentArea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Measure sparkline container width to make the chart responsive
  useEffect(() => {
    const el = sparklineContainerRef.current;
    if (!el) return;

    const measure = () => {
      setSparklineWidth(el.clientWidth);
    };
    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  // Listen for navbar pin state changes
  useEffect(() => {
    const checkNavbarState = () => {
      const storedPinStatus = localStorage.getItem('navbarPinned');
      setIsNavbarPinned(storedPinStatus !== 'false');
    };

    // Check initial state
    checkNavbarState();

    // Listen for custom navbar pin change events
    const handleNavbarChange = (event: CustomEvent) => {
      setIsNavbarPinned(event.detail.isPinned);
    };

    // Listen for custom navbar hover change events
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

  // Calculate sidebar width based on pin and hover state
  const getSidebarWidth = () => {
    if (isNavbarPinned) return 'w-64';
    if (isNavbarHovered) return 'w-64';
    return 'w-12';
  };

  // Format SKU numbers with K suffix for values over 1000
  const formatSkus = (skus: number): string => {
    if (skus >= 1000) {
      return `${(skus / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return skus.toString();
  };

  // CSV-backed series store for per-retailer data (state to trigger re-render when loaded)
  const [seriesCsvMap, setSeriesCsvMap] = useState<Record<string, number[]>>({});
  useEffect(() => {
    let isMounted = true;
    fetch('/data/retailer_series.csv', { cache: 'no-store' })
      .then(r => r.text())
      .then(text => {
        const map: Record<string, number[]> = {};
        text.split(/\r?\n/).forEach(line => {
          const trimmed = (line || '').trim();
          if (!trimmed || trimmed.startsWith('#') || /^key\b/i.test(trimmed)) return;
          const parts = trimmed.split(',').map(s => s.trim());
          if (parts.length < 2) return;
          const key = parts.shift() as string;
          const values = parts.map(v => parseInt(v, 10)).filter(n => !Number.isNaN(n));
          if (key && values.length > 0) map[key.toLowerCase()] = values;
        });
        if (isMounted) setSeriesCsvMap(map);
      })
      .catch(() => {})
      .finally(() => { /* no-op */ });
    return () => { isMounted = false; };
  }, []);

  // Per-retailer deterministic 7-point series
  const seriesCacheRef = useRef<Record<string, number[]>>({});
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
      return state / 4294967296; // 2^32
    };
  };
  const generateSeriesForKey = (key: string): number[] => {
    const seed = hashString((key || '').toLowerCase());
    const rnd = randFromSeed(seed);
    const base = 80000 + Math.floor(rnd() * 160000); // 80k..240k
    const trend = -0.18 + rnd() * 0.40; // -18%..+22%
    const out: number[] = [];
    for (let i = 0; i < 7; i++) {
      const progress = i / 6;
      const noise = (rnd() - 0.5) * 0.10; // ±5%
      const factor = 1 + trend * progress + noise;
      out.push(Math.max(1000, Math.round((base * factor) / 1000) * 1000));
    }
    return out;
  };
  const getSeriesForRetailer = (hostLabel: string): number[] => {
    const csvMap = seriesCsvMap;
    const hostKey = (hostLabel || '').trim().toLowerCase();
    if (csvMap[hostKey] && csvMap[hostKey].length > 0) return csvMap[hostKey];
    // Fallback to a resolved key and its lowercase variant
    const resolved = (resolveChartKey(hostLabel) || '').trim();
    if (csvMap[resolved]) return csvMap[resolved];
    const resolvedLower = resolved.toLowerCase();
    if (csvMap[resolvedLower]) return csvMap[resolvedLower];
    // Deterministic fallback if CSV has no entry
    const cache = seriesCacheRef.current;
    if (!cache[hostKey]) cache[hostKey] = generateSeriesForKey(hostKey);
    return cache[hostKey];
  };
  const getVisibleSeries = (hosts: string[]): number[][] => hosts.map(h => getSeriesForRetailer(h));

  // Back-compat helper: derive a matrix from visible hosts
  const getSampleSeriesData = (): number[][] => getVisibleSeries(selectedLegendHosts);

  const dateLabels7 = ['1 Dec', '5 Dec', '9 Dec', '13 Dec', '17 Dec', '21 Dec', '27 Dec'];

  // Calculate dynamic Y-axis scale based on visible line data
  const calculateYAxisScale = () => {
    if (selectedLegendHosts.length === 0) return { min: 0, max: 100, steps: [0, 25, 50, 75, 100] };
    
    const sampleData = getSampleSeriesData();
    const visibleData = sampleData.flat();
    const min = Math.min(...visibleData);
    const max = Math.max(...visibleData);
    
    // Add 10% padding
    const range = max - min;
    const paddedMin = Math.max(0, Math.floor(min - range * 0.1));
    const paddedMax = Math.ceil(max + range * 0.1);
    
    // Generate 7 steps
    const stepSize = (paddedMax - paddedMin) / 6;
    const steps = Array.from({ length: 7 }, (_, i) => Math.round(paddedMin + stepSize * i));
    
    return { min: paddedMin, max: paddedMax, steps };
  };
  
  const yAxisScale = calculateYAxisScale();
  const reversedSteps = [...yAxisScale.steps].reverse();

  const formatPercent = (v: number) => {
    const sign = v > 0 ? '+' : v < 0 ? '' : '';
    return `${sign}${(v * 100).toFixed(0)}%`;
  };



  const modeLabel = compareTo === 'Year over Year' ? 'YoY' : 'PoP';

  // Convert chart data to Series format for the new insight module
  const getInsightSeries = (): Series[] => {
    return selectedLegendHosts.map(host => {
      const current = getSeriesForRetailer(host);
      const isYoY = modeLabel === 'YoY';
      
      // Create more realistic previous period data with varied growth patterns
      const hostHash = host.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const baseMultiplier = 0.85 + (hostHash % 30) / 100; // 0.85 to 1.14 range
      const trendFactor = ((hostHash % 7) - 3) / 100; // -3% to +3% trend difference
      
      const previous = current.map((value, idx) => {
        const periodFactor = isYoY ? baseMultiplier : (0.95 + (hostHash + idx) % 10 / 100); // 0.95-1.04 for PoP
        const trendAdjustment = trendFactor * idx; // Gradual trend difference
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

    const series = getInsightSeries();
    const mode = modeLabel.toLowerCase() as 'pop' | 'yoy';
    const insight = pickRetailerGrowthInsight(series, mode);

    // Calculate both PoP and YoY for the selected retailer
    const selectedRetailer = insight.retailer;
    const current = getSeriesForRetailer(selectedRetailer);
    
    // Calculate PoP (shift by one period)
    const hostHash = selectedRetailer.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const trendFactor = ((hostHash % 7) - 3) / 100;
    const popPrevious = current.map((value, idx) => {
      const periodFactor = 0.95 + (hostHash + idx) % 10 / 100; // 0.95-1.04 for PoP
      const trendAdjustment = trendFactor * idx;
      const finalMultiplier = periodFactor + trendAdjustment;
      return Math.round(value * Math.max(0.5, Math.min(1.5, finalMultiplier)));
    });
    
    // Calculate YoY (different base multiplier)
    const baseMultiplier = 0.85 + (hostHash % 30) / 100; // 0.85 to 1.14 range
    const yoyPrevious = current.map((value, idx) => {
      const trendAdjustment = trendFactor * idx;
      const finalMultiplier = baseMultiplier + trendAdjustment;
      return Math.round(value * Math.max(0.5, Math.min(1.5, finalMultiplier)));
    });

    // Calculate growth percentages
    const sumCurrent = current.reduce((a, b) => a + b, 0);
    const sumPopPrev = popPrevious.reduce((a, b) => a + b, 0);
    const sumYoyPrev = yoyPrevious.reduce((a, b) => a + b, 0);
    
    const popGrowth = (sumCurrent - sumPopPrev) / Math.max(sumPopPrev, 1);
    const yoyGrowth = (sumCurrent - sumYoyPrev) / Math.max(sumYoyPrev, 1);

    // Create both chips
    const chips: Array<{ text: string; tone: 'pos' | 'neg' | 'neu' }> = [];
    
    // PoP chip
    const popPct = (popGrowth * 100).toFixed(0);
    const popSign = popGrowth > 0 ? '+' : '';
    const popTone: 'pos' | 'neg' | 'neu' = popGrowth > 0 ? 'pos' : popGrowth < 0 ? 'neg' : 'neu';
    chips.push({ text: `${popSign}${popPct}% PoP`, tone: popTone });
    
    // YoY chip
    const yoyPct = (yoyGrowth * 100).toFixed(0);
    const yoySign = yoyGrowth > 0 ? '+' : '';
    const yoyTone: 'pos' | 'neg' | 'neu' = yoyGrowth > 0 ? 'pos' : yoyGrowth < 0 ? 'neg' : 'neu';
    chips.push({ text: `${yoySign}${yoyPct}% YoY`, tone: yoyTone });

    return {
      headline: insight.headline,
      sentence: insight.sentence,
      chips
    };
  }, [selectedLegendHosts, compareTo]);

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
                        
                        <HeaderMultiSelect label="Retailers" value={selectedRetailers} options={retailerOptions} onChange={handleRetailerSelectionChange} />
                        
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
          {/* Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg px-8 py-[18px] mb-8" style={{
            background: 'linear-gradient(250deg, rgba(165, 31, 227, 0.15) 9.5%, rgba(25, 90, 254, 0.15) 26%, rgba(255, 255, 255, 0.15) 52%), #ffffff'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center justify-center">
                  <svg width="97" height="99" viewBox="0 0 97 99" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_d_376_20980)">
                      <path d="M81.0432 70.6001L48.5671 86.4998V48.0668L84.3882 30.1562V65.238C84.3882 67.5174 83.0904 69.5978 81.0432 70.6001Z" fill="url(#paint0_linear_376_20980)"/>
                      <path d="M48.5672 86.5V48.067L12.7461 29.4102V65.7038C12.7461 67.6982 13.8817 69.5186 15.673 70.3956L48.5672 86.5Z" fill="url(#paint1_linear_376_20980)"/>
                      <path d="M84.3884 30.5299L48.5674 48.0674L12 29.0374L43.9484 13.5573C46.6289 12.2585 49.7553 12.2619 52.4319 13.5686C63.5414 18.9924 80.2031 27.1313 81.7765 27.918C83.5675 28.8135 84.2641 30.0324 84.3884 30.5299Z" fill="white"/>
                      <path d="M25.4327 36.6031V47.2333C25.4327 47.5159 25.5924 47.7743 25.8453 47.9007L33.308 51.6321C33.8042 51.8802 34.388 51.5194 34.388 50.9646V41.0618C34.388 40.7814 34.5452 40.5246 34.795 40.3971L70.2091 22.3212L63.1195 18.5898L25.8642 35.9265C25.601 36.0489 25.4327 36.3129 25.4327 36.6031Z" fill="#E0EDFF"/>
                      <path d="M25.4327 37.3335V47.232C25.4327 47.5146 25.5924 47.7731 25.8453 47.8995L33.308 51.6308C33.8042 51.8789 34.388 51.5181 34.388 50.9633V41.0648C34.388 40.7822 34.2283 40.5238 33.9755 40.3973L26.5128 36.666C26.0166 36.4179 25.4327 36.7787 25.4327 37.3335Z" fill="#CBE1FF"/>
                    </g>
                    <defs>
                      <filter id="filter0_d_376_20980" x="0" y="-0.5" width="96.3884" height="99" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset/>
                        <feGaussianBlur stdDeviation="6"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0.719201 0 0 0 0 0.8128 0 0 0 0 1 0 0 0 0.5 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_376_20980"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_376_20980" result="shape"/>
                      </filter>
                      <linearGradient id="paint0_linear_376_20980" x1="84.3882" y1="68.5893" x2="48.5671" y2="47.6936" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ECF3FD"/>
                        <stop offset="1" stopColor="#EFF3FE"/>
                      </linearGradient>
                      <linearGradient id="paint1_linear_376_20980" x1="12.7461" y1="69.3357" x2="48.5672" y2="47.6938" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#EBF2FF"/>
                        <stop offset="1" stopColor="#F7F9FE"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Cross Retail Analysis</h2>
                  <p className="text-sm text-gray-600">
                    Compare your brand's performance across different retailers and identify opportunities for growth.
                  </p>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700">
                <span>Learn More</span>
              </button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-3 gap-4 mb-8 items-start">
            {/* My Brand Traffic Share */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
                <h3 className="text-base font-medium text-gray-900 leading-5">My Brand Traffic Share</h3>
                <span className="text-sm text-gray-500 leading-4">Brand views trend</span>
              </div>
              <div className="border-t border-gray-200 pt-4 px-6 pb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-medium text-gray-900 tracking-wide">24.3K</span>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">+2.2%</span>
                    </div>
                                 <span className="text-xs text-gray-500">3 May - 30 Jul</span>
           </div>
                       <div ref={sparklineContainerRef} className="w-full mb-4" style={{ height: '64px' }}>
              {sparklineWidth > 0 && (
                <Sparklines data={[15, 10, 5, 20, 8, 15]} width={sparklineWidth} height={64} margin={2} min={0} max={30} preserveAspectRatio="none">
                  <SparklinesLine color="blue" />
                </Sparklines>
              )}
            </div>
         </div>
                <div className="border-t border-gray-200 pt-4 mt-4 text-center">
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    View detailed traffic analysis
                  </button>
                </div>
              </div>
            </div>

            {/* Leading Retailers in category by Views */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
                <h3 className="text-base font-medium text-gray-900 leading-5">Leading Retailers in category by Views</h3>
                <span className="text-sm text-gray-500 leading-4">Category views split by retailer</span>
              </div>
              <div className="border-t border-gray-200 pt-4 px-6 pb-4">
                <div className="flex items-center gap-4 mb-4" style={{ height: '136px' }}>
                  <div className="w-[105px] h-[105px]">
                    <img src="/assets/a644a1d71ad8cc9cf565e595fd6501551f1f4ef9.svg" alt="Retailer chart" className="w-full h-full" />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <div className="w-[9px] h-[9px]">
                          <img src="/assets/01e295c52274f3848620593ef43c0094ba9d21fd.svg" alt="" className="w-full h-full" />
                        </div>
                        <span className="text-xs text-gray-900 font-medium">35%</span>
                        <span className="text-xs text-gray-500">Amazon.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">1M</span>
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+12%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <div className="w-[9px] h-[9px]">
                          <img src="/assets/08f4a05d46d0b4a00f0baec4e42bd7c69dd61cb6.svg" alt="" className="w-full h-full" />
                        </div>
                        <span className="text-xs text-gray-900 font-medium">25%</span>
                        <span className="text-xs text-gray-500">Walmart.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">714K</span>
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+8%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <div className="w-[9px] h-[9px]">
                          <img src="/assets/c47addf3e686f1568df327e0c31664782f3eb468.svg" alt="" className="w-full h-full" />
                        </div>
                        <span className="text-xs text-gray-900 font-medium">20%</span>
                        <span className="text-xs text-gray-500">Bestbuy.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">571K</span>
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">-3%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <div className="w-[9px] h-[9px]">
                          <img src="/assets/3919bd618661a0f02c6ed8d1faa60217015ee892.svg" alt="" className="w-full h-full" />
                        </div>
                        <span className="text-xs text-gray-900 font-medium">10%</span>
                        <span className="text-xs text-gray-500">Ebay.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">286K</span>
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+5%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <div className="w-[9px] h-[9px]">
                          <img src="/assets/5539226077f9ec8c8a3a63adbed9ef313903da99.svg" alt="" className="w-full h-full" />
                        </div>
                        <span className="text-xs text-gray-900 font-medium">10%</span>
                        <span className="text-xs text-gray-500">Samsung.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">286K</span>
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">-7%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 text-center">
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    Analyze the retailers' change over time
                  </button>
                </div>
              </div>
            </div>

            {/* My Best retailer */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="flex flex-col gap-1 px-6 pt-4 pb-4">
                <h3 className="text-base font-medium text-gray-900 leading-5">My Best retailer</h3>
                <span className="text-sm text-gray-500 leading-4">Top retailer performance metrics</span>
              </div>
              <div className="border-t border-gray-200 pt-4 px-6 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-bold text-gray-900">eBay.com</span>
                  <div className="w-4 h-4">
                    <img src="/assets/4c906a76851dd45819a9104dd0fc0f361509528d.svg" alt="Info icon" className="w-full h-full" />
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-600 text-xs font-medium px-0 py-0 rounded w-4 h-4 flex items-center justify-center">1</div>
                      <span className="text-sm text-gray-900">Total Brand Views</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-900">142K</span>
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-600 text-xs font-medium px-0 py-0 rounded w-4 h-4 flex items-center justify-center">2</div>
                      <span className="text-sm text-gray-900">Traffic Share</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-900">21.2%</span>
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">+1.1PP</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-600 text-xs font-medium px-0 py-0 rounded w-4 h-4 flex items-center justify-center">3</div>
                      <span className="text-sm text-gray-900">Share of Shelf</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-900">13.3%</span>
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">-3.1PP</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4 text-center">
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    Search for additional retailers to consider
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Market Position Chart */}
          <div className="bg-white border border-gray-200 rounded-lg mb-8">
            <div className="px-6 pt-4 pb-4 border-b border-[#E6E9EC]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <h3 className="text-[20px] leading-6 font-medium text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: '500', lineHeight: '24px' }}>{brandSel}'s Market Position by views</h3>
                    <InformationCircleIcon className="w-4 h-4 text-[#B6BEC6]" />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <img src="/assets/f743f0cc589b750074a9fe613e2a212fb32ce333.svg" alt="" className="w-4 h-4" />
                    <span className="text-[13px] leading-4 text-[#B6BEC6]" style={{ fontFamily: 'Roboto, sans-serif' }}>Jul 2020 - May 2023</span>
                    </div>
                  </div>
                </div>
              </div>
            
            <div className="px-6 py-4">
              {/* Brand Position axis */}
              <div className="flex items-start justify-start gap-4 h-12 mb-4">
                <div className="flex flex-col justify-center h-6 w-10 text-[12px] text-[#092540] font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Trailing
            </div>
                <div className="flex-1 relative">
                  <div className="flex flex-col gap-3 items-center justify-start mt-2.5 w-full">
                    {/* Gradient axis */}
                    <div className="h-[5px] bg-gradient-to-r from-[#e6e9ec] to-[#82affe] w-full"></div>
                    
                    {/* Axis labels */}
                    <div className="flex justify-center items-start gap-[107px] text-[12px] text-[#3A5166] font-normal w-full" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <span className="text-right flex-1">Behind</span>
                      <span className="text-center flex-1">Median</span>
                      <span className="text-left flex-1">Ahead</span>
                    </div>
                  </div>
                  
                  {/* Competitor markers positioned absolutely */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between items-start">
                    <div 
                      className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                      onMouseEnter={(e) => handleBrandHover('Co', e)}
                      onMouseLeave={handleBrandLeave}
                    >
                      <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Co</span>
                    </div>
                    <div 
                      className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                      onMouseEnter={(e) => handleBrandHover('Pu', e)}
                      onMouseLeave={handleBrandLeave}
                    >
                      <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Pu</span>
                    </div>
                    <div 
                      className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                      onMouseEnter={(e) => handleBrandHover('DM', e)}
                      onMouseLeave={handleBrandLeave}
                    >
                      <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>DM</span>
                    </div>
                    <div 
                      className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                      onMouseEnter={(e) => handleBrandHover('Ad', e)}
                      onMouseLeave={handleBrandLeave}
                    >
                      <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Ad</span>
                    </div>
                    <div 
                      className="w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 transition-colors"
                      onMouseEnter={(e) => handleBrandHover('NB', e)}
                      onMouseLeave={handleBrandLeave}
                    >
                      <span className="text-[12px] font-bold text-[#092540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>NB</span>
                    </div>
                    {/* Current brand marker - positioned dynamically */}
                    <div 
                      className="absolute w-6 h-6 bg-white border border-[#e6e9ec] rounded flex items-center justify-center p-2 cursor-pointer hover:border-blue-400 transition-all duration-300" 
                      style={{ 
                        width: '26px', 
                        height: '26px',
                        left: currentBrandData.position,
                        transform: 'translateX(-50%)',
                        top: '0'
                      }}
                      onMouseEnter={(e) => handleBrandHover(brandSel, e)}
                      onMouseLeave={handleBrandLeave}
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ width: '8px', height: '8px' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center h-6 w-[77px] text-[12px] text-[#092540] font-normal text-right whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Market Leader
                </div>
              </div>
              
              {/* Summary card */}
              <div className="bg-[#f5f8ff] rounded-lg p-4 w-full">
                <div className="flex flex-col items-start justify-start w-full">
                  <h4 className="text-[20px] leading-7 font-bold text-[#092540] text-center w-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {getBrandHeadline(currentBrandData.status, brandSel)}
                  </h4>
                </div>
                <div className="h-px w-full my-2">
                  <img src="/assets/dc289e6a6ffaf06d2e064fa9fe8267366e41a94d.svg" alt="" className="w-full h-px" />
                </div>
                <div className="relative">
                  <p className="text-[14px] leading-5 text-[#092540] text-center flex items-center justify-center gap-2 flex-wrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <span>You're in the <span className="font-bold">{getOrdinal(currentBrandData.percentile)}</span> percentile (rank {currentBrandData.rank} of {currentBrandData.total}).</span>
                    <span className="bg-[#e6faf5] text-[#009688] text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">+3PP PoP</span>
                    <span className="bg-[#ffe6e6] text-[#bb3f3f] text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">-2PP YoY</span>
                  </p>
                </div>
              </div>
                </div>
              </div>
              
          {/* Main Chart Tile */}
          <div className="bg-white border border-gray-200 rounded-lg mb-8">
            {/* Tab Header */}
            <div className="flex flex-col items-start justify-start p-0 w-full">
              <div className="flex flex-row items-center justify-between p-0 w-full border-b border-[#e6e9ec]">
                <div className="flex flex-row grow items-start justify-start min-h-px min-w-px p-0">
                  {/* Tab 1 - Brand Performance Across Retailers */}
                  <div 
                    className={`flex flex-col gap-3 grow items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                      activeTab === 'brand-performance' ? 'border-b-[3px] border-[#195afe]' : 'border-b border-[#e6e9ec]'
                    }`}
                    onClick={() => setActiveTab('brand-performance')}
                  >
                    <div className="flex flex-row gap-2 items-center justify-center p-0">
                      <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        Brand Performance Across Retailers
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center self-stretch">
                    <div className="h-[70px] w-px bg-[#cbd1d7]"></div>
                  </div>

                  {/* Tab 2 - Retailer Growth Over Time (Active) */}
                  <div 
                    className={`flex flex-col gap-3 grow items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                      activeTab === 'retailer-growth' ? 'border-b-[3px] border-[#195afe]' : 'border-b border-[#e6e9ec]'
                    }`}
                    onClick={() => setActiveTab('retailer-growth')}
                  >
                    <div className="flex flex-row gap-2 items-center justify-center p-0">
                      <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        Retailer Growth Over Time
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center self-stretch">
                    <div className="h-[70px] w-px bg-[#cbd1d7]"></div>
                  </div>

                  {/* Tab 3 - Retailer Opportunity Matrix */}
                  <div 
                    className={`flex flex-col gap-3 grow items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                      activeTab === 'opportunity-matrix' ? 'border-b-[3px] border-[#195afe]' : 'border-b border-[#e6e9ec]'
                    }`}
                    onClick={() => setActiveTab('opportunity-matrix')}
                  >
                    <div className="flex flex-row gap-2 items-center justify-center p-0">
                      <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        Retailer Opportunity Matrix
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center self-stretch">
                    <div className="h-[70px] w-px bg-[#cbd1d7]"></div>
                  </div>

                  {/* Tab 4 - Brand Competitive landscape */}
                  <div 
                    className={`flex flex-col gap-3 grow items-center justify-center min-h-px min-w-px p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                      activeTab === 'competitive-landscape' ? 'border-b-[3px] border-[#195afe]' : 'border-b border-[#e6e9ec]'
                    }`}
                    onClick={() => setActiveTab('competitive-landscape')}
                  >
                    <div className="flex flex-row gap-2 items-center justify-center p-0">
                      <div className="text-[16px] leading-[22px] font-normal text-[#092540] whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        Brand Competitive landscape
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Chart Content Area */}
              <div className="flex flex-row gap-10 h-[400px] items-start justify-start p-4 w-full">
                {/* Line Chart */}
                <div className="grow h-full min-h-px min-w-px relative">
                  {/* Y-Axis and Chart Area */}
                  <div className="absolute inset-0 flex flex-col">
                    {/* Y-Axis */}
                    <div className="flex flex-col grow items-start justify-between min-h-px min-w-px p-0 w-full">
                      {/* Y-axis labels and grid lines */}
                      <div className="flex items-center justify-center w-full">
                        <div className="flex flex-row gap-4 h-px items-center justify-start p-0 w-full">
                          <div className="flex items-center justify-center">
                            <div className="text-[11px] leading-4 font-normal text-[#3a5166] text-right w-12" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              Views
                            </div>
                          </div>
                          <div className="grow flex items-center justify-center min-h-px min-w-px">
                            <div className="h-px bg-[#e6e9ec] w-full"></div>
                          </div>
                        </div>
                      </div>
                      
                      {reversedSteps.map((value, index) => (
                        <div key={index} className="flex items-center justify-center w-full">
                          <div className="flex flex-row gap-4 h-px items-center justify-start p-0 w-full">
                            <div className="flex items-center justify-center">
                              <div className="text-[11px] leading-4 font-normal text-[#3a5166] text-right w-12" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {formatSkus(value)}
                              </div>
                            </div>
                            <div className="grow flex items-center justify-center min-h-px min-w-px">
                              <div className={`h-px w-full ${index === reversedSteps.length - 1 ? 'bg-[#cbd1d7]' : 'bg-[#e6e9ec]'}`}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* X-Axis */}
                    <div className="flex flex-row items-start justify-between pl-[72px] pr-0 py-0 w-full">
                      <div className="flex flex-col items-start justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          1 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          3 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          5 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          7 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          9 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          11 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          13 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          15 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          17 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          19 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          21 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          23 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          25 Dec
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-start p-0 w-px">
                        <div className="h-1 w-px bg-[#cbd1d7]"></div>
                        <div className="text-[11px] leading-4 font-normal text-[#6b7c8c] text-center whitespace-nowrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          27 Dec
                        </div>
                      </div>
                    </div>
                  </div>

                                     {/* Chart Lines Area - data-driven from CSV */}
                  <div className="absolute bottom-[21px] left-[72px] right-0 top-0">
                    {selectedLegendHosts.length > 0 && (
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {selectedLegendHosts.map((host) => {
                          const values = getSeriesForRetailer(host);
                          if (!values || values.length === 0) return null;
                          const min = yAxisScale.min;
                          const max = yAxisScale.max;
                          const denom = Math.max(1, max - min);
                          const cols = values.length;
                          const stepX = cols > 1 ? 100 / (cols - 1) : 0;
                          const d = values.map((v, i) => {
                            const x = i * stepX;
                            const ratio = (v - min) / denom;
                            const y = 100 - ratio * 100;
                            return (i === 0 ? 'M' : 'L') + ' ' + x + ' ' + y;
                          }).join(' ');
                          const color = seriesColorByRetailer[host] || '#CBD1D7';
                          return (
                            <path
                              key={host}
                              d={d}
                              fill="none"
                              stroke={color}
                              strokeWidth={1.5}
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              vectorEffect="non-scaling-stroke"
                              shapeRendering="geometricPrecision"
                            />
                          );
                        })}
                      </svg>
                    )}
                  </div>
{/* Hover overlay for tooltip and guideline */}
                   <div
                     className="absolute bottom-[21px] left-[72px] right-0 top-0 z-[10]"
                     onMouseMove={(e) => {
                       const target = e.currentTarget as HTMLDivElement;
                       const rect = target.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       setChartHoverPos({ x: e.clientX, y: e.clientY });
                       const columns = 7;
                       const idx = Math.max(0, Math.min(columns - 1, Math.round((x / rect.width) * (columns - 1))));
                       setHoveredDateIdx(idx);
                     }}
                     onMouseLeave={() => setHoveredDateIdx(null)}
                   >
                     {hoveredDateIdx !== null && (
                       <>
                         {/* vertical guideline */}
                         <div
                           className="absolute top-0 bottom-0 border-l border-dashed border-[#cbd1d7]"
                           style={{ left: `${(hoveredDateIdx / 6) * 100}%` }}
                         />
                       </>
                     )}
                   </div>
                </div>

                {/* Legend Sidebar */}
                <div className="bg-white h-[347px] rounded border border-[#e6e9ec] w-[254px]">
                  <div className="flex flex-col h-[347px] items-start justify-start overflow-clip p-0 w-[254px]">
                    <div className="h-0 w-full relative">
                      <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                        <img alt="Legend line" className="w-full h-px" src="/assets/f1185c9a9f03d441b08c5344c528a7d18dc379f0.svg" />
                      </div>
                    </div>
                    
                    <div className="grow flex flex-col gap-1 items-start justify-start min-h-px min-w-px pb-0 pl-4 pr-0 pt-2 w-full overflow-y-auto">
                      {/* Legend Items */}
                      {legendRetailers.map((retailer) => {
                        const resolvedKey = resolveChartKey(retailer.name);
                        const isDisabled = isLegendItemDisabled(retailer.name);
                        const isSelected = selectedLegendHosts.includes(retailer.name);
                        
                        return (
                          <div key={retailer.name} className="flex items-center gap-2 text-sm py-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRetailerToggle(retailer.name)}
                              disabled={isDisabled}
                              className={`h-4 w-4 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                              style={{ accentColor: seriesColorByRetailer[retailer.name] || '#CBD1D7' }}
                            />
                            <span 
                              className={`${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-[#195afe]'} transition-colors`}
                              style={{ 
                                fontFamily: 'Roboto, sans-serif',
                                color: isSelected ? '#3a5166' : (isDisabled ? '#b6bec6' : '#3a5166'),
                                fontSize: '14px',
                                lineHeight: '20px'
                              }}
                              onClick={() => !isDisabled && handleRetailerToggle(retailer.name)}
                            >
                              {retailer.name}
                              <span className="text-[#b6bec6]"> - {formatSkus(retailer.skus)} SKUs</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="bg-white flex flex-row h-8 items-start justify-between px-4 py-2 w-full border-t border-[#e6e9ec]">
                      <div className="flex flex-row gap-1.5 items-start justify-start p-0 text-[12px] leading-4 whitespace-nowrap" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        <button 
                          className={`flex flex-col justify-center text-center transition-opacity cursor-pointer ${
                            selectedLegendHosts.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#195afe] hover:opacity-75'
                          }`}
                          onClick={handleClearAll}
                          disabled={selectedLegendHosts.length === 0}
                        >
                          Clear all
                        </button>
                        <div className="text-left text-[#195afe]">
                          |
                        </div>
                        <button 
                          className={`flex flex-col justify-center text-center transition-opacity cursor-pointer ${
                            selectedLegendHosts.length === maxRetailerSelections ? 'text-gray-400 cursor-not-allowed' : 'text-[#195afe] hover:opacity-75'
                          }`}
                          onClick={handleSelectAll}
                          disabled={selectedLegendHosts.length === maxRetailerSelections}
                        >
                          Select Top
                        </button>
                      </div>
                      <div className="flex flex-row gap-1.5 items-start justify-start p-0 text-right" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <div className="text-[12px] leading-[18px] font-normal text-[#6b7c8c] whitespace-nowrap">
                          {selectedLegendHosts.length}/{maxRetailerSelections}
                        </div>
                        <div className="flex flex-col h-[18px] justify-end text-[10px] leading-4 font-normal text-[#b6bec6] w-[42px]">
                          Out of {legendRetailers.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights Section (dynamic) */}
              <div className="flex flex-col gap-2.5 items-start justify-start pb-4 pt-0 px-4 w-full">
                <div className="bg-[#f5f8ff] flex flex-col gap-2 items-start justify-center p-4 rounded-lg w-full h-[101px]">
                  <div className="flex flex-col items-start justify-start p-0 w-full">
                    <div className="text-[20px] leading-7 font-bold text-[#092540] text-center w-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {dynamicInsight.headline}
                    </div>
                  </div>
                  <div className="h-0 w-full relative">
                    <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
                      <img alt="Line" className="w-full h-px" src="/assets/c5f98cc278369be2d380820eb9a00765a4507302.svg" />
                    </div>
                  </div>
                                     <div className="text-[14px] leading-5 font-normal text-[#092540] text-center w-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                     <div className="mb-0">
                      <span dangerouslySetInnerHTML={{ __html: dynamicInsight.sentence }}></span>
                      {dynamicInsight.chips.map((c, idx) => (
                        <span
                          key={idx}
                          className={`${c.tone === 'pos' ? 'bg-[#e6faf5] text-[#009688]' : c.tone === 'neg' ? 'bg-[#ffe6e6] text-[#bb3f3f]' : 'bg-[#eef2f5] text-[#3a5166]'} text-[10px] font-bold px-2 py-0.5 rounded-full tracking-[0.3px] ml-2`}
                          style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {c.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Tooltip */}
      {hoveredBrand && brandData[hoveredBrand] && (
        <div 
          className="fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
          style={{ 
            left: tooltipPosition.x + 10, 
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="text-sm font-bold text-gray-900 mb-1">{brandData[hoveredBrand].name}</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div><span className="font-medium">Percentile:</span> {brandData[hoveredBrand].percentile}th</div>
            <div><span className="font-medium">Rank:</span> {brandData[hoveredBrand].rank} of {brandData[hoveredBrand].total}</div>
            <div><span className="font-medium">Status:</span> {brandData[hoveredBrand].status}</div>
            <div><span className="font-medium">Views:</span> {brandData[hoveredBrand].views}</div>
          </div>
        </div>
      )}

      {/* Main chart hover tooltip */}
      {hoveredDateIdx !== null && selectedLegendHosts.length > 0 && (
        <div
          className="fixed z-[60] bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[260px] pointer-events-none"
          style={{ left: chartHoverPos.x + 12, top: chartHoverPos.y - 12 }}
        >
          <div className="text-[14px] font-bold text-[#092540] mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {dateLabels7[hoveredDateIdx]}
          </div>
                  <div className="text-[12px] text-[#6b7c8c] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Total daily views – {
            (() => {
              let total = 0;
              selectedLegendHosts.forEach((host) => {
                const series = getSeriesForRetailer(host);
                total += series[hoveredDateIdx] || 0;
              });
              return formatSkus(total);
            })()
          }
        </div>
          <div className="space-y-2">
            {selectedLegendHosts.map((host, i) => {
              const color = seriesColorByRetailer[host] || '#CBD1D7';
              const series = getSeriesForRetailer(host);
              const value = series[hoveredDateIdx] || 0;
              return (
                <div key={host} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[13px] text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>{host}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-[#092540]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {formatSkus(value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossRetailAnalysis;
