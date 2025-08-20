import React, { useState } from 'react';
import { Grid3X3, BarChart3, Target, Settings, Crown, ChevronDown, Clock, User, Users, Shield, TrendingUp, Calendar, MessageSquare, Zap, Sparkles, Cog } from 'lucide-react';
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
      // Super Admin: Premium glassmorphism theme
      return {
        buttonClass: "bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/40 shadow-lg hover:shadow-warm-gold/30 transition-all duration-300",
        dropdownClass: "bg-gradient-to-br from-spiritual-blue/80 via-purple-900/85 to-purple-800/80 backdrop-blur-2xl border-white/10 text-white shadow-2xl ring-1 ring-white/5",
        iconClass: "text-warm-gold",
        badgeClass: "bg-warm-gold text-spiritual-blue font-semibold",
        recentHeaderClass: "text-purple-100",
        pillarHeaderClass: "text-warm-gold font-bold tracking-wide"
      };
    } else if (isChurchAdmin) {
      // Church Admin: Warm community theme
      return {
        buttonClass: "bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/40 shadow-lg transition-all duration-200",
        dropdownClass: "bg-gradient-to-br from-white to-purple-50/50 border-spiritual-blue/20",
        iconClass: "text-spiritual-blue",
        badgeClass: "bg-warm-gold text-white",
        recentHeaderClass: "text-purple-600",
        pillarHeaderClass: "text-spiritual-blue font-semibold"
      };
    } else {
      // Default theme
      return {
        buttonClass: "bg-white/20 border-white/30 text-white hover:bg-white/30",
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
        // Insights Section
        {
          id: 'overview',
          name: 'Platform Analytics',
          description: 'Cross-church metrics',
          icon: TrendingUp,
          path: '/admin/overview',
          pillar: 'Insights',
          permissions: ['SUPER_ADMIN'],
          badgeCount: 0
        },
        {
          id: 'assessment',
          name: 'Global Assessments',
          description: 'Platform-wide insights',
          icon: Target,
          path: '/admin/assessment',
          pillar: 'Insights',
          permissions: ['SUPER_ADMIN'],
          badgeCount: 0
        },
        
        // Management Section
        {
          id: 'admin',
          name: 'System Admin',
          description: 'Churches & configuration',
          icon: Settings,
          path: '/admin/admin',
          pillar: 'Management',
          permissions: ['SUPER_ADMIN'],
          badgeCount: 0
        },
      ];
    } else {
      return [
        // Growth Section
        {
          id: 'overview',
          name: 'Church Overview',
          description: 'Member insights',
          icon: TrendingUp,
          path: '/admin/overview',
          pillar: 'Growth',
          permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
          badgeCount: 0
        },
        {
          id: 'assessment',
          name: 'Spiritual Gifts',
          description: 'Track gifts',
          icon: Target,
          path: '/admin/assessment',
          pillar: 'Growth',
          permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
          badgeCount: 0
        },
        
        // Engagement Section  
        {
          id: 'events',
          name: 'Events',
          description: 'Manage events',
          icon: Calendar,
          path: '/admin/events',
          pillar: 'Engagement',
          permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
          badgeCount: 0
        },
        {
          id: 'serve',
          name: 'Serve Central',
          description: 'Ministry opportunities',
          icon: Users,
          path: '/admin/serve',
          pillar: 'Engagement',
          permissions: ['ORG_ADMIN', 'ORG_LEADER', 'SUPER_ADMIN'],
          badgeCount: 3
        }
      ];
    }
  };

  const allModules = getModulesForRole();

  // Get recent items (mock for Phase 1A)
  const recentItems = [
    { id: 'overview', name: isSuperAdmin ? 'Platform Analytics' : 'Church Overview', icon: TrendingUp, lastVisited: '2 minutes ago' },
    { id: 'assessment', name: isSuperAdmin ? 'Global Assessments' : 'Spiritual Gifts', icon: Target, lastVisited: '1 hour ago' },
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

  // Get pillar icon
  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Insights':
        return TrendingUp;
      case 'Management':
        return Cog;
      case 'Growth':
        return Sparkles;
      case 'Engagement':
        return Users;
      default:
        return Settings;
    }
  };

  // Desktop Dropdown Content
  const DesktopContent = () => (
    <div className={`w-80 p-0 ${theme.dropdownClass} rounded-2xl shadow-2xl border animate-in slide-in-from-top-2 fade-in-0 duration-300`}>
      {/* Header */}
      <div className="p-5 border-b border-white/5 bg-gradient-to-r from-white/10 via-white/5 to-transparent backdrop-blur-sm">
        <h3 className={`font-bold text-sm ${isSuperAdmin ? 'text-warm-gold' : 'text-spiritual-blue'} tracking-wide uppercase`}>KingdomOps Apps</h3>
      </div>
      
      {/* Recent Items */}
      {recentItems.length > 0 && (
        <div className="p-5 pb-3">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className={`h-4 w-4 ${theme.recentHeaderClass}`} />
            <h3 className={`font-semibold text-sm ${theme.recentHeaderClass} tracking-wide uppercase`}>Recent</h3>
          </div>
          <div className="grid gap-1">
            {recentItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleRecentClick(item)}
                  className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 text-left group ${isSuperAdmin ? 'hover:bg-white/10 hover:shadow-lg hover:shadow-warm-gold/20 hover:ring-1 hover:ring-warm-gold/30' : 'hover:bg-spiritual-blue/5'}`}
                >
                  <div className={`w-9 h-9 rounded-xl ${isSuperAdmin ? 'bg-warm-gold/20 group-hover:bg-warm-gold/30' : theme.iconClass + ' bg-opacity-10'} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon className={`h-4 w-4 ${theme.iconClass} group-hover:drop-shadow-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isSuperAdmin ? 'text-white group-hover:text-warm-gold/90' : 'text-gray-900'} truncate transition-colors duration-300`}>{item.name}</p>
                    <p className={`text-xs ${isSuperAdmin ? 'text-purple-200' : 'text-gray-500'} transition-colors duration-300`}>{item.lastVisited}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className={`border-t my-6 ${isSuperAdmin ? 'border-white/5' : 'border-gray-100'}`} />
        </div>
      )}

      {/* Modules by Pillar */}
      <div className="px-5 pb-5">
        {Object.entries(groupedModules).map(([pillar, modules]) => {
          const PillarIcon = getPillarIcon(pillar);
          return (
          <div key={pillar} className="mb-6 last:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <PillarIcon className={`h-4 w-4 ${theme.pillarHeaderClass}`} />
              <h3 className={`font-bold text-xs uppercase tracking-wider ${theme.pillarHeaderClass}`}>{pillar}</h3>
            </div>
            <div className="grid gap-1">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => handleModuleClick(module)}
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 text-left group ${isSuperAdmin ? 'hover:bg-white/10 hover:shadow-xl hover:shadow-warm-gold/20 hover:ring-1 hover:ring-warm-gold/30 hover:scale-[1.02]' : 'hover:bg-spiritual-blue/5'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${isSuperAdmin ? 'bg-warm-gold/20 group-hover:bg-warm-gold/30 group-hover:shadow-lg' : 'bg-spiritual-blue/10'} flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
                      <Icon className={`h-6 w-6 ${theme.iconClass} group-hover:drop-shadow-md`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold text-sm ${isSuperAdmin ? 'text-white group-hover:text-warm-gold/90' : 'text-gray-900'} transition-colors duration-300`}>{module.name}</p>
                        {module.badgeCount && module.badgeCount > 0 && (
                          <Badge className={`text-xs ${theme.badgeClass} border-0 px-2 py-1 font-bold`}>
                            {module.badgeCount}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs ${isSuperAdmin ? 'text-purple-200' : 'text-gray-600'} truncate mt-0.5 transition-colors duration-300`}>{module.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {pillar !== Object.keys(groupedModules)[Object.keys(groupedModules).length - 1] && (
              <div className={`border-t my-6 ${isSuperAdmin ? 'border-white/5' : 'border-gray-100'}`} />
            )}
          </div>
        )})}
      </div>
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
      <PopoverContent 
        className={cn("p-0 border-0", theme.dropdownClass)} 
        align="start"
        sideOffset={8}
      >
        <DesktopContent />
      </PopoverContent>
    </Popover>
  );
}