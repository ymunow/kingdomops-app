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

interface ThemeConfig {
  buttonClass: string;
  dropdownClass: string;
  iconClass: string;
  badgeClass: string;
  recentHeaderClass: string;
  pillarHeaderClass: string;
}

export function AppSwitcher({ user, className }: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // Determine visual theme based on user role
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isChurchAdmin = user.role === 'ORG_ADMIN' || user.role === 'ORG_LEADER';
  
  const getThemeConfig = (): ThemeConfig => {
    if (isSuperAdmin) {
      // Super Admin: Dark "control center" theme
      return {
        buttonClass: "bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 text-white hover:from-slate-700 hover:to-slate-800 shadow-lg hover:shadow-slate-500/25 transition-all duration-200",
        dropdownClass: "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 text-white",
        iconClass: "text-amber-400",
        badgeClass: "bg-amber-500 text-slate-900",
        recentHeaderClass: "text-slate-300",
        pillarHeaderClass: "text-amber-400 font-semibold"
      };
    } else if (isChurchAdmin) {
      // Church Admin: Warm community theme
      return {
        buttonClass: "bg-gradient-to-r from-spiritual-blue to-purple-600 border-spiritual-blue/20 text-white hover:from-spiritual-blue/90 hover:to-purple-600/90 shadow-lg hover:shadow-spiritual-blue/25 transition-all duration-200",
        dropdownClass: "bg-gradient-to-br from-white to-purple-50/50 border-spiritual-blue/20",
        iconClass: "text-spiritual-blue",
        badgeClass: "bg-warm-gold text-white",
        recentHeaderClass: "text-purple-600",
        pillarHeaderClass: "text-spiritual-blue font-semibold"
      };
    } else {
      // Default theme
      return {
        buttonClass: "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
        dropdownClass: "bg-white border-gray-200",
        iconClass: "text-spiritual-blue",
        badgeClass: "bg-red-500 text-white",
        recentHeaderClass: "text-gray-600",
        pillarHeaderClass: "text-gray-900"
      };
    }
  };

  const theme = getThemeConfig();

  // Define all available modules with persona-specific descriptions
  const getModulesForRole = (): AppModule[] => {
    if (isSuperAdmin) {
      return [
        // Community Pillar - Super Admin view
        {
          id: 'overview',
          name: 'Platform Analytics',
          description: 'Cross-church metrics and system health',
          icon: BarChart3,
          path: '/admin/overview',
          pillar: 'Control Center',
          permissions: ['SUPER_ADMIN'],
          badgeCount: 0
        },
        
        // Assessment Pillar - Super Admin view
        {
          id: 'assessment',
          name: 'Global Assessments',
          description: 'Platform-wide spiritual gifts insights',
          icon: Target,
          path: '/admin/assessment',
          pillar: 'Control Center',
          permissions: ['SUPER_ADMIN'],
          badgeCount: 0
        },
        
        // Admin Pillar - Super Admin view
        {
          id: 'admin',
          name: 'System Administration',
          description: 'Churches, users, and system configuration',
          icon: Settings,
          path: '/admin/admin',
          pillar: 'Platform Management',
          permissions: ['SUPER_ADMIN'],
          badgeCount: 0
        },
      ];
    } else {
      return [
        // Community Pillar - Church Admin view
        {
          id: 'overview',
          name: 'Church Overview',
          description: 'Member growth and congregation insights',
          icon: BarChart3,
          path: '/admin/overview',
          pillar: 'Church Operations',
          permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
          badgeCount: 0
        },
        
        // Assessment Pillar - Church Admin view
        {
          id: 'assessment',
          name: 'Spiritual Gifts',
          description: 'Assessment management and member results',
          icon: Target,
          path: '/admin/assessment',
          pillar: 'Discipleship',
          permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
          badgeCount: 0
        }
      ];
    }
  };

  const allModules = getModulesForRole();

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
            <Clock className={`h-4 w-4 ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`} />
            <h3 className={`font-medium ${theme.recentHeaderClass}`}>Recent</h3>
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
            className={cn("flex-shrink-0 border-0", theme.buttonClass, className)}
            data-testid="button-app-switcher"
          >
            <Grid3X3 className={`h-4 w-4 mr-2 ${isSuperAdmin ? 'text-amber-300' : 'text-current'}`} />
            Apps
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className={cn("h-[80vh]", theme.dropdownClass)}>
          <SheetHeader>
            <SheetTitle className={isSuperAdmin ? 'text-slate-100' : 'text-gray-900'}>KingdomOps Apps</SheetTitle>
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
          className={cn("flex-shrink-0 border-0", theme.buttonClass, className)}
          data-testid="button-app-switcher"
        >
          <Grid3X3 className={`h-4 w-4 mr-2 ${isSuperAdmin ? 'text-amber-300' : 'text-current'}`} />
          Apps
          <ChevronDown className={`h-4 w-4 ml-2 ${isSuperAdmin ? 'text-amber-300' : 'text-current'}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0 border-0", theme.dropdownClass)} align="start">
        <DesktopContent />
      </PopoverContent>
    </Popover>
  );
}