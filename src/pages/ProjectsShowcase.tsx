import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Code, Star, Bell, Settings, Search, Sun, Moon, Github, Globe, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface User {
  id: string;
  fullName: string;
  avatar?: string;
}

interface Project {
  id: string;
  title: string;
  creator: User;
  domain: string;
  event?: string;
  stars: number;
  githubRepo: string;
  linkedinPost: string;
  deploymentUrl: string;
  isApproved: boolean;
}

const ProjectsShowcase: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('stars');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/projects?approved=true`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProjects(data.projects);
        setFilteredProjects(data.projects);
      } catch (error) {
        console.error('ProjectsShowcase: Fetch projects error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  useEffect(() => {
    let result = [...projects];

    // Apply search
    if (searchQuery) {
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.creator.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.domain.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply domain filter
    if (filterDomain !== 'all') {
      result = result.filter((project) => project.domain.toLowerCase() === filterDomain.toLowerCase());
    }

    // Apply event filter
    if (filterEvent !== 'all') {
      result = result.filter((project) => project.event?.toLowerCase() === filterEvent.toLowerCase());
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });

    setFilteredProjects(result);
  }, [searchQuery, filterDomain, filterEvent, sortBy, projects]);

  const getUniqueDomains = () => {
    const domains = new Set(projects.map((project) => project.domain));
    return ['all', ...Array.from(domains)];
  };

  const getUniqueEvents = () => {
    const events = new Set(projects.map((project) => project.event).filter((event): event is string => !!event));
    return ['all', ...Array.from(events)];
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} flex justify-center items-center`}>
        <OGLoader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} overflow-x-hidden transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'} backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Projects Showcase</h1>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/members')}
                aria-label="Members"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
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
        {/* Search and Filters */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Search className="h-5 w-5 mr-2" />
              Find Projects
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Search and filter projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by project name, creator, or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <Select onValueChange={setFilterDomain} defaultValue="all">
                <SelectTrigger className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9 w-full sm:w-[180px]`}>
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueDomains().map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain === 'all' ? 'All Domains' : domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setFilterEvent} defaultValue="all">
                <SelectTrigger className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9 w-full sm:w-[180px]`}>
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueEvents().map((event) => (
                    <SelectItem key={event} value={event}>
                      {event === 'all' ? 'All Events' : event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSortBy} defaultValue="stars">
                <SelectTrigger className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9 w-full sm:w-[180px]`}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stars">Top Rated</SelectItem>
                  <SelectItem value="name">Project Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Code className="h-5 w-5 mr-2" />
              Approved Projects
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Explore all approved projects</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No projects found</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}>
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={project.creator.avatar || ''} />
                          <AvatarFallback className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white text-sm`}>
                            {project.creator.fullName.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{project.creator.fullName}</span>
                      </div>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{project.title}</span>
                      <Badge className="text-xs w-fit">{project.domain}</Badge>
                      {project.event && <Badge variant="secondary" className="text-xs w-fit">{project.event}</Badge>}
                      <div className="flex items-center space-x-2">
                        <Star className={`h-4 w-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{project.stars}</span>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="link"
                          className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm p-0 h-auto flex items-center`}
                          onClick={() => window.open(project.githubRepo, '_blank')}
                        >
                          <Github className="h-4 w-4 mr-1" />
                          GitHub
                        </Button>
                        <Button
                          variant="link"
                          className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm p-0 h-auto flex items-center`}
                          onClick={() => window.open(project.linkedinPost, '_blank')}
                        >
                          <Linkedin className="h-4 w-4 mr-1" />
                          LinkedIn
                        </Button>
                        <Button
                          variant="link"
                          className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm p-0 h-auto flex items-center`}
                          onClick={() => window.open(project.deploymentUrl, '_blank')}
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Deployment
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsShowcase;
