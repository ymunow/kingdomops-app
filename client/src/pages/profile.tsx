import { useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useOrganization } from "@/hooks/use-organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, User, Users, Calendar, ArrowLeft, Save, MessageCircle, Heart, MapPin, Gift, Settings, Camera, Edit3, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profileCompletionSchema, type ProfileCompletionData } from "@shared/schema";
import { MainLayout } from '@/components/navigation/main-layout';

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Force refresh user data on component mount to ensure we have latest data
  React.useEffect(() => {
    queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  }, [queryClient]);

  const form = useForm<ProfileCompletionData>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      displayName: user?.displayName || "",
      ageRange: user?.ageRange || undefined,
    },
  });

  // Reset form values when user data changes, but only when not editing
  React.useEffect(() => {
    if (user && !isEditing) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        displayName: user.displayName || "",
        ageRange: user.ageRange || undefined,
      });
    }
  }, [user, isEditing]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileCompletionData) => {
      const response = await apiRequest("POST", "/api/auth/complete-profile", data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile updated!",
        description: "Your profile information has been successfully updated.",
      });
      // Clear cache and force fresh fetch
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Then update cache with fresh data
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update failed:", error);
    },
  });

  const onSubmit = (data: ProfileCompletionData) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    // Reset form to original values
    form.reset({
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      displayName: (user as any)?.displayName || "",
      ageRange: (user as any)?.ageRange || undefined,
    });
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  // Mock data for demonstration - would come from API in real app
  const mockProfileData = {
    coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    bio: "Passionate about worship and discipleship. Walking with Jesus for 8 years and loving every step of the journey!",
    location: "Charlotte, NC",
    memberSince: "2020",
    spiritualGifts: ['Teaching', 'Encouragement', 'Leadership'],
    servingAreas: ['Worship Team', 'Youth Ministry'],
    favoriteVerse: "For I know the plans I have for you, declares the Lord... - Jeremiah 29:11",
    groups: ['Young Adults', 'Worship Team', 'Small Group Alpha'],
    recentActivity: [
      { type: 'rsvp', text: 'RSVP\'d to Sunday Worship Service', time: '2 hours ago' },
      { type: 'group', text: 'Joined Men\'s Discipleship Group', time: '1 day ago' },
      { type: 'prayer', text: 'Shared a testimony in Worship Group', time: '3 days ago' }
    ],
    stats: {
      connections: 47,
      groups: 3,
      eventsAttended: 12,
      prayersShared: 8
    }
  };

  const tabs = [
    { id: 'about', label: 'About', icon: User },
    { id: 'groups', label: 'Groups & Serving', icon: Users },
    { id: 'activity', label: 'Timeline', icon: Calendar },
    { id: 'prayers', label: 'Prayer Wall', icon: Heart }
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo Section */}
        <div className="relative h-80 overflow-hidden rounded-t-2xl">
          <img 
            src={mockProfileData.coverPhoto} 
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Cover Photo Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            data-testid="edit-cover-photo"
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-spiritual-blue text-white text-2xl font-bold">
                  {user?.displayName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 p-0"
                data-testid="edit-profile-picture"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-charcoal">
                    {user?.displayName || `${user?.firstName} ${user?.lastName}` || 'Your Name'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{mockProfileData.location}</span>
                    </div>
                    <span>•</span>
                    <span>🎶 Worship Team</span>
                    <span>•</span>
                    <span>🙌 Youth Ministry</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {mockProfileData.spiritualGifts.map((gift) => (
                      <Badge key={gift} className="bg-spiritual-blue/10 text-spiritual-blue border-spiritual-blue/20">
                        <Gift className="h-3 w-3 mr-1" />
                        {gift}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button size="sm" className="bg-spiritual-blue hover:bg-purple-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="text-spiritual-blue border-spiritual-blue/20 hover:bg-spiritual-blue/10">
                    <Heart className="h-4 w-4 mr-2" />
                    Pray for Me
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="font-bold text-xl text-charcoal">{mockProfileData.stats.connections}</div>
                  <div className="text-sm text-gray-600">Connections</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-charcoal">{mockProfileData.stats.groups}</div>
                  <div className="text-sm text-gray-600">Groups</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-charcoal">{mockProfileData.stats.eventsAttended}</div>
                  <div className="text-sm text-gray-600">Events</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl text-charcoal">{mockProfileData.stats.prayersShared}</div>
                  <div className="text-sm text-gray-600">Prayers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mt-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 flex items-center justify-center space-x-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-spiritual-blue border-b-2 border-spiritual-blue bg-spiritual-blue/5'
                      : 'text-gray-600 hover:text-spiritual-blue hover:bg-gray-50'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* About Me */}
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">About Me</h3>
                  <p className="text-gray-700 leading-relaxed">{mockProfileData.bio}</p>
                </div>

                {/* Spiritual Journey */}
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">My Faith Journey</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-spiritual-blue/5 rounded-lg">
                      <h4 className="font-medium text-spiritual-blue mb-2">Favorite Verse</h4>
                      <p className="text-sm text-gray-700 italic">{mockProfileData.favoriteVerse}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-700 mb-2">Church Member Since</h4>
                      <p className="text-sm text-gray-700">{mockProfileData.memberSince}</p>
                    </div>
                  </div>
                </div>

                {/* Spiritual Gifts */}
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">Spiritual Gifts</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockProfileData.spiritualGifts.map((gift) => (
                      <Badge key={gift} className="bg-spiritual-blue text-white">
                        {gift}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-6">
                {/* Serving Areas */}
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">Currently Serving</h3>
                  <div className="grid gap-3">
                    {mockProfileData.servingAreas.map((area) => (
                      <div key={area} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium text-green-800">{area}</span>
                        <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Groups */}
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">Groups & Communities</h3>
                  <div className="grid gap-3">
                    {mockProfileData.groups.map((group) => (
                      <div key={group} className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Users className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-medium text-blue-800">{group}</span>
                        <Badge className="ml-auto bg-blue-100 text-blue-700">Member</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal mb-3">Recent Activity</h3>
                {mockProfileData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'rsvp' ? 'bg-green-500' :
                      activity.type === 'group' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-800">{activity.text}</p>
                      <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'prayers' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal mb-3">Prayer Requests & Testimonies</h3>
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Share your prayer requests and testimonies with the community</p>
                  <Button className="mt-4 bg-spiritual-blue hover:bg-purple-700 text-white">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Share a Prayer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsEditingProfile(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-charcoal">Edit Profile</h2>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                  data-testid="close-edit-modal"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your first name" {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your last name" {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="What would you like to be called?" {...field} data-testid="input-display-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ageRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Range *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-age-range">
                                <SelectValue placeholder="Select your age range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="18-25">18-25</SelectItem>
                              <SelectItem value="26-35">26-35</SelectItem>
                              <SelectItem value="36-45">36-45</SelectItem>
                              <SelectItem value="46-55">46-55</SelectItem>
                              <SelectItem value="56-65">56-65</SelectItem>
                              <SelectItem value="66+">66+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="bg-spiritual-blue text-white hover:bg-purple-800"
                        data-testid="button-save-profile"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingProfile(false)}
                        disabled={updateMutation.isPending}
                        data-testid="button-cancel-edit"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}