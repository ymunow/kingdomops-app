import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(location);

  useEffect(() => {
    if (location !== currentLocation) {
      setIsTransitioning(true);
      
      // Start exit animation
      const timer1 = setTimeout(() => {
        setCurrentLocation(location);
      }, 150);
      
      // End transition and start enter animation
      const timer2 = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [location, currentLocation]);

  return (
    <div 
      className={`min-h-screen w-full transition-all duration-300 ease-out ${
        isTransitioning 
          ? 'opacity-0 transform translate-y-2 scale-98' 
          : 'opacity-100 transform translate-y-0 scale-100'
      }`}
      style={{
        transformOrigin: 'center center'
      }}
    >
      {children}
    </div>
  );
}

// Wrapper for individual pages that want custom animations
interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div
      className={`w-full animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
}