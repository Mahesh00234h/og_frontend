import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Code, Brain, Atom, Zap, Database, Terminal, Rocket, CircuitBoard, Monitor, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://og-backend-mwwi.onrender.com/api';

const Index = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMembers, setActiveMembers] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState({
    members: true,
    projects: true,
    events: true,
  });

  useEffect(() => {
    const fetchData = async (url, setter, type) => {
      try {
        setIsLoading((prev) => ({ ...prev, [type]: true }));
        console.log(`Fetching ${type} from ${url}`);
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await res.json();
        console.log(`Fetched ${type} data:`, data);
        if (type === 'events') {
          setter(Array.isArray(data.events) ? data.events : []);
        } else if (type === 'members') {
          setter(typeof data.activeMembers === 'number' ? data.activeMembers : 0);
        } else if (type === 'projects') {
          setter(typeof data.activeProjects === 'number' ? data.activeProjects : 0);
        }
      } catch (error) {
        console.error(`Failed to fetch ${type}:`, error);
        if (error.message.includes('401')) {
          console.log(`${type} endpoint requires authentication, using fallback data`);
        } else {
          setError(`Failed to load ${type}.`);
          toast({
            title: 'Error',
            description: `Failed to fetch ${type}. Please try again later.`,
            variant: 'destructive',
          });
        }
        if (type === 'events') {
          setter([]);
        } else {
          setter(0);
        }
      } finally {
        setIsLoading((prev) => ({ ...prev, [type]: false }));
        console.log(`Fetch finished loading: GET "${url}"`);
      }
    };

    const fetchAllData = async () => {
      await Promise.all([
        fetchData(`${API_BASE_URL}/active-members`, setActiveMembers, 'members'),
        fetchData(`${API_BASE_URL}/active-projects`, setActiveProjects, 'projects'),
        fetchData(`${API_BASE_URL}/public-events`, setUpcomingEvents, 'events'),
      ]);
      console.log('State after fetch:', { activeMembers, activeProjects, upcomingEvents });
    };

    fetchAllData();
  }, [toast]);

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
            <span className="truncate">
              {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[8%] w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-[30%] right-[8%] w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-[40%] left-[20%] w-1 h-1 bg-green-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-[60%] right-[25%] w-0.5 h-0.5 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
      </div>

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
            </div>
          )}
        </div>
      </nav>

      <section className="px-3 py-8 text-center relative">
        <div className="max-w-4xl mx-auto relative z-10">
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}
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
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 backdrop-blur-sm">
              {isLoading.members ? (
                <OGLoader />
              ) : (
                <>
                  <div className="text-lg font-bold text-cyan-400">{activeMembers >= 0 ? `${activeMembers}+` : '0+'}</div>
                  <div className="text-xs text-gray-300">Members</div>
                </>
              )}
            </div>
            <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 backdrop-blur-sm">
              {isLoading.projects ? (
                <OGLoader />
              ) : (
                <>
                  <div className="text-lg font-bold text-purple-400">{activeProjects >= 0 ? `${activeProjects}+` : '0+'}</div>
                  <div className="text-xs text-gray-300">Projects</div>
                </>
              )}
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

      <section className="px-3 py-8 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Upcoming Events
          </h2>
          {isLoading.events ? (
            <div className="col-span-full text-center">
              <OGLoader />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
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
          )}
        </div>
      </section>

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
              <p className="text-gray-400">{activeMembers >= 0 ? `${activeMembers}+` : '0+'} Members • Global</p>
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
