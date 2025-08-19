import React from 'react';
import { MessageCircle, Heart, MessageSquare, Share, MoreHorizontal } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function Connect() {
  const posts = [
    {
      id: '1',
      type: 'testimony',
      author: {
        name: 'Sarah Johnson',
        avatar: null
      },
      body: 'God showed up in such a powerful way during our small group this week. Grateful for this community! 🙏',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      reactionCounts: {
        heart: 12,
        pray: 5
      },
      commentCount: 3
    },
    {
      id: '2',
      type: 'prayer',
      author: {
        name: 'Pastor Smith',
        avatar: null
      },
      body: 'Please pray for our upcoming outreach event this Saturday. We are believing for breakthrough and many lives to be touched! Let\'s storm heaven together.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      reactionCounts: {
        pray: 23,
        heart: 8
      },
      commentCount: 7
    },
    {
      id: '3',
      type: 'announcement',
      author: {
        name: 'Church Admin',
        avatar: null
      },
      body: '📣 Reminder: Small group signups are now open! Find your group and take your next step in community. Link in bio.',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      reactionCounts: {
        heart: 15,
        pray: 2
      },
      commentCount: 5
    }
  ];

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'testimony': return '✍️';
      case 'prayer': return '🙏';
      case 'announcement': return '📣';
      default: return '💬';
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'testimony': return 'bg-green-50 text-green-700';
      case 'prayer': return 'bg-purple-50 text-purple-700';
      case 'announcement': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Connect</h1>
          <p className="text-gray-600">Stay connected with your church community</p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-spiritual-blue/10 flex items-center justify-center">
                    <span className="text-spiritual-blue font-semibold text-sm">
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-charcoal">{post.author.name}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                        {getPostIcon(post.type)} {post.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-700">{post.body}</p>
              </div>

              {/* Reactions and Comments */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600"
                      data-testid={`like-${post.id}`}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.reactionCounts.heart}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-purple-500 hover:text-purple-600"
                      data-testid={`pray-${post.id}`}
                    >
                      🙏 {post.reactionCounts.pray}
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    data-testid={`comment-${post.id}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {post.commentCount}
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" data-testid="load-more-posts">
            Load More Posts
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}