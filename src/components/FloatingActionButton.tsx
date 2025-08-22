import React, { useState, useEffect } from 'react';
import SecretModificationMenu from './SecretModificationMenu';

interface FloatingActionButtonProps {
  onClick?: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Calculate distance from bottom-right corner
      const distanceFromCorner = Math.sqrt(
        Math.pow(window.innerWidth - e.clientX, 2) + 
        Math.pow(window.innerHeight - e.clientY, 2)
      );
      
      // Show button when cursor is within 75px of the corner
      setIsVisible(distanceFromCorner < 75);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Open the secret modification menu
      setIsMenuOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed bottom-6 right-6 z-50
          w-8 h-8 
          bg-blue-600 hover:bg-blue-700 
          rounded-full 
          shadow-lg hover:shadow-xl 
          transition-all duration-300 ease-in-out
          flex items-center justify-center
          focus:outline-none focus:ring-4 focus:ring-blue-300
          ${isHovered ? 'scale-110' : 'scale-100'}
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
        `}
        aria-label="Settings"
      >
        <img 
          src="/icons/settings-icon.svg" 
          alt="Settings"
          className="w-4 h-4 filter invert brightness-0 contrast-100"
        />
      </button>
      
      <SecretModificationMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </>
  );
};

export default FloatingActionButton;
