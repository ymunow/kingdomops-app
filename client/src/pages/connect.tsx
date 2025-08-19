import React, { useState } from 'react';
import { MessageCircle, Heart, MessageSquare, Share, MoreHorizontal, Edit3, Camera, Megaphone, Users, Crown, ArrowRight, MapPin, Clock } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

export default function Connect() {
  const [activeComposer, setActiveComposer] = useState<string | null>(null);
  
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

  const myGroups = [
    { id: '1', name: 'Young Adults', members: 24, isJoined: true },
    { id: '2', name: 'Worship Team', members: 18, isJoined: true },
    { id: '3', name: 'Small Group Leaders', members: 12, isJoined: true }
  ];

  const suggestedGroups = [
    { id: '4', name: 'Men\'s Bible Study', members: 15, isJoined: false },
    { id: '5', name: 'Parents Connect', members: 32, isJoined: false },
    { id: '6', name: 'Creative Arts', members: 28, isJoined: false }
  ];

  const serveOpportunities = [
    {
      id: '1',
      title: 'Children\'s Ministry Helper',
      ministry: 'Kids Kingdom',
      time: 'Sunday mornings',
      match: 92,
      urgent: true
    },
    {
      id: '2', 
      title: 'Worship Sound Tech',
      ministry: 'Worship Ministry',
      time: 'Weekend services',
      match: 87,
      urgent: false
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
      case 'testimony': return 'bg-green-50 text-green-700 border-green-200';
      case 'prayer': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'announcement': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const ComposerBar = () => (
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-spiritual-blue text-white">TG</AvatarFallback>
          </Avatar>
          <div 
            className="flex-1 bg-gray-50 rounded-full px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setActiveComposer(activeComposer ? null : 'post')}
            data-testid="composer-input"
          >
            <span className="text-gray-500">What's on your heart?</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={activeComposer === 'post' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveComposer('post')}
              className="text-sm"
              data-testid="composer-post"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Post
            </Button>
            <Button
              variant={activeComposer === 'prayer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveComposer('prayer')}
              className="text-sm"
              data-testid="composer-prayer"
            >
              🙏 Prayer Request
            </Button>
            <Button
              variant={activeComposer === 'photo' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveComposer('photo')}
              className="text-sm"
              data-testid="composer-photo"
            >
              <Camera className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button
              variant={activeComposer === 'announcement' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveComposer('announcement')}
              className="text-sm"
              data-testid="composer-announcement"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              Announcement
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed" data-testid="feed-tab">Feed</TabsTrigger>
            <TabsTrigger value="groups" data-testid="groups-tab">Groups</TabsTrigger>
            <TabsTrigger value="serve" data-testid="serve-tab">Serve</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <ComposerBar />
            
            {/* Serve Opportunities Discovery Card */}
            <Card className="mb-6 border border-warm-gold/20 bg-gradient-to-r from-warm-gold/5 to-spiritual-blue/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-warm-gold" />
                    <span className="font-semibold text-charcoal">Perfect Matches for You</span>
                  </div>
                  <Button variant="ghost" size="sm" data-testid="view-all-serve">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {serveOpportunities.slice(0, 2).map((opportunity) => (
                    <div key={opportunity.id} className="flex items-center justify-between p-3 bg-white/70 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-sm">{opportunity.title}</p>
                          {opportunity.urgent && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">Urgent</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-600">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{opportunity.ministry}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{opportunity.time}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-green-600 font-medium mb-1">{opportunity.match}% match</div>
                        <Button size="sm" variant="outline" className="text-xs" data-testid={`apply-${opportunity.id}`}>
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feed Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-spiritual-blue/10 text-spiritual-blue font-semibold">
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-charcoal text-sm">{post.author.name}</p>
                            <Badge variant="outline" className={`text-xs border ${getPostTypeColor(post.type)}`}>
                              {getPostIcon(post.type)} {post.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
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
                      <p className="text-gray-700 text-sm leading-relaxed">{post.body}</p>
                    </div>

                    {/* Reactions and Comments */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                          data-testid={`like-${post.id}`}
                        >
                          ❤️ {post.reactionCounts.heart}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 px-2"
                          data-testid={`pray-${post.id}`}
                        >
                          🙏 {post.reactionCounts.pray}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-gray-50 px-2"
                          data-testid={`comment-${post.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.commentCount}
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center mt-8">
              <Button variant="outline" data-testid="load-more-posts">
                Load More Posts
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            <div className="space-y-6">
              {/* My Groups */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-spiritual-blue" />
                    <span>My Groups</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.members} members</p>
                      </div>
                      <Button size="sm" variant="outline" data-testid={`open-group-${group.id}`}>
                        Open
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Suggested Groups */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Discover Groups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedGroups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.members} members</p>
                      </div>
                      <Button size="sm" className="bg-spiritual-blue hover:bg-spiritual-blue/90" data-testid={`join-group-${group.id}`}>
                        Join
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="serve" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-warm-gold" />
                  <span>Serve Central</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serveOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="p-4 rounded-lg border border-gray-200 hover:border-spiritual-blue transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-charcoal">{opportunity.title}</h3>
                          {opportunity.urgent && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700">Urgent</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{opportunity.ministry}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{opportunity.time}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-green-600 font-medium">{opportunity.match}% match with your gifts</div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-spiritual-blue hover:bg-spiritual-blue/90" data-testid={`apply-serve-${opportunity.id}`}>
                      Apply to Serve
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}