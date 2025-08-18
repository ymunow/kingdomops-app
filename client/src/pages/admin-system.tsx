import { useState } from "react";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Users, 
  ArrowLeft,
  Shield,
  Database,
  Mail,
  Bell,
  Key,
  Server,
  Activity,
  AlertTriangle,
  Save,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SystemSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  assessmentTimeout: number;
  maxFileSize: number;
  backupSchedule: string;
  systemMessage: string;
}

interface SystemUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
  lastActive?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export default function AdminSystem() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ['/api/super-admin/system-settings'],
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const { data: systemUsers, isLoading: usersLoading } = useQuery<SystemUser[]>({
    queryKey: ['/api/super-admin/users'],
    enabled: user?.role === 'SUPER_ADMIN',
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      return apiRequest('PATCH', '/api/super-admin/system-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/system-settings'] });
      toast({ title: "Success", description: "System settings updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      return apiRequest('PATCH', `/api/super-admin/users/${data.userId}/role`, { role: data.role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/users'] });
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading || settingsLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-blue mb-4 mx-auto"></div>
          <p className="text-charcoal">Loading system administration...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h2>
          <p className="text-gray-600">Super Admin access required</p>
          <Button onClick={() => setLocation('/')} className="mt-4">Return Home</Button>
        </div>
      </div>
    );
  }

  const filteredUsers = systemUsers?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (user.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === "ALL" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800 border-red-300';
      case 'ORG_OWNER': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ORG_ADMIN': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ORG_LEADER': return 'bg-green-100 text-green-800 border-green-300';
      case 'PARTICIPANT': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-300';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'SUSPENDED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="mr-4"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex-shrink-0 flex items-center">
                <Settings className="text-spiritual-blue h-8 w-8 mr-3" />
                <div>
                  <h1 className="font-display font-bold text-xl text-charcoal">
                    System Admin
                  </h1>
                  <p className="text-sm text-gray-600">System Settings & User Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {settings?.maintenanceMode && (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Maintenance Mode
                </Badge>
              )}
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                <Shield className="mr-1 h-3 w-3" />
                Super Admin
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display font-bold text-3xl text-charcoal">
                System Administration
              </h1>
              <p className="text-gray-600 mt-2">
                Manage system settings, user permissions, and platform configuration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="settings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">System Settings</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Configure system-wide settings and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">Temporarily disable user access</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={settings?.maintenanceMode || false}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({ maintenanceMode: checked })
                      }
                      data-testid="switch-maintenance-mode"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registration">User Registration</Label>
                      <p className="text-sm text-gray-600">Allow new user registrations</p>
                    </div>
                    <Switch
                      id="registration"
                      checked={settings?.registrationEnabled || false}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({ registrationEnabled: checked })
                      }
                      data-testid="switch-registration-enabled"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send system email notifications</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings?.emailNotifications || false}
                      onCheckedChange={(checked) => 
                        updateSettingsMutation.mutate({ emailNotifications: checked })
                      }
                      data-testid="switch-email-notifications"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assessment-timeout">Assessment Timeout (minutes)</Label>
                    <Input
                      id="assessment-timeout"
                      type="number"
                      value={settings?.assessmentTimeout || 30}
                      onChange={(e) => 
                        updateSettingsMutation.mutate({ assessmentTimeout: parseInt(e.target.value) })
                      }
                      className="max-w-xs"
                      data-testid="input-assessment-timeout"
                    />
                  </div>

                  <div>
                    <Label htmlFor="system-message">System Message</Label>
                    <textarea
                      id="system-message"
                      placeholder="Optional system-wide message to display to users"
                      value={settings?.systemMessage || ''}
                      onChange={(e) => 
                        updateSettingsMutation.mutate({ systemMessage: e.target.value })
                      }
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="textarea-system-message"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => updateSettingsMutation.mutate({})}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-save-settings"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users by email or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-users"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-role-filter">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      <SelectItem value="ORG_OWNER">Org Owner</SelectItem>
                      <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                      <SelectItem value="ORG_LEADER">Org Leader</SelectItem>
                      <SelectItem value="PARTICIPANT">Participant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal">Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">User</th>
                        <th className="text-left p-4 font-medium text-gray-700">Organization</th>
                        <th className="text-left p-4 font-medium text-gray-700">Role</th>
                        <th className="text-left p-4 font-medium text-gray-700">Status</th>
                        <th className="text-left p-4 font-medium text-gray-700">Last Active</th>
                        <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((systemUser) => (
                        <tr key={systemUser.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-charcoal">{systemUser.name || systemUser.email}</p>
                              <p className="text-sm text-gray-500">{systemUser.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-charcoal">{systemUser.organizationName || 'N/A'}</span>
                          </td>
                          <td className="p-4">
                            <Badge className={getRoleColor(systemUser.role)}>
                              {systemUser.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(systemUser.status)}>
                              {systemUser.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-500">
                              {systemUser.lastActive ? new Date(systemUser.lastActive).toLocaleDateString() : 'Never'}
                            </span>
                          </td>
                          <td className="p-4">
                            <Select onValueChange={(role) => updateUserRoleMutation.mutate({ userId: systemUser.id, role })}>
                              <SelectTrigger className="w-32" data-testid={`select-role-${systemUser.id}`}>
                                <SelectValue placeholder="Change Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                <SelectItem value="ORG_OWNER">Org Owner</SelectItem>
                                <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                                <SelectItem value="ORG_LEADER">Org Leader</SelectItem>
                                <SelectItem value="PARTICIPANT">Participant</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Database Management
                </CardTitle>
                <CardDescription>Database operations and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="button-backup-database"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Backup Database
                  </Button>
                  <Button 
                    variant="outline"
                    data-testid="button-optimize-database"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Optimize Tables
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    data-testid="button-vacuum-database"
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Vacuum Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
              <CardHeader>
                <CardTitle className="text-charcoal flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  System Logs
                </CardTitle>
                <CardDescription>View system activity and error logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                  <div>2025-08-18 00:52:00 - INFO - System startup completed</div>
                  <div>2025-08-18 00:52:01 - INFO - Database connection established</div>
                  <div>2025-08-18 00:52:02 - INFO - Authentication service initialized</div>
                  <div>2025-08-18 00:52:03 - INFO - Email service connected</div>
                  <div>2025-08-18 00:52:05 - INFO - User login: tgray@graymusicmedia.com</div>
                  <div>2025-08-18 00:52:10 - INFO - Assessment completed: user_id=e852eca5</div>
                  <div>2025-08-18 00:52:15 - INFO - Admin dashboard accessed</div>
                  <div className="text-yellow-400">2025-08-18 00:52:20 - WARN - High memory usage detected</div>
                  <div>2025-08-18 00:52:25 - INFO - Cache cleanup completed</div>
                  <div>2025-08-18 00:52:30 - INFO - Backup process started</div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" data-testid="button-refresh-logs">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button size="sm" variant="outline" data-testid="button-download-logs">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}