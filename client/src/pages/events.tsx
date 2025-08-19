import React from 'react';
import { Calendar, MapPin, Users, Video } from 'lucide-react';
import { MainLayout } from '@/components/navigation/main-layout';
import { Button } from '@/components/ui/button';

export default function Events() {
  const upcomingEvents = [
    {
      id: '1',
      title: 'Sunday Worship Service',
      date: 'Tomorrow, 10:00 AM',
      location: 'Main Sanctuary',
      attendees: 150,
      isVirtual: false,
      rsvpStatus: null
    },
    {
      id: '2',
      title: 'Small Group Training',
      date: 'Next Week, 7:00 PM',
      location: 'Online Meeting',
      attendees: 25,
      isVirtual: true,
      rsvpStatus: 'attending'
    },
    {
      id: '3',
      title: 'Youth Game Night',
      date: 'Friday, 6:30 PM',
      location: 'Fellowship Hall',
      attendees: 40,
      isVirtual: false,
      rsvpStatus: 'interested'
    }
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">Events</h1>
          <p className="text-gray-600">Discover upcoming gatherings and activities</p>
        </div>

        <div className="space-y-6">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-charcoal mb-2">{event.title}</h3>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {event.isVirtual ? (
                        <>
                          <Video className="h-4 w-4" />
                          <span className="text-sm">Virtual</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{event.attendees} attending</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {event.rsvpStatus === 'attending' ? (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    ✓ Attending
                  </Button>
                ) : event.rsvpStatus === 'interested' ? (
                  <Button variant="outline" size="sm">
                    Interested
                  </Button>
                ) : (
                  <>
                    <Button size="sm" data-testid={`rsvp-${event.id}`}>
                      RSVP
                    </Button>
                    <Button variant="outline" size="sm">
                      Maybe
                    </Button>
                  </>
                )}
                {event.isVirtual && (
                  <Button variant="ghost" size="sm" className="text-spiritual-blue">
                    Join Meeting
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}