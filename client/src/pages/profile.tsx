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
import { Crown, User, Users, Calendar, ArrowLeft, Save, MessageCircle, Heart, MapPin, Gift, Settings, Camera, Edit3, UserPlus, ChevronDown, Eye, EyeOff, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profileCompletionSchema, type ProfileCompletionData } from "@shared/schema";
import { MainLayout } from '@/components/navigation/main-layout';

export default function Profile() {
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

  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState(mockProfileData.bio);
  const [editLocation, setEditLocation] = useState(mockProfileData.location);
  const [editFavoriteVerse, setEditFavoriteVerse] = useState(mockProfileData.favoriteVerse);
  const [editSpiritualGifts, setEditSpiritualGifts] = useState(mockProfileData.spiritualGifts);
  const [editServingAreas, setEditServingAreas] = useState(mockProfileData.servingAreas);
  const [privacySettings, setPrivacySettings] = useState({
    showBio: true,
    showLocation: true,
    showSpiritualGifts: true,
    showServingAreas: true,
    showStats: true,
    showFavoriteVerse: true,
    showTestimonies: true,
    showMinistryPassions: true,
    showVolunteerAvailability: true,
    showPrayerRequests: true,
    showChurchActivity: true,
    showPersonalPosts: true
  });

  const [additionalSections, setAdditionalSections] = useState({
    testimonies: "God has been so faithful in my journey of faith. Recently, I've seen His provision in amazing ways through our church family.",
    ministryPassions: ["Youth Mentorship", "Community Outreach", "Worship Arts"],
    volunteerAvailability: {
      weekdays: "Evenings after 6pm",
      weekends: "Saturday mornings, Sunday afternoons",
      specialEvents: "Always available for community service projects"
    }
  });

  const availableGifts = ['Teaching', 'Encouragement', 'Leadership', 'Prophecy', 'Service', 'Giving', 'Mercy', 'Wisdom', 'Knowledge', 'Faith', 'Healing', 'Administration'];
  const availableServingAreas = ['Worship Team', 'Youth Ministry', 'Children\'s Ministry', 'Small Groups', 'Ushers', 'Tech Team', 'Prayer Team', 'Outreach', 'Food Ministry'];

  // Only refresh user data when component first mounts
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  }, []); // Empty dependency array to run only once

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
    if (user && !isEditing && !isEditingProfile) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        displayName: user.displayName || "",
        ageRange: user.ageRange || undefined,
      });
    }
  }, [user, isEditing, isEditingProfile, form]);

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
      // Update cache with fresh data
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      setIsEditing(false);
      setIsEditingProfile(false);
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
                {privacySettings.showBio && (
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-3">About Me</h3>
                    <p className="text-gray-700 leading-relaxed">{mockProfileData.bio}</p>
                  </div>
                )}

                {/* Spiritual Journey */}
                <div>
                  <h3 className="text-lg font-semibold text-charcoal mb-3">My Faith Journey</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {privacySettings.showFavoriteVerse && (
                      <div className="p-4 bg-spiritual-blue/5 rounded-lg">
                        <h4 className="font-medium text-spiritual-blue mb-2">Favorite Verse</h4>
                        <p className="text-sm text-gray-700 italic">{mockProfileData.favoriteVerse}</p>
                      </div>
                    )}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-700 mb-2">Church Member Since</h4>
                      <p className="text-sm text-gray-700">{mockProfileData.memberSince}</p>
                    </div>
                  </div>
                </div>

                {/* Testimonies */}
                {privacySettings.showTestimonies && (
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-3">Recent Testimony</h3>
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                      <p className="text-gray-700 italic">"{additionalSections.testimonies}"</p>
                    </div>
                  </div>
                )}

                {/* Ministry Passions */}
                {privacySettings.showMinistryPassions && (
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-3">Ministry Passions</h3>
                    <div className="flex flex-wrap gap-2">
                      {additionalSections.ministryPassions.map((passion) => (
                        <Badge key={passion} className="bg-orange-100 text-orange-800 border border-orange-200">
                          <Heart className="h-3 w-3 mr-1" />
                          {passion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Volunteer Availability */}
                {privacySettings.showVolunteerAvailability && (
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-3">Volunteer Availability</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="font-medium text-blue-800">Weekdays</div>
                          <div className="text-sm text-blue-600">{additionalSections.volunteerAvailability.weekdays}</div>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <div className="font-medium text-green-800">Weekends</div>
                          <div className="text-sm text-green-600">{additionalSections.volunteerAvailability.weekends}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spiritual Gifts */}
                {privacySettings.showSpiritualGifts && (
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
                )}
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-6">
                {/* Serving Areas */}
                {privacySettings.showServingAreas && (
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
                )}

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-charcoal">Personal Timeline</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <button 
                      onClick={() => setPrivacySettings(prev => ({ ...prev, showPersonalPosts: !prev.showPersonalPosts }))}
                      className={`px-3 py-1 rounded-full border ${
                        privacySettings.showPersonalPosts ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      Posts
                    </button>
                    <button 
                      onClick={() => setPrivacySettings(prev => ({ ...prev, showChurchActivity: !prev.showChurchActivity }))}
                      className={`px-3 py-1 rounded-full border ${
                        privacySettings.showChurchActivity ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      Church Activity
                    </button>
                    <button 
                      onClick={() => setPrivacySettings(prev => ({ ...prev, showPrayerRequests: !prev.showPrayerRequests }))}
                      className={`px-3 py-1 rounded-full border ${
                        privacySettings.showPrayerRequests ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      Prayers
                    </button>
                  </div>
                </div>
                
                {/* Unified Timeline Feed */}
                <div className="space-y-4">
                  {/* Personal Post Example */}
                  {privacySettings.showPersonalPosts && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <Avatar className="w-8 h-8 mr-3">
                          <AvatarFallback className="bg-spiritual-blue text-white text-sm">
                            {user?.displayName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">Shared a reflection</div>
                          <div className="text-sm text-gray-500">2 hours ago</div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">"Grateful for today's sermon on faith. Pastor John's words about trusting God's timing really spoke to my heart. 🙏"</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center hover:text-spiritual-blue">
                          <Heart className="h-4 w-4 mr-1" /> 12 prayers
                        </button>
                        <button className="flex items-center hover:text-spiritual-blue">
                          <MessageCircle className="h-4 w-4 mr-1" /> 3 comments
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Church Activity */}
                  {privacySettings.showChurchActivity && mockProfileData.recentActivity.map((activity, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          activity.type === 'rsvp' ? 'bg-green-500' :
                          activity.type === 'group' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-gray-800">{activity.text}</p>
                          <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Prayer Request Example */}
                  {privacySettings.showPrayerRequests && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Heart className="h-5 w-5 text-purple-600 mr-2" />
                        <div>
                          <div className="font-medium text-purple-900">Prayer Request</div>
                          <div className="text-sm text-purple-600">1 week ago</div>
                        </div>
                      </div>
                      <p className="text-purple-800 mb-3">"Please pray for my family as we navigate this season of change. Your prayers mean everything! 💜"</p>
                      <div className="flex items-center space-x-4 text-sm text-purple-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" /> 24 people praying
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Ministry Milestone */}
                  {privacySettings.showChurchActivity && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Gift className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <div className="font-medium text-yellow-900">Ministry Milestone</div>
                          <div className="text-sm text-yellow-600">2 weeks ago</div>
                        </div>
                      </div>
                      <p className="text-yellow-800">"Celebrated 1 year serving on the worship team! God has taught me so much through music ministry. 🎵"</p>
                    </div>
                  )}
                </div>
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

        {/* Enhanced Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsEditingProfile(false)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-charcoal">Edit Profile & Privacy</h2>
                <p className="text-gray-600 mt-1">Customize what others see on your profile</p>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                  data-testid="close-edit-modal"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal mb-4">Basic Information</h3>
                      <Form {...form}>
                        <div className="space-y-4">
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
                        </div>
                      </Form>
                    </div>

                    {/* Bio Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-charcoal">About Me</h4>
                        <button
                          onClick={() => setPrivacySettings(prev => ({ ...prev, showBio: !prev.showBio }))}
                          className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                        >
                          {privacySettings.showBio ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                          {privacySettings.showBio ? 'Public' : 'Hidden'}
                        </button>
                      </div>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Share a bit about your faith journey..."
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        rows={4}
                        data-testid="textarea-bio"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-charcoal">Location</h4>
                        <button
                          onClick={() => setPrivacySettings(prev => ({ ...prev, showLocation: !prev.showLocation }))}
                          className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                        >
                          {privacySettings.showLocation ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                          {privacySettings.showLocation ? 'Public' : 'Hidden'}
                        </button>
                      </div>
                      <Input
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="City, State"
                        data-testid="input-location"
                      />
                    </div>

                    {/* Favorite Verse */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-charcoal">Favorite Bible Verse</h4>
                        <button
                          onClick={() => setPrivacySettings(prev => ({ ...prev, showFavoriteVerse: !prev.showFavoriteVerse }))}
                          className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                        >
                          {privacySettings.showFavoriteVerse ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                          {privacySettings.showFavoriteVerse ? 'Public' : 'Hidden'}
                        </button>
                      </div>
                      <Input
                        value={editFavoriteVerse}
                        onChange={(e) => setEditFavoriteVerse(e.target.value)}
                        placeholder="Your favorite verse and reference"
                        data-testid="input-favorite-verse"
                      />
                    </div>
                  </div>

                  {/* Right Column - Ministry & Privacy */}
                  <div className="space-y-6">
                    {/* Spiritual Gifts */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-charcoal">Spiritual Gifts</h4>
                        <button
                          onClick={() => setPrivacySettings(prev => ({ ...prev, showSpiritualGifts: !prev.showSpiritualGifts }))}
                          className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                        >
                          {privacySettings.showSpiritualGifts ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                          {privacySettings.showSpiritualGifts ? 'Public' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {editSpiritualGifts.map((gift, index) => (
                            <Badge key={index} className="bg-spiritual-blue text-white">
                              {gift}
                              <button
                                onClick={() => setEditSpiritualGifts(prev => prev.filter((_, i) => i !== index))}
                                className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(value) => {
                          if (!editSpiritualGifts.includes(value)) {
                            setEditSpiritualGifts(prev => [...prev, value]);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add a spiritual gift" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableGifts.filter(gift => !editSpiritualGifts.includes(gift)).map((gift) => (
                              <SelectItem key={gift} value={gift}>{gift}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Serving Areas */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-charcoal">Currently Serving</h4>
                        <button
                          onClick={() => setPrivacySettings(prev => ({ ...prev, showServingAreas: !prev.showServingAreas }))}
                          className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                        >
                          {privacySettings.showServingAreas ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                          {privacySettings.showServingAreas ? 'Public' : 'Hidden'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {editServingAreas.map((area, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              {area}
                              <button
                                onClick={() => setEditServingAreas(prev => prev.filter((_, i) => i !== index))}
                                className="ml-2 hover:bg-green-200 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={(value) => {
                          if (!editServingAreas.includes(value)) {
                            setEditServingAreas(prev => [...prev, value]);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Add a serving area" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableServingAreas.filter(area => !editServingAreas.includes(area)).map((area) => (
                              <SelectItem key={area} value={area}>{area}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Profile Photo Section */}
                    <div>
                      <h4 className="font-medium text-charcoal mb-3">Profile Photos</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Camera className="h-4 w-4 mr-2" />
                          Change Cover Photo
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Change Profile Picture
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Privacy Controls */}
                    <div>
                      <h4 className="font-medium text-charcoal mb-3">Section Visibility</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Activity Stats</span>
                          <button
                            onClick={() => setPrivacySettings(prev => ({ ...prev, showStats: !prev.showStats }))}
                            className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                          >
                            {privacySettings.showStats ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                            {privacySettings.showStats ? 'Public' : 'Hidden'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Testimonies</span>
                          <button
                            onClick={() => setPrivacySettings(prev => ({ ...prev, showTestimonies: !prev.showTestimonies }))}
                            className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                          >
                            {privacySettings.showTestimonies ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                            {privacySettings.showTestimonies ? 'Public' : 'Hidden'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Ministry Passions</span>
                          <button
                            onClick={() => setPrivacySettings(prev => ({ ...prev, showMinistryPassions: !prev.showMinistryPassions }))}
                            className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                          >
                            {privacySettings.showMinistryPassions ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                            {privacySettings.showMinistryPassions ? 'Public' : 'Hidden'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Volunteer Schedule</span>
                          <button
                            onClick={() => setPrivacySettings(prev => ({ ...prev, showVolunteerAvailability: !prev.showVolunteerAvailability }))}
                            className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                          >
                            {privacySettings.showVolunteerAvailability ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                            {privacySettings.showVolunteerAvailability ? 'Public' : 'Hidden'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Timeline Posts</span>
                          <button
                            onClick={() => setPrivacySettings(prev => ({ ...prev, showPersonalPosts: !prev.showPersonalPosts }))}
                            className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                          >
                            {privacySettings.showPersonalPosts ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                            {privacySettings.showPersonalPosts ? 'Public' : 'Hidden'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Prayer Requests</span>
                          <button
                            onClick={() => setPrivacySettings(prev => ({ ...prev, showPrayerRequests: !prev.showPrayerRequests }))}
                            className="flex items-center text-sm text-gray-500 hover:text-spiritual-blue"
                          >
                            {privacySettings.showPrayerRequests ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                            {privacySettings.showPrayerRequests ? 'Public' : 'Hidden'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
                  <Button
                    onClick={() => {
                      // Here you would save all the profile changes
                      form.handleSubmit(onSubmit)();
                      toast({
                        title: "Profile updated!",
                        description: "Your profile and privacy settings have been saved.",
                      });
                      setIsEditingProfile(false);
                    }}
                    disabled={updateMutation.isPending}
                    className="bg-spiritual-blue text-white hover:bg-purple-800"
                    data-testid="button-save-full-profile"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save All Changes"}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}