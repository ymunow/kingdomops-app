import React, { useState, useEffect } from 'react';
import { FeedComposer } from '@/components/FeedComposer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Heart, MessageSquare, Share, MoreHorizontal, Edit3, Camera, Megaphone, Users, Crown, ArrowRight, MapPin, Clock, Bookmark, ChevronLeft, ChevronRight, TrendingUp, HandHeart, Filter, CheckCircle, Sparkles, Plus, Shield, Lock, Globe, Eye, UserCheck, AlertCircle, X, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { useFeed } from '@/hooks/useFeed';
import { useCreatePost } from '@/hooks/useCreatePost';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

export default function Connect() {
  const [activeTab, setActiveTab] = useState('feed');
  const [activeComposer, setActiveComposer] = useState<string | null>(null);
  const [urgentCarouselIndex, setUrgentCarouselIndex] = useState(0);
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const [prayedForPosts, setPrayedForPosts] = useState<string[]>([]);
  const [prayerFilter, setPrayerFilter] = useState<string>('all');
  const [prayerNotifications, setPrayerNotifications] = useState<Record<string, number>>({});
  const [prayerGlow, setPrayerGlow] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showRequestGroupModal, setShowRequestGroupModal] = useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [quickViewGroup, setQuickViewGroup] = useState<any>(null);
  const [groupFilters, setGroupFilters] = useState({
    category: 'All',
    day: 'All',
    format: 'All',
    campus: 'All',
    search: ''
  });
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    category: '',
    visibility: 'public' as 'public' | 'private' | 'secret'
  });
  const [groupRequest, setGroupRequest] = useState({
    name: '',
    description: '',
    reason: '',
    category: ''
  });
  const [pendingRequests, setPendingRequests] = useState([
    { id: '1', name: 'College & Career Ministry', requester: 'Sarah Johnson', reason: 'Need a space for young adults to connect', category: 'Ministry', status: 'pending' },
    { id: '2', name: 'Photography Group', requester: 'Mike Chen', reason: 'Creative outlet for church photographers', category: 'Interest', status: 'pending' }
  ]);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch feed posts from API with optimistic updates
  const { data: feedPosts = [], isLoading } = useFeed("church", "members");
  
  // Create post mutation with optimistic updates  
  const createPostMutation = useCreatePost("church", "members", user);

  // Check URL parameter for initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['feed', 'groups', 'serve', 'prayer'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);
  
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

  // Enhanced group data with cover photos and profile pictures
  const myGroups = [
    { 
      id: '1', 
      name: 'Young Adults', 
      members: 24, 
      isJoined: true, 
      privacy: 'Public', 
      description: 'Ages 18-30 fellowship and Bible study',
      category: 'Group',
      unreadCount: 3,
      leaders: [{ name: 'Sarah J.', role: 'Organizer' }],
      recentPosts: [
        { author: 'Mike', text: 'Great discussion tonight! Looking forward to next week.', time: '2h ago' },
        { author: 'Sarah', text: 'Don\'t forget to bring your Bibles tomorrow!', time: '1d ago' },
        { author: 'Alex', text: 'Prayer request: Job interview Friday', time: '3d ago' }
      ],
      tags: ['Bible Study', 'Fellowship', 'Young Adults'],
      coverPhoto: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=200&fit=crop',
      profilePhoto: '🙏'
    },
    { 
      id: '2', 
      name: 'Worship Team', 
      members: 18, 
      isJoined: true, 
      privacy: 'Private', 
      description: 'For current worship team members',
      category: 'Group',
      unreadCount: 0,
      leaders: [{ name: 'David P.', role: 'Organizer' }],
      recentPosts: [
        { author: 'David', text: 'New song for Sunday - "Way Maker". Let\'s practice!', time: '4h ago' },
        { author: 'Emma', text: 'Sound check at 7:30am this Sunday', time: '1d ago' },
        { author: 'Josh', text: 'Thanks for the amazing worship time today!', time: '2d ago' }
      ],
      tags: ['Worship', 'Music', 'Ministry'],
      coverPhoto: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
      profilePhoto: '🎵'
    },
    { 
      id: '3', 
      name: 'Small Group Leaders', 
      members: 12, 
      isJoined: true, 
      privacy: 'Private', 
      description: 'Leadership training and support',
      category: 'Group',
      unreadCount: 1,
      leaders: [{ name: 'Pastor Mike', role: 'Organizer' }],
      recentPosts: [
        { author: 'Pastor Mike', text: 'Leadership retreat planning meeting this Saturday', time: '6h ago' },
        { author: 'Lisa', text: 'Great leadership book recommendation: "The Serve"', time: '2d ago' },
        { author: 'Tom', text: 'Prayer for wisdom in leading my group', time: '4d ago' }
      ],
      tags: ['Leadership', 'Training', 'Support'],
      coverPhoto: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop',
      profilePhoto: '👑'
    }
  ];

  const suggestedGroups = [
    { 
      id: '4', 
      name: 'Men\'s Bible Study', 
      members: 15, 
      isJoined: false, 
      privacy: 'Public', 
      description: 'Weekly men\'s fellowship and study', 
      category: 'Group',
      leaders: [{ name: 'Steve R.', role: 'Organizer' }],
      recentPosts: [
        { author: 'Steve', text: 'New study series starting next week: "Biblical Manhood"', time: '1h ago' },
        { author: 'Mark', text: 'Great fellowship time tonight guys!', time: '1d ago' },
        { author: 'Paul', text: 'Bringing donuts next Tuesday', time: '3d ago' }
      ],
      tags: ['Men\'s Ministry', 'Bible Study', 'Fellowship'],
      matchPercentage: 85,
      campus: 'Main Campus',
      format: 'In-person',
      coverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
      profilePhoto: '💪'
    },
    { 
      id: '5', 
      name: 'Parents Connect', 
      members: 32, 
      isJoined: false, 
      privacy: 'Public', 
      description: 'Support and encouragement for parents', 
      category: 'Group',
      leaders: [{ name: 'Jennifer M.', role: 'Organizer' }],
      recentPosts: [
        { author: 'Jennifer', text: 'Topic this week: Setting healthy boundaries with kids', time: '3h ago' },
        { author: 'Amy', text: 'Thanks for all the prayer for my teenager!', time: '1d ago' },
        { author: 'Carlos', text: 'Great parenting book recommendation', time: '2d ago' }
      ],
      tags: ['Parenting', 'Support', 'Family'],
      matchPercentage: 72,
      campus: 'Online',
      format: 'Hybrid',
      coverPhoto: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=200&fit=crop',
      profilePhoto: '👨‍👩‍👧‍👦'
    },
    { 
      id: '6', 
      name: 'Creative Arts', 
      members: 28, 
      isJoined: false, 
      privacy: 'Private', 
      description: 'Artists, musicians, and creatives', 
      category: 'Group',
      leaders: [{ name: 'Maria L.', role: 'Organizer' }],
      recentPosts: [
        { author: 'Maria', text: 'Working on Christmas decorations for church!', time: '2h ago' },
        { author: 'Alex', text: 'Art supplies available in the studio', time: '1d ago' },
        { author: 'Nina', text: 'Beautiful painting session last week', time: '4d ago' }
      ],
      tags: ['Creative', 'Arts', 'Music'],
      matchPercentage: 68,
      campus: 'Main Campus',
      format: 'In-person',
      coverPhoto: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=200&fit=crop',
      profilePhoto: '🎨'
    }
  ];
  
  const groupCategories = [
    { id: 'ministry', name: 'Ministry Groups', icon: '⛪', description: 'Official church ministries' },
    { id: 'smallgroup', name: 'Small Groups', icon: '👥', description: 'Bible study and fellowship' },
    { id: 'support', name: 'Support Groups', icon: '🤝', description: 'Life stage and situation support' },
    { id: 'interest', name: 'Interest Groups', icon: '🎨', description: 'Hobbies and shared interests' },
    { id: 'class', name: 'Classes', icon: '📚', description: 'Learning and development' }
  ];
  
  // Permission checking functions
  const canCreateGroups = () => {
    if (!user?.role) return false;
    const role = user.role;
    return ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF'].includes(role);
  };
  
  const canCreateMinistryGroups = () => {
    if (!user?.role) return false;
    const role = user.role;
    return ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF', 'MINISTRY_LEADER'].includes(role);
  };
  
  const canManageGroupRequests = () => {
    if (!user?.role) return false;
    const role = user.role;
    return ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF'].includes(role);
  };
  
  const getCreateGroupPermissions = () => {
    if (!user?.role) return { canCreate: false, allowedCategories: [] };
    const role = user.role;
    
    if (['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN'].includes(role)) {
      return { canCreate: true, allowedCategories: ['ministry', 'smallgroup', 'support', 'interest', 'class'] };
    }
    if (role === 'PASTORAL_STAFF') {
      return { canCreate: true, allowedCategories: ['ministry', 'smallgroup', 'support', 'class'] };
    }
    if (role === 'MINISTRY_LEADER') {
      return { canCreate: true, allowedCategories: ['ministry', 'smallgroup'] };
    }
    return { canCreate: false, allowedCategories: [] };
  };

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
  
  // Algorithm to merge posts and service opportunities like sponsored content
  const createMergedFeed = () => {
    const feedItems = [];
    const allOpportunities = [...serveOpportunities];
    let opportunityIndex = 0;
    
    // Add posts and intersperse opportunities every ~8-10 posts
    posts.forEach((post, index) => {
      feedItems.push({ type: 'post', data: post, key: `post-${post.id}` });
      
      // Insert service opportunity every 8-10 posts (with some randomization)
      const shouldInsertOpportunity = (index + 1) % (8 + Math.floor(Math.random() * 3)) === 0;
      
      if (shouldInsertOpportunity && opportunityIndex < allOpportunities.length) {
        const opportunity = allOpportunities[opportunityIndex];
        feedItems.push({ 
          type: 'serviceOpportunity', 
          data: opportunity, 
          key: `opportunity-${opportunity.id}`,
          isUrgent: opportunity.urgent
        });
        opportunityIndex++;
      }
    });
    
    // Add any remaining opportunities at the end
    while (opportunityIndex < allOpportunities.length) {
      const opportunity = allOpportunities[opportunityIndex];
      feedItems.push({ 
        type: 'serviceOpportunity', 
        data: opportunity, 
        key: `opportunity-${opportunity.id}`,
        isUrgent: opportunity.urgent
      });
      opportunityIndex++;
    }
    
    return feedItems;
  };
  
  const mergedFeed = createMergedFeed();
  
  // Service Opportunity Component
  const ServiceOpportunityPost = ({ opportunity, isUrgent }: { opportunity: any, isUrgent: boolean }) => {
    const getMatchColor = (match: number) => {
      if (match >= 90) return { dot: 'bg-green-500', text: 'text-green-700' };
      if (match >= 75) return { dot: 'bg-orange-500', text: 'text-orange-700' };
      return { dot: 'bg-red-500', text: 'text-red-700' };
    };
    const matchColors = getMatchColor(opportunity.match);
    
    return (
      <Card className={`mb-4 shadow-sm hover:shadow-md transition-shadow ${isUrgent ? 'border-l-4 border-l-red-500' : ''}`}>
        <CardContent className="p-4">
          {/* Post Header - Ministry as Author */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-full ${isUrgent ? 'bg-red-50 border-2 border-red-200' : 'bg-spiritual-blue/10'} flex items-center justify-center`}>
                <span className="text-lg">{opportunity.icon}</span>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-semibold text-charcoal text-sm">{opportunity.ministry}</p>
                  <Badge className={`text-xs ${isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                    {isUrgent ? '❗ Urgent Need' : '👑 Perfect Match'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {isUrgent ? `Just posted • Only ${opportunity.needsTotal - opportunity.currentVolunteers} spots left!` : `2 minutes ago • Needs ${opportunity.needsTotal - opportunity.currentVolunteers} more volunteers`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Post Content - Relational Framing */}
          <div className="mb-4">
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              {isUrgent ? 
                `🚨 Urgent: We need help with ${opportunity.title} this week! Your gifts are a perfect match and your church family really needs you. Only ${opportunity.needsTotal - opportunity.currentVolunteers} volunteers needed.` :
                `Your church needs you in ${opportunity.title} this week! We're looking for someone with your gifts to help create an amazing experience. ${opportunity.currentVolunteers} of ${opportunity.needsTotal} volunteers have signed up.`
              }
            </p>
            
            {/* Ministry Image */}
            {opportunity.image && (
              <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm mb-3">
                <img 
                  src={opportunity.image} 
                  alt={opportunity.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            {/* Match Info - Simplified */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${matchColors.dot}`}></div>
                <span className={`font-bold ${matchColors.text}`}>{opportunity.match}% Match</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{opportunity.time}</span>
              </div>
            </div>
            
            {/* Matching Gifts */}
            <div className="flex items-center space-x-1 mt-2">
              <span className="text-xs text-gray-500">{isUrgent ? 'Your gifts:' : 'Perfect for:'}</span>
              {opportunity.matchingGifts.map((gift: string, giftIndex: number) => (
                <Badge key={giftIndex} variant="outline" className={`text-xs px-2 py-0.5 ${isUrgent ? 'bg-red-50 border-red-200 text-red-700' : ''}`}>
                  {gift}
                </Badge>
              ))}
            </div>
          </div>

          {/* Feed-Style Interactions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-spiritual-blue to-purple-600 hover:from-spiritual-blue/90 hover:to-purple-600/90 text-white font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 px-4"
                onClick={() => handleApplyToServe(opportunity.id)}
                disabled={appliedOpportunities.includes(opportunity.id)}
                data-testid={`apply-${opportunity.id}`}
              >
                {appliedOpportunities.includes(opportunity.id) ? '✅ Applied' : (isUrgent ? '🙋 Help Now' : '🙋 Apply to Serve')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2"
              >
                💬 Ask Questions
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleSaveOpportunity(opportunity.id)}
                data-testid={`save-${opportunity.id}`}
                className="px-2"
              >
                <Bookmark className={`h-4 w-4 ${savedOpportunities.includes(opportunity.id) ? `fill-current ${isUrgent ? 'text-red-500' : 'text-spiritual-blue'}` : 'text-gray-500'}`} />
              </Button>
              <Button variant="ghost" size="sm" className="px-2">
                <Share className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const handleCreateGroup = () => {
    // Here you would submit the new group data to the backend
    console.log('Creating group:', newGroupData);
    setShowCreateGroupModal(false);
    setNewGroupData({ name: '', description: '', category: '', visibility: 'public' });
  };
  
  const handleRequestGroup = () => {
    // Here you would submit the group request to the backend
    console.log('Requesting group:', groupRequest);
    setPendingRequests(prev => [...prev, {
      id: Date.now().toString(),
      name: groupRequest.name,
      requester: user?.displayName || 'Unknown User',
      reason: groupRequest.reason,
      category: groupRequest.category,
      status: 'pending'
    }]);
    setShowRequestGroupModal(false);
    setGroupRequest({ name: '', description: '', reason: '', category: '' });
  };
  
  const handleApproveRequest = (requestId: string) => {
    setPendingRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
  };
  
  const handleRejectRequest = (requestId: string) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  };
  
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'secret': return <Eye className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };
  
  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Anyone can discover and join';
      case 'private': return 'Members must be approved';
      case 'secret': return 'Invite only, hidden from discovery';
      default: return 'Anyone can discover and join';
    }
  };

  // Helper functions for enhanced Groups
  const getActivityLevel = (weeklyActivity: number) => {
    if (weeklyActivity >= 10) return { level: 'High', color: 'bg-green-500', text: 'Very Active' };
    if (weeklyActivity >= 5) return { level: 'Medium', color: 'bg-yellow-500', text: 'Active' };
    return { level: 'Low', color: 'bg-gray-400', text: 'Quiet' };
  };

  const getRecommendations = () => {
    // Simple recommendation logic based on user gifts and campus
    return suggestedGroups
      .filter(group => group.matchPercentage && group.matchPercentage > 70)
      .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
      .slice(0, 3);
  };

  const filterGroups = (groups: any[]) => {
    return groups.filter(group => {
      const matchesCategory = groupFilters.category === 'All' || group.category === groupFilters.category;
      const matchesFormat = groupFilters.format === 'All' || group.format === groupFilters.format;
      const matchesCampus = groupFilters.campus === 'All' || group.campus === groupFilters.campus;
      const matchesSearch = groupFilters.search === '' || 
        group.name.toLowerCase().includes(groupFilters.search.toLowerCase()) ||
        group.description.toLowerCase().includes(groupFilters.search.toLowerCase()) ||
        group.tags?.some((tag: string) => tag.toLowerCase().includes(groupFilters.search.toLowerCase()));
      
      return matchesCategory && matchesFormat && matchesCampus && matchesSearch;
    });
  };

  const handleQuickView = (group: any) => {
    setQuickViewGroup(group);
    setShowQuickViewModal(true);
  };

  const recommendations = getRecommendations();
  const filteredSuggestedGroups = filterGroups(suggestedGroups);


  // Quick View Modal Component
  const QuickViewModal = () => {
    if (!showQuickViewModal || !quickViewGroup) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowQuickViewModal(false)}>
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={`h-16 bg-gradient-to-r ${quickViewGroup.coverColor} relative`}>
            <button
              onClick={() => setShowQuickViewModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              data-testid="close-quick-view"
            >
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="absolute bottom-4 left-6">
              <h3 className="text-white font-bold text-lg">{quickViewGroup.name}</h3>
              <div className="flex items-center space-x-2 text-white/90 text-sm">
                <Users className="h-3 w-3" />
                <span>{quickViewGroup.members}/{quickViewGroup.capacity} members</span>
                <span>•</span>
                <span>{quickViewGroup.campus}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Group Info */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline" className={`text-xs px-2 py-1 ${getPrivacyColor(quickViewGroup.privacy)}`}>
                  {getPrivacyIcon(quickViewGroup.privacy)} {quickViewGroup.privacy}
                </Badge>
                <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                  {quickViewGroup.category}
                </Badge>
                {quickViewGroup.matchPercentage && (
                  <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                    {quickViewGroup.matchPercentage}% match
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{quickViewGroup.description}</p>

              {/* Leaders */}
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Led by:</span>
                <span className="text-sm text-gray-600">
                  {quickViewGroup.leaders.map((leader: any) => leader.name).join(', ')}
                </span>
              </div>
            </div>


            {/* Tags */}
            {quickViewGroup.tags && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {quickViewGroup.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {quickViewGroup.isJoined ? (
                <>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-spiritual-blue to-purple-600 hover:from-spiritual-blue/90 hover:to-purple-600/90 text-white"
                    onClick={() => {
                      setShowQuickViewModal(false);
                      // Navigate to group feed
                    }}
                    data-testid="open-group-feed"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Group Feed
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowQuickViewModal(false);
                      // Message leaders
                    }}
                    data-testid="message-group-leaders"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    onClick={() => {
                      setShowQuickViewModal(false);
                      // Handle join/request logic
                    }}
                    data-testid="join-from-quick-view"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {quickViewGroup.privacy === 'private' ? 'Request to Join' : 'Join Group'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowQuickViewModal(false);
                      // Favorite group
                    }}
                    data-testid="favorite-from-quick-view"
                  >
                    ⭐
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="feed" data-testid="feed-tab">Feed</TabsTrigger>
            <TabsTrigger value="groups" data-testid="groups-tab">Groups</TabsTrigger>
            <TabsTrigger value="serve" data-testid="serve-tab">Serve</TabsTrigger>
            <TabsTrigger value="prayer" data-testid="prayer-tab">Prayer</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            {/* Real Feed Composer with optimistic updates */}
            <FeedComposer
              currentUser={{ 
                id: user?.id || '', 
                role: user?.role,
                displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || undefined,
                firstName: user?.firstName || undefined,
                lastName: user?.lastName || undefined,
                profileImageUrl: user?.profileImageUrl || undefined
              }}
              createPostMutation={createPostMutation}
              onPosted={() => {
                // Fallback for backward compatibility
                queryClient.invalidateQueries({ queryKey: ["feed", "church", "members"] });
              }}
            />
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-blue"></div>
              </div>
            )}
            
            {/* Real API Feed Data */}
            <div className="space-y-4">
              {feedPosts && Array.isArray(feedPosts) && feedPosts.length > 0 ? (
                feedPosts.map((post: any, index: number) => (
                  <Card key={post?.id || `post-${index}`} className={`shadow-sm hover:shadow-md transition-shadow ${
                    post.authorId === user?.id || post.isMine ? 'border-2 border-spiritual-blue bg-purple-50' : ''
                  } ${post.isOptimistic ? 'opacity-80 animate-pulse' : ''} ${
                    post.type === 'announcement' ? 'border-l-4 border-l-amber-500 bg-amber-50' : ''
                  }`}>
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-spiritual-blue/10 text-spiritual-blue font-semibold">
                            {post.author?.displayName?.charAt(0) || 
                             post.author?.name?.charAt(0) || 
                             post.author?.firstName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-charcoal text-sm">
                              {post.author?.displayName || 
                               post.author?.name || 
                               `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 
                               'Unknown'}
                            </p>
                            <Badge variant="outline" className={`text-xs border ${getPostTypeColor(post.type)}`}>
                              {getPostIcon(post.type)} {post.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {post.createdAt && !isNaN(new Date(post.createdAt).getTime()) 
                              ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                              : 'just now'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
                        {typeof post.body === "string" ? post.body : JSON.stringify(post.body || "")}
                      </p>
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <img 
                            src={post.attachments[0]} 
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
                          ❤️ {post.likesCount || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 px-2"
                          data-testid={`pray-${post.id}`}
                        >
                          🙏 {post.prayersCount || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-gray-50 px-2"
                          data-testid={`comment-${post.id}`}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.commentsCount || 0}
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {isLoading ? 'Loading feed...' : 'No posts yet. Be the first to share something!'}
                  </p>
                </div>
              )}
            </div>

            {/* Load More */}
            <div className="flex justify-center mt-8">
              <Button variant="outline" data-testid="load-more-posts">
                Load More Posts
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            {/* Modern Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-charcoal mb-2">Groups</h1>
                  <p className="text-gray-600">Connect with others through meaningful community and shared purpose</p>
                </div>
                
                {/* Create Group Action */}
                <div className="flex items-center space-x-2">
                  {canCreateGroups() || canCreateMinistryGroups() ? (
                    <Button 
                      onClick={() => setShowCreateGroupModal(true)}
                      className="bg-spiritual-blue hover:bg-purple-700 text-white shadow-lg"
                      data-testid="create-group-button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowRequestGroupModal(true)}
                      variant="outline"
                      className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue/10 shadow-lg"
                      data-testid="request-group-button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Request Group
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Smart Recommendations Row */}
              {recommendations.length > 0 && (
                <div className="p-6 bg-gradient-to-r from-spiritual-blue/5 to-purple-50 rounded-xl border border-spiritual-blue/20">
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-spiritual-blue" />
                    <span className="font-semibold text-spiritual-blue">Perfect Matches for You</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((group) => (
                      <div 
                        key={group.id} 
                        className="p-4 bg-white rounded-lg border border-spiritual-blue/20 hover:border-spiritual-blue/40 transition-all cursor-pointer"
                        onClick={() => handleQuickView(group)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-charcoal text-sm">{group.name}</h4>
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            {group.matchPercentage}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{group.campus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Role-Based Permission Guide - Modernized */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-spiritual-blue to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">Permission Guide</h3>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'SUPER_ADMIN' || user?.role === 'CHURCH_SUPER_ADMIN' ? 'Full group creation access' :
                       user?.role === 'PASTORAL_STAFF' ? 'Create ministry and small groups' :
                       user?.role === 'MINISTRY_LEADER' ? 'Create groups in your ministry area' :
                       'Request new groups for approval'}
                    </p>
                  </div>
                  {user?.role && ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF'].includes(user.role) && (
                    <Badge className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300 shadow-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin Access
                    </Badge>
                  )}
                </div>
                  
                {/* Permission Cards - Modern Design */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${user?.role === 'SUPER_ADMIN' || user?.role === 'CHURCH_SUPER_ADMIN' ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-md' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
                    <Crown className="h-5 w-5 text-amber-600 mb-2" />
                    <p className="text-sm font-medium text-charcoal">Admin/Pastor</p>
                    <p className="text-xs text-gray-600">All groups</p>
                  </div>
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${user?.role === 'MINISTRY_LEADER' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
                    <Shield className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-charcoal">Leaders</p>
                    <p className="text-xs text-gray-600">Ministry groups</p>
                  </div>
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${user?.role && ['CHURCH_MEMBER', 'VOLUNTEER'].includes(user.role) ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
                    <UserCheck className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-charcoal">Members</p>
                    <p className="text-xs text-gray-600">Request only</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md">
                    <AlertCircle className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-charcoal">Approval Flow</p>
                    <p className="text-xs text-gray-600">Requests reviewed</p>
                  </div>
                </div>
              </div>

              {/* Admin Pending Requests - Modern Design */}
              {canManageGroupRequests() && pendingRequests.length > 0 && (
                <div className="p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900">Pending Group Requests</h3>
                      <p className="text-sm text-amber-700">{pendingRequests.length} requests awaiting review</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {pendingRequests.filter(req => req.status === 'pending').map((request) => (
                      <div key={request.id} className="p-5 bg-white rounded-xl border border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-charcoal">{request.name}</h4>
                              <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">{request.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Requested by: <span className="font-medium text-charcoal">{request.requester}</span></p>
                            <p className="text-sm text-gray-700 leading-relaxed">{request.reason}</p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                            onClick={() => handleApproveRequest(request.id)}
                            data-testid={`approve-request-${request.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                            onClick={() => handleRejectRequest(request.id)}
                            data-testid={`reject-request-${request.id}`}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Groups - LinkedIn Style Design */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-spiritual-blue to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-charcoal">My Groups</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {myGroups.map((group) => {
                    return (
                      <div 
                        key={group.id} 
                        className="rounded-lg border border-gray-200 hover:border-spiritual-blue/30 transition-all duration-200 bg-white shadow-sm hover:shadow-md overflow-hidden cursor-pointer"
                        onClick={() => handleQuickView(group)}
                        data-testid={`group-card-${group.id}`}
                      >
                        {/* Cover Photo */}
                        <div className="h-32 relative overflow-hidden">
                          <img 
                            src={group.coverPhoto} 
                            alt={`${group.name} cover`}
                            className="w-full h-full object-cover"
                          />
                          {/* Profile Photo Overlay */}
                          <div className="absolute bottom-4 left-4">
                            <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-xl border-2 border-white">
                              {group.profilePhoto}
                            </div>
                          </div>
                          {/* Unread Badge */}
                          {group.unreadCount > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                              {group.unreadCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          {/* Group Name */}
                          <h3 className="font-semibold text-charcoal text-base mb-1">{group.name}</h3>
                          
                          {/* Privacy and Category */}
                          <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                            <span>{group.privacy}</span>
                            <span>•</span>
                            <span>{group.category}</span>
                          </div>

                          {/* Member Avatars and Organizer Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-1">
                                <div className="w-6 h-6 bg-spiritual-blue/20 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-xs text-spiritual-blue font-medium">S</span>
                                </div>
                                <div className="w-6 h-6 bg-purple-200 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-xs text-purple-700 font-medium">M</span>
                                </div>
                                <div className="w-6 h-6 bg-green-200 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-xs text-green-700 font-medium">+</span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-600">{group.members} members</span>
                            </div>
                            
                            {/* Organizer Badge */}
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <CheckCircle className="h-3 w-3" />
                              <span>{group.leaders[0]?.role || 'Member'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discover Groups - Enhanced with Filter Bar */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-charcoal">Discover Groups</h2>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search groups..."
                        value={groupFilters.search}
                        onChange={(e) => setGroupFilters({...groupFilters, search: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent text-sm"
                        data-testid="search-groups"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <select
                      value={groupFilters.category}
                      onChange={(e) => setGroupFilters({...groupFilters, category: e.target.value})}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent text-sm min-w-[120px]"
                      data-testid="filter-category"
                    >
                      <option value="All">All Categories</option>
                      <option value="Small Group">Small Groups</option>
                      <option value="Ministry">Ministry</option>
                      <option value="Support">Support</option>
                      <option value="Interest">Interest</option>
                      <option value="Leadership">Leadership</option>
                    </select>

                    {/* Day Filter */}
                    <select
                      value={groupFilters.day}
                      onChange={(e) => setGroupFilters({...groupFilters, day: e.target.value})}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent text-sm min-w-[100px]"
                      data-testid="filter-day"
                    >
                      <option value="All">Any Day</option>
                      <option value="Sun">Sunday</option>
                      <option value="Mon">Monday</option>
                      <option value="Tue">Tuesday</option>
                      <option value="Wed">Wednesday</option>
                      <option value="Thu">Thursday</option>
                      <option value="Fri">Friday</option>
                      <option value="Sat">Saturday</option>
                    </select>

                    {/* Format Filter */}
                    <select
                      value={groupFilters.format}
                      onChange={(e) => setGroupFilters({...groupFilters, format: e.target.value})}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent text-sm min-w-[120px]"
                      data-testid="filter-format"
                    >
                      <option value="All">Any Format</option>
                      <option value="In-person">In-person</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>

                    {/* Campus Filter */}
                    <select
                      value={groupFilters.campus}
                      onChange={(e) => setGroupFilters({...groupFilters, campus: e.target.value})}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent text-sm min-w-[120px]"
                      data-testid="filter-campus"
                    >
                      <option value="All">Any Campus</option>
                      <option value="Main Campus">Main Campus</option>
                      <option value="North Campus">North Campus</option>
                      <option value="Online">Online</option>
                    </select>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGroupFilters({ category: 'All', day: 'All', format: 'All', campus: 'All', search: '' })}
                      className="px-3 py-2 text-sm"
                      data-testid="clear-filters"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>

                {/* Filtered Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredSuggestedGroups.map((group) => {
                    return (
                      <div 
                        key={group.id} 
                        className="rounded-lg border border-gray-200 hover:border-spiritual-blue/30 transition-all duration-200 bg-white shadow-sm hover:shadow-md overflow-hidden cursor-pointer"
                        onClick={() => handleQuickView(group)}
                        data-testid={`discover-group-card-${group.id}`}
                      >
                        {/* Cover Photo */}
                        <div className="h-32 relative overflow-hidden">
                          <img 
                            src={group.coverPhoto} 
                            alt={`${group.name} cover`}
                            className="w-full h-full object-cover"
                          />
                          {/* Profile Photo Overlay */}
                          <div className="absolute bottom-4 left-4">
                            <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-xl border-2 border-white">
                              {group.profilePhoto}
                            </div>
                          </div>
                          {/* Match Percentage Badge */}
                          {group.matchPercentage && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                              {group.matchPercentage}% match
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          {/* Group Name */}
                          <h3 className="font-semibold text-charcoal text-base mb-1">{group.name}</h3>
                          
                          {/* Privacy and Category */}
                          <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                            <span>{group.privacy}</span>
                            <span>•</span>
                            <span>{group.category}</span>
                          </div>

                          {/* Member Avatars and Organizer Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-1">
                                <div className="w-6 h-6 bg-spiritual-blue/20 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-xs text-spiritual-blue font-medium">S</span>
                                </div>
                                <div className="w-6 h-6 bg-purple-200 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-xs text-purple-700 font-medium">M</span>
                                </div>
                                <div className="w-6 h-6 bg-green-200 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-xs text-green-700 font-medium">+</span>
                                </div>
                              </div>
                              <span className="text-sm text-gray-600">{group.members} members</span>
                            </div>
                            
                            {/* Join Button or Organizer Badge */}
                            <div className="flex items-center space-x-1 text-xs">
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs h-7 px-3"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleQuickView(group);
                                }}
                                data-testid={`join-group-${group.id}`}
                              >
                                {group.privacy === 'Private' ? 'Request' : 'Join'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* No Results */}
                {filteredSuggestedGroups.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <Users className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No groups found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestGroupModal(true)}
                      data-testid="request-new-group"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Request a Group
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Create Group Modal */}
          {showCreateGroupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateGroupModal(false)}>
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-charcoal">Create New Group</h2>
                    <button
                      onClick={() => setShowCreateGroupModal(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                      data-testid="close-create-modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">Build community around shared interests and spiritual growth</p>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Group Name */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Group Name *</label>
                      <input
                        type="text"
                        value={newGroupData.name}
                        onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                        placeholder="Enter a descriptive group name"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        data-testid="input-group-name"
                      />
                    </div>
                    
                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Category *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {groupCategories.filter(cat => getCreateGroupPermissions().allowedCategories.includes(cat.id)).map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setNewGroupData({...newGroupData, category: category.id})}
                            className={`p-4 rounded-lg border text-left transition-all ${
                              newGroupData.category === category.id
                                ? 'border-spiritual-blue bg-spiritual-blue/10 ring-2 ring-spiritual-blue/20'
                                : 'border-gray-200 hover:border-spiritual-blue/50'
                            }`}
                            data-testid={`category-${category.id}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <p className="font-medium text-charcoal">{category.name}</p>
                                <p className="text-xs text-gray-600">{category.description}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Privacy Settings */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Privacy Level *</label>
                      <div className="space-y-3">
                        {(['public', 'private', 'secret'] as const).map((visibility) => (
                          <button
                            key={visibility}
                            onClick={() => setNewGroupData({...newGroupData, visibility})}
                            className={`w-full p-4 rounded-lg border text-left transition-all ${
                              newGroupData.visibility === visibility
                                ? 'border-spiritual-blue bg-spiritual-blue/10 ring-2 ring-spiritual-blue/20'
                                : 'border-gray-200 hover:border-spiritual-blue/50'
                            }`}
                            data-testid={`visibility-${visibility}`}
                          >
                            <div className="flex items-center space-x-3">
                              {getVisibilityIcon(visibility)}
                              <div>
                                <p className="font-medium text-charcoal capitalize">{visibility} Group</p>
                                <p className="text-xs text-gray-600">{getVisibilityDescription(visibility)}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                      <textarea
                        value={newGroupData.description}
                        onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                        placeholder="What is this group about? What will members do together?"
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent resize-none"
                        data-testid="input-group-description"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {user?.role && ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF'].includes(user.role) 
                        ? 'Your group will be created immediately'
                        : 'Your group will require approval before going live'
                      }
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateGroupModal(false)}
                        data-testid="cancel-create-group"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateGroup}
                        disabled={!newGroupData.name || !newGroupData.category}
                        className="bg-spiritual-blue hover:bg-purple-700 text-white"
                        data-testid="submit-create-group"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Group
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Request Group Modal */}
          {showRequestGroupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowRequestGroupModal(false)}>
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-charcoal">Request New Group</h2>
                    <button
                      onClick={() => setShowRequestGroupModal(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                      data-testid="close-request-modal"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-1">Submit a request for church leadership to review</p>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Request Notice */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Request Process</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Your request will be reviewed by church leadership. They may contact you for additional details before approval.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Group Name */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Proposed Group Name *</label>
                      <input
                        type="text"
                        value={groupRequest.name}
                        onChange={(e) => setGroupRequest({...groupRequest, name: e.target.value})}
                        placeholder="What would you like to call this group?"
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        data-testid="input-request-name"
                      />
                    </div>
                    
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Category *</label>
                      <select
                        value={groupRequest.category}
                        onChange={(e) => setGroupRequest({...groupRequest, category: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        data-testid="select-request-category"
                      >
                        <option value="">Select a category</option>
                        {groupCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Group Description *</label>
                      <textarea
                        value={groupRequest.description}
                        onChange={(e) => setGroupRequest({...groupRequest, description: e.target.value})}
                        placeholder="Describe what this group is about and what activities you plan"
                        rows={4}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent resize-none"
                        data-testid="input-request-description"
                      />
                    </div>
                    
                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Why is this group needed? *</label>
                      <textarea
                        value={groupRequest.reason}
                        onChange={(e) => setGroupRequest({...groupRequest, reason: e.target.value})}
                        placeholder="Explain the need or opportunity this group addresses in our church community"
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent resize-none"
                        data-testid="input-request-reason"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Leadership will review your request within 1-2 weeks
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowRequestGroupModal(false)}
                        data-testid="cancel-request-group"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRequestGroup}
                        disabled={!groupRequest.name || !groupRequest.category || !groupRequest.description || !groupRequest.reason}
                        className="bg-spiritual-blue hover:bg-purple-700 text-white"
                        data-testid="submit-request-group"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Request
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
      
      {/* Quick View Modal */}
      <QuickViewModal />
      
    </MainLayout>
  );
}