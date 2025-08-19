import React, { useState } from 'react';
import { Plus, PenTool, Heart, Megaphone, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useSupabaseAuth';

interface FloatingActionButtonProps {
  isVisible: boolean;
}

interface CreateOption {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  action: () => void;
  requiredRoles?: string[];
}

export function FloatingActionButton({ isVisible }: FloatingActionButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  
  const userRole = (user as any)?.role;

  const createOptions: CreateOption[] = [
    {
      icon: PenTool,
      label: 'Share Testimony',
      description: 'Share how God is working',
      action: () => console.log('Create testimony'),
    },
    {
      icon: Heart,
      label: 'Prayer Request',
      description: 'Ask for prayer support', 
      action: () => console.log('Create prayer'),
    },
    {
      icon: Megaphone,
      label: 'Announcement',
      description: 'Share church news',
      action: () => console.log('Create announcement'),
      requiredRoles: ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_LEADER', 'PASTORAL_STAFF'],
    },
    {
      icon: Calendar,
      label: 'Create Event',
      description: 'Schedule a gathering',
      action: () => console.log('Create event'),
      requiredRoles: ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_LEADER', 'MINISTRY_LEADER'],
    },
    {
      icon: Users,
      label: 'Serve Opportunity',
      description: 'Post ministry role',
      action: () => console.log('Create serve opportunity'),
      requiredRoles: ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_LEADER', 'MINISTRY_LEADER'],
    },
  ];

  // Filter options based on user role
  const availableOptions = createOptions.filter(option => 
    !option.requiredRoles || option.requiredRoles.includes(userRole)
  );

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div 
      className={cn(
        "fixed bottom-20 right-6 z-40 transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      )}
    >
      {/* Create Options Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-16 right-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden mb-4">
          <div className="p-3 border-b border-gray-100">
            <p className="font-semibold text-charcoal text-sm">Create New</p>
            <p className="text-xs text-gray-500">Share with your community</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {availableOptions.map(({ icon: Icon, label, description, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setIsMenuOpen(false);
                }}
                data-testid={`create-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-spiritual-blue/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-spiritual-blue" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal text-sm">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={toggleMenu}
        data-testid="fab-create"
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
          "bg-gradient-to-r from-spiritual-blue to-purple-700",
          "hover:from-spiritual-blue/90 hover:to-purple-700/90",
          "hover:scale-110 hover:shadow-xl",
          isMenuOpen && "rotate-45"
        )}
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
}