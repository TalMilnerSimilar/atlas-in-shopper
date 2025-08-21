import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  brandColorMap: Record<string, string>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, brandColorMap }) => {
  // Share-over-time charts always pass percentage values (0..100)
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Categorize brands
  const myBrand = payload.find(item => item.dataKey === 'Nike');
  const competitors = payload.filter(item => 
    ['Adidas', 'New Balance', 'Hoka', 'Asics'].includes(item.dataKey)
  );
  const otherBrands = payload.filter(item => 
    item.dataKey !== 'Nike' && 
    !['Adidas', 'New Balance', 'Hoka', 'Asics'].includes(item.dataKey)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[250px] max-w-[400px]">
      {/* Date */}
      <div className="mb-4">
        <span className="text-xs font-medium text-[#092540]">{label}</span>
      </div>

      {/* My Brand */}
      {myBrand && (
        <div className="mb-4">
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: brandColorMap[myBrand.dataKey] }}
              />
              <span className="text-xs text-[#3a5166]">
                <span className="font-bold">My Brand</span>
                <span> - {myBrand.dataKey}</span>
              </span>
            </div>
            <span className="text-xs font-bold text-[#092540] text-right tracking-[0.36px] w-[48px]">
              {`${Number(myBrand.value ?? 0).toFixed(1)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Competitors */}
      {competitors.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-[#092540] mb-2">Competitors:</div>
          <div className="space-y-2">
            {competitors.map((item) => (
              <div key={item.dataKey} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: brandColorMap[item.dataKey] }}
                  />
                  <span className="text-xs text-[#3a5166]">{item.dataKey}</span>
                </div>
                <span className="text-xs font-bold text-[#092540] text-right tracking-[0.36px] w-[48px]">
                  {`${Number(item.value ?? 0).toFixed(1)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Brands */}
      {otherBrands.length > 0 && (
        <div>
          <div className="text-xs font-bold text-[#092540] mb-2">Other Brands:</div>
          <div className="space-y-2">
            {otherBrands.map((item) => (
              <div key={item.dataKey} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: brandColorMap[item.dataKey] }}
                  />
                  <span className="text-xs text-[#3a5166]">{item.dataKey}</span>
                </div>
                <span className="text-xs font-bold text-[#092540] text-right tracking-[0.36px] w-[48px]">
                  {`${Number(item.value ?? 0).toFixed(1)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTooltip; 