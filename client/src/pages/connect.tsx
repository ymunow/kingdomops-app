import React, { useState } from 'react';
import { MessageCircle, Heart, MessageSquare, Share, MoreHorizontal, Edit3, Camera, Megaphone, Users, Crown, ArrowRight, MapPin, Clock, Bookmark, ChevronLeft, ChevronRight, TrendingUp, HandHeart, Filter, CheckCircle, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

export default function Connect() {
  const [activeComposer, setActiveComposer] = useState<string | null>(null);
  const [urgentCarouselIndex, setUrgentCarouselIndex] = useState(0);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const [prayedForPosts, setPrayedForPosts] = useState<string[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<string>('all');
  const [prayerNotifications, setPrayerNotifications] = useState<Record<string, number>>({});
  const [prayerGlow, setPrayerGlow] = useState<string | null>(null);
  
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
      commentCount: 3,
      prayedCount: 8,
      isAnswered: false,
      isAnonymous: false
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
      commentCount: 7,
      prayedCount: 47,
      isAnswered: true,
      isAnonymous: false,
      answeredDate: '2025-08-18T10:30:00Z'
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
      commentCount: 12,
      prayedCount: 25,
      isAnswered: false,
      isAnonymous: true,
      isUrgent: true
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
      commentCount: 5,
      prayedCount: 3,
      isAnswered: false,
      isAnonymous: false
    },
    {
      id: 'prayer-1',
      author: { name: 'Sarah Chen', avatar: '' },
      createdAt: '2025-08-19T08:00:00Z',
      type: 'prayer',
      title: 'Prayer for Healing',
      body: 'Please pray for my grandmother who is in the hospital recovering from surgery. The doctors say she\'s doing well but we\'re trusting God for complete healing and strength for our family during this time.',
      reactionCounts: { heart: 8, pray: 32 },
      commentCount: 12,
      prayedCount: 32,
      isAnswered: false,
      isAnonymous: false
    },
    {
      id: 'prayer-2',
      author: { name: 'Michael Rodriguez', avatar: '' },
      createdAt: '2025-08-18T15:30:00Z',
      type: 'prayer',
      title: 'Job Search Prayer',
      body: 'I\'ve been searching for a new job for 3 months now. Feeling discouraged but trusting God\'s timing. Please pray for open doors, wisdom in interviews, and peace during this season of waiting. God knows our needs! 🙏',
      reactionCounts: { heart: 15, pray: 28 },
      commentCount: 8,
      prayedCount: 28,
      isAnswered: true,
      isAnonymous: false,
      answeredDate: '2025-08-19T06:00:00Z'
    },
    {
      id: 'prayer-3',
      author: { name: 'Anonymous Church Member', avatar: '' },
      createdAt: '2025-08-19T12:45:00Z',
      type: 'prayer',
      title: 'Marriage Struggles',
      body: 'My spouse and I are going through a very difficult time. We\'re attending counseling but things feel overwhelming. Please pray for healing, forgiveness, and God\'s restoration in our marriage. We need His guidance more than ever.',
      reactionCounts: { heart: 22, pray: 64 },
      commentCount: 15,
      prayedCount: 64,
      isAnswered: false,
      isAnonymous: true,
      isUrgent: true
    },
    {
      id: 'prayer-4',
      author: { name: 'Pastor David', avatar: '' },
      createdAt: '2025-08-18T20:15:00Z',
      type: 'prayer',
      title: 'Church Outreach Event',
      body: 'We\'re planning a community outreach event next month to serve local families in need. Please pray for God\'s favor, volunteers to step up, and that hearts would be open to receive His love through our service.',
      reactionCounts: { heart: 18, pray: 41 },
      commentCount: 6,
      prayedCount: 41,
      isAnswered: false,
      isAnonymous: false
    },
    {
      id: 'prayer-5',
      author: { name: 'Emma Thompson', avatar: '' },
      createdAt: '2025-08-17T14:00:00Z',
      type: 'prayer',
      title: 'Financial Breakthrough',
      body: 'Thank you Jesus! After months of praying for provision, God opened an unexpected door. I got the promotion I\'ve been hoping for AND my husband found steady work. God is so faithful! Thank you all for your prayers 🙌',
      reactionCounts: { heart: 42, pray: 58 },
      commentCount: 24,
      prayedCount: 58,
      isAnswered: true,
      isAnonymous: false,
      answeredDate: '2025-08-17T18:30:00Z'
    },
    {
      id: 'prayer-6',
      author: { name: 'Anonymous Church Member', avatar: '' },
      createdAt: '2025-08-19T09:20:00Z',
      type: 'prayer',
      title: 'Health Concerns',
      body: 'I received some concerning test results and am waiting for more tests next week. Feeling anxious and scared. Please pray for peace, healing, and good results. Also pray for my family as they\'re worried too.',
      reactionCounts: { heart: 11, pray: 29 },
      commentCount: 9,
      prayedCount: 29,
      isAnswered: false,
      isAnonymous: true
    },
    {
      id: 'prayer-7',
      author: { name: 'Teen Ministry Leader', avatar: '' },
      createdAt: '2025-08-19T16:00:00Z',
      type: 'prayer',
      title: 'Youth Camp Success',
      body: 'Our teen summer camp starts tomorrow! 50 students signed up. Please pray for safety, spiritual breakthrough, that seeds planted would grow, and for our volunteer team to have energy and wisdom. Excited to see what God does! 🏕️',
      reactionCounts: { heart: 35, pray: 47 },
      commentCount: 18,
      prayedCount: 47,
      isAnswered: false,
      isAnonymous: false,
      isUrgent: true
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
      description: 'Help create a fun, safe environment where kids encounter Jesus',
      currentVolunteers: 8,
      needsTotal: 12,
      details: {
        expectations: 'Assist with activities, help manage classroom behavior, support lead teacher',
        timeCommitment: '2-3 hours on Sunday mornings, 1-2 Sundays per month',
        training: 'Background check required, 2-hour orientation session'
      }
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
      description: 'Support our worship team with excellent sound production',
      currentVolunteers: 3,
      needsTotal: 6,
      details: {
        expectations: 'Operate sound board, manage microphones, troubleshoot audio issues',
        timeCommitment: '3-4 hours for weekend services, 1-2 weekends per month',
        training: 'Technical training provided, no prior experience required'
      }
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
      description: 'Welcome guests and make everyone feel at home',
      currentVolunteers: 15,
      needsTotal: 18,
      details: {
        expectations: 'Greet guests, serve coffee, answer questions, guide newcomers',
        timeCommitment: '2 hours before and during service, 1-2 Sundays per month',
        training: 'Brief orientation on hospitality best practices'
      }
    }
  ];

  const testimonials = [
    { text: 'Serving in Worship has helped me grow in faith!', author: 'Sarah J.' },
    { text: 'Working with kids brings me so much joy every week.', author: 'Mike T.' },
    { text: 'Our hospitality team is like a second family to me.', author: 'Lisa M.' }
  ];

  const filterChips = ['All', 'Kids', 'Worship', 'Hospitality', 'Tech', 'Prayer'];

  const urgentOpportunities = serveOpportunities.filter(op => op.urgent);

  const handleSaveOpportunity = (id: string) => {
    setSavedOpportunities(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApplyToServe = (id: string) => {
    setAppliedOpportunities(prev => [...prev, id]);
    setShowCelebration(id);
    setTimeout(() => setShowCelebration(null), 3000);
  };

  const nextUrgentSlide = () => {
    setUrgentCarouselIndex((prev) => 
      prev === urgentOpportunities.length - 1 ? 0 : prev + 1
    );
  };

  const prevUrgentSlide = () => {
    setUrgentCarouselIndex((prev) => 
      prev === 0 ? urgentOpportunities.length - 1 : prev - 1
    );
  };

  const handlePrayForPost = (postId: string) => {
    setPrayedForPosts(prev => {
      const wasPrayingBefore = prev.includes(postId);
      if (wasPrayingBefore) {
        return prev.filter(id => id !== postId);
      } else {
        // Add prayer and trigger notification
        setPrayerNotifications(notifications => ({
          ...notifications,
          [postId]: (notifications[postId] || 0) + 1
        }));
        
        // Trigger glow effect
        setPrayerGlow(postId);
        setTimeout(() => setPrayerGlow(null), 600);
        
        return [...prev, postId];
      }
    });
  };

  const prayerPosts = posts.filter(post => post.type === 'prayer');
  const answeredPrayers = prayerPosts.filter(post => post.isAnswered);
  const activePrayers = prayerPosts.filter(post => !post.isAnswered);

  const filteredPrayers = () => {
    switch (prayerFilter) {
      case 'urgent':
        return activePrayers.filter(post => post.reactionCounts.pray > 20);
      case 'answered':
        return answeredPrayers;
      default:
        return activePrayers;
    }
  };

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
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="feed" data-testid="feed-tab">Feed</TabsTrigger>
            <TabsTrigger value="groups" data-testid="groups-tab">Groups</TabsTrigger>
            <TabsTrigger value="serve" data-testid="serve-tab">Serve</TabsTrigger>
            <TabsTrigger value="prayer" data-testid="prayer-tab">Prayer</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <ComposerBar />
            
            {/* Urgent Opportunities Carousel */}
            {urgentOpportunities.length > 0 && (
              <Card className="mb-6 border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <span className="font-semibold text-charcoal">Urgent Needs</span>
                      <Badge className="text-xs bg-red-100 text-red-700">Swipe to see {urgentOpportunities.length}</Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={prevUrgentSlide} data-testid="urgent-prev">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={nextUrgentSlide} data-testid="urgent-next">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg">
                    <div 
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${urgentCarouselIndex * 100}%)` }}
                    >
                      {urgentOpportunities.map((opportunity) => (
                        <div key={opportunity.id} className="w-full flex-shrink-0">
                          <div className={`relative overflow-hidden rounded-lg border-2 ${opportunity.borderColor} ${opportunity.bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}>
                            <div className="flex items-start p-4">
                              <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center mr-3 shadow-sm">
                                <span className="text-2xl">{opportunity.icon}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-semibold text-sm text-charcoal">{opportunity.title}</p>
                                  <Badge className="text-xs bg-red-500 text-white animate-pulse shadow-sm">
                                    Urgent
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{opportunity.ministry}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{opportunity.currentVolunteers}/{opportunity.needsTotal} volunteers</span>
                                  </span>
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
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    className="flex-1 bg-gradient-to-r from-spiritual-blue to-purple-600 hover:from-spiritual-blue/90 hover:to-purple-600/90 text-white font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                                    onClick={() => handleApplyToServe(opportunity.id)}
                                    disabled={appliedOpportunities.includes(opportunity.id)}
                                    data-testid={`apply-urgent-${opportunity.id}`}
                                  >
                                    {appliedOpportunities.includes(opportunity.id) ? '✅ Applied' : '🙋 Apply Now'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleSaveOpportunity(opportunity.id)}
                                    data-testid={`save-urgent-${opportunity.id}`}
                                  >
                                    <Bookmark className={`h-4 w-4 ${savedOpportunities.includes(opportunity.id) ? 'fill-current text-spiritual-blue' : ''}`} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Perfect Matches Discovery Card */}
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
                  {serveOpportunities.filter(op => !op.urgent).slice(0, 2).map((opportunity) => (
                    <div key={opportunity.id} className={`relative overflow-hidden rounded-lg border-2 ${opportunity.borderColor} ${opportunity.bgColor} transition-all duration-300 hover:shadow-md hover:scale-[1.02]`}>
                      <div className="flex items-start p-4">
                        <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center mr-3 shadow-sm">
                          <span className="text-2xl">{opportunity.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-sm text-charcoal">{opportunity.title}</p>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{opportunity.ministry}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>{opportunity.currentVolunteers}/{opportunity.needsTotal} volunteers</span>
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
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-spiritual-blue to-purple-600 hover:from-spiritual-blue/90 hover:to-purple-600/90 text-white font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
                              onClick={() => handleApplyToServe(opportunity.id)}
                              disabled={appliedOpportunities.includes(opportunity.id)}
                              data-testid={`apply-${opportunity.id}`}
                            >
                              {appliedOpportunities.includes(opportunity.id) ? '✅ Applied' : '🙋 Apply to Serve'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSaveOpportunity(opportunity.id)}
                              data-testid={`save-${opportunity.id}`}
                            >
                              <Bookmark className={`h-4 w-4 ${savedOpportunities.includes(opportunity.id) ? 'fill-current text-spiritual-blue' : ''}`} />
                            </Button>
                          </div>
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
                        
                        {/* Impact Stats */}
                        <div className="mb-4 p-3 bg-white/60 rounded-lg border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-spiritual-blue" />
                              <span className="text-gray-700">Impact Stats</span>
                            </span>
                            <span className="font-semibold text-spiritual-blue">
                              {opportunity.currentVolunteers}/{opportunity.needsTotal} volunteers serving
                            </span>
                          </div>
                        </div>
                        
                        {/* Expandable Details */}
                        <div className="mb-4 p-3 bg-white/40 rounded-lg border text-sm">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-gray-700">Role:</span>
                              <p className="text-gray-600 text-xs mt-1">{opportunity.details.expectations}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Time:</span>
                              <p className="text-gray-600 text-xs mt-1">{opportunity.details.timeCommitment}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Training:</span>
                              <p className="text-gray-600 text-xs mt-1">{opportunity.details.training}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-spiritual-blue via-purple-600 to-warm-gold hover:from-spiritual-blue/90 hover:via-purple-600/90 hover:to-warm-gold/90 text-white font-bold py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                            onClick={() => handleApplyToServe(opportunity.id)}
                            disabled={appliedOpportunities.includes(opportunity.id)}
                            data-testid={`apply-serve-${opportunity.id}`}
                          >
                            {appliedOpportunities.includes(opportunity.id) ? '✅ Applied!' : '🙋 Apply to Serve'}
                          </Button>
                          <Button 
                            variant="outline"
                            className="px-4 hover:bg-spiritual-blue/10"
                            onClick={() => handleSaveOpportunity(opportunity.id)}
                            data-testid={`save-serve-${opportunity.id}`}
                          >
                            <Bookmark className={`h-4 w-4 ${savedOpportunities.includes(opportunity.id) ? 'fill-current text-spiritual-blue' : ''}`} />
                            <span className="ml-2 text-sm">
                              {savedOpportunities.includes(opportunity.id) ? 'Saved' : 'Save'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="prayer" className="mt-0 space-y-6 relative min-h-screen bg-gradient-to-b from-purple-50/30 via-indigo-50/20 to-blue-50/30">
            {/* Spiritual Background Overlay */}
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-purple-200 via-transparent to-blue-200 pointer-events-none" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), 
                                     radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
                 }}>
            </div>

            {/* Urgent Prayer Banner */}
            {activePrayers.some(p => p.isUrgent || p.reactionCounts.pray > 20) && (
              <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg sticky top-4 z-10">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-800 mb-1">🚨 Urgent Prayer Needs</p>
                      <p className="text-sm text-red-700">
                        {activePrayers.filter(p => p.isUrgent || p.reactionCounts.pray > 20).length} prayer(s) need immediate attention from our community
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => setPrayerFilter('urgent')}
                      data-testid="view-urgent-prayers"
                    >
                      View Urgent 🙏
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prayer Notifications */}
            {Object.entries(prayerNotifications).map(([postId, count]) => {
              const post = posts.find(p => p.id === postId);
              if (!post || count === 0) return null;
              return (
                <Card key={`notification-${postId}`} className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 animate-fade-in">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🙏✨</div>
                    <p className="font-semibold text-purple-800 mb-1">Prayer Encouragement</p>
                    <p className="text-sm text-purple-700">
                      {count} {count === 1 ? 'person' : 'people'} prayed for your request today!
                    </p>
                    <p className="text-xs text-purple-600 mt-1">You are covered in prayer and not alone.</p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Prayer Wall Header */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 relative overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <HandHeart className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <h2 className="text-xl font-bold text-charcoal">Prayer Wall</h2>
                </div>
                <p className="text-gray-700 italic mb-2">
                  "The prayer of a righteous person is powerful and effective."
                </p>
                <p className="text-sm text-gray-600">— James 5:16</p>
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>{activePrayers.length} active prayers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{answeredPrayers.length} answered this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prayer Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter prayers:</span>
                  <div className="flex space-x-2">
                    <Button
                      variant={prayerFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPrayerFilter('all')}
                      className="rounded-full text-xs"
                      data-testid="filter-all-prayers"
                    >
                      All ({activePrayers.length})
                    </Button>
                    <Button
                      variant={prayerFilter === 'urgent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPrayerFilter('urgent')}
                      className="rounded-full text-xs"
                      data-testid="filter-urgent-prayers"
                    >
                      Urgent ({activePrayers.filter(p => p.reactionCounts.pray > 20).length})
                    </Button>
                    <Button
                      variant={prayerFilter === 'answered' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPrayerFilter('answered')}
                      className="rounded-full text-xs"
                      data-testid="filter-answered-prayers"
                    >
                      Answered ({answeredPrayers.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prayer Requests */}
            <div className="space-y-4">
              {filteredPrayers().length > 0 ? (
                filteredPrayers().map((post) => (
                  <Card key={post.id} className={`shadow-sm hover:shadow-md transition-shadow ${
                    post.isAnswered ? 'border-2 border-green-200 bg-green-50/30' : 'border border-purple-100'
                  }`}>
                    <CardContent className="p-4">
                      {/* Prayer Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`font-semibold ${
                              post.isAnonymous 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              {post.isAnonymous ? '?' : post.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold text-charcoal text-sm">
                                {post.isAnonymous ? 'Anonymous Church Member' : post.author.name}
                              </p>
                              {post.isAnswered ? (
                                <Badge className="text-xs bg-green-500 text-white animate-pulse">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  ✨ Answered!
                                </Badge>
                              ) : post.isUrgent ? (
                                <Badge className="text-xs bg-red-500 text-white animate-pulse">
                                  🚨 Urgent Prayer
                                </Badge>
                              ) : post.isAnonymous ? (
                                <Badge variant="outline" className="text-xs border border-gray-300 bg-gray-50 text-gray-600">
                                  🤐 Anonymous Request
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs border border-purple-200 bg-purple-50 text-purple-700">
                                  🙏 Prayer Request
                                </Badge>
                              )}
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

                      {/* Prayer Content */}
                      <div className="mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed">{post.body}</p>
                      </div>

                      {/* Prayer Stats */}
                      <div className="mb-4 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <HandHeart className="h-4 w-4 text-purple-500" />
                              <span className="font-medium text-purple-700">
                                {post.reactionCounts.pray + (prayedForPosts.includes(post.id) ? 1 : 0)} people prayed
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{post.commentCount} comments</span>
                            </span>
                          </div>
                          {post.reactionCounts.pray > 20 && (
                            <Badge className="text-xs bg-orange-100 text-orange-700">
                              <Sparkles className="h-3 w-3 mr-1" />
                              High Priority
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Prayer Actions */}
                      {!post.isAnswered && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            className={`flex-1 transition-all duration-300 relative overflow-hidden ${
                              prayedForPosts.includes(post.id)
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg transform scale-105'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white hover:shadow-lg hover:scale-105'
                            } ${
                              prayerGlow === post.id ? 'animate-pulse shadow-lg shadow-purple-300 ring-2 ring-purple-300' : ''
                            }`}
                            onClick={() => handlePrayForPost(post.id)}
                            data-testid={`pray-for-${post.id}`}
                          >
                            {prayedForPosts.includes(post.id) ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Prayed ✓
                              </>
                            ) : (
                              <>
                                <HandHeart className="h-4 w-4 mr-2" />
                                I'll Pray for This
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Answered Prayer Celebration */}
                      {post.isAnswered && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200 relative overflow-hidden">
                          {/* Celebration Confetti Effect */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute top-4 right-4 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                            <div className="absolute bottom-3 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                            <div className="absolute bottom-2 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="flex space-x-1">
                                <Sparkles className="h-5 w-5 text-green-600 animate-pulse" />
                                <span className="text-2xl animate-bounce">🎉</span>
                              </div>
                              <span className="font-bold text-green-800 text-lg">PRAISE REPORT!</span>
                            </div>
                            <p className="text-sm text-green-700 font-medium mb-2">
                              🙌 God answered this prayer! Praise His faithfulness!
                            </p>
                            <p className="text-xs text-green-600 italic">
                              Answered on {formatDistanceToNow(new Date(post.answeredDate || post.createdAt), { addSuffix: true })}
                            </p>
                            <div className="mt-3 flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                data-testid={`praise-${post.id}`}
                              >
                                🙌 Praise God! ({(post.reactionCounts.heart || 0) + 15})
                              </Button>
                              <Button variant="outline" size="sm" className="text-xs">
                                💬 Share Testimony
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HandHeart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-2">
                      {prayerFilter === 'answered' ? 'No answered prayers yet' : 'No prayer requests in this category'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {prayerFilter === 'answered' 
                        ? 'When prayers are answered, they\'ll appear here as testimonies of God\'s faithfulness.' 
                        : 'Be the first to share a prayer request and invite the community to pray with you.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Community Prayer Stats */}
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-charcoal mb-3">Community Prayer Impact</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {prayerPosts.reduce((sum, post) => sum + post.reactionCounts.pray + (prayedForPosts.includes(post.id) ? 1 : 0), 0)}
                      </div>
                      <div className="text-gray-600">Total Prayers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{answeredPrayers.length}</div>
                      <div className="text-gray-600">Answered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">{activePrayers.length}</div>
                      <div className="text-gray-600">Active Requests</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Celebration Toast */}
      {showCelebration && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-semibold text-green-800">Thanks for stepping up!</p>
              <p className="text-sm text-green-600">We'll be in touch soon with next steps.</p>
            </CardContent>
          </Card>
        </div>
      )}
      
    </MainLayout>
  );
}