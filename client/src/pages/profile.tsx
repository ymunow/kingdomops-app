import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarCoverUploader } from '@/components/AvatarCoverUploader';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, MapPin, Gift, UserPlus, MessageCircle, Edit3, X,
  Users, Calendar, Heart, User, Info
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('about');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{
    firstName: string;
    lastName: string;
    bio: string;
  } | null>(null);

  const mockProfileData = {
    name: user?.displayName || 'Your Name',
    coverPhoto: user?.coverPhotoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    location: 'San Francisco, CA',
    bio: 'Passionate about serving God and building community. Love worship music and youth ministry.',
    spiritualGifts: ['Leadership', 'Teaching', 'Encouragement'],
    servingAreas: ['Worship Team', 'Youth Ministry', 'Small Groups'],
    groups: ['Young Adults', 'Bible Study', 'Volunteer Team'],
  };

  const tabs = [
    { id: 'about', label: 'About', icon: Info },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'activity', label: 'Activity', icon: Calendar },
    { id: 'prayers', label: 'Prayers', icon: Heart }
  ];

  // Profile picture upload handler
  const handleProfilePictureUpload = async (url: string) => {
    console.log('Profile picture uploaded:', url);
    
    try {
      // Update user profile image URL
      await apiRequest('PUT', '/api/profile', { profileImageUrl: url });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully!',
      });
    } catch (error) {
      console.error('Profile picture update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
    }
  };

  // Cover photo upload handler
  const handleCoverPhotoUpload = async (url: string) => {
    console.log('Cover photo uploaded:', url);
    
    try {
      // Update user cover photo URL
      await apiRequest('PUT', '/api/profile', { coverPhotoUrl: url });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: 'Success',
        description: 'Cover photo updated successfully!',
      });
    } catch (error) {
      console.error('Cover photo update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cover photo',
        variant: 'destructive',
      });
    }
  };

  // Profile update
  const profileUpdateMutation = useMutation({
    mutationFn: async (profileData: { firstName: string; lastName: string; bio: string }) => {
      return apiRequest('PUT', '/api/profile', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditingProfile(false);
      setEditingProfile(null);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const handleProfileUpdate = (profileData: { firstName: string; lastName: string; bio: string }) => {
    profileUpdateMutation.mutate(profileData);
  };

  useEffect(() => {
    if (isEditingProfile && user) {
      setEditingProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || mockProfileData.bio, // Use current displayed bio or fallback
      });
    }
  }, [isEditingProfile, user]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto bg-white overflow-hidden shadow-sm">
        {/* Cover Photo Section - Facebook Style */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="relative h-96 overflow-hidden bg-gray-300 rounded-b-lg">
            <img 
              src={user?.coverPhotoUrl || mockProfileData.coverPhoto} 
              alt="Cover"
              className="w-full h-full object-cover object-center"
            />
            
            {/* Cover Photo Upload Button */}
            <div className="absolute bottom-4 right-4">
              <AvatarCoverUploader
                kind="cover"
                userId={user?.id || 'anonymous'}
                onDone={handleCoverPhotoUpload}
                buttonText="Edit cover photo"
                buttonClassName="bg-white/95 hover:bg-white text-gray-800 font-medium shadow-md border border-gray-200 px-3 py-2 rounded-md text-sm flex items-center"
              />
            </div>
          </div>

          {/* Profile Picture - Overlapping Facebook Style */}
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="relative group cursor-pointer">
              <Avatar className="w-44 h-44 border-4 border-white shadow-xl bg-white transition-all duration-200 group-hover:brightness-90">
                {user?.profileImageUrl && (
                  <AvatarImage 
                    src={user.profileImageUrl} 
                    alt="Profile picture" 
                    className="object-cover"
                    onError={(e) => {
                      console.error('Profile image failed to load:', user.profileImageUrl);
                      console.error('Current user data:', user);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully:', user.profileImageUrl);
                    }}
                  />
                )}
                <AvatarFallback className="bg-spiritual-blue text-white text-4xl font-bold">
                  {user?.displayName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Picture Hover Overlay */}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center space-x-1">
                    <Camera className="h-4 w-4 text-gray-700" />
                    <span className="text-gray-700 font-medium text-sm">Update</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-3 right-3">
                <div className="w-11 h-11 rounded-full bg-white hover:bg-gray-50 border-2 border-gray-300 shadow-md flex items-center justify-center">
                  <AvatarCoverUploader
                    kind="avatar"
                    userId={user?.id || 'anonymous'}
                    onDone={handleProfilePictureUpload}
                    buttonText=""
                    buttonClassName="w-full h-full rounded-full flex items-center justify-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information - Facebook Style */}
        <div className="pt-24 pb-4 px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
            {/* Profile Info */}
            <div className="flex-1 lg:ml-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {user?.displayName || `${user?.firstName} ${user?.lastName}` || 'Your Name'}
              </h1>
              <p className="text-gray-600 text-lg mb-3">
                2.4K followers • 1.7K following
              </p>
              <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{mockProfileData.location}</span>
                </div>
                <span>•</span>
                <span>🎶 Worship Team</span>
                <span>•</span>
                <span>🙌 Youth Ministry</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {mockProfileData.spiritualGifts.map((gift) => (
                  <Badge key={gift} className="bg-spiritual-blue/10 text-spiritual-blue border-spiritual-blue/20 px-3 py-1">
                    <Gift className="h-3 w-3 mr-1" />
                    {gift}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons - Facebook Style */}
            <div className="flex gap-2 mt-4 lg:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium">
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </Button>
              <Button variant="outline" className="px-6 font-medium border-gray-300">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                data-testid="edit-profile"
                className="px-4 border-gray-300"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs - Facebook Style */}
        <div className="border-t border-gray-200">
          <div className="px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-white rounded-b-lg">
          {/* Edit Profile Section */}
          {isEditingProfile && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form 
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingProfile) {
                    handleProfileUpdate(editingProfile);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editingProfile?.firstName || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, firstName: e.target.value} : null)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editingProfile?.lastName || ''}
                      onChange={(e) => setEditingProfile(prev => prev ? {...prev, lastName: e.target.value} : null)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                  <textarea
                    value={editingProfile?.bio || ''}
                    onChange={(e) => setEditingProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={profileUpdateMutation.isPending}
                  >
                    {profileUpdateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tab Content */}
          <div>
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {user?.bio || mockProfileData.bio}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Spiritual Gifts</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockProfileData.spiritualGifts.map((gift) => (
                      <Badge key={gift} className="bg-spiritual-blue/10 text-spiritual-blue border-spiritual-blue/20 px-3 py-1">
                        <Gift className="h-3 w-3 mr-1" />
                        {gift}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ministry Involvement</h3>
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
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Groups & Communities</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Attended Sunday Service</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Joined Small Group</p>
                        <p className="text-sm text-gray-500">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'prayers' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Prayer Wall</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-700 italic">"Praying for wisdom in my new role at work..."</p>
                    <p className="text-sm text-gray-500 mt-2">3 days ago • 5 people praying</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}