import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { Building2 } from 'lucide-react';

interface BetaNotification {
  id: string;
  type: 'beta_application';
  message: string;
  time: Date;
  read: boolean;
  avatar: null;
  icon: typeof Building2;
  applicationId: string;
  organizationName: string;
}

const LAST_CHECKED_KEY = 'last_checked_beta_applications';
const READ_APPLICATIONS_KEY = 'read_beta_applications';

export function useBetaApplicationNotifications() {
  const { user } = useAuth();
  const [lastChecked, setLastChecked] = useState<string | null>(
    localStorage.getItem(LAST_CHECKED_KEY)
  );
  const [readApplications, setReadApplications] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem(READ_APPLICATIONS_KEY) || '[]'))
  );

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Fetch pending applications for SUPER_ADMIN only
  const { data: applications } = useQuery<any[]>({
    queryKey: ['/api/admin/orgs?status=pending'],
    enabled: isSuperAdmin,
    refetchInterval: 30000, // Check every 30 seconds for new applications
  });

  // Generate notifications for new applications
  const betaNotifications: BetaNotification[] = [];

  if (isSuperAdmin && applications) {
    const now = new Date();
    
    for (const app of applications) {
      const appCreatedAt = new Date(app.createdAt);
      const isNew = !lastChecked || appCreatedAt > new Date(lastChecked);
      const hasBeenRead = readApplications.has(app.id);
      
      if (isNew) {
        betaNotifications.push({
          id: `beta_${app.id}`,
          type: 'beta_application',
          message: `New church application from ${app.name}`,
          time: appCreatedAt,
          read: hasBeenRead,
          avatar: null,
          icon: Building2,
          applicationId: app.id,
          organizationName: app.name,
        });
      }
    }
  }

  // Update last checked timestamp when component mounts
  useEffect(() => {
    if (isSuperAdmin && applications) {
      const now = new Date().toISOString();
      setLastChecked(now);
      localStorage.setItem(LAST_CHECKED_KEY, now);
    }
  }, []); // Only run once on mount

  // Mark applications as read
  const markApplicationsAsRead = () => {
    if (betaNotifications.length === 0) return;

    const newReadApplications = new Set([
      ...Array.from(readApplications),
      ...betaNotifications.map(n => n.applicationId)
    ]);
    
    setReadApplications(newReadApplications);
    localStorage.setItem(READ_APPLICATIONS_KEY, JSON.stringify(Array.from(newReadApplications)));
  };

  // Clear all read applications (for testing)
  const clearReadApplications = () => {
    setReadApplications(new Set());
    localStorage.removeItem(READ_APPLICATIONS_KEY);
    localStorage.removeItem(LAST_CHECKED_KEY);
  };

  return {
    betaNotifications,
    unreadBetaCount: betaNotifications.filter(n => !n.read).length,
    markApplicationsAsRead,
    clearReadApplications,
  };
}