import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Calendar, Code, Brain, Atom, Zap, Database, Terminal, Rocket, CircuitBoard, Monitor, Menu, X } from 'lucide-react';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMembers, setActiveMembers] = useState(500);
  const [activeProjects, setActiveProjects] = useState(150);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: '',
    location: '',
    description: '',
    attendees: ''
  });
  const [error, setError] = useState(null);

  // Fetch live data on mount
  useEffect(() => {
  fetch('https://ogtechminds.vercel.app/api/active-members')
    .then((res) => res.json())
    .then((data) => setActiveMembers(data.length)) // Use array length
    .catch((err) => console.error('Failed to fetch active members:', err));

  fetch('https://ogtechminds.vercel.app/api/active-projects')
    .then((res) => res.json())
    .then((data) => setActiveProjects(data.length)) // Use array length
    .catch((err) => console.error('Failed to fetch active projects:', err));

  fetch('https://ogtechminds.vercel.app/api/events')
    .then((res) => res.json())
    .then((data) => setUpcomingEvents(data)) // Data is already an array
    .catch((err) => console.error('Failed to fetch events:', err));
}, []);
  // Handle admin event form submission
  const handleEventSubmit = async (e) => {
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
          attendees: parseInt(newEvent.attendees, 10)
        })
      });
      const data = await response.json();
      if (response.ok) {
        setUpcomingEvents([...upcomingEvents, {
          id: data.eventId,
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          type: newEvent.type,
          attendees: parseInt(newEvent.attendees, 10)
        }]);
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

  const features = [
    { icon: Brain, title: "AI & ML", description: "Explore cutting-edge AI algorithms and neural networks" },
    { icon: Code, title: "Development", description: "Build innovative applications and open-source projects" },
    { icon: CircuitBoard, title: "Hardware", description: "Design electronic systems and IoT solutions" },
    { icon: Database, title: "Data Science", description: "Analyze datasets and build predictive models" },
    { icon: Terminal, title: "Programming", description: "Collaborate on coding projects and languages" },
    { icon: Rocket, title: "Innovation", description: "Work on cutting-edge tech and startup ideas" }
  ];

  const researchAreas = [
    { icon: Zap, title: "Neural Networks", projects: 12, members: 24 },
    { icon: Atom, title: "Quantum Computing", projects: 8, members: 16 },
    { icon: Monitor, title: "Computer Vision", projects: 15, members: 32 },
    { icon: Database, title: "Big Data", projects: 20, members: 28 }
  ];

  // Memoized components for performance
  const FeatureCard = memo(({ feature }) => (
    <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300 group h-full">
      <CardHeader className="pb-3">
        <div className="mb-3 relative">
          <feature.icon className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          <div className="absolute inset-0 h-8 w-8 border border-cyan-400/30 rounded-full group-hover:border-cyan-400/50 transition-all"></div>
        </div>
        <CardTitle className="text-white group-hover:text-cyan-100 transition-colors text-base leading-tight">
          {feature.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-gray-300 text-sm leading-relaxed">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  ));

  const ResearchCard = memo(({ area }) => (
    <Card className="bg-gradient-to-br from-black/60 to-black/40 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all h-full">
      <CardHeader className="text-center pb-3">
        <area.icon className="h-7 w-7 text-purple-400 mx-auto mb-2" />
        <CardTitle className="text-white text-sm leading-tight">{area.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center pt-0">
        <div className="space-y-1">
          <div className="text-cyan-400 font-semibold text-sm">{area.projects} Projects</div>
          <div className="text-gray-400 text-xs">{area.members} Members</div>
        </div>
      </CardContent>
    </Card>
  ));

  const EventCard = memo(({ event }) => (
    <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-sm leading-tight flex-1 pr-2">
              {event.title}
            </CardTitle>
            <Badge className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs px-2 py-1 flex-shrink-0">
              {event.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-gray-300 text-xs">
            <Calendar className="h-3 w-3 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300 text-xs">
            <Users className="h-3 w-3 text-purple-400 flex-shrink-0" />
            <span>{event.attendees} Expected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Simplified background elements for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[8%] w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-[30%] right-[8%] w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-[40%] left-[20%] w-1 h-1 bg-green-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-[60%] right-[25%] w-0.5 h-0.5 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Compact Navigation */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-cyan-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Atom className="h-6 w-6 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-0 h-6 w-6 border border-cyan-400/30 rounded-full animate-pulse"></div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </div>
            <div className="hidden sm:flex space-x-3">
              {!isLoggedIn ? (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 backdrop-blur-sm text-sm px-4 py-2">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 text-sm px-4 py-2">
                      Join Now
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm px-4 py-2">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-cyan-400 h-8 w-8"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="sm:hidden py-3 space-y-2 border-t border-cyan-500/20">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 backdrop-blur-sm text-sm py-2">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25 text-sm py-2">
                      Join Now
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="block">
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm py-2">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Compact Hero Section */}
      <section className="px-3 py-8 text-center relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="text-white">Welcome to </span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </h1>
            <div className="flex justify-center mb-4">
              <div className="text-xs sm:text-sm text-cyan-400 font-mono bg-black/40 px-3 py-2 rounded border border-cyan-500/30 backdrop-blur-sm">
                {'>'} Advancing technology frontiers
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
            Join our vibrant community of developers, innovators, and tech enthusiasts. 
            Collaborate on exciting projects and shape the future of technology.
          </p>
          <div className="flex flex-col space-y-3 mb-8">
            <Link to="/register">
              <Button size="lg" className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 py-3 text-sm shadow-lg shadow-cyan-500/25">
                Join Community
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 px-6 py-3 text-sm backdrop-blur-sm">
                Learn More
              </Button>
            </Link>
          </div>
          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-lg font-bold text-cyan-400">{activeMembers}+</div>
              <div className="text-xs text-gray-300">Members</div>
            </div>
            <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-lg font-bold text-purple-400">{activeProjects}+</div>
              <div className="text-xs text-gray-300">Projects</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-3">
            <div className="bg-black/40 border border-green-500/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-lg font-bold text-green-400">50+</div>
              <div className="text-xs text-gray-300">Workshops</div>
            </div>
            <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-lg font-bold text-yellow-400">25+</div>
              <div className="text-xs text-gray-300">Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Event Creation Form (compact for mobile) */}
      {isLoggedIn && isAdmin && (
        <section className="px-3 py-8 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Create Event
            </h2>
            <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm">
              <CardContent className="pt-4">
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
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
                    <div>
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
                    <Label htmlFor="type" className="text-white text-sm">Type</Label>
                    <Input
                      id="type"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                      className="bg-black/60 text-white border-cyan-400/50 text-sm"
                      placeholder="Workshop, Conference"
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
                  <Button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-sm py-2">
                    Create Event
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Compact Tech Focus Areas */}
      <section className="px-3 py-8 bg-gradient-to-r from-cyan-900/10 to-purple-900/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tech Focus Areas
            </span>
          </h2>
          <p className="text-center text-gray-300 mb-6 text-sm">Explore our specialized domains</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Compact Active Project Areas */}
      <section className="px-3 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Active Projects
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {researchAreas.map((area, index) => (
              <ResearchCard key={index} area={area} />
            ))}
          </div>
        </div>
      </section>

      {/* Compact Upcoming Events */}
      <section className="px-3 py-8 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full text-center">
                <div className="bg-black/40 border border-gray-500/20 rounded-lg p-6 backdrop-blur-sm">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">No upcoming events at the moment</p>
                  <p className="text-gray-400 text-xs mt-1">Check back soon for exciting tech events!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Compact Footer */}
      <footer className="bg-black/40 border-t border-cyan-500/20 px-3 py-6 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Atom className="h-5 w-5 text-cyan-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              Advancing technology through collaborative innovation
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
            <div>
              <h3 className="text-cyan-400 font-semibold mb-1">Tech Focus</h3>
              <p className="text-gray-400">AI • Development • Data Science</p>
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold mb-1">Innovation</h3>
              <p className="text-gray-400">Hardware • Software • IoT</p>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold mb-1">Community</h3>
              <p className="text-gray-400">{activeMembers}+ Members • Global</p>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-t border-cyan-500/10">
            <p className="text-gray-400 text-xs">
              © 2025 OG Techminds. Building tomorrow's technology today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
