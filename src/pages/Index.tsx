
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Code, Star, MessageCircle, Trophy, Brain, Atom, Zap, Database, Terminal, Rocket, CircuitBoard, Monitor, Menu, X } from 'lucide-react';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "AI & Machine Learning",
      description: "Explore cutting-edge AI algorithms and neural networks through collaborative projects"
    },
    {
      icon: Code,
      title: "Software Development",
      description: "Build innovative applications and contribute to open-source projects"
    },
    {
      icon: CircuitBoard,
      title: "Hardware Innovation",
      description: "Design and prototype electronic systems and IoT solutions"
    },
    {
      icon: Database,
      title: "Data Science Hub",
      description: "Analyze datasets and build predictive models for real-world applications"
    },
    {
      icon: Terminal,
      title: "Programming Community",
      description: "Collaborate on coding projects and master new programming languages"
    },
    {
      icon: Rocket,
      title: "Tech Innovation",
      description: "Work on cutting-edge technology projects and startup ideas"
    }
  ];

  const researchAreas = [
    {
      icon: Zap,
      title: "Neural Networks",
      projects: 12,
      members: 24
    },
    {
      icon: Atom,
      title: "Quantum Computing",
      projects: 8,
      members: 16
    },
    {
      icon: Monitor,
      title: "Computer Vision",
      projects: 15,
      members: 32
    },
    {
      icon: Database,
      title: "Big Data Analytics",
      projects: 20,
      members: 28
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Quantum Computing Workshop",
      date: "2024-01-15",
      time: "2:00 PM",
      type: "Workshop",
      attendees: 45
    },
    {
      id: 2,
      title: "AI Ethics Symposium",
      date: "2024-01-22",
      time: "9:00 AM",
      type: "Conference",
      attendees: 120
    },
    {
      id: 3,
      title: "Neural Network Hackathon",
      date: "2024-01-28",
      time: "4:00 PM",
      type: "Competition",
      attendees: 80
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/4 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-xl border-b border-cyan-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Atom className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 border border-cyan-400/30 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {!isLoggedIn ? (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 backdrop-blur-sm">
                      Initialize Session
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25">
                      Join Tech Community
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white">
                    Access Dashboard
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-cyan-400"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 backdrop-blur-sm">
                      Initialize Session
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25">
                      Join Tech Community
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="block">
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white">
                    Access Dashboard
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-20 text-center relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6">
              <span className="text-white">Welcome to </span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </h1>
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="text-sm sm:text-lg text-cyan-400 font-mono bg-black/40 px-3 sm:px-4 py-2 rounded border border-cyan-500/30 backdrop-blur-sm">
                {'>'} Advancing the frontiers of technology and innovation
              </div>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Join our vibrant community of developers, innovators, and tech enthusiasts. 
            Collaborate on exciting projects, learn cutting-edge technologies, 
            and shape the future of technology together.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 sm:mb-16 px-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 sm:px-10 py-4 text-lg shadow-lg shadow-cyan-500/25">
                Initialize Membership
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 px-8 sm:px-10 py-4 text-lg backdrop-blur-sm">
                About OG
              </Button>
            </Link>
          </div>

          {/* Tech Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">500+</div>
              <div className="text-xs sm:text-sm text-gray-400">Active Members</div>
            </div>
            <div className="bg-black/40 border border-purple-500/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">150+</div>
              <div className="text-xs sm:text-sm text-gray-400">Tech Projects</div>
            </div>
            <div className="bg-black/40 border border-green-500/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-green-400">50+</div>
              <div className="text-xs sm:text-sm text-gray-400">Workshops</div>
            </div>
            <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">25+</div>
              <div className="text-xs sm:text-sm text-gray-400">Tech Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Focus Areas */}
      <section className="px-4 py-12 sm:py-20 bg-gradient-to-r from-cyan-900/10 to-purple-900/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Technology Focus Areas
            </span>
          </h2>
          <p className="text-center text-gray-400 mb-12 sm:mb-16 text-lg px-4">Explore our specialized technology domains</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black/40 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-300 group">
                <CardHeader>
                  <div className="mb-4 relative">
                    <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                    <div className="absolute inset-0 h-10 w-10 sm:h-12 sm:w-12 border border-cyan-400/30 rounded-full group-hover:border-cyan-400/50 transition-all"></div>
                  </div>
                  <CardTitle className="text-white group-hover:text-cyan-100 transition-colors text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active Project Areas */}
      <section className="px-4 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">
            Active Project Domains
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {researchAreas.map((area, index) => (
              <Card key={index} className="bg-gradient-to-br from-black/60 to-black/40 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all">
                <CardHeader className="text-center">
                  <area.icon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400 mx-auto mb-3" />
                  <CardTitle className="text-white text-base sm:text-lg">{area.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-2">
                    <div className="text-cyan-400 font-semibold text-sm sm:text-base">{area.projects} Projects</div>
                    <div className="text-gray-400 text-sm">{area.members} Members</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Tech Events */}
      <section className="px-4 py-12 sm:py-20 bg-gradient-to-r from-purple-900/10 to-cyan-900/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 sm:mb-16">
            Upcoming Tech Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="bg-black/40 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                    <CardTitle className="text-white text-base sm:text-lg">{event.title}</CardTitle>
                    <Badge className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white self-start">{event.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-300 text-sm sm:text-base">
                      <Calendar className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300 text-sm sm:text-base">
                      <Users className="h-4 w-4 text-purple-400 flex-shrink-0" />
                      <span>{event.attendees} Expected Attendees</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-cyan-500/20 px-4 py-8 sm:py-12 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Atom className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                OG Techminds
              </span>
            </div>
            <p className="text-gray-400 text-base sm:text-lg px-4">
              Advancing technology through collaborative innovation and community learning
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <h3 className="text-cyan-400 font-semibold mb-2">Tech Focus</h3>
              <p className="text-gray-500 text-sm">AI • Software Development • Data Science</p>
            </div>
            <div>
              <h3 className="text-purple-400 font-semibold mb-2">Innovation Areas</h3>
              <p className="text-gray-500 text-sm">Hardware • Software • Digital Solutions</p>
            </div>
            <div>
              <h3 className="text-green-400 font-semibold mb-2">Global Network</h3>
              <p className="text-gray-500 text-sm">500+ Members • 25+ Countries</p>
            </div>
          </div>
          
          <div className="text-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-cyan-500/10">
            <p className="text-gray-500 text-sm px-4">
              © 2024 OG Techminds Technology Community. Building tomorrow's technology today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
