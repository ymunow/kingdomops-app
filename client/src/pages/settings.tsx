import React from 'react';
import { Settings as SettingsIcon, Bell, Lock, User, Smartphone, LogOut } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const settingSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Edit Profile', description: 'Update your personal information', action: 'profile' },
        { label: 'Email Preferences', description: 'Manage email notifications', action: 'email' },
        { label: 'Privacy Settings', description: 'Control your visibility', action: 'privacy' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Push Notifications', description: 'Get notified about updates', toggle: true, value: true },
        { label: 'Prayer Requests', description: 'Notifications for prayer requests', toggle: true, value: true },
        { label: 'Event Reminders', description: 'Reminders for upcoming events', toggle: true, value: false },
        { label: 'Serve Opportunities', description: 'New ministry opportunities', toggle: true, value: true }
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      items: [
        { label: 'Change Password', description: 'Update your account password', action: 'password' },
        { label: 'Two-Factor Authentication', description: 'Add extra security to your account', action: '2fa' },
        { label: 'Active Sessions', description: 'Manage logged in devices', action: 'sessions' }
      ]
    },
    {
      title: 'App Settings',
      icon: Smartphone,
      items: [
        { label: 'Dark Mode', description: 'Toggle dark theme', toggle: true, value: false },
        { label: 'Auto-refresh Feed', description: 'Automatically refresh Connect feed', toggle: true, value: true },
        { label: 'Offline Mode', description: 'Download content for offline viewing', toggle: true, value: false }
      ]
    }
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and app preferences</p>
        </div>

        <div className="space-y-8">
          {settingSections.map((section) => (
            <div key={section.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <section.icon className="h-6 w-6 text-spiritual-blue" />
                <h2 className="text-xl font-bold text-charcoal">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-charcoal">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    
                    {'toggle' in item ? (
                      <Switch 
                        checked={item.value} 
                        data-testid={`toggle-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`action-${item.action}`}
                      >
                        Configure
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Sign Out */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Button 
              variant="destructive" 
              className="w-full"
              data-testid="sign-out-button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}