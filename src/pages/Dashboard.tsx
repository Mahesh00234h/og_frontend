import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Code, Star, MessageCircle, Bell, Settings, Trophy, Plus, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', technology: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Utility function to format "time ago"
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
        console.log('Dashboard: Cookies before current-user request:', document.cookie);
        const res = await fetch(`${API_BASE_URL}/current-user`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        console.log('Dashboard: Current-user response headers:', Object.fromEntries(res.headers));
        const data = await res.json();
        console.log('Dashboard: Current-user response data:', data);
        if (!res.ok) {
          throw new Error(data.error || `HTTP error! status: ${res.status}`);
        }
        setUser(data.user);
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
        console.log('Dashboard: Cookies before notifications request:', document.cookie);
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        console.log('Dashboard: Notifications response headers:', Object.fromEntries(res.headers));
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
        console.log('Dashboard: Cookies before projects request:', document.cookie);
        const res = await fetch(`${API_BASE_URL}/projects`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        console.log('Dashboard: Projects response headers:', Object.fromEntries(res.headers));
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
        console.log('Dashboard: Cookies before events request:', document.cookie);
        const res = await fetch(`${API_BASE_URL}/events`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        console.log('Dashboard: Events response headers:', Object.fromEntries(res.headers));
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
        console.log('Dashboard: Cookies before announcements request:', document.cookie);
        const res = await fetch(`${API_BASE_URL}/announcements`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        console.log('Dashboard: Announcements response headers:', Object.fromEntries(res.headers));
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
      console.log('Dashboard: Cookies before create project request:', document.cookie);
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newProject),
      });
      console.log('Dashboard: Create project response headers:', Object.fromEntries(res.headers));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <OGLoader />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="text-black border-purple-400"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-4 w-4 mr-2" />
              
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-black border-purple-400"
              onClick={() => navigate('/members')}
            >
              <Users className="h-4 w-4 mr-2" />
              
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-black border-purple-400"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              
            </Button>
            <Avatar className="cursor-pointer" onClick={() => navigate('/profile')}>
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className="bg-purple-600 text-white">
                {user.fullName.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Welcome back, {user.fullName}! 👋</CardTitle>
            <CardDescription className="text-gray-300">
              Member ID: {user.rollNumber} | {user.department} | {user.year}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-semibold">{recentProjects.reduce((acc: number, p: Project) => acc + p.stars, 0)} Stars</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-purple-400" />
              <span className="text-white font-semibold">{recentProjects.length} Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-400" />
              <span className="text-white font-semibold">{notifications.filter((n) => !n.read).length} Unread Notifications</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Notifications Section */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Notifications
              </CardTitle>
              <CardDescription className="text-gray-300">Stay updated with your latest notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-400">No notifications available</p>
              ) : (
                <ul className="space-y-2">
                  {notifications.slice(0, 5).map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-2 rounded-md ${notification.read ? 'bg-gray-800/50' : 'bg-purple-900/30'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white">{notification.message}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">{timeAgo(notification.createdAt)}</span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-400"
                              onClick={() => markNotificationRead(notification.id)}
                            >
                              Mark as Read
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
                className="text-purple-400 mt-4"
                onClick={() => navigate('/notifications')}
              >
                View All Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Events Section */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </CardTitle>
              <CardDescription className="text-gray-300">Check out upcoming club events</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-gray-400">No events available</p>
              ) : (
                <ul className="space-y-2">
                  {events.slice(0, 5).map((event) => (
                    <li key={event.id} className="p-2 rounded-md bg-purple-900/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-semibold">{event.title}</span>
                          <p className="text-gray-300 text-sm">{event.description}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(event.date).toLocaleString()} | {event.location} {event.isVirtual ? '(Virtual)' : ''}
                          </p>
                        </div>
                        <Badge variant={event.category === 'General' ? 'default' : 'secondary'}>
                          {event.category}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="link"
                className="text-purple-400 mt-4"
                onClick={() => navigate('/events')}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>

          {/* Announcements Section */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Announcements
              </CardTitle>
              <CardDescription className="text-gray-300">Latest club announcements</CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <p className="text-gray-400">No announcements available</p>
              ) : (
                <ul className="space-y-2">
                  {announcements.slice(0, 5).map((announcement) => (
                    <li key={announcement.id} className="p-2 rounded-md bg-purple-900/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-semibold">{announcement.title}</span>
                          <p className="text-gray-300 text-sm">{announcement.message}</p>
                          <p className="text-gray-400 text-sm">{timeAgo(announcement.createdAt)}</p>
                        </div>
                        <Badge
                          variant={
                            announcement.priority === 'high'
                              ? 'destructive'
                              : announcement.priority === 'normal'
                              ? 'default'
                              : 'secondary'
                          }
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
                className="text-purple-400 mt-4"
                onClick={() => navigate('/announcements')}
              >
                View All Announcements
              </Button>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Recent Projects
              </CardTitle>
              <CardDescription className="text-gray-300">Your latest projects</CardDescription>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className="text-gray-400">No projects available</p>
              ) : (
                <ul className="space-y-2">
                  {recentProjects.slice(0, 5).map((project) => (
                    <li key={project.id} className="p-2 rounded-md bg-purple-900/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-white font-semibold">{project.title}</span>
                          <p className="text-gray-300 text-sm">{project.technology}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-white">{project.stars}</span>
                          <Users className="h-4 w-4 text-purple-400" />
                          <span className="text-white">{project.collaborators}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                variant="outline"
                className="text-black border-purple-400 mt-4"
                onClick={() => setIsProjectModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create Project Modal */}
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogContent className="bg-black/80 border-purple-500/20 text-white">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-title" className="text-gray-300">
                  Project Title
                </Label>
                <Input
                  id="project-title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="bg-gray-800 border-purple-500/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="project-technology" className="text-gray-300">
                  Technology
                </Label>
                <Input
                  id="project-technology"
                  value={newProject.technology}
                  onChange={(e) => setNewProject({ ...newProject, technology: e.target.value })}
                  className="bg-gray-800 border-purple-500/20 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="text-white border-purple-400"
                onClick={() => setIsProjectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
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
