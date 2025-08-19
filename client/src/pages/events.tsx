import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Video, Heart, Clock, Share, CalendarPlus, MessageCircle, Bell, Grid3x3, List, ChevronLeft, ChevronRight, Plus, Shield, Crown, UserCheck, AlertCircle, X, CheckCircle, Repeat, Settings } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function Events() {
  const [rsvpStatuses, setRsvpStatuses] = useState<Record<string, string | null>>({});
  const [interestedEvents, setInterestedEvents] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showSuggestEventModal, setShowSuggestEventModal] = useState(false);
  const [newEventData, setNewEventData] = useState({ name: '', description: '', category: '', date: '', time: '', location: '', recurring: false, frequency: '', scope: 'group' });
  const [eventSuggestion, setEventSuggestion] = useState({ name: '', description: '', date: '', time: '', location: '', reason: '', recurring: false, frequency: '' });
  
  // Mock user data - in real app this comes from auth
  const user = { role: 'GROUP_LEADER' }; // Can be CHURCH_MEMBER, GROUP_LEADER, PASTORAL_STAFF, SUPER_ADMIN, etc.
  
  // Mock pending event requests for admins
  const pendingEventRequests = [
    { id: '1', name: 'Youth Pizza Night', category: 'Youth', requester: 'Sarah Johnson', group: 'Youth Ministry', reason: 'Monthly fellowship for teens', status: 'pending', scope: 'church-wide' },
    { id: '2', name: 'Men\'s Bible Study', category: 'Small Group', requester: 'Mike Davis', group: 'Men\'s Ministry', reason: 'Weekly study for spiritual growth', status: 'pending', scope: 'group' }
  ];
  
  // Permission functions
  const canCreateEvents = () => {
    return ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF', 'GROUP_LEADER'].includes(user?.role || '');
  };
  
  const canApproveChurchWideEvents = () => {
    return ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF'].includes(user?.role || '');
  };
  
  const canManageEventRequests = () => {
    return ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF', 'GROUP_LEADER'].includes(user?.role || '');
  };
  
  const handleCreateEvent = () => {
    console.log('Creating event:', newEventData);
    setShowCreateEventModal(false);
    setNewEventData({ name: '', description: '', category: '', date: '', time: '', location: '', recurring: false, frequency: '', scope: 'group' });
  };
  
  const handleSuggestEvent = () => {
    console.log('Suggesting event:', eventSuggestion);
    setShowSuggestEventModal(false);
    setEventSuggestion({ name: '', description: '', date: '', time: '', location: '', reason: '', recurring: false, frequency: '' });
  };
  
  const handleApproveEventRequest = (requestId: string) => {
    console.log('Approving event request:', requestId);
  };
  
  const handleRejectEventRequest = (requestId: string) => {
    console.log('Rejecting event request:', requestId);
  };
  
  const eventCategories = [
    { id: 'worship', name: 'Worship Service', icon: '🙌', description: 'Sunday services and special worship events' },
    { id: 'youth', name: 'Youth Ministry', icon: '🎯', description: 'Programs and activities for teens and young adults' },
    { id: 'training', name: 'Training & Education', icon: '📚', description: 'Leadership development and learning opportunities' },
    { id: 'service', name: 'Community Service', icon: '🤝', description: 'Outreach and volunteer opportunities' },
    { id: 'fellowship', name: 'Fellowship', icon: '🍞', description: 'Social gatherings and community building' },
    { id: 'prayer', name: 'Prayer & Spiritual', icon: '🙏', description: 'Prayer meetings and spiritual growth events' }
  ];
  
  const getCreateEventPermissions = () => {
    const role = user?.role;
    if (['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN'].includes(role || '')) {
      return { allowedCategories: eventCategories.map(c => c.id), canPromoteChurchWide: true };
    }
    if (role === 'PASTORAL_STAFF') {
      return { allowedCategories: eventCategories.map(c => c.id), canPromoteChurchWide: true };
    }
    if (role === 'GROUP_LEADER') {
      return { allowedCategories: ['fellowship', 'training', 'service', 'prayer'], canPromoteChurchWide: false };
    }
    return { allowedCategories: [], canPromoteChurchWide: false };
  };
  
  const upcomingEvents = [
    {
      id: '1',
      title: 'Sunday Worship Service',
      description: 'Join us for inspiring worship, biblical teaching, and community fellowship.',
      date: '2025-08-20T10:00:00Z',
      displayDate: 'Tomorrow, 10:00 AM',
      location: 'Main Sanctuary',
      attendees: 150,
      interested: 23,
      isVirtual: false,
      category: 'worship',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
      attendeeAvatars: ['JD', 'SM', 'ER', 'MK', 'AL'],
      comments: 12,
      friendsAttending: ['Sarah Miller', 'John Davis'],
      hasPhotos: true,
      isFeatured: false
    },
    {
      id: '2',
      title: 'Small Group Leader Training',
      description: 'Equip yourself with tools and strategies for effective small group leadership.',
      date: '2025-08-26T19:00:00Z',
      displayDate: 'Next Week, 7:00 PM',
      location: 'Online Meeting',
      attendees: 25,
      interested: 8,
      isVirtual: true,
      category: 'training',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=200&fit=crop',
      attendeeAvatars: ['BC', 'DT', 'NG', 'PW'],
      comments: 5,
      meetingLink: 'https://zoom.us/j/123456789',
      friendsAttending: ['David Thompson'],
      hasPhotos: false,
      isFeatured: true
    },
    {
      id: '3',
      title: 'Youth Game Night 🎉',
      description: 'Fun games, snacks, and fellowship for teens and young adults.',
      date: '2025-08-22T18:30:00Z',
      displayDate: 'Friday, 6:30 PM',
      location: 'Fellowship Hall',
      attendees: 40,
      interested: 15,
      isVirtual: false,
      category: 'youth',
      image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=200&fit=crop',
      attendeeAvatars: ['TC', 'LM', 'KS', 'RH', 'JB'],
      comments: 18,
      friendsAttending: ['Katie Smith', 'Ryan Harris', 'Lucy Martinez'],
      hasPhotos: true,
      isFeatured: false
    },
    {
      id: '4',
      title: 'Community Outreach Day',
      description: 'Serve our neighborhood with food distribution and community care.',
      date: '2025-08-30T09:00:00Z',
      displayDate: 'Next Saturday, 9:00 AM',
      location: 'Community Center',
      attendees: 65,
      interested: 32,
      isVirtual: false,
      category: 'service',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=200&fit=crop',
      attendeeAvatars: ['MM', 'SF', 'CL', 'BK'],
      comments: 7,
      friendsAttending: ['Mark Miller'],
      hasPhotos: false,
      isFeatured: false
    }
  ];

  const categoryConfig = {
    worship: { color: 'bg-purple-500', badge: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300', name: '🙌 Worship' },
    youth: { color: 'bg-teal-500', badge: 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300', name: '🎯 Youth' },
    training: { color: 'bg-blue-500', badge: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300', name: '📚 Training' },
    service: { color: 'bg-green-500', badge: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300', name: '🤝 Service' }
  };

  const getTimeUntilEvent = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffMs = event.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffMs < 0) return { text: 'Event passed', urgent: false };
    if (diffDays > 0) return { text: `${diffDays}d ${diffHours}h left`, urgent: diffDays === 1 };
    if (diffHours > 0) return { text: `${diffHours}h ${diffMinutes}m left`, urgent: diffHours <= 6 };
    if (diffMinutes > 0) return { text: `${diffMinutes}m left`, urgent: true };
    return { text: 'Starting now!', urgent: true };
  };

  const handleRSVP = (eventId: string) => {
    setRsvpStatuses(prev => ({
      ...prev,
      [eventId]: prev[eventId] === 'attending' ? null : 'attending'
    }));
  };

  const handleInterested = (eventId: string) => {
    setInterestedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">Events</h1>
              <p className="text-gray-600">Discover upcoming gatherings and connect with your community</p>
            </div>
            
            {/* Create Event Action */}
            <div className="flex items-center space-x-2">
              {canCreateEvents() ? (
                <Button 
                  onClick={() => setShowCreateEventModal(true)}
                  className="bg-spiritual-blue hover:bg-purple-700 text-white shadow-lg"
                  data-testid="create-event-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowSuggestEventModal(true)}
                  variant="outline"
                  className="border-spiritual-blue text-spiritual-blue hover:bg-spiritual-blue/10 shadow-lg"
                  data-testid="suggest-event-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Suggest Event
                </Button>
              )}
              
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={`${
                  viewMode === 'cards' 
                    ? 'bg-white shadow-sm text-spiritual-blue' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                data-testid="view-cards"
              >
                <List className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={`${
                  viewMode === 'calendar' 
                    ? 'bg-white shadow-sm text-spiritual-blue' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                data-testid="view-calendar"
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              </div>
            </div>
          </div>
          
          {/* Event Creation Permission Guide */}
          <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/50 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-spiritual-blue to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <CalendarPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal">Event Creation</h3>
                <p className="text-sm text-gray-600">
                  {user?.role === 'SUPER_ADMIN' || user?.role === 'CHURCH_SUPER_ADMIN' ? 'Full event creation and church-wide promotion access' :
                   user?.role === 'PASTORAL_STAFF' ? 'Create and approve church-wide events' :
                   user?.role === 'GROUP_LEADER' ? 'Create group events, request church-wide promotion' :
                   'Suggest events for group leader approval'}
                </p>
              </div>
              {user?.role && ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF'].includes(user.role) && (
                <Badge className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300 shadow-sm">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin Access
                </Badge>
              )}
            </div>
            
            {/* Permission Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-4 rounded-xl border transition-all duration-200 ${user?.role === 'SUPER_ADMIN' || user?.role === 'CHURCH_SUPER_ADMIN' ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-md' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
                <Crown className="h-5 w-5 text-amber-600 mb-2" />
                <p className="text-sm font-medium text-charcoal">Admin/Pastor</p>
                <p className="text-xs text-gray-600">All events + conflicts</p>
              </div>
              <div className={`p-4 rounded-xl border transition-all duration-200 ${user?.role === 'GROUP_LEADER' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
                <Shield className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-charcoal">Group Leaders</p>
                <p className="text-xs text-gray-600">Group events + approval</p>
              </div>
              <div className={`p-4 rounded-xl border transition-all duration-200 ${user?.role && ['CHURCH_MEMBER', 'VOLUNTEER'].includes(user.role) ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'}`}>
                <UserCheck className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-charcoal">Members</p>
                <p className="text-xs text-gray-600">Suggest only</p>
              </div>
              <div className="p-4 rounded-xl border bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md">
                <Repeat className="h-5 w-5 text-orange-600 mb-2" />
                <p className="text-sm font-medium text-charcoal">Recurring Events</p>
                <p className="text-xs text-gray-600">Series management</p>
              </div>
            </div>
          </div>
          
          {/* Admin Pending Event Requests */}
          {canManageEventRequests() && pendingEventRequests.length > 0 && (
            <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Pending Event Requests</h3>
                  <p className="text-sm text-amber-700">{pendingEventRequests.length} events awaiting approval</p>
                </div>
              </div>
              <div className="space-y-4">
                {pendingEventRequests.filter(req => req.status === 'pending').map((request) => (
                  <div key={request.id} className="p-5 bg-white rounded-xl border border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-charcoal">{request.name}</h4>
                          <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">{request.category}</Badge>
                          {request.scope === 'church-wide' && (
                            <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                              <Crown className="h-3 w-3 mr-1" />
                              Church-Wide
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Requested by: <span className="font-medium text-charcoal">{request.requester}</span> from <span className="font-medium">{request.group}</span></p>
                        <p className="text-sm text-gray-700 leading-relaxed">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                        onClick={() => handleApproveEventRequest(request.id)}
                        data-testid={`approve-event-${request.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                        onClick={() => handleRejectEventRequest(request.id)}
                        data-testid={`reject-event-${request.id}`}
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
          
          {/* Personalized Recommendations - Only show in cards view */}
          {viewMode === 'cards' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-spiritual-blue/5 to-purple-50 rounded-lg border border-spiritual-blue/20">
              <div className="flex items-center space-x-2 mb-2">
                <Bell className="h-5 w-5 text-spiritual-blue" />
                <span className="font-medium text-spiritual-blue">Recommended for you</span>
              </div>
              <p className="text-sm text-gray-700">
                Based on your spiritual gifts and interests, we think you'll love the <span className="font-medium">Small Group Leader Training</span> and <span className="font-medium">Community Outreach Day</span>.
              </p>
            </div>
          )}
        </div>

        {/* Featured Event Banner - Only show in cards view */}
        {viewMode === 'cards' && upcomingEvents.some(event => event.isFeatured) && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">🔥</span>
              <h3 className="font-bold text-lg">Don't Miss This Week's Featured Event!</h3>
            </div>
            <p className="text-white/90">
              {upcomingEvents.find(event => event.isFeatured)?.title} - Leadership training that will transform your ministry approach
            </p>
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-spiritual-blue/5 to-purple-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                data-testid="prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-xl font-bold text-charcoal">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                data-testid="next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Calendar Grid */}
            <div className="p-4">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const monthStart = startOfMonth(currentMonth);
                  const monthEnd = endOfMonth(monthStart);
                  const startDate = startOfWeek(monthStart);
                  const endDate = endOfWeek(monthEnd);
                  
                  const days = [];
                  let day = startDate;
                  
                  while (day <= endDate) {
                    const currentDay = day;
                    const dayEvents = upcomingEvents.filter(event => 
                      isSameDay(new Date(event.date), currentDay)
                    );
                    
                    days.push(
                      <div
                        key={day.toString()}
                        className={`min-h-[100px] p-2 border border-gray-100 rounded-lg ${
                          !isSameMonth(day, currentMonth) 
                            ? 'bg-gray-50 text-gray-400'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isSameDay(day, new Date()) 
                            ? 'text-spiritual-blue font-bold'
                            : 'text-gray-700'
                        }`}>
                          {format(day, 'd')}
                        </div>
                        
                        {/* Events for this day */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => {
                            const category = categoryConfig[event.category as keyof typeof categoryConfig];
                            return (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 ${category.color}`}
                                title={event.title}
                                onClick={() => setSelectedEvent(event)}
                                data-testid={`calendar-event-${event.id}`}
                              >
                                {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    
                    day = addDays(day, 1);
                  }
                  
                  return days;
                })()}
              </div>
            </div>
          </div>
        )}
        
        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="space-y-6">
          {upcomingEvents.map((event) => {
            const category = categoryConfig[event.category as keyof typeof categoryConfig];
            const isAttending = rsvpStatuses[event.id] === 'attending';
            const isInterested = interestedEvents.includes(event.id);
            const timeUntil = getTimeUntilEvent(event.date);
            
            return (
              <div key={event.id} className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
                event.isFeatured 
                  ? 'border-orange-200 shadow-orange-100' 
                  : category.color === 'bg-purple-500' 
                    ? 'border-purple-100 hover:border-purple-200'
                    : category.color === 'bg-teal-500'
                      ? 'border-teal-100 hover:border-teal-200'
                      : category.color === 'bg-blue-500'
                        ? 'border-blue-100 hover:border-blue-200'
                        : 'border-green-100 hover:border-green-200'
              }`}>
                {/* Event Banner Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${category.badge} font-medium`}>
                      {category.name}
                    </Badge>
                  </div>
                  
                  {/* Enhanced Countdown Timer */}
                  <div className="absolute top-4 right-4">
                    <div className={`backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium flex items-center space-x-1 ${
                      timeUntil.urgent 
                        ? 'bg-red-500/90 text-white animate-pulse'
                        : 'bg-white/90 text-gray-700'
                    }`}>
                      <Clock className="h-3 w-3" />
                      <span>{timeUntil.text}</span>
                    </div>
                  </div>
                  
                  {/* Event Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-white/90 text-sm">{event.description}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  {/* Date and Location */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-12 rounded-lg bg-spiritual-blue/10 flex flex-col items-center justify-center">
                        <span className="text-xs font-medium text-spiritual-blue">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-lg font-bold text-spiritual-blue">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-charcoal">{event.displayDate}</p>
                        <div className="flex items-center space-x-1 text-gray-600">
                          {event.isVirtual ? (
                            <>
                              <Video className="h-4 w-4" />
                              <span className="text-sm">Virtual Event</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Attendee Preview with Friends */}
                  <div className="space-y-3 mb-4">
                    {/* Friends Attending */}
                    {event.friendsAttending && event.friendsAttending.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Your friends are going: {event.friendsAttending.slice(0, 2).join(', ')}
                            {event.friendsAttending.length > 2 && ` +${event.friendsAttending.length - 2} more`}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Regular Attendee Preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {event.attendeeAvatars.slice(0, 5).map((initials, index) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-white">
                              <AvatarFallback className="bg-spiritual-blue/10 text-spiritual-blue text-xs font-medium">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {event.attendees > 5 && (
                            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">+{event.attendees - 5}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{event.attendees}</span> attending
                          {event.interested > 0 && (
                            <span className="ml-2">• <span className="font-medium">{event.interested}</span> interested</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{event.comments}</span>
                        </div>
                        {event.hasPhotos && (
                          <div className="flex items-center space-x-1">
                            <span className="text-sm">📷</span>
                            <span className="text-sm">Photos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button 
                      onClick={() => handleRSVP(event.id)}
                      className={`transition-all duration-200 ${
                        isAttending
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200'
                          : 'bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-spiritual-blue/90 hover:to-purple-700/90 text-white shadow-lg shadow-purple-200'
                      }`}
                      data-testid={`rsvp-${event.id}`}
                    >
                      {isAttending ? (
                        <>
                          ✓ Attending
                        </>
                      ) : (
                        'RSVP Now'
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => handleInterested(event.id)}
                      className={`transition-all duration-200 ${
                        isInterested ? 'bg-red-50 border-red-200 text-red-600 shadow-lg shadow-red-100' : 'hover:bg-gray-50'
                      }`}
                      data-testid={`interested-${event.id}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isInterested ? 'fill-current' : ''}`} />
                      Interested
                    </Button>
                  </div>
                  
                  {/* Secondary Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-gray-50 hover:bg-gray-100"
                      data-testid={`add-calendar-${event.id}`}
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-gray-50 hover:bg-gray-100"
                      data-testid={`share-${event.id}`}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share Event
                    </Button>
                  </div>

                  {/* Enhanced Virtual Event Join Button */}
                  {event.isVirtual && event.meetingLink && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border-2 border-emerald-200 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Video className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-bold text-emerald-800 block">Virtual Meeting Ready</span>
                            <span className="text-sm text-emerald-600">One-click to join when it starts</span>
                          </div>
                        </div>
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold shadow-lg shadow-emerald-200 px-6"
                          data-testid={`join-meeting-${event.id}`}
                        >
                          <Video className="h-5 w-5 mr-2" />
                          Join Meeting
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Comments & Discussion */}
                  {event.comments > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{event.comments} comments</span>
                          {event.hasPhotos && (
                            <span className="text-sm text-gray-500">• Photos shared</span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-spiritual-blue hover:bg-spiritual-blue/10">
                          View Discussion
                        </Button>
                      </div>
                      
                      {/* Quick Comment Preview */}
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-spiritual-blue/10 text-spiritual-blue text-xs">SM</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-700">Sarah Miller</span>
                          <span className="text-gray-500">2h ago</span>
                        </div>
                        <p className="text-gray-600 ml-7">
                          {event.category === 'youth' ? 'Can I bring my sister? She loves game nights!' :
                           event.category === 'training' ? 'Looking forward to learning new leadership skills!' :
                           event.category === 'worship' ? 'Excited for this week\'s worship theme! 🙌' :
                           'Count our family in! We love serving the community.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
        
        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Event Image Header */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`${categoryConfig[selectedEvent.category as keyof typeof categoryConfig].badge} font-medium`}>
                    {categoryConfig[selectedEvent.category as keyof typeof categoryConfig].name}
                  </Badge>
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  data-testid="close-event-modal"
                >
                  ✕
                </button>
                
                {/* Event Title */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{selectedEvent.title}</h3>
                  <p className="text-white/90 text-sm">{selectedEvent.description}</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                {/* Date and Location */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-spiritual-blue" />
                    <span className="font-medium text-charcoal">{selectedEvent.displayDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedEvent.isVirtual ? (
                      <>
                        <Video className="h-5 w-5 text-spiritual-blue" />
                        <span className="text-gray-600">Virtual</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 text-spiritual-blue" />
                        <span className="text-gray-600">{selectedEvent.location}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Attendee Info */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{selectedEvent.attendees} attending</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{selectedEvent.interested} interested</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{selectedEvent.comments} comments</span>
                  </div>
                </div>

                {/* Friends Attending */}
                {selectedEvent.friendsAttending && selectedEvent.friendsAttending.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Your friends: {selectedEvent.friendsAttending.slice(0, 2).join(', ')}
                        {selectedEvent.friendsAttending.length > 2 && ` +${selectedEvent.friendsAttending.length - 2} more`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button 
                    onClick={() => handleRSVP(selectedEvent.id)}
                    className={`transition-all duration-200 ${
                      rsvpStatuses[selectedEvent.id] === 'attending'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-spiritual-blue/90 hover:to-purple-700/90 text-white'
                    }`}
                    data-testid={`modal-rsvp-${selectedEvent.id}`}
                  >
                    {rsvpStatuses[selectedEvent.id] === 'attending' ? '✓ Attending' : 'RSVP Now'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleInterested(selectedEvent.id)}
                    className={`transition-all duration-200 ${
                      interestedEvents.includes(selectedEvent.id) ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-gray-50'
                    }`}
                    data-testid={`modal-interested-${selectedEvent.id}`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${interestedEvents.includes(selectedEvent.id) ? 'fill-current' : ''}`} />
                    Interested
                  </Button>
                </div>
                
                {/* Secondary Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setViewMode('cards');
                      setSelectedEvent(null);
                    }}
                    className="flex-1"
                    data-testid="view-full-details"
                  >
                    Full Details
                  </Button>
                </div>

                {/* Virtual Meeting Button */}
                {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium"
                      data-testid={`modal-join-meeting-${selectedEvent.id}`}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Virtual Meeting
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateEventModal(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-charcoal">Create New Event</h2>
                  <button
                    onClick={() => setShowCreateEventModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                    data-testid="close-create-event-modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">Build community through meaningful gatherings and shared experiences</p>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Event Name *</label>
                    <input
                      type="text"
                      value={newEventData.name}
                      onChange={(e) => setNewEventData({...newEventData, name: e.target.value})}
                      placeholder="Enter a descriptive event name"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                      data-testid="input-event-name"
                    />
                  </div>
                  
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Category *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {eventCategories.filter(cat => getCreateEventPermissions().allowedCategories.includes(cat.id)).map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setNewEventData({...newEventData, category: category.id})}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            newEventData.category === category.id
                              ? 'border-spiritual-blue bg-spiritual-blue/10 ring-2 ring-spiritual-blue/20'
                              : 'border-gray-200 hover:border-spiritual-blue/50'
                          }`}
                          data-testid={`event-category-${category.id}`}
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
                  
                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Date *</label>
                      <input
                        type="date"
                        value={newEventData.date}
                        onChange={(e) => setNewEventData({...newEventData, date: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        data-testid="input-event-date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Time *</label>
                      <input
                        type="time"
                        value={newEventData.time}
                        onChange={(e) => setNewEventData({...newEventData, time: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        data-testid="input-event-time"
                      />
                    </div>
                  </div>
                  
                  {/* Recurring Event */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEventData.recurring}
                        onChange={(e) => setNewEventData({...newEventData, recurring: e.target.checked})}
                        className="w-5 h-5 text-spiritual-blue rounded focus:ring-spiritual-blue"
                        data-testid="checkbox-recurring"
                      />
                      <div>
                        <span className="font-medium text-charcoal">Recurring Event</span>
                        <p className="text-sm text-gray-600">This event repeats on a schedule</p>
                      </div>
                    </label>
                    
                    {newEventData.recurring && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-charcoal mb-2">Frequency</label>
                        <select
                          value={newEventData.frequency}
                          onChange={(e) => setNewEventData({...newEventData, frequency: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                          data-testid="select-frequency"
                        >
                          <option value="">Select frequency</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Location</label>
                    <input
                      type="text"
                      value={newEventData.location}
                      onChange={(e) => setNewEventData({...newEventData, location: e.target.value})}
                      placeholder="Where will this event take place?"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                      data-testid="input-event-location"
                    />
                  </div>
                  
                  {/* Scope Selection for Group Leaders */}
                  {user?.role === 'GROUP_LEADER' && (
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Event Scope</label>
                      <div className="space-y-3">
                        <button
                          onClick={() => setNewEventData({...newEventData, scope: 'group'})}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            newEventData.scope === 'group'
                              ? 'border-spiritual-blue bg-spiritual-blue/10 ring-2 ring-spiritual-blue/20'
                              : 'border-gray-200 hover:border-spiritual-blue/50'
                          }`}
                          data-testid="scope-group"
                        >
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-charcoal">Group Only</p>
                              <p className="text-xs text-gray-600">Event visible only to your group members</p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => setNewEventData({...newEventData, scope: 'church-wide'})}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            newEventData.scope === 'church-wide'
                              ? 'border-spiritual-blue bg-spiritual-blue/10 ring-2 ring-spiritual-blue/20'
                              : 'border-gray-200 hover:border-spiritual-blue/50'
                          }`}
                          data-testid="scope-church-wide"
                        >
                          <div className="flex items-center space-x-3">
                            <Crown className="h-5 w-5 text-amber-600" />
                            <div>
                              <p className="font-medium text-charcoal">Promote Church-Wide</p>
                              <p className="text-xs text-gray-600">Request to promote to entire church (requires admin approval)</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                    <textarea
                      value={newEventData.description}
                      onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                      placeholder="What can attendees expect from this event?"
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent resize-none"
                      data-testid="input-event-description"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {user?.role && ['SUPER_ADMIN', 'CHURCH_SUPER_ADMIN', 'PASTORAL_STAFF'].includes(user.role) 
                      ? 'Your event will be created immediately'
                      : newEventData.scope === 'church-wide' 
                        ? 'Church-wide events require admin approval'
                        : 'Your group event will be created immediately'
                    }
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateEventModal(false)}
                      data-testid="cancel-create-event"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateEvent}
                      disabled={!newEventData.name || !newEventData.category || !newEventData.date || !newEventData.time}
                      className="bg-spiritual-blue hover:bg-purple-700 text-white"
                      data-testid="submit-create-event"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Suggest Event Modal */}
        {showSuggestEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowSuggestEventModal(false)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-charcoal">Suggest New Event</h2>
                  <button
                    onClick={() => setShowSuggestEventModal(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                    data-testid="close-suggest-event-modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">Submit an event suggestion for your group leader to review</p>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Suggestion Notice */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Suggestion Process</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Your group leader will review this suggestion and may approve it as a group event or request church-wide promotion.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Proposed Event Name *</label>
                    <input
                      type="text"
                      value={eventSuggestion.name}
                      onChange={(e) => setEventSuggestion({...eventSuggestion, name: e.target.value})}
                      placeholder="What would you like to call this event?"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                      data-testid="input-suggestion-name"
                    />
                  </div>
                  
                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Proposed Date *</label>
                      <input
                        type="date"
                        value={eventSuggestion.date}
                        onChange={(e) => setEventSuggestion({...eventSuggestion, date: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        data-testid="input-suggestion-date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Proposed Time *</label>
                      <input
                        type="time"
                        value={eventSuggestion.time}
                        onChange={(e) => setEventSuggestion({...eventSuggestion, time: e.target.value})}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                        data-testid="input-suggestion-time"
                      />
                    </div>
                  </div>
                  
                  {/* Recurring Option */}
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventSuggestion.recurring}
                        onChange={(e) => setEventSuggestion({...eventSuggestion, recurring: e.target.checked})}
                        className="w-5 h-5 text-spiritual-blue rounded focus:ring-spiritual-blue"
                        data-testid="checkbox-suggestion-recurring"
                      />
                      <div>
                        <span className="font-medium text-charcoal">Recurring Event</span>
                        <p className="text-sm text-gray-600">This event would repeat on a schedule</p>
                      </div>
                    </label>
                    
                    {eventSuggestion.recurring && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-charcoal mb-2">Suggested Frequency</label>
                        <select
                          value={eventSuggestion.frequency}
                          onChange={(e) => setEventSuggestion({...eventSuggestion, frequency: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                          data-testid="select-suggestion-frequency"
                        >
                          <option value="">Select frequency</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Suggested Location</label>
                    <input
                      type="text"
                      value={eventSuggestion.location}
                      onChange={(e) => setEventSuggestion({...eventSuggestion, location: e.target.value})}
                      placeholder="Where should this event take place?"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent"
                      data-testid="input-suggestion-location"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Event Description *</label>
                    <textarea
                      value={eventSuggestion.description}
                      onChange={(e) => setEventSuggestion({...eventSuggestion, description: e.target.value})}
                      placeholder="Describe what this event is about and what activities are planned"
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent resize-none"
                      data-testid="input-suggestion-description"
                    />
                  </div>
                  
                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Why is this event needed? *</label>
                    <textarea
                      value={eventSuggestion.reason}
                      onChange={(e) => setEventSuggestion({...eventSuggestion, reason: e.target.value})}
                      placeholder="Explain how this event would benefit the group or church community"
                      rows={3}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-spiritual-blue focus:border-transparent resize-none"
                      data-testid="input-suggestion-reason"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Your group leader will review this suggestion within 1-2 weeks
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowSuggestEventModal(false)}
                      data-testid="cancel-suggest-event"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSuggestEvent}
                      disabled={!eventSuggestion.name || !eventSuggestion.date || !eventSuggestion.time || !eventSuggestion.description || !eventSuggestion.reason}
                      className="bg-spiritual-blue hover:bg-purple-700 text-white"
                      data-testid="submit-suggest-event"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Submit Suggestion
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}