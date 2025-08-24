import React from 'react';
import { useLocation } from 'wouter';
import { Crown, X, Church } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useSupabaseAuth';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleLogin = () => {
    setLocation("/auth");
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
      
      {/* Mobile Navigation Menu - matching landing page design */}
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

        {/* Menu Content */}
        <div className="p-6">
          <div className="space-y-3">
            {!user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg" 
                  onClick={() => {
                    setLocation("/features");
                    onClose();
                  }}
                  data-testid="mobile-features"
                >
                  Features
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg" 
                  onClick={() => {
                    setLocation("/pricing");
                    onClose();
                  }}
                  data-testid="mobile-pricing"
                >
                  Pricing
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg" 
                  onClick={() => onClose()}
                  data-testid="mobile-contact"
                >
                  Contact
                </Button>
                
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <Button 
                    variant="outline"
                    className="w-full border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue hover:text-white py-3"
                    onClick={() => {
                      setLocation("/church-signup");
                      onClose();
                    }}
                    data-testid="mobile-church-signup"
                  >
                    <Church className="mr-2 h-4 w-4" />
                    Apply for Beta
                  </Button>
                  <Button 
                    className="w-full bg-spiritual-blue text-white hover:bg-purple-800 py-3" 
                    onClick={() => {
                      handleLogin();
                      onClose();
                    }}
                    data-testid="mobile-signin"
                  >
                    Sign In
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg" 
                  onClick={() => {
                    setLocation("/dashboard");
                    onClose();
                  }}
                  data-testid="mobile-dashboard"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-lg" 
                  onClick={() => {
                    setLocation("/profile");
                    onClose();
                  }}
                  data-testid="mobile-profile"
                >
                  Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}