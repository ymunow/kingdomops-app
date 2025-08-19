import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Video, Heart, Clock, Share, CalendarPlus, MessageCircle, Bell, Grid3x3, List, ChevronLeft, ChevronRight } from 'lucide-react';
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
      </div>
    </MainLayout>
  );
}