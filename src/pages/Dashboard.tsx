import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Code, Star, Bell, Settings, Plus, Mail, Sun, Moon, CheckCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  isActive: boolean;
  avatar?: string;
  role?: string;
  skills?: string[];
  interests?: string[];
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  technology: string;
  stars: number;
  collaborators: number;
}

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  category: string;
  isVirtual: boolean;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [newProject, setNewProject] = useState<{ title: string; technology: string }>({ title: '', technology: '' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const timeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/current-user`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP error! status: ${res.status}`);
        setUser(data.user);
        // Calculate profile completion
        const fields = [data.user.fullName, data.user.email, data.user.rollNumber, data.user.department, data.user.year, data.user.skills?.length, data.user.interests?.length];
        const completedFields = fields.filter(Boolean).length;
        setProfileCompletion(Math.round((completedFields / 7) * 100));
      } catch (error) {
        console.error('Dashboard: Fetch user error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Please log in to access the dashboard',
          variant: 'destructive',
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setNotifications(data.notifications);
      } catch (error) {
        console.error('Dashboard: Fetch notifications error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch notifications',
          variant: 'destructive',
        });
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/projects`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setRecentProjects(data.projects);
      } catch (error) {
        console.error('Dashboard: Fetch projects error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive',
        });
      }
    };

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
        console.error('Dashboard: Fetch events error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch events',
          variant: 'destructive',
        });
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/announcements`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAnnouncements(data.announcements);
      } catch (error) {
        console.error('Dashboard: Fetch announcements error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch announcements',
          variant: 'destructive',
        });
      }
    };

    fetchUser();
    fetchNotifications();
    fetchProjects();
    fetchEvents();
    fetchAnnouncements();
  }, [navigate, toast]);

  const handleCreateProject = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newProject),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      setRecentProjects([...recentProjects, { ...newProject, id: data.projectId, stars: 0, collaborators: 0 }]);
      setIsProjectModalOpen(false);
      setNewProject({ title: '', technology: '' });
    } catch (error: any) {
      console.error('Dashboard: Create project error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
    } catch (error: any) {
      console.error('Dashboard: Mark notification read error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: 'Success',
        description: 'Successfully RSVP\'d for the event',
      });
    } catch (error: any) {
      console.error('Dashboard: RSVP error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to RSVP for the event',
        variant: 'destructive',
      });
    }
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
  if (!user) return null;

  const featuredProject = recentProjects.reduce((prev, curr) => (prev.stars > curr.stars ? prev : curr), recentProjects[0]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} overflow-x-hidden transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'} backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TechMinds Dashboard</h1>
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
              <Avatar className="cursor-pointer h-9 w-9" onClick={() => navigate('/profile')}>
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white text-sm`}>
                  {user.fullName.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      {announcements.some((a) => a.priority === 'high') && (
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {announcements
              .filter((a) => a.priority === 'high')
              .map((announcement) => (
                <span key={announcement.id} className="mx-4 text-sm">
                  {announcement.title}: {announcement.message}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 space-y-6">
        {/* User Card */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl sm:text-2xl`}>
              Welcome back to TechMinds, {user.fullName}! 👋
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Member ID: {user.rollNumber} | {user.department} | {user.year}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-1">
              <Star className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>
                {recentProjects.reduce((acc: number, p: Project) => acc + p.stars, 0)} Stars
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Code className={`h-5 w-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{recentProjects.length} Projects</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bell className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>
                {notifications.filter((n) => !n.read).length} Unread
              </span>
            </div>
          </CardContent>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Profile Completion: {profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} [&>div]:bg-gradient-to-r [&>div]:from-cyan-600 [&>div]:to-purple-600`} />
              {profileCompletion < 100 && (
                <Button
                  variant="link"
                  className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm`}
                  onClick={() => navigate('/profile/edit')}
                >
                  Complete Your Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Plus className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Get started with TechMinds</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
              onClick={() => setIsProjectModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Project
            </Button>
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
              onClick={() => navigate('/projects/join')}
            >
              <Users className="h-4 w-4 mr-1" />
              Join Project
            </Button>
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
              onClick={() => navigate('/feedback')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Featured Project */}
          {featuredProject && (
            <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
                  <Star className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                  Featured Project
                </CardTitle>
                <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Top-rated project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-md bg-gradient-to-r from-cyan-900/30 to-purple-900/30">
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{featuredProject.title}</span>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{featuredProject.technology}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <Star className={`h-4 w-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{featuredProject.stars}</span>
                    <Users className={`h-4 w-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{featuredProject.collaborators}</span>
                  </div>
                  <Button
                    variant="link"
                    className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm mt-3`}
                    onClick={() => navigate(`/projects/${featuredProject.id}`)}
                  >
                    View Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Section */}
          <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Stay updated</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No notifications available</p>
              ) : (
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-3 rounded-md ${isDarkMode ? notification.read ? 'bg-gray-800/50' : 'bg-cyan-900/30' : notification.read ? 'bg-gray-100' : 'bg-blue-50'}`}
                    >
                      <div className="flex flex-col justify-between items-start space-y-2">
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{notification.message}</span>
                        <div className="flex items-center w-full justify-between">
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{timeAgo(notification.createdAt)}</span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm p-1`}
                              onClick={() => markNotificationRead(notification.id)}
                              aria-label="Mark notification as read"
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="link"
                className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm mt-4`}
                onClick={() => navigate('/notifications')}
              >
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Events Section */}
          <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Club events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No events available</p>
              ) : (
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                  {events.slice(0, 5).map((event) => (
                    <li key={event.id} className={`p-3 rounded-md ${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'}`}>
                      <div className="flex flex-col justify-between items-start space-y-2">
                        <div>
                          <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{event.title}</span>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{event.description}</p>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                            {new Date(event.date).toLocaleString()} | {event.location} {event.isVirtual ? '(Virtual)' : ''}
                          </p>
                        </div>
                        <div className="flex items-center w-full justify-between">
                          <Badge variant={event.category === 'General' ? 'default' : 'secondary'} className="text-sm">
                            {event.category}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9`}
                            onClick={() => handleRSVP(event.id)}
                            aria-label={`RSVP for ${event.title}`}
                          >
                            RSVP
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="link"
                className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm mt-4`}
                onClick={() => navigate('/events')}
              >
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Announcements Section */}
          <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
                <Mail className="h-5 w-5 mr-2" />
                Announcements
              </CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Club updates</CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No announcements available</p>
              ) : (
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                  {announcements.slice(0, 5).map((announcement) => (
                    <li key={announcement.id} className={`p-3 rounded-md ${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'}`}>
                      <div className="flex flex-col justify-between items-start space-y-2">
                        <div>
                          <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{announcement.title}</span>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{announcement.message}</p>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{timeAgo(announcement.createdAt)}</p>
                        </div>
                        <Badge
                          variant={
                            announcement.priority === 'high'
                              ? 'destructive'
                              : announcement.priority === 'normal'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-sm"
                        >
                          {announcement.priority}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="link"
                className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm mt-4`}
                onClick={() => navigate('/announcements')}
              >
                View All
              </Button>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
                <Code className="h-5 w-5 mr-2" />
                Recent Projects
              </CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Your projects</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No projects available</p>
              ) : (
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                  {recentProjects.slice(0, 5).map((project) => (
                    <li key={project.id} className={`p-3 rounded-md ${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'}`}>
                      <div className="flex flex-col justify-between items-start space-y-2">
                        <div>
                          <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{project.title}</span>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{project.technology}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Star className={`h-4 w-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                          <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{project.stars}</span>
                          <Users className={`h-4 w-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                          <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{project.collaborators}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="outline"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm mt-4 h-9`}
                onClick={() => setIsProjectModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Project Modal */}
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-md`}>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-title" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Project Title</Label>
                <Input
                  id="project-title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="project-technology" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Technology</Label>
                <Input
                  id="project-technology"
                  value={newProject.technology}
                  onChange={(e) => setNewProject({ ...newProject, technology: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9`}
                onClick={() => setIsProjectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={handleCreateProject}
                disabled={!newProject.title || !newProject.technology}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
