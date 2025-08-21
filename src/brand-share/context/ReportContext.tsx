import React, { createContext, useContext } from 'react';
import unifiedBrands from '../data/unifiedBrands';

export type ReportConfig = {
  id: string;
  name: string;
  category: string;
  myBrand: string;
  competitors: string[];
};

type ReportContextValue = {
  config: ReportConfig;
  allBrands: string[];
};

const defaultConfig: ReportConfig = {
  id: 'default-nike-shoes',
  name: 'Nike • Shoes',
  category: 'Shoes',
  myBrand: 'Nike',
  competitors: ['Adidas', 'New Balance', 'Hoka', 'Asics'],
};

const ReportContext = createContext<ReportContextValue>({
  config: defaultConfig,
  allBrands: Object.keys(unifiedBrands) as string[],
});

export const ReportProvider: React.FC<{ config?: ReportConfig; children: React.ReactNode }> = ({ config, children }) => {
  const value: ReportContextValue = {
    config: config ?? defaultConfig,
    allBrands: Object.keys(unifiedBrands) as string[],
  };
  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};

export const useReportContext = () => useContext(ReportContext);


