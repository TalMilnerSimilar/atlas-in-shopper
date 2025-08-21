import React, { useState, useEffect } from 'react';
// styles loaded globally via _app.tsx

interface NavItem {
  id: string;
  icon: string;
  text: string;
  badge?: string;
  hasChevron?: boolean;
  isExpanded?: boolean;
  isActive?: boolean;
  subItems?: Array<{
    id: string;
    text: string;
    isActive?: boolean;
  }>;
}

const navItemsData: NavItem[] = [
  { id: 'home', icon: '/icons/home-icon.svg', text: 'Home' },
  { id: 'my-assets', icon: '/icons/my-assets-icon.svg', text: 'My Assets', badge: 'New' },
  { 
    id: 'my-analytics', 
    icon: '/icons/analytics-icon.svg', 
    text: 'My Analytics', 
    hasChevron: true,
    isExpanded: false,
    subItems: [
      { id: 'brand-share-reports', text: 'Brand Share Reports' }
    ]
  },
  { id: 'sales', icon: '/icons/sales-icon.svg', text: 'Sales Performance', hasChevron: true },
  { id: 'search', icon: '/icons/search-icon.svg', text: 'Search Optimization', hasChevron: true },
  { id: 'traffic', icon: '/icons/traffic-icon.svg', text: 'Traffic Sources', hasChevron: true },
  { id: 'consumer', icon: '/icons/consumer-icon.svg', text: 'Consumer Behavior', hasChevron: true },
  { id: 'cross-retail', icon: '/icons/cross-retail-icon.svg', text: 'Cross Retail', badge: 'New', isActive: true },
  { id: 'data-export', icon: '/icons/data-export-icon.svg', text: 'Data Exporter' },
];

const NavBar: React.FC = () => {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const storedPinStatus = localStorage.getItem('navbarPinned');
    if (storedPinStatus !== null) {
      setIsPinned(storedPinStatus === 'true');
    }
  }, []);

  const handlePinToggle = () => {
    const newPinState = !isPinned;
    setIsPinned(newPinState);
    localStorage.setItem('navbarPinned', String(newPinState));
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('navbarPinChange', { detail: { isPinned: newPinState } }));
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Dispatch hover state change
    window.dispatchEvent(new CustomEvent('navbarHoverChange', { detail: { isHovered: true } }));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Dispatch hover state change
    window.dispatchEvent(new CustomEvent('navbarHoverChange', { detail: { isHovered: false } }));
  };

  const navBarClass = `nav-bar ${!isPinned ? 'unpinned' : ''} ${!isPinned && isHovered ? 'hover-show' : ''}`;

  return (
    <div
      className={navBarClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="nav-logos">
        <div className="header-nav-bar">
          <div className="logo-container">
            <div className="similarweb-logo full-logo">
              <img src="/icons/similarweb logo.svg" alt="Shopper Intelligence by Similarweb" />
            </div>
            <div className="similarweb-logo icon-only">
              <div className="main-icon">
                <img src="/icons/shopper-logo.svg" alt="Shopper Intelligence" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-items">
        <div className="nav-upper">
          {navItemsData.map((item, index) => (
            <div key={item.id}>
              <div
                className={`nav-item ${item.isActive ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={item.text}
              >
                <div className="nav-content">
                  <div className={`nav-icon ${item.id === 'home' ? 'home-icon' : ''}`}>
                    <img src={item.icon} alt={`${item.text} icon`} />
                  </div>
                  <span className="nav-text">{item.text}</span>
                </div>
                {item.badge && (
                  <div className={`${item.badge === 'New' ? 'new-badge' : 'positive-badge'}`}>
                    {item.badge}
                  </div>
                )}
                {item.hasChevron && (
                  <div className="chevron-icon">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Sub-menu items for My Analytics */}
              {item.id === 'my-analytics' && item.isExpanded && item.subItems && (
                <div className="sub-menu">
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`sub-menu-item ${subItem.isActive ? 'active' : ''}`}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="sub-menu-content">
                        {subItem.isActive && (
                          <div className="active-indicator"></div>
                        )}
                        <span className="sub-menu-text">{subItem.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Separation line between Consumer Behavior and Cross Retail */}
              {item.id === 'consumer' && (
                <div className="nav-separator"></div>
              )}
            </div>
          ))}
        </div>

        <div className="nav-bottom">
          <div
            className="nav-item"
            role="button"
            tabIndex={0}
            aria-label="Settings"
          >
            <div className="nav-content">
              <div className="nav-icon">
                <img src="/icons/settings-icon.svg" alt="Settings icon" />
              </div>
              <span className="nav-text">Settings</span>
            </div>
            <div className="chevron-icon">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div
            id="pinButton"
            className={`pin-button ${!isPinned ? 'unpinned' : ''}`}
            onClick={handlePinToggle}
            role="button"
            aria-label={isPinned ? 'Unpin navigation' : 'Pin navigation'}
          >
            <img src="/icons/pin icon.svg" alt="Pin icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar; 