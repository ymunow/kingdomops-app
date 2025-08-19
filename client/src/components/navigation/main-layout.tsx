import React, { useState, useEffect } from 'react';
import { Menu, Bell, Heart, MessageSquare, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { BottomNavigation } from './bottom-navigation';
import { SideDrawer } from './side-drawer';
import { FloatingActionButton } from './floating-action-button';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  
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
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
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
              <div className="w-8 h-8 rounded-full bg-spiritual-blue/10 flex items-center justify-center">
                <span className="text-spiritual-blue font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-charcoal hidden sm:inline">KingdomOps</span>
            </div>
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