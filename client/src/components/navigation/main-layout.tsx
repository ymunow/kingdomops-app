import React, { useState, useEffect } from 'react';
import { Menu, Bell, Heart, MessageSquare, Users, Crown, User, Settings, LogOut, Search, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { BottomNavigation } from './bottom-navigation';
import { SideDrawer } from './side-drawer';
import { FloatingActionButton } from './floating-action-button';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { ViewAsSwitcher } from '@/components/admin/view-as-switcher';
import { AppSwitcher } from '@/components/admin/app-switcher';
import { useLocation } from 'wouter';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  const { user, signOutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Bottom nav is visible when scrolling up or at top, hidden when scrolling down
  const isBottomNavVisible = scrollDirection !== 'down';
  
  // FAB is visible when bottom nav is visible
  const isFabVisible = isBottomNavVisible;

  // Sample notifications data
  const notifications = [
    {
      id: '1',
      type: 'like',
      message: 'Sarah Johnson and 3 others liked your prayer request',
      time: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
      avatar: null,
      icon: Heart
    },
    {
      id: '2', 
      type: 'comment',
      message: 'Pastor Smith commented on your testimony',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      avatar: null,
      icon: MessageSquare
    },
    {
      id: '3',
      type: 'group',
      message: 'You have been added to "Young Adults" group',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
      avatar: null,
      icon: Users
    },
    {
      id: '4',
      type: 'serve',
      message: 'New serving opportunity matches your gifts',
      time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
      avatar: null,
      icon: Crown
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    signOutMutation.mutate();
  };

  const handleProfileClick = () => {
    setLocation('/profile');
  };

  const isSuperAdmin = (user as any)?.role === 'SUPER_ADMIN';
  const isAdmin = (user as any)?.role && ['ORG_OWNER', 'ORG_ADMIN', 'ORG_LEADER', 'ADMIN'].includes((user as any).role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - Planning Center Style */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-spiritual-blue/95 to-purple-600/95 backdrop-blur-md border-b border-spiritual-blue/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            {/* Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              data-testid="menu-button"
              className="flex items-center space-x-2 text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
            
            {/* Apps Switcher - Only for admins */}
            {(isSuperAdmin || isAdmin) && user && (
              <AppSwitcher user={user} className="bg-white/20 hover:bg-white/30 border-white/30 hover:border-white/40 rounded-full px-4 py-2 transition-all duration-200" />
            )}
          </div>
          
          {/* Center - Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search churches, users, events..."
                className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/25 transition-all"
                data-testid="global-search"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Quick Create Button - Only for admins */}
            {(isSuperAdmin || isAdmin) && (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 rounded-full px-4 py-2 text-white transition-all duration-200"
                  data-testid="quick-create"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create</span>
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </div>
            )}
            
            {/* Profile Menu - For non-admin users */}
            {!isAdmin && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 rounded-full p-2"
                    data-testid="header-profile"
                  >
                    <Avatar className="w-8 h-8">
                      {user?.profileImageUrl && (
                        <AvatarImage 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="object-cover" 
                        />
                      )}
                      <AvatarFallback className="bg-white/20 text-white text-sm font-bold">
                        {user?.displayName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="space-y-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="font-medium text-sm text-gray-900">
                        {user?.displayName || user?.firstName || 'Member'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleProfileClick}
                      className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      data-testid="menu-profile"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      disabled={signOutMutation.isPending}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid="menu-sign-out"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {signOutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-white/30" />
            {/* Notifications */}
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-white hover:bg-white/10"
                  data-testid="notifications-button"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="border-b border-gray-200 p-4">
                  <h3 className="font-semibold text-charcoal">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          data-testid={`notification-${notification.id}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-spiritual-blue/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-spiritual-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                !notification.read ? 'font-medium text-charcoal' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(notification.time, { addSuffix: true })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-spiritual-blue rounded-full mt-2" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 p-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-spiritual-blue hover:text-spiritual-blue/80"
                    data-testid="mark-all-read"
                  >
                    Mark all as read
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-white hidden lg:inline">KingdomOps</span>
            </div>
          </div>
        </div>
      </header>

      {/* Simplified Admin Controls - Only for admins */}
      {(isSuperAdmin || isAdmin) && (
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isSuperAdmin 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600' 
                  : 'bg-spiritual-blue/10'
              }`}>
                {isSuperAdmin ? (
                  <Crown className="h-4 w-4 text-white" />
                ) : (
                  <User className="h-4 w-4 text-spiritual-blue" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-charcoal text-sm">
                    {(user as any)?.firstName && (user as any)?.lastName 
                      ? `${(user as any).firstName} ${(user as any).lastName}`
                      : user?.displayName || user?.email || 'Member'}
                  </p>
                  {isSuperAdmin && (
                    <div className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
                      SUPER
                    </div>
                  )}
                </div>
                <p className={`text-xs ${
                  isSuperAdmin ? 'text-amber-700 font-medium' : 'text-gray-600'
                }`}>
                  {isSuperAdmin ? 'Platform Administrator' :
                   (user as any)?.role === 'ORG_ADMIN' ? 'Church Admin' :
                   (user as any)?.role === 'ORG_LEADER' ? 'Church Leader' :
                   'Member'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* View As Switcher - Super Admin Only */}
              {isSuperAdmin && (
                <ViewAsSwitcher user={user} className="" />
              )}
              
              {/* Profile Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-profile"
              >
                <Settings className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              
              {/* Sign Out Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={signOutMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="button-sign-out"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Navigation Components */}
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <FloatingActionButton isVisible={isFabVisible} />
    </div>
  );
}