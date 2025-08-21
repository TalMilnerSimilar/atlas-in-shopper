import React from 'react';
// styles loaded globally via _app.tsx
import Tooltip from './Tooltip';

interface HeroTileProps {
  reportRange: string;
  onEditList?: () => void;
}

const HeroTile: React.FC<HeroTileProps> = ({ reportRange, onEditList }) => {
  const competitors = ['Adidas', 'New Balance', 'Hoka', 'Asics'];

  const getDisplayDate = (range: string) => {
    const parts = range.split('-');
    return parts.length > 1 ? parts[1].trim() : range;
  };

  return (
    <div className="spotlight-container">
      {/* Brand Header Card */}
      <div className="brand-header-card">
        <div className="brand-header-content">
          <div className="brand-info">
            {/* Brand Title */}
            <div className="brand-title">
              <span className="brand-name-bold">Nike</span>
              <span className="brand-name-regular">Across</span>
              <span className="brand-name-bold">Shoes</span>
            </div>
            
            {/* Domain */}
            <div className="domain-info">
              <div className="flag-container">
                <img src="/icons/us-flag.svg" alt="US" className="flag-icon" />
                <span className="domain-text">amazon.com</span>
              </div>
            </div>
            
            {/* Report Info */}
            <div className="report-info">
              <span className="report-label">Report Period:</span>
              <span className="report-date">{getDisplayDate(reportRange)}</span>
            </div>
          </div>
          
          {/* Leading Products */}
          <div className="leading-products">
            <div className="products-container">
              {/* Product 1 - Small */}
              <div className="product-card product-small product-1">
                <div className="product-content">
                  <div className="product-image-container">
                    <img src="/icons/images/shoe-1.png" alt="Product 1" className="product-image" />
                  </div>
                </div>
              </div>

              {/* Product 2 - Small */}
              <div className="product-card product-small product-2">
                <div className="product-content">
                  <div className="product-image-container">
                    <img src="/icons/images/shoe-2.png" alt="Product 2" className="product-image" />
                  </div>
                </div>
              </div>

              {/* Product 3 - Medium */}
              <div className="product-card product-medium product-3">
                <div className="product-content">
                  <div className="product-image-container">
                    <img src="/icons/images/shoe-3.png" alt="Product 3" className="product-image" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competitors Section */}
      <div className="competitors-section">
        <div className="competitors-content">
          <div className="competitors-info">
            <span className="competitors-title">Vs. Your Competitors:</span>
            <div className="competitors-tags">
              {competitors.map((competitor, index) => (
                <div key={index} className="competitor-tag">
                  <div className="tag-content">
                    <div className="tag-icon">
                      <img src="/icons/brand icon.svg" alt="Brand" className="brand-icon" />
                    </div>
                    <span className="competitor-name">{competitor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="edit-button-container">
            <Tooltip content="Customize which competitors to compare against">
              <button className="edit-button" onClick={onEditList}>
                Edit List
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroTile; 