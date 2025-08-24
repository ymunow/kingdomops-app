import React from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Home, Calendar, Users, Gift, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  isVisible: boolean;
}

const navigationItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/connect', icon: Users, label: 'Serve' },
  { path: '/gifts', icon: Gift, label: 'Gifts' },
  { path: '/give', icon: DollarSign, label: 'Give' },
];

export function BottomNavigation({ isVisible }: BottomNavigationProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 transition-transform duration-300 z-50",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navigationItems.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          
          return (
            <button
              key={path}
              onClick={() => {
                // If navigating to dashboard, invalidate progress cache for fresh data
                if (path === '/dashboard') {
                  queryClient.invalidateQueries({ queryKey: ['/api/profile/progress'] });
                }
                setLocation(path);
              }}
              data-testid={`nav-${label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg transition-colors min-w-[60px]",
                isActive 
                  ? "text-spiritual-blue bg-spiritual-blue/10" 
                  : "text-gray-500 hover:text-spiritual-blue hover:bg-spiritual-blue/5"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-spiritual-blue" : "text-gray-500"
                )} 
              />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-spiritual-blue" : "text-gray-500"
              )}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}