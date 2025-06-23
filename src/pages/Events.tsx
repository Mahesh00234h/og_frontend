import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  category: string;
  isVirtual: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('Events: Cookies before events request:', document.cookie);
        const res = await fetch(`${API_BASE_URL}/events`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        console.log('Events: Events response headers:', Object.fromEntries(res.headers));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
        setEvents(data.events);
      } catch (error: any) {
        console.error('Events: Fetch events error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch events',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  // Filter events based on search query
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine upcoming and past events
  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );
  const completedEvents = filteredEvents.filter(
    (event) => new Date(event.date) < new Date()
  );

  const getTypeColor = (category: string) => {
    switch (category) {
      case 'Workshop':
        return 'bg-blue-600';
      case 'Competition':
        return 'bg-red-600';
      case 'Seminar':
        return 'bg-green-600';
      default:
        return 'bg-purple-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Events</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="text-white border-purple-400">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/create-event')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-400">No upcoming events available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-black/40 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors overflow-hidden"
                >
                  <div className="relative h-48">
                    {/* Note: Backend does not provide images, using placeholder */}
                    <img
                      src="https://images.unsplash.com/photo-1516321310762-479437144403?w=400&h=200&fit=crop"
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getTypeColor(event.category)} text-white`}>
                        {event.category}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-white">{event.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(event.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">
                          {event.location} {event.isVirtual ? '(Virtual)' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                        Register
                      </Button>
                      <Button
                        variant="outline"
                        className="border-purple-500 text-purple-400"
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Past Events</h2>
          {completedEvents.length === 0 ? (
            <p className="text-gray-400">No past events available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-black/40 border-purple-500/20 backdrop-blur-md opacity-75 overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src="https://images.unsplash.com/photo-1516321310762-479437144403?w=400&h=200&fit=crop"
                      alt={event.title}
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gray-600 text-white">Completed</Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-white">{event.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">
                        {new Date(event.date).toLocaleString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-500 text-gray-400"
                      >
                        View Summary
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Events;