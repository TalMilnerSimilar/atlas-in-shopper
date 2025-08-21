import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowTopRightOnSquareIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { RetailerNode } from '../../analytics/opportunity';

type TopSku = {
  sku: string;
  name: string;
  brand: string;
  retailer: string;
  category: string;
  price: number;
  views: number;
};

type SortField = 'name' | 'brand' | 'retailer' | 'category' | 'price' | 'views';
type SortDirection = 'asc' | 'desc';

function abbr(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

function seededRand(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function titleCase(str: string): string {
  return str
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function synthesizeSkusFromRetailers(retailers: RetailerNode[], take: number, selectedBrand?: string): TopSku[] {
  const baseBrands = ['Adidas', 'Apple', 'Nike', 'Samsung', 'Sony', 'Microsoft', 'Canon', 'Garmin', 'Ray-Ban', 'Bose', 'Dell', 'HP', 'Logitech', 'Intel'];
  
  // Include the selected brand if provided and not already in the list
  const brands = selectedBrand && !baseBrands.includes(selectedBrand) 
    ? [selectedBrand, ...baseBrands] 
    : baseBrands;
  
  const cats = ['Accessories', 'Kitchen', 'Eyewear', 'Electronics', 'Stationery', 'Beauty'];
  const out: TopSku[] = [];
  
  // Calculate how many SKUs per retailer to reach the target
  const skusPerRetailer = Math.ceil(take / retailers.length);
  
  retailers.forEach(n => {
    const seed = (n.retailerName || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = seededRand(seed);
    const retailer = n.retailerName;
    
    // Generate enough SKUs per retailer to reach our target
    for (let i = 0; i < skusPerRetailer; i++) {
      // If we have a selected brand, make sure some SKUs use it (every 4th SKU)
      const brand = selectedBrand && i % 4 === 0 
        ? selectedBrand 
        : brands[Math.floor(rnd() * brands.length)];
      
      const category = cats[Math.floor(rnd() * cats.length)];
      const price = Math.round((8 + rnd() * 220) * 100) / 100;
      // weight by retailer demand when available
      const baseViews = Math.max(1000, n.demand_weekly || 0) * (0.02 + rnd() * 0.12);
      const views = Math.round(baseViews);
      const sku = 'SKU' + Math.abs(Math.imul(seed, i + 37)).toString(36).slice(0, 8).toUpperCase();
      const name = `${brand} ${titleCase(category)} ${Math.floor(10 + rnd() * 90)}`;
      out.push({ sku, name, brand, retailer, category, price, views });
    }
  });
  return out
    .sort((a, b) => b.views - a.views)
    .slice(0, take);
}

function placeholdersFor(label: string): { include: string; exclude: string } {
  switch (label) {
    case 'Product Name':
      return { include: 'e.g., Utility Knife, Kitchen', exclude: 'e.g., Knife set' };
    case 'Brand':
      return { include: 'e.g., Nike, Adidas', exclude: 'e.g., Puma' };
    case 'Retailer':
      return { include: 'e.g., amazon.com, walmart.com', exclude: 'e.g., bestbuy.com' };
    case 'Price Range':
      return { include: 'e.g., 20', exclude: 'e.g., 200' };
    case 'Views':
      return { include: 'e.g., 1000', exclude: 'e.g., 50000' };
    default:
      return { include: 'Include…', exclude: 'Exclude…' };
  }
}

function labelsFor(label: string): { include: string; exclude: string } {
  switch (label) {
    case 'Price Range':
      return { include: 'Min', exclude: 'Max' };
    case 'Views':
      return { include: 'Min', exclude: 'Max' };
    default:
      return { include: 'Include', exclude: 'Exclude' };
  }
}

interface NoAggregationTabProps {
  retailers: RetailerNode[];
  selectedBrandName?: string;
}

export default function NoAggregationTab({ retailers, selectedBrandName }: NoAggregationTabProps) {
  const [openChip, setOpenChip] = useState<string | null>(null);
  const [staging, setStaging] = useState<{ include: string; exclude: string }>({ include: '', exclude: '' });
  const [chipState, setChipState] = useState<Record<string, { include: string; exclude: string }>>({});
  const [sortField, setSortField] = useState<SortField>('views');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const includeInputRef = useRef<HTMLInputElement | null>(null);
  
  const allRows = useMemo(() => synthesizeSkusFromRetailers(retailers, 350, selectedBrandName), [retailers, selectedBrandName]);
  
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      // Product Name filter
      const productFilter = chipState['Product Name'];
      if (productFilter?.include || productFilter?.exclude) {
        const includeTerms = productFilter.include?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
        const excludeTerms = productFilter.exclude?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
        const productName = row.name.toLowerCase();
        
        if (includeTerms.length > 0 && !includeTerms.some(term => productName.includes(term))) {
          return false;
        }
        if (excludeTerms.length > 0 && excludeTerms.some(term => productName.includes(term))) {
          return false;
        }
      }

      // Brand filter
      const brandFilter = chipState['Brand'];
      if (brandFilter?.include || brandFilter?.exclude) {
        const includeTerms = brandFilter.include?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
        const excludeTerms = brandFilter.exclude?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
        const brandName = row.brand.toLowerCase();
        
        if (includeTerms.length > 0 && !includeTerms.some(term => brandName.includes(term))) {
          return false;
        }
        if (excludeTerms.length > 0 && excludeTerms.some(term => brandName.includes(term))) {
          return false;
        }
      }

      // Retailer filter
      const retailerFilter = chipState['Retailer'];
      if (retailerFilter?.include || retailerFilter?.exclude) {
        const includeTerms = retailerFilter.include?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
        const excludeTerms = retailerFilter.exclude?.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) || [];
        const retailerName = row.retailer.toLowerCase();
        
        if (includeTerms.length > 0 && !includeTerms.some(term => retailerName.includes(term))) {
          return false;
        }
        if (excludeTerms.length > 0 && excludeTerms.some(term => retailerName.includes(term))) {
          return false;
        }
      }

      // Price Range filter
      const priceFilter = chipState['Price Range'];
      if (priceFilter?.include || priceFilter?.exclude) {
        const minPrice = priceFilter.include ? parseFloat(priceFilter.include) : null;
        const maxPrice = priceFilter.exclude ? parseFloat(priceFilter.exclude) : null;
        
        if (minPrice !== null && !isNaN(minPrice) && row.price < minPrice) {
          return false;
        }
        if (maxPrice !== null && !isNaN(maxPrice) && row.price > maxPrice) {
          return false;
        }
      }

      // Views filter
      const viewsFilter = chipState['Views'];
      if (viewsFilter?.include || viewsFilter?.exclude) {
        const minViews = viewsFilter.include ? parseFloat(viewsFilter.include) : null;
        const maxViews = viewsFilter.exclude ? parseFloat(viewsFilter.exclude) : null;
        
        if (minViews !== null && !isNaN(minViews) && row.views < minViews) {
          return false;
        }
        if (maxViews !== null && !isNaN(maxViews) && row.views > maxViews) {
          return false;
        }
      }

      return true;
    });
  }, [allRows, chipState]);

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      
      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'brand':
          aVal = a.brand.toLowerCase();
          bVal = b.brand.toLowerCase();
          break;
        case 'retailer':
          aVal = a.retailer.toLowerCase();
          bVal = b.retailer.toLowerCase();
          break;
        case 'category':
          aVal = a.category.toLowerCase();
          bVal = b.category.toLowerCase();
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'views':
          aVal = a.views;
          bVal = b.views;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }
    });
  }, [filteredRows, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const rows = sortedRows.slice(startIndex, endIndex);
  
  const targetBrand = selectedBrandName || 'My Brand';
  const totalViews = filteredRows.reduce((s, r) => s + r.views, 0);
  const avgPrice = filteredRows.length ? filteredRows.reduce((s, r) => s + r.price, 0) / filteredRows.length : 0;
  const mySkusCount = filteredRows.filter(r => r.brand === targetBrand).length;
  const myShareOfShelf = filteredRows.length ? (mySkusCount / filteredRows.length) * 100 : 0;

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(e.target as Node)) setOpenChip(null);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenChip(null);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  useEffect(() => {
    if (openChip && includeInputRef.current) {
      includeInputRef.current.focus();
    }
  }, [openChip]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'views' || field === 'price' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [chipState]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-3 h-3 text-[#9EA8B2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-3 h-3 text-[#3A5166]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l9 16 9-16H3z" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-[#3A5166]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 20L12 4 3 20h18z" />
      </svg>
    );
  };

  return (
    <div className="w-full">
      {/* KPI Row */}
      <div className="relative p-4 gap-2.5 flex border-b border-[#E6E9EC]">
        <div className="flex-1 bg-[#F5F8FF] p-4 rounded relative flex flex-col items-center justify-center group">
          <div className="absolute inset-0 rounded border border-[#E6E9EC] pointer-events-none" />
          <div className="flex items-center gap-1">
            <div className="text-[14px] leading-[20px] tracking-[0.3px] text-[#092540]">Total Views</div>
            <InformationCircleIcon className="w-4 h-4 text-[#B6BEC6]" />
          </div>
          <div className="text-[20px] leading-[24px] text-[#092540] font-medium tracking-[1px]">{abbr(totalViews)}</div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#092540] text-white text-[12px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
            Sum of all product views across filtered SKUs
          </div>
        </div>
        <div className="flex-1 bg-[#F5F8FF] p-4 rounded relative flex flex-col items-center justify-center group">
          <div className="absolute inset-0 rounded border border-[#E6E9EC] pointer-events-none" />
          <div className="flex items-center gap-1">
            <div className="text-[14px] leading-[20px] tracking-[0.3px] text-[#092540]">Average Price Point</div>
            <InformationCircleIcon className="w-4 h-4 text-[#B6BEC6]" />
          </div>
          <div className="text-[20px] leading-[24px] text-[#092540] font-medium tracking-[1px]">${avgPrice.toFixed(0)}</div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#092540] text-white text-[12px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
            Average price across all filtered SKUs
          </div>
        </div>
        <div className="flex-1 bg-[#F5F8FF] p-4 rounded relative flex flex-col items-center justify-center group">
          <div className="absolute inset-0 rounded border border-[#E6E9EC] pointer-events-none" />
          <div className="flex items-center gap-1">
            <div className="text-[14px] leading-[20px] tracking-[0.3px] text-[#092540]">My SKUs</div>
            <InformationCircleIcon className="w-4 h-4 text-[#B6BEC6]" />
          </div>
          <div className="text-[20px] leading-[24px] text-[#092540] font-medium tracking-[1px]">{mySkusCount}</div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#092540] text-white text-[12px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
            Number of SKUs from {targetBrand} in filtered results
          </div>
        </div>
        <div className="flex-1 bg-[#F5F8FF] p-4 rounded relative flex flex-col items-center justify-center group">
          <div className="absolute inset-0 rounded border border-[#E6E9EC] pointer-events-none" />
          <div className="flex items-center gap-1">
            <div className="text-[14px] leading-[20px] tracking-[0.3px] text-[#092540]">My Share of Shelf</div>
            <InformationCircleIcon className="w-4 h-4 text-[#B6BEC6]" />
          </div>
          <div className="text-[20px] leading-[24px] text-[#092540] font-medium tracking-[1px]">{Math.round(myShareOfShelf)}%</div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#092540] text-white text-[12px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
            Percentage of total SKUs that belong to {targetBrand}
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="px-6 py-4 flex items-center gap-2 border-b border-[#E6E9EC]">
        <div className="text-[14px] leading-[20px] text-[#3A5166]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Filter By:</div>
        <div className="flex items-center gap-2 h-8">
          {['Product Name','Brand','Retailer','Price Range','Views'].map(lbl => {
            const isOpen = openChip === lbl;
            const filled = !!(chipState[lbl]?.include || chipState[lbl]?.exclude);
            const filterCount = (chipState[lbl]?.include?.split(',').filter(Boolean).length || 0) + (chipState[lbl]?.exclude?.split(',').filter(Boolean).length || 0);
            
            return (
              <div key={lbl} className="relative">
                <div
                  className={`rounded-[40px] pl-3 pr-1 py-1 flex items-center gap-2 text-[12px] leading-[16px] ${
                    isOpen || filled ? 'bg-[#3A5166] text-white' : 'bg-[#F7F7F8] hover:bg-[#E6E9EC] text-[#092540]'
                  }`}
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const next = isOpen ? null : lbl;
                      setOpenChip(next);
                      setStaging(chipState[lbl] || { include: '', exclude: '' });
                    }}
                    className="flex items-center gap-2"
                  >
                    <span>{lbl}</span>
                    {filled && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isOpen ? 'bg-white/20 text-white' : 'bg-[#E6E9EC] text-[#092540]'}`}>
                        {filterCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (filled) {
                        setChipState(prev => ({ ...prev, [lbl]: { include: '', exclude: '' } }));
                        setOpenChip(null);
                      } else {
                        const next = isOpen ? null : lbl;
                        setOpenChip(next);
                        setStaging(chipState[lbl] || { include: '', exclude: '' });
                      }
                    }}
                    className="w-6 h-6 relative flex items-center justify-center"
                  >
                    {isOpen || filled ? (
                      <svg viewBox="0 0 24 24" className="w-[12px] h-[12px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                        <path d="M15.5 8.5L8.5 15.5M15.5 15.5L8.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" className="w-[10px] h-[6px] text-[#092540]" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {isOpen && (
                  <div ref={popoverRef} className="absolute left-0 top-10 z-30 bg-white rounded p-3 w-[280px] shadow-[0px_1px_8px_rgba(9,37,64,0.08),0px_5px_24px_rgba(9,37,64,0.08)] border border-[#D1D6DD]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <div className="absolute -top-2 left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-[#D1D6DD]" />
                    <div className="absolute -top-[7px] left-6 w-0 h-0 border-l-7 border-r-7 border-b-7 border-l-transparent border-r-transparent border-b-white" />
                    <div className="relative flex items-center gap-2 mb-3">
                      <div className="text-[14px] leading-[20px] text-[#0B253F] min-w-[64px]">{labelsFor(lbl).include}</div>
                      <div className="relative h-10 w-[200px] rounded border border-[#D1D6DD]">
                        <input
                          ref={includeInputRef}
                          className="absolute inset-0 w-full h-full px-[15px] py-2.5 text-[14px] text-[#0B253F] placeholder-[#9EA8B2] rounded outline-none"
                          placeholder={placeholdersFor(lbl).include}
                          value={staging.include}
                          onChange={(e)=>setStaging(s=>({...s, include: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between gap-2 mb-2 w-[257px]">
                      <div className="text-[14px] leading-[20px] text-[#0B253F] min-w-[64px]">{labelsFor(lbl).exclude}</div>
                      <div className="relative h-10 w-[200px] rounded border border-[#D1D6DD]">
                        <input
                          className="absolute inset-0 w-full h-full px-[15px] py-2.5 text-[14px] text-[#0B253F] placeholder-[#9EA8B2] rounded outline-none"
                          placeholder={placeholdersFor(lbl).exclude}
                          value={staging.exclude}
                          onChange={(e)=>setStaging(s=>({...s, exclude: e.target.value}))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <div className="text-[12px] leading-[16px] text-[#B6BEC6]">
                        {(lbl === 'Price Range' || lbl === 'Views') ? 'Enter numeric values' : 'Separate terms by comma'}
                      </div>
                      {filled && (
                        <button className="text-[12px] text-[#6B7C8C] hover:text-[#195AFE]" onClick={()=>{ setChipState(prev=>({ ...prev, [lbl]: { include: '', exclude: '' } })); setOpenChip(null); }}>Clear</button>
                      )}
                      <button
                        className={`text-[14px] leading-[20px] rounded-[18px] px-4 py-2 ${ (staging.include.trim() || staging.exclude.trim()) ? 'bg-[#195AFE] text-white' : 'bg-[#E6E9EC] text-[#6B7C8C] cursor-not-allowed' }`}
                        disabled={!(staging.include.trim() || staging.exclude.trim())}
                        onClick={()=>{ if (!(staging.include.trim() || staging.exclude.trim())) return; setChipState(prev=>({ ...prev, [lbl]: staging })); setOpenChip(null); }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
        <div className="grid grid-cols-[minmax(280px,1.2fr)_0.7fr_0.7fr_0.7fr_0.5fr_0.5fr] text-[12px] text-[#3a5166] border-b border-[#E6E9EC] h-12 items-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <button 
            className="flex items-center gap-1 hover:text-[#195AFE] cursor-pointer justify-start border-r border-[#E6E9EC] px-4 h-full" 
            onClick={() => handleSort('name')}
          >
            SKU Name {getSortIcon('name')}
          </button>
          <button 
            className="flex items-center gap-1 hover:text-[#195AFE] cursor-pointer justify-start px-4 h-full" 
            onClick={() => handleSort('brand')}
          >
            Brand {getSortIcon('brand')}
          </button>
          <button 
            className="flex items-center gap-1 hover:text-[#195AFE] cursor-pointer justify-start px-4 h-full" 
            onClick={() => handleSort('retailer')}
          >
            Retailer {getSortIcon('retailer')}
          </button>
          <button 
            className="flex items-center gap-1 hover:text-[#195AFE] cursor-pointer justify-start px-4 h-full" 
            onClick={() => handleSort('category')}
          >
            Category {getSortIcon('category')}
          </button>
          <button 
            className="flex items-center gap-1 hover:text-[#195AFE] cursor-pointer justify-start px-4 h-full" 
            onClick={() => handleSort('price')}
          >
            Price {getSortIcon('price')}
          </button>
          <button 
            className="flex items-center gap-1 hover:text-[#195AFE] cursor-pointer justify-start px-4 h-full" 
            onClick={() => handleSort('views')}
          >
            Views {getSortIcon('views')}
          </button>
        </div>
        {rows.map(r => (
          <div key={r.sku} className="grid grid-cols-[minmax(280px,1.2fr)_0.7fr_0.7fr_0.7fr_0.5fr_0.5fr] text-[14px] text-[#092540] h-20 items-center border-b border-[#E6E9EC]">
            <div className="flex items-center gap-3 min-w-0 border-r border-[#E6E9EC] px-4 h-full">
              <div className="w-12 h-12 bg-white rounded-md border border-[#E6E9EC] overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${r.sku}/48/48`}
                  alt={r.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="truncate" title={r.name}>{r.name}</div>
                <div className="text-[12px] text-[#09254099] flex items-center gap-2">
                  <span>{r.sku}</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 text-[#6b7c8c]" />
                </div>
              </div>
            </div>
            <div className="truncate px-4 h-full flex items-center" title={r.brand}>{r.brand}</div>
            <div className="truncate px-4 h-full flex items-center" title={r.retailer}>{r.retailer}</div>
            <div className="truncate px-4 h-full flex items-center" title={r.category}>{r.category}</div>
            <div className="px-4 h-full flex items-center">${r.price.toFixed(2)}</div>
            <div className="px-4 h-full flex items-center">{abbr(r.views)}</div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white flex flex-col h-[73px] items-end justify-center relative rounded-bl-md rounded-br-md border-t border-[#CBD1D7]">
          <div className="flex gap-2 items-center justify-end px-6 py-3 w-full">
            <div className="flex gap-2 items-start justify-start">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="relative size-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#6B7C8C]" fill="none">
                  <path d="M11 7l-5 5 5 5M19 7l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="relative size-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#6B7C8C]" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="flex gap-1 items-center justify-start">
              <div className="border border-[#E6E9EC] px-1.5 py-0.5">
                <div className="font-['Roboto'] text-[12px] leading-[20px] text-[#6B7C8C] text-center">
                  {currentPage}
                </div>
              </div>
              <div className="font-['Roboto'] text-[12px] leading-[20px] text-[#6B7C8C] text-center">
                out of
              </div>
              <div className="px-1 py-0">
                <div className="font-['Roboto'] text-[12px] leading-[20px] text-[#6B7C8C] text-center">
                  {totalPages}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 items-start justify-start">
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="relative size-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#6B7C8C]" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="relative size-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#6B7C8C]" fill="none">
                  <path d="M13 17l5-5-5-5M5 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
