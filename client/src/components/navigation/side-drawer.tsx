import React from 'react';
import { useLocation } from 'wouter';
import { Crown, MessageCircle, User, Settings, X, Home, Calendar, Users, Gift, BarChart3, Database, Building, UserCog, Globe, Zap, Lock, Eye, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { ViewAsSwitcher } from '@/components/admin/view-as-switcher';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainNavigationItems = [
  { path: '/dashboard', icon: BarChart3, label: 'Dashboard', description: 'Your church overview' },
  { path: '/events', icon: Calendar, label: 'Events', description: 'Church gatherings' },
  { path: '/connect', icon: Users, label: 'Serve', description: 'Ministry opportunities' },
  { path: '/gifts', icon: Gift, label: 'Spiritual Gifts', description: 'Your assessment results' },
  { path: '/profile', icon: User, label: 'Profile', description: 'Your account & settings' },
];

const superAdminItems = [
  { path: '/admin-dashboard', icon: Database, label: 'Platform Admin', description: 'System-wide management' },
  { path: '/organizations', icon: Building, label: 'All Organizations', description: 'Manage all churches' },
  { path: '/super-admin/users', icon: UserCog, label: 'User Management', description: 'Platform-wide users' },
  { path: '/super-admin/analytics', icon: Globe, label: 'Platform Analytics', description: 'Usage & insights' },
];

const adminItems = [
  { path: '/admin-dashboard', icon: Crown, label: 'Admin Dashboard', description: 'Church management' },
];

export function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const [location, setLocation] = useLocation();
  const { user, signOutMutation } = useAuth();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  const handleLogout = () => {
    signOutMutation.mutate();
    onClose();
  };

  const isSuperAdmin = (user as any)?.role === 'SUPER_ADMIN';
  const isAdmin = (user as any)?.role && ['ORG_OWNER', 'ORG_ADMIN', 'ORG_LEADER', 'ADMIN'].includes((user as any).role);

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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
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

        {/* Enhanced User Info */}
        <div className={`p-4 sm:p-6 border-b border-gray-100 ${
          isSuperAdmin 
            ? 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-amber-200' 
            : ''
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isSuperAdmin 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600' 
                : 'bg-spiritual-blue/10'
            }`}>
              {isSuperAdmin ? (
                <Crown className="h-6 w-6 text-white" />
              ) : (
                <User className="h-6 w-6 text-spiritual-blue" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-charcoal">
                  {(user as any)?.firstName && (user as any)?.lastName 
                    ? `${(user as any).firstName} ${(user as any).lastName}`
                    : user?.displayName || user?.email || 'Member'}
                </p>
                {isSuperAdmin && (
                  <div className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                    SUPER
                  </div>
                )}
              </div>
              <p className={`text-sm ${
                isSuperAdmin ? 'text-amber-700 font-medium' : 'text-gray-600'
              }`}>
                {isSuperAdmin ? 'Platform Administrator' :
                 (user as any)?.role === 'ORG_ADMIN' ? 'Church Admin' :
                 (user as any)?.role === 'ORG_LEADER' ? 'Church Leader' :
                 (user as any)?.role === 'GROUP_LEADER' ? 'Group Leader' :
                 'Member'}
              </p>
              {isSuperAdmin && (
                <p className="text-xs text-amber-600 mt-1">
                  Full platform access • All organizations
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation Items */}
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
          {mainNavigationItems.map(({ path, icon: Icon, label, description }) => {
            const isActive = location === path;
            
            return (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                data-testid={`drawer-${label.toLowerCase().replace(' ', '-')}`}
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

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Super Admin
                </p>
                <div className="px-2 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full">
                  <Crown className="h-3 w-3 text-amber-600" />
                </div>
              </div>
            </div>
            
            <div className="px-4 space-y-2 mb-4">
              {superAdminItems.map(({ path, icon: Icon, label, description }) => {
                const isActive = location === path;
                
                return (
                  <button
                    key={path}
                    onClick={() => handleNavigation(path)}
                    data-testid={`drawer-super-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg transition-colors text-left",
                      isActive 
                        ? "bg-amber-100 text-amber-700" 
                        : "text-gray-700 hover:bg-amber-50"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-amber-600" : "text-gray-500"
                    )} />
                    <div>
                      <p className={cn(
                        "font-medium",
                        isActive ? "text-amber-700" : "text-charcoal"
                      )}>
                        {label}
                      </p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Current Organization Section */}
            <div className="px-4 mb-4">
              <div className="border-t border-amber-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Current Church View
                </p>
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  data-testid="drawer-current-church"
                  className={cn(
                    "w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left",
                    location === '/dashboard' 
                      ? "bg-spiritual-blue/10 text-spiritual-blue" 
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <BarChart3 className={cn(
                    "h-4 w-4",
                    location === '/dashboard' ? "text-spiritual-blue" : "text-gray-500"
                  )} />
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      location === '/dashboard' ? "text-spiritual-blue" : "text-charcoal"
                    )}>
                      Church Dashboard
                    </p>
                    <p className="text-xs text-gray-500">Default Organization</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Regular Admin Section */}
        {isAdmin && !isSuperAdmin && (
          <>
            <div className="px-4 py-2 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Church Administration</p>
            </div>
            
            <div className="px-4 space-y-2 mb-4">
              {adminItems.map(({ path, icon: Icon, label, description }) => {
                const isActive = location === path;
                
                return (
                  <button
                    key={path}
                    onClick={() => handleNavigation(path)}
                    data-testid={`drawer-admin-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "w-full flex items-center space-x-3 p-4 rounded-lg transition-colors text-left",
                      isActive 
                        ? "bg-amber-100 text-amber-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-amber-600" : "text-gray-500"
                    )} />
                    <div>
                      <p className={cn(
                        "font-medium",
                        isActive ? "text-amber-700" : "text-charcoal"
                      )}>
                        {label}
                      </p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}


        {/* Footer */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 border-t border-gray-100">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={signOutMutation.isPending}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center"
              data-testid="drawer-sign-out"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            KingdomOps Platform
            <br />
            Empowering churches for Kingdom impact
          </p>
        </div>
      </div>
    </>
  );
}