import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from './bottom-navigation';
import { SideDrawer } from './side-drawer';
import { FloatingActionButton } from './floating-action-button';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  
  // Bottom nav is visible when scrolling up or at top, hidden when scrolling down
  const isBottomNavVisible = scrollDirection !== 'down';
  
  // FAB is visible when bottom nav is visible
  const isFabVisible = isBottomNavVisible;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            data-testid="menu-button"
            className="flex items-center space-x-2"
          >
            <Menu className="h-5 w-5" />
            <span className="hidden sm:inline">Menu</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-spiritual-blue/10 flex items-center justify-center">
              <span className="text-spiritual-blue font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-charcoal hidden sm:inline">KingdomOps</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Navigation Components */}
      <BottomNavigation isVisible={isBottomNavVisible} />
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <FloatingActionButton isVisible={isFabVisible} />
    </div>
  );
}