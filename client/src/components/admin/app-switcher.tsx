import React, { useState } from 'react';
import { Grid3X3, BarChart3, Target, Settings, Crown, ChevronDown, Clock, User, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppModule {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  pillar: string;
  permissions: string[];
  badgeCount?: number;
}

interface User {
  role: string;
  organizationId?: string;
}

interface AppSwitcherProps {
  user: User;
  className?: string;
}

export function AppSwitcher({ user, className }: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // Define all available modules
  const allModules: AppModule[] = [
    // Community Pillar
    {
      id: 'overview',
      name: 'Overview',
      description: 'Church insights and analytics',
      icon: BarChart3,
      path: '/admin/overview',
      pillar: 'Community',
      permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
      badgeCount: 0
    },
    
    // Assessment Pillar  
    {
      id: 'assessment',
      name: 'Spiritual Gifts',
      description: 'Assessment management and results',
      icon: Target,
      path: '/admin/assessment',
      pillar: 'Assessment',
      permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
      badgeCount: 0
    },
    
    // Admin Pillar
    {
      id: 'admin',
      name: 'Administration',
      description: 'Platform and organization settings',
      icon: Settings,
      path: '/admin/admin',
      pillar: 'Admin',
      permissions: ['SUPER_ADMIN'],
      badgeCount: 0
    },
  ];

  // Get recent items (mock for Phase 1A)
  const recentItems = [
    { id: 'overview', name: 'Church Overview', icon: BarChart3, lastVisited: '2 minutes ago' },
    { id: 'assessment', name: 'Spiritual Gifts', icon: Target, lastVisited: '1 hour ago' },
  ];

  // Filter modules based on user permissions
  const getAccessibleModules = () => {
    return allModules.filter(module => {
      return module.permissions.includes(user.role);
    });
  };

  // Group modules by pillar
  const groupModulesByPillar = (modules: AppModule[]) => {
    const grouped: Record<string, AppModule[]> = {};
    modules.forEach(module => {
      if (!grouped[module.pillar]) {
        grouped[module.pillar] = [];
      }
      grouped[module.pillar].push(module);
    });
    return grouped;
  };

  const accessibleModules = getAccessibleModules();
  const groupedModules = groupModulesByPillar(accessibleModules);

  const handleModuleClick = (module: AppModule) => {
    setIsOpen(false);
    setLocation(module.path);
  };

  const handleRecentClick = (item: any) => {
    setIsOpen(false);
    const module = allModules.find(m => m.id === item.id);
    if (module) {
      setLocation(module.path);
    }
  };

  // Mobile Sheet Content
  const MobileContent = () => (
    <div className="p-4 space-y-6">
      {/* Recent Items */}
      {recentItems.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-gray-900">Recent</h3>
          </div>
          <div className="space-y-2">
            {recentItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleRecentClick(item)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-spiritual-blue/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-spiritual-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.lastVisited}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modules by Pillar */}
      {Object.entries(groupedModules).map(([pillar, modules]) => (
        <div key={pillar}>
          <h3 className="font-medium text-gray-900 mb-3">{pillar}</h3>
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-spiritual-blue/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-spiritual-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{module.name}</p>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </div>
                  {module.badgeCount && module.badgeCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {module.badgeCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop Dropdown Content
  const DesktopContent = () => (
    <div className="w-80 p-4 space-y-4">
      {/* Recent Items */}
      {recentItems.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-gray-900 text-sm">Recent</h3>
          </div>
          <div className="grid gap-2">
            {recentItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleRecentClick(item)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded bg-spiritual-blue/10 flex items-center justify-center">
                    <Icon className="h-3 w-3 text-spiritual-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.lastVisited}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-100 my-4" />
        </div>
      )}

      {/* Modules by Pillar */}
      {Object.entries(groupedModules).map(([pillar, modules]) => (
        <div key={pillar}>
          <h3 className="font-medium text-gray-900 text-sm mb-2">{pillar}</h3>
          <div className="grid gap-1">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-spiritual-blue/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-spiritual-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900">{module.name}</p>
                      {module.badgeCount && module.badgeCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {module.badgeCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{module.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {pillar !== Object.keys(groupedModules)[Object.keys(groupedModules).length - 1] && (
            <div className="border-t border-gray-100 my-3" />
          )}
        </div>
      ))}
    </div>
  );

  if (accessibleModules.length === 0) {
    return null; // No modules accessible
  }

  // Mobile version
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("flex-shrink-0", className)}
            data-testid="button-app-switcher"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Apps
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>KingdomOps Apps</SheetTitle>
          </SheetHeader>
          <MobileContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("flex-shrink-0", className)}
          data-testid="button-app-switcher"
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Apps
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <DesktopContent />
      </PopoverContent>
    </Popover>
  );
}