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
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop&crop=center',
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
      image: null,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      reactionCounts: {
        pray: 23,
        heart: 8
      },
      commentCount: 7
    },
    {
      id: '3',
      type: 'post',
      author: {
        name: 'Michael Chen',
        avatar: null
      },
      body: 'Beautiful worship service today! The presence of God was so tangible. Here\'s a glimpse of our amazing worship team in action! 🎵✨',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&crop=center',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      reactionCounts: {
        heart: 28,
        pray: 4
      },
      commentCount: 12
    },
    {
      id: '4',
      type: 'announcement',
      author: {
        name: 'Church Admin',
        avatar: null
      },
      body: '📣 Reminder: Small group signups are now open! Find your group and take your next step in community. Link in bio.',
      image: null,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      reactionCounts: {
        heart: 15,
        pray: 2
      },
      commentCount: 5
    }
  ];

  const myGroups = [
    { id: '1', name: 'Young Adults', members: 24, isJoined: true, privacy: 'public', description: 'Ages 18-30 fellowship and Bible study' },
    { id: '2', name: 'Worship Team', members: 18, isJoined: true, privacy: 'private', description: 'For current worship team members' },
    { id: '3', name: 'Small Group Leaders', members: 12, isJoined: true, privacy: 'private', description: 'Leadership training and support' }
  ];

  const suggestedGroups = [
    { id: '4', name: 'Men\'s Bible Study', members: 15, isJoined: false, privacy: 'public', description: 'Weekly men\'s fellowship and study' },
    { id: '5', name: 'Parents Connect', members: 32, isJoined: false, privacy: 'public', description: 'Support and encouragement for parents' },
    { id: '6', name: 'Creative Arts', members: 28, isJoined: false, privacy: 'private', description: 'Artists, musicians, and creatives' }
  ];

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public': return '🌍';
      case 'private': return '🔒';
      case 'hidden': return '👁️‍🗨️';
      default: return '🌍';
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'public': return 'text-green-600 bg-green-50 border-green-200';
      case 'private': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'hidden': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const serveOpportunities = [
    {
      id: '1',
      title: 'Children\'s Ministry Helper',
      ministry: 'Kids Kingdom',
      time: 'Sunday mornings',
      match: 92,
      urgent: true,
      icon: '🧒',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      accentColor: 'text-yellow-700',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=200&fit=crop&crop=center',
      matchingGifts: ['Helps', 'Teaching'],
      description: 'Help create a fun, safe environment where kids encounter Jesus'
    },
    {
      id: '2', 
      title: 'Worship Sound Tech',
      ministry: 'Worship Ministry',
      time: 'Weekend services',
      match: 87,
      urgent: false,
      icon: '🎤',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200', 
      accentColor: 'text-blue-700',
      image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=200&fit=crop&crop=center',
      matchingGifts: ['Administration', 'Helps'],
      description: 'Support our worship team with excellent sound production'
    },
    {
      id: '3',
      title: 'Hospitality Team',
      ministry: 'Guest Services',
      time: 'Sunday services',
      match: 78,
      urgent: false,
      icon: '☕',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      accentColor: 'text-green-700',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop&crop=center',
      matchingGifts: ['Hospitality', 'Helps'],
      description: 'Welcome guests and make everyone feel at home'
    }
  ];

  const testimonials = [
    { text: 'Serving in Worship has helped me grow in faith!', author: 'Sarah J.' },
    { text: 'Working with kids brings me so much joy every week.', author: 'Mike T.' },
    { text: 'Our hospitality team is like a second family to me.', author: 'Lisa M.' }
  ];

  const filterChips = ['All', 'Kids', 'Worship', 'Hospitality', 'Tech', 'Prayer'];

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
            <Card className="mb-6 border border-warm-gold/20 bg-gradient-to-r from-warm-gold/5 to-spiritual-blue/5 shadow-lg">
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
                <div className="space-y-3">
                  {serveOpportunities.slice(0, 2).map((opportunity) => (
                    <div key={opportunity.id} className={`relative overflow-hidden rounded-lg border-2 ${opportunity.borderColor} ${opportunity.bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}>
                      <div className="flex items-start p-4">
                        <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center mr-3 shadow-sm">
                          <span className="text-2xl">{opportunity.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-sm text-charcoal">{opportunity.title}</p>
                            {opportunity.urgent && (
                              <Badge className="text-xs bg-red-500 text-white animate-pulse shadow-sm">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{opportunity.ministry}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{opportunity.time}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center space-x-1">
                              {opportunity.matchingGifts.map((gift, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-white/60">
                                  🎁 {gift}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-green-700 font-medium">{opportunity.match}% match</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-700"
                                style={{ width: `${opportunity.match}%` }}
                              ></div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-spiritual-blue to-purple-600 hover:from-spiritual-blue/90 hover:to-purple-600/90 text-white font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                            data-testid={`apply-${opportunity.id}`}
                          >
                            🙋 Apply to Serve
                          </Button>
                        </div>
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
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{post.body}</p>
                      {post.image && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img 
                            src={post.image} 
                            alt="Post image" 
                            className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            data-testid={`post-image-${post.id}`}
                          />
                        </div>
                      )}
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
                    <div key={group.id} className="p-4 rounded-lg border border-gray-100 hover:border-spiritual-blue/30 transition-colors bg-white/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-sm">{group.name}</p>
                            <Badge variant="outline" className={`text-xs px-2 py-1 border ${getPrivacyColor(group.privacy)}`}>
                              {getPrivacyIcon(group.privacy)} {group.privacy}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{group.members} members • Feed access for members only</p>
                          <p className="text-xs text-gray-600">{group.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full" data-testid={`open-group-${group.id}`}>
                        Open Group Feed
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
                    <div key={group.id} className="p-4 rounded-lg border border-gray-100 hover:border-spiritual-blue/30 transition-colors bg-white/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-sm">{group.name}</p>
                            <Badge variant="outline" className={`text-xs px-2 py-1 border ${getPrivacyColor(group.privacy)}`}>
                              {getPrivacyIcon(group.privacy)} {group.privacy}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{group.members} members • Feed access for members only</p>
                          <p className="text-xs text-gray-600">{group.description}</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full bg-spiritual-blue hover:bg-spiritual-blue/90" data-testid={`join-group-${group.id}`}>
                        {group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="serve" className="mt-0 space-y-6">
            {/* Why Serve Banner */}
            <Card className="border-2 border-warm-gold/30 bg-gradient-to-r from-warm-gold/10 to-spiritual-blue/10">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <Crown className="h-8 w-8 mx-auto text-warm-gold mb-2" />
                  <h2 className="text-xl font-bold text-charcoal">Why Serve?</h2>
                </div>
                <p className="text-gray-700 italic mb-2">
                  "God has given each of you a gift from his great variety of spiritual gifts. Use them well to serve one another."
                </p>
                <p className="text-sm text-gray-600">— 1 Peter 4:10 NLT</p>
              </CardContent>
            </Card>

            {/* Testimonial Carousel */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="mb-2">
                    <p className="text-sm italic text-gray-700">"Serving in Worship has helped me grow in faith!"</p>
                    <p className="text-xs text-gray-500">— Sarah J.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {filterChips.map((filter) => (
                <Button
                  key={filter}
                  variant={filter === 'All' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full"
                  data-testid={`filter-${filter.toLowerCase()}`}
                >
                  {filter}
                </Button>
              ))}
            </div>

            {/* Enhanced Serve Opportunities */}
            <div className="space-y-4">
              {serveOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className={`overflow-hidden border-2 ${opportunity.borderColor} ${opportunity.bgColor} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                  <CardContent className="p-0">
                    {/* Image Header */}
                    <div className="h-32 bg-gray-200 relative overflow-hidden">
                      <img 
                        src={opportunity.image} 
                        alt={opportunity.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="w-10 h-10 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                          <span className="text-xl">{opportunity.icon}</span>
                        </div>
                      </div>
                      {opportunity.urgent && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-500 text-white animate-pulse shadow-sm">
                            Urgent
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h3 className="font-bold text-charcoal text-lg mb-1">{opportunity.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-spiritual-blue" />
                            <span className={opportunity.accentColor}>{opportunity.ministry}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-spiritual-blue" />
                            <span>{opportunity.time}</span>
                          </span>
                        </div>
                        
                        {/* Matching Gifts */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-sm font-medium text-gray-700">Matching Gifts:</span>
                          <div className="flex space-x-1">
                            {opportunity.matchingGifts.map((gift, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-2 py-1 bg-white/80">
                                🎁 {gift}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Gift Match</span>
                            <span className="font-bold text-green-600">{opportunity.match}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-700 shadow-sm"
                              style={{ width: `${opportunity.match}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Apply Button */}
                        <Button 
                          className="w-full bg-gradient-to-r from-spiritual-blue via-purple-600 to-warm-gold hover:from-spiritual-blue/90 hover:via-purple-600/90 hover:to-warm-gold/90 text-white font-bold py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                          data-testid={`apply-serve-${opportunity.id}`}
                        >
                          🙋 Apply to Serve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}