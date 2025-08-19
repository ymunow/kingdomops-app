import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Video, Heart, Clock, Share, CalendarPlus, MessageCircle, Bell } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export default function Events() {
  const [rsvpStatuses, setRsvpStatuses] = useState<Record<string, string>>({});
  const [interestedEvents, setInterestedEvents] = useState<string[]>([]);
  
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
      comments: 12
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
      meetingLink: 'https://zoom.us/j/123456789'
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
      comments: 18
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
      comments: 7
    }
  ];

  const categoryConfig = {
    worship: { color: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', name: '🙌 Worship' },
    youth: { color: 'bg-teal-500', badge: 'bg-teal-100 text-teal-700', name: '🎯 Youth' },
    training: { color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', name: '📚 Training' },
    service: { color: 'bg-green-500', badge: 'bg-green-100 text-green-700', name: '🤝 Service' }
  };

  const getTimeUntilEvent = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffMs = event.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffMs < 0) return 'Event passed';
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} away`;
    return 'Starting soon!';
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
          <h1 className="text-3xl font-bold text-charcoal mb-2">Events</h1>
          <p className="text-gray-600">Discover upcoming gatherings and connect with your community</p>
          
          {/* Personalized Recommendations */}
          <div className="mt-4 p-4 bg-gradient-to-r from-spiritual-blue/5 to-purple-50 rounded-lg border border-spiritual-blue/20">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-5 w-5 text-spiritual-blue" />
              <span className="font-medium text-spiritual-blue">Recommended for you</span>
            </div>
            <p className="text-sm text-gray-700">
              Based on your spiritual gifts and interests, we think you'll love the <span className="font-medium">Small Group Leader Training</span> and <span className="font-medium">Community Outreach Day</span>.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {upcomingEvents.map((event) => {
            const category = categoryConfig[event.category as keyof typeof categoryConfig];
            const isAttending = rsvpStatuses[event.id] === 'attending';
            const isInterested = interestedEvents.includes(event.id);
            const timeUntil = getTimeUntilEvent(event.date);
            
            return (
              <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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
                  
                  {/* Countdown Timer */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{timeUntil}</span>
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

                  {/* Attendee Preview */}
                  <div className="flex items-center justify-between mb-4">
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
                    
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{event.comments}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <Button 
                      onClick={() => handleRSVP(event.id)}
                      className={`flex-1 transition-all duration-200 ${
                        isAttending
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gradient-to-r from-spiritual-blue to-purple-700 hover:from-spiritual-blue/90 hover:to-purple-700/90 text-white'
                      }`}
                      data-testid={`rsvp-${event.id}`}
                    >
                      {isAttending ? (
                        <>
                          ✓ Attending
                        </>
                      ) : (
                        'RSVP'
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => handleInterested(event.id)}
                      className={`transition-all duration-200 ${
                        isInterested ? 'bg-red-50 border-red-200 text-red-600' : 'hover:bg-gray-50'
                      }`}
                      data-testid={`interested-${event.id}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${isInterested ? 'fill-current' : ''}`} />
                      {isInterested ? 'Interested' : 'Interested'}
                    </Button>
                    
                    <Button variant="outline" size="sm" data-testid={`add-calendar-${event.id}`}>
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm" data-testid={`share-${event.id}`}>
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Virtual Event Join Button */}
                  {event.isVirtual && event.meetingLink && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Virtual Meeting Ready</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid={`join-meeting-${event.id}`}
                        >
                          Join Meeting
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Comments Preview */}
                  {event.comments > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{event.comments} comments</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-spiritual-blue">
                          View Discussion
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}