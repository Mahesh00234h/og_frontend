import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Image as ImageIcon, Sun, Moon, Settings, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  category: string;
  isVirtual: boolean;
  isUpcoming: boolean;
  rsvpCount: number;
}

interface GalleryImage {
  id: string;
  eventId: string;
  url: string;
  description: string;
  uploadedAt: string;
}

const EventsAndGallery: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpData, setRsvpData] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setEvents(data.events);
      } catch (error) {
        console.error('EventsAndGallery: Fetch events error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch events',
          variant: 'destructive',
        });
      }
    };

    const fetchGalleryImages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/gallery`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGalleryImages(data.images);
      } catch (error) {
        console.error('EventsAndGallery: Fetch gallery images error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch gallery images',
          variant: 'destructive',
        });
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchGalleryImages()]);
      setLoading(false);
    };

    loadData();
  }, [toast]);

  const handleRsvp = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`${API_BASE_URL}/events/${selectedEvent.id}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(rsvpData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id ? { ...event, rsvpCount: event.rsvpCount + 1 } : event
        )
      );
      setIsRsvpModalOpen(false);
      setRsvpData({ name: '', email: '' });
      setSelectedEvent(null);
      toast({
        title: 'Success',
        description: `Successfully registered for ${selectedEvent.title}`,
      });
    } catch (error: any) {
      console.error('EventsAndGallery: RSVP error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to register for event',
        variant: 'destructive',
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
            : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'
        } flex justify-center items-center`}
      >
        <OGLoader />
      </div>
    );
  }

  const upcomingEvents = events.filter((event) => event.isUpcoming);
  const pastEvents = events.filter((event) => !event.isUpcoming);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
          : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'
        } overflow-x-hidden transition-colors duration-300`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'
        } backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1
              className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Events & Gallery
            </h1>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/members')}
                aria-label="Members"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/settings')}
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 space-y-6">
        {/* Upcoming Events */}
        <Card
          className={`${
            isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
          } backdrop-blur-sm`}
        >
          <CardHeader>
            <CardTitle
              className={`${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } text-lg sm:text-xl flex items-center`}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Events
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Register for upcoming events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No upcoming events
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map((event) => (
                  <Card
                    key={event.id}
                    className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                  >
                    <div className="flex flex-col space-y-3">
                      <span
                        className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        } text-sm font-semibold`}
                      >
                        {event.title}
                      </span>
                      <p
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                      >
                        {event.description}
                      </p>
                      <Badge className="text-xs w-fit">{event.category}</Badge>
                      <div className="flex items-center space-x-2">
                        <Calendar
                          className={`h-4 w-4 ${
                            isDarkMode ? 'text-cyan-400' : 'text-blue-500'
                          }`}
                        />
                        <span
                          className={`${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          } text-sm`}
                        >
                          {new Date(event.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users
                          className={`h-4 w-4 ${
                            isDarkMode ? 'text-cyan-400' : 'text-blue-500'
                          }`}
                        />
                        <span
                          className={`${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          } text-sm`}
                        >
                          {event.rsvpCount} RSVPs
                        </span>
                      </div>
                      <p
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                      >
                        {event.location} {event.isVirtual ? '(Virtual)' : ''}
                      </p>
                      <Button
                        className={`${
                          isDarkMode
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                        } text-white text-sm h-9`}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsRsvpModalOpen(true);
                        }}
                      >
                        RSVP
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Events */}
        <Card
          className={`${
            isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
          } backdrop-blur-sm`}
        >
          <CardHeader>
            <CardTitle
              className={`${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } text-lg sm:text-xl flex items-center`}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Past Events
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Explore our past events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pastEvents.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No past events
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastEvents.map((event) => (
                  <Card
                    key={event.id}
                    className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                  >
                    <div className="flex flex-col space-y-3">
                      <span
                        className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        } text-sm font-semibold`}
                      >
                        {event.title}
                      </span>
                      <p
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                      >
                        {event.description}
                      </p>
                      <Badge className="text-xs w-fit">{event.category}</Badge>
                      <div className="flex items-center space-x-2">
                        <Calendar
                          className={`h-4 w-4 ${
                            isDarkMode ? 'text-cyan-400' : 'text-blue-500'
                          }`}
                        />
                        <span
                          className={`${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          } text-sm`}
                        >
                          {new Date(event.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users
                          className={`h-4 w-4 ${
                            isDarkMode ? 'text-cyan-400' : 'text-blue-500'
                          }`}
                        />
                        <span
                          className={`${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          } text-sm`}
                        >
                          {event.rsvpCount} Attendees
                        </span>
                      </div>
                      <p
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                      >
                        {event.location} {event.isVirtual ? '(Virtual)' : ''}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Gallery */}
        <Card
          className={`${
            isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
          } backdrop-blur-sm`}
        >
          <CardHeader>
            <CardTitle
              className={`${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } text-lg sm:text-xl flex items-center`}
            >
              <ImageIcon className="h-5 w-5 mr-2" />
              Event Gallery
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Browse images from past events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {galleryImages.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No gallery images available
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((image) => (
                  <Card
                    key={image.id}
                    className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                  >
                    <div className="flex flex-col space-y-3">
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <p
                        className={`${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        } text-sm`}
                      >
                        {image.description}
                      </p>
                      <p
                        className={`${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        } text-xs`}
                      >
                        Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                      </p>
                      <p
                        className={`${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        } text-xs`}
                      >
                        Event: {events.find((e) => e.id === image.eventId)?.title || 'Unknown'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RSVP Modal */}
        <Dialog open={isRsvpModalOpen} onOpenChange={setIsRsvpModalOpen}>
          <DialogContent
            className={`${
              isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'
            } backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-md`}
          >
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">
                RSVP for {selectedEvent?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="rsvp-name"
                  className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                >
                  Full Name
                </Label>
                <Input
                  id="rsvp-name"
                  value={rsvpData.name}
                  onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                  className={`${
                    isDarkMode
                      ? 'bg-black/60 border-cyan-400/50 text-white'
                      : 'bg-gray-100 border-blue-300 text-gray-900'
                  } text-sm h-9`}
                />
              </div>
              <div>
                <Label
                  htmlFor="rsvp-email"
                  className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                >
                  Email
                </Label>
                <Input
                  id="rsvp-email"
                  type="email"
                  value={rsvpData.email}
                  onChange={(e) => setRsvpData({ ...rsvpData, email: e.target.value })}
                  className={`${
                    isDarkMode
                      ? 'bg-black/60 border-cyan-400/50 text-white'
                      : 'bg-gray-100 border-blue-300 text-gray-900'
                  } text-sm h-9`}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } text-sm h-9`}
                onClick={() => {
                  setIsRsvpModalOpen(false);
                  setRsvpData({ name: '', email: '' });
                  setSelectedEvent(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className={`${
                  isDarkMode
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                } text-white text-sm h-9`}
                onClick={handleRsvp}
                disabled={!rsvpData.name || !rsvpData.email}
              >
                Register
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventsAndGallery;
