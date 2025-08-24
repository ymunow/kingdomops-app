import React from 'react';
import { useLocation } from 'wouter';
import { Crown, X, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useSupabaseAuth';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainMenuItems = [
  { path: '/features', label: 'Features' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/contact', label: 'Contact' },
];

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const [location, setLocation] = useLocation();
  const { user, signOutMutation } = useAuth();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  const handleApplyForBeta = () => {
    // Navigate to beta application or external link
    window.open('https://kingdomops.org/beta', '_blank');
    onClose();
  };

  const handleSignIn = () => {
    setLocation('/auth');
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
          "fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-spiritual-blue" />
            <div>
              <h2 className="font-bold text-xl text-charcoal">KingdomOps</h2>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            data-testid="drawer-close"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Menu Items */}
        <div className="flex-1 px-6 py-8">
          <div className="space-y-8">
            {mainMenuItems.map(({ path, label }) => (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                data-testid={`drawer-${label.toLowerCase()}`}
                className="block text-left text-lg text-gray-700 hover:text-spiritual-blue transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-4">
          <Button
            onClick={handleApplyForBeta}
            variant="outline"
            className="w-full border-2 border-gray-300 text-gray-700 hover:border-spiritual-blue hover:text-spiritual-blue py-3 text-base font-medium"
            data-testid="drawer-apply-beta"
          >
            <Building className="h-5 w-5 mr-2" />
            Apply for Beta
          </Button>
          
          {!user ? (
            <Button
              onClick={handleSignIn}
              className="w-full bg-spiritual-blue hover:bg-spiritual-blue/90 text-white py-3 text-base font-medium"
              data-testid="drawer-sign-in"
            >
              Sign In
            </Button>
          ) : (
            <Button
              onClick={() => {
                signOutMutation.mutate();
                onClose();
              }}
              variant="outline"
              className="w-full border-2 border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 py-3 text-base font-medium"
              data-testid="drawer-sign-out"
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </>
  );
}