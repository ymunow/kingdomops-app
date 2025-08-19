import React from 'react';
import { useLocation } from 'wouter';
import { Crown, MessageCircle, User, Settings, X, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useSupabaseAuth';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const drawerItems = [
  { path: '/dashboard', icon: Home, label: 'Home', description: 'Dashboard & Overview' },
  { path: '/connect', icon: MessageCircle, label: 'Connect', description: 'Community & Social' },
  { path: '/profile', icon: User, label: 'Profile', description: 'Personal Information' },
  { path: '/settings', icon: Settings, label: 'Settings', description: 'App Preferences' },
];

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-spiritual-blue" />
            <div>
              <h2 className="font-bold text-xl text-charcoal">KingdomOps</h2>
              <p className="text-sm text-gray-600">Connect Platform</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            data-testid="drawer-close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-spiritual-blue/10 flex items-center justify-center">
              <User className="h-6 w-6 text-spiritual-blue" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">
                {user?.firstName || user?.displayName || 'Member'}
              </p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {drawerItems.map(({ path, icon: Icon, label, description }) => {
            const isActive = location === path;
            
            return (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                data-testid={`drawer-${label.toLowerCase()}`}
                className={cn(
                  "w-full flex items-center space-x-3 p-4 rounded-lg transition-colors text-left",
                  isActive 
                    ? "bg-spiritual-blue/10 text-spiritual-blue" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-spiritual-blue" : "text-gray-500"
                )} />
                <div>
                  <p className={cn(
                    "font-medium",
                    isActive ? "text-spiritual-blue" : "text-charcoal"
                  )}>
                    {label}
                  </p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            KingdomOps Connect Platform
            <br />
            Empowering churches for Kingdom impact
          </p>
        </div>
      </div>
    </>
  );
}