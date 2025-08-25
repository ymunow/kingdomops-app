import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/navigation/main-layout";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart, 
  MessageCircle, 
  Share,
  MoreHorizontal,
  Bell,
  Plus
} from "lucide-react";
import { FeedComposer } from "@/components/FeedComposer";

export default function Feed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();



  // Fetch feed posts from API
  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['/api/feed'],
    enabled: !!user,
  });


  const { toast } = useToast();

  // React to post mutation
  const reactToPostMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: string }) => {
      const response = await apiRequest('POST', `/api/feed/posts/${postId}/reactions`, { type });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    },
    onError: (error: any) => {
      console.error('Reaction error:', error);
      toast({
        title: "Error",
        description: "Failed to react to post. Please try again.",
        variant: "destructive",
      });
    },
  });


  const handleReaction = (postId: string, type: string) => {
    reactToPostMutation.mutate({ postId, type });
  };

  // Mock feed data for demonstration (keeping as fallback)
  const mockFeedPosts = [
    {
      id: 1,
      author: {
        name: "Sarah Johnson",
        role: "Youth Leader",
        avatar: null,
        initials: "SJ"
      },
      content: "God showed up in such a powerful way during our small group this week. Grateful for this community! 🙏",
      type: "testimony",
      timestamp: "2 hours ago",
      likes: 12,
      comments: 5,
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop"
    },
    {
      id: 2,
      author: {
        name: "Pastor Smith",
        role: "Lead Pastor",
        avatar: null,
        initials: "PS"
      },
      content: "Please pray for our upcoming outreach event this Saturday. We are believing for breakthrough and many souls to be reached! Let's storm heaven together.",
      type: "prayer",
      timestamp: "4 hours ago",
      likes: 25,
      comments: 8,
      prayerCount: 15
    },
    {
      id: 3,
      author: {
        name: "Mike Torres",
        role: "Worship Leader",
        avatar: null,
        initials: "MT"
      },
      content: "New worship song we're learning for Sunday! Can't wait to lift these words together as a family.",
      type: "announcement",
      timestamp: "6 hours ago",
      likes: 18,
      comments: 3,
      video: true
    }
  ];


  // Use API data if available, otherwise fallback to mock data
  const displayPosts = Array.isArray(feedPosts) && feedPosts.length > 0 ? feedPosts : mockFeedPosts;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto pt-6 pb-12 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community Feed</h1>
            <p className="text-gray-600 dark:text-gray-400">Stay connected with your church family</p>
          </div>

          {/* Feed Composer - Robust component for creating posts */}
          <FeedComposer
            currentUser={{ id: user?.id || '', role: user?.role }}
            onPosted={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
            }}
          />

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue"></div>
            </div>
          )}

          {/* Feed Posts */}
          <div className="space-y-6">
            {displayPosts.map((post: any) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <UserAvatar 
                        user={{ displayName: post.author.name }}
                        className="h-10 w-10" 
                        fallbackClassName="bg-spiritual-blue/10 text-spiritual-blue"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{post.author.name}</h3>
                          <Badge variant="secondary" className="text-xs">{post.author.role}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-6 pb-4">
                  <p className="text-gray-900 dark:text-white leading-relaxed">{post.content}</p>
                  
                  {/* Post Type Badge */}
                  {post.type !== 'post' && (
                    <div className="mt-3">
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${post.type === 'prayer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' : ''}
                          ${post.type === 'testimony' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : ''}
                          ${post.type === 'announcement' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' : ''}
                        `}
                      >
                        {post.type === 'prayer' && '🙏 Prayer Request'}
                        {post.type === 'testimony' && '✨ Testimony'}
                        {post.type === 'announcement' && '📢 Announcement'}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Post Media */}
                {post.image && (
                  <div className="px-6 pb-4">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="w-full rounded-lg object-cover max-h-96"
                    />
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                        <Heart className="h-4 w-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comments}
                      </Button>
                      {post.type === 'prayer' && (
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-500">
                          <Bell className="h-4 w-4 mr-2" />
                          {post.prayerCount} praying
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Load More Posts
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}