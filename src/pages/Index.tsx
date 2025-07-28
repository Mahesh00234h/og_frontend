import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Calendar, Code, Brain, Atom, Zap, Database, Terminal, Rocket, CircuitBoard, Monitor, Menu, X } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  attendees: number;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface ResearchArea {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  projects: number;
  members: number;
}

interface NewEvent {
  title: string;
  date: string;
  time: string;
  type: string;
  location: string;
  description: string;
  attendees: string;
}

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeMembers, setActiveMembers] = useState<number>(500);
  const [activeProjects, setActiveProjects] = useState<number>(150);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    date: '',
    time: '',
    type: '',
    location: '',
    description: '',
    attendees: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/active-members')
      .then((res) => res.json())
      .then((data) => data.activeMembers && setActiveMembers(data.activeMembers))
      .catch((err) => console.error('Failed to fetch active members:', err));

    fetch('/api/active-projects')
      .then((res) => res.json())
      .then((data) => data.activeProjects && setActiveProjects(data.activeProjects))
      .catch((err) => console.error('Failed to fetch active projects:', err));

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => data.events && setUpcomingEvents(data.events))
      .catch((err) => console.error('Failed to fetch events:', err));
  }, []);

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          date: eventDateTime.toISOString(),
          location: newEvent.location,
          description: newEvent.description,
          type: newEvent.type,
          attendees: parseInt(newEvent.attendees, 10),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setUpcomingEvents([
          ...upcomingEvents,
          {
            id: data.eventId,
            title: newEvent.title,
            date: newEvent.date,
            time: newEvent.time,
            type: newEvent.type,
            attendees: parseInt(newEvent.attendees, 10),
          },
        ]);
        setNewEvent({ title: '', date: '', time: '', type: '', location: '', description: '', attendees: '' });
        setError(null);
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Failed to create event');
      console.error('Event creation error:', err);
    }
  };

  const features: Feature[] = [
    { icon: Brain, title: 'AI & Machine Learning', description: 'Explore cutting-edge AI algorithms and neural networks' },
    { icon: Code, title: 'Software Development', description: 'Build innovative applications and open-source projects' },
    { icon: CircuitBoard, title: 'Hardware Innovation', description: 'Design electronic systems and IoT solutions' },
    { icon: Database, title: 'Data Science Hub', description: 'Analyze datasets and build predictive models' },
    { icon: Terminal, title: 'Programming Community', description: 'Collaborate and master new programming languages' },
    { icon: Rocket, title: 'Tech Innovation', description: 'Work on cutting-edge technology and startup ideas' },
  ];

  const researchAreas: ResearchArea[] = [
    { icon: Zap, title: 'Neural Networks', projects: 12, members: 24 },
    { icon: Atom, title: 'Quantum Computing', projects: 8, members: 16 },
    { icon: Monitor, title: 'Computer Vision', projects: 15, members: 32 },
    { icon: Database, title: 'Big Data Analytics', projects: 20, members: 28 },
  ];

  const FeatureCard = memo(({ feature }: { feature: Feature }) => (
    <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300 group">
      <CardHeader>
        <div className="mb-3 relative">
          <feature.icon className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          <div className="absolute inset-0 h-8 w-8 border border-cyan-400/30 rounded-full group-hover:border-cyan-400/50 transition-all"></div>
        </div>
        <CardTitle className="text-white group-hover:text-cyan-100 transition-colors text-base">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-300 text-sm">{feature.description}</CardDescription>
      </CardContent>
    </Card>
  ));

  const ResearchCard = memo(({ area }: { area: ResearchArea }) => (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all">
      <CardHeader className="text-center">
        <area.icon className="h-6 w-6 text-purple-400 mx-auto mb-2" />
        <CardTitle className="text-white text-sm">{area.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-y-1">
          <div className="text-cyan-400 font-semibold text-sm">{area.projects} Projects</div>
          <div className="text-gray-400 text-xs">{area.members} Members</div>
        </div>
      </CardContent>
    </Card>
  ));

  const EventCard = memo(({ event }: { event: Event }) => (
    <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-white text-base">{event.title}</CardTitle>
          <Badge className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white self-start">{event.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-300 text-sm">
            <Calendar className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300 text-sm">
            <Users className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span>{event.attendees} Attendees</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5vw] w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-[25%] right-[5vw] w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-[33%] left-[25%] w-1.2 h-1.2 bg-green-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-[50%] right-[33%] w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-cyan-500/20 relative z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Atom className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-0 h-5 w-5 border border-cyan-400/30 rounded-full animate-pulse"></div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </div>
            <div className="hidden md:flex space-x-3">
              {!isLoggedIn ? (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 backdrop-blur-sm text-sm py-1 px-3">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm py-1 px-3 shadow-lg shadow-cyan-500/25">
                      Join
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm py-1 px-3">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-cyan-400"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-black/80 backdrop-blur-xl z-30 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden`}
        >
          <div className="flex justify-end p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="text-cyan-400"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-col space-y-3 p-4">
            {!isLoggedIn ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 backdrop-blur-sm text-sm py-5">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm py-5 shadow-lg shadow-cyan-500/25">
                    Join Community
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm py-5">
                  Dashboard
                </Button>
              </Link>
            )}
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-gray-300 hover:text-cyan-400 text-sm py-5">
                About OG
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-3 py-10 sm:py-16 text-center relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-3 sm:mb-4">
              <span className="text-white">Welcome to </span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </h1>
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="text-xs sm:text-base text-cyan-400 font-mono bg-black/40 px-2 sm:px-3 py-1.5 rounded border border-cyan-500/30 backdrop-blur-sm">
                {'>'} Advancing technology and innovation
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-lg text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-3">
            Join our vibrant community of developers and tech enthusiasts. Collaborate, learn, and shape the future.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8 sm:mb-12 px-3">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 text-base shadow-lg shadow-cyan-500/25">
                Join Now
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 px-6 sm:px-8 py-3 text-base backdrop-blur-sm">
                About OG
              </Button>
            </Link>
          </div>
          {/* Tech Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto">
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
              <div className="text-lg sm:text-xl font-bold text-cyan-400">{activeMembers}+</div>
              <div className="text-xs text-gray-300">Members</div>
            </div>
            <div className="bg-black/40 border border-purple-500/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
              <div className="text-lg sm:text-xl font-bold text-purple-400">{activeProjects}+</div>
              <div className="text-xs text-gray-300">Projects</div>
            </div>
            <div className="bg-black/40 border border-green-500/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
              <div className="text-lg sm:text-xl font-bold text-green-400">50+</div>
              <div className="text-xs text-gray-300">Workshops</div>
            </div>
            <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
              <div className="text-lg sm:text-xl font-bold text-yellow-400">25+</div>
              <div className="text-xs text-gray-300">Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Event Creation Form */}
      {isLoggedIn && isAdmin && (
        <section className="px-3 py-10 sm:py-16 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">
              Create New Event
            </h2>
            <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm">
              <CardContent className="pt-5">
                <form onSubmit={handleEventSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="title" className="text-white text-sm">Event Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="bg-black/60 text-white border-cyan-400/50 text-sm"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <Label htmlFor="date" className="text-white text-sm">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="bg-black/60 text-white border-cyan-400/50 text-sm"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="time" className="text-white text-sm">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="bg-black/60 text-white border-cyan-400/50 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="type" className="text-white text-sm">Event Type</Label>
                    <Input
                      id="type"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                      className="bg-black/60 text-white border-cyan-400/50 text-sm"
                      placeholder="e.g., Workshop, Conference"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-white text-sm">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="bg-black/60 text-white border-cyan-400/50 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white text-sm">Description</Label>
                    <Input
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="bg-black/60 text-white border-cyan-400/50 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendees" className="text-white text-sm">Expected Attendees</Label>
                    <Input
                      id="attendees"
                      type="number"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                      className="bg-black/60 text-white border-cyan-400/50 text-sm"
                      required
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm py-5 w-full">
                    Create Event
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Tech Focus Areas */}
      <section className="px-3 py-10 sm:py-16 bg-gradient-to-r from-cyan-900/10 to-purple-900/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-3">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Technology Focus
            </span>
          </h2>
          <p className="text-center text-gray-300 mb-6 sm:mb-8 text-sm px-3">Explore our tech domains</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Active Project Areas */}
      <section className="px-3 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
            Active Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {researchAreas.map((area, index) => (
              <ResearchCard key={index} area={area} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Tech Events */}
      <section className="px-3 py-10 sm:py-16 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <p className="text-gray-300 text-center col-span-full text-sm">No upcoming events.</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-cyan-500/20 px-3 py-6 sm:py-8 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Atom className="h-5 w-5 text-cyan-400" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </div>
            <p className="text-gray-300 text-sm px-3">
              Advancing technology through collaboration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <h3 className="text-cyan-400 font-semibold text-sm mb-1">Tech Focus</h3>
              <p className="text-gray-400 text-xs">AI • Software • Data</p>
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold text-sm mb-1">Innovation</h3>
              <p className="text-gray-400 text-xs">Hardware • Software</p>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold text-sm mb-1">Network</h3>
              <p className="text-gray-400 text-xs">{activeMembers}+ Members</p>
            </div>
          </div>
          <div className="text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-cyan-500/10">
            <p className="text-gray-400 text-xs px-3">
              © 2025 OG Techminds. Building tomorrow's tech.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
