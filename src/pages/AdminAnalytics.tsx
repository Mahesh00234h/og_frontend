import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Code, Award, Upload, BarChart, Sun, Moon, Settings, Bell } from 'lucide-react';
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
  githubRepo: string;
  linkedinPost: string;
  deploymentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
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

interface Analytics {
  totalUsers: number;
  totalProjects: number;
  totalEvents: number;
  domainCounts: { [key: string]: number };
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({ totalUsers: 0, totalProjects: 0, totalEvents: 0, domainCounts: {} });
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    date: string;
    description: string;
    location: string;
    category: string;
    isVirtual: boolean;
  }>({ title: '', date: '', description: '', location: '', category: '', isVirtual: false });
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAnalytics(data.analytics);
      } catch (error) {
        console.error('AdminAnalytics: Fetch analytics error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch analytics',
          variant: 'destructive',
        });
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/projects`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProjects(data.projects);
      } catch (error) {
        console.error('AdminAnalytics: Fetch projects error:', error);
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
        console.error('AdminAnalytics: Fetch events error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch events',
          variant: 'destructive',
        });
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchProjects(), fetchEvents()]);
      setLoading(false);
    };

    loadData();
  }, [toast]);

  const handleProjectStatus = async (projectId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/projects/${projectId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProjects(projects.map((p) => (p.id === projectId ? { ...p, status } : p)));
      toast({
        title: 'Success',
        description: `Project ${status} successfully`,
      });
    } catch (error: any) {
      console.error('AdminAnalytics: Update project status error:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to update project status`,
        variant: 'destructive',
      });
    }
  };

  const handleIssueCertificate = async (projectId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/certificates/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: 'Success',
        description: 'Certificate issued successfully',
      });
    } catch (error: any) {
      console.error('AdminAnalytics: Issue certificate error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to issue certificate',
        variant: 'destructive',
      });
    }
  };

  const handleBulkIssueCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/certificates/bulk-issue`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: 'Success',
        description: 'Bulk certificates issued successfully',
      });
    } catch (error: any) {
      console.error('AdminAnalytics: Bulk issue certificates error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to issue bulk certificates',
        variant: 'destructive',
      });
    }
  };

  const handleCreateEvent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newEvent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvents([...events, { ...newEvent, id: data.eventId }]);
      setIsEventModalOpen(false);
      setNewEvent({ title: '', date: '', description: '', location: '', category: '', isVirtual: false });
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    } catch (error: any) {
      console.error('AdminAnalytics: Create event error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const handleGalleryUpload = async () => {
    try {
      const formData = new FormData();
      galleryFiles.forEach((file) => formData.append('files', file));
      const res = await fetch(`${API_BASE_URL}/admin/gallery/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGalleryFiles([]);
      setIsGalleryModalOpen(false);
      toast({
        title: 'Success',
        description: 'Gallery images uploaded successfully',
      });
    } catch (error: any) {
      console.error('AdminAnalytics: Gallery upload error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload gallery images',
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} overflow-x-hidden transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'} backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Analytics</h1>
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
        {/* Analytics Overview */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <BarChart className="h-5 w-5 mr-2" />
              Analytics Overview
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4 rounded-md`}>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Total Users</p>
                <p className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-2xl font-bold`}>{analytics.totalUsers}</p>
              </div>
              <div className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4 rounded-md`}>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Total Projects</p>
                <p className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-2xl font-bold`}>{analytics.totalProjects}</p>
              </div>
              <div className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4 rounded-md`}>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Total Events</p>
                <p className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-2xl font-bold`}>{analytics.totalEvents}</p>
              </div>
              <div className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4 rounded-md`}>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Top Domain</p>
                <p className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-2xl font-bold`}>
                  {Object.entries(analytics.domainCounts).reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0])[0] || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Review */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Code className="h-5 w-5 mr-2" />
              Project Review
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Manage submitted projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Creator</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Domain</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Status</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No projects to review</TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{project.title}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{project.creator.fullName}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{project.domain}</TableCell>
                      <TableCell>
                        <Badge
                          variant={project.status === 'approved' ? 'default' : project.status === 'rejected' ? 'destructive' : 'secondary'}
                          className="text-sm"
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {project.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} h-9`}
                                onClick={() => handleProjectStatus(project.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${isDarkMode ? 'text-red-400 border-red-400/50 hover:bg-red-400/10' : 'text-red-600 border-red-300 hover:bg-red-100'} h-9`}
                                onClick={() => handleProjectStatus(project.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {project.status === 'approved' && (
                            <Button
                              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                              onClick={() => handleIssueCertificate(project.id)}
                            >
                              <Award className="h-4 w-4 mr-1" />
                              Issue Certificate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9 mt-4`}
              onClick={handleBulkIssueCertificates}
            >
              <Award className="h-4 w-4 mr-1" />
              Issue All Certificates
            </Button>
          </CardContent>
        </Card>

        {/* Event Management */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Calendar className="h-5 w-5 mr-2" />
              Event Management
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Create and manage events</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9 mb-4`}
              onClick={() => setIsEventModalOpen(true)}
            >
              Create Event
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Title</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Date</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Category</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No events available</TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{event.title}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{event.category}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{event.location} {event.isVirtual ? '(Virtual)' : ''}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Gallery Upload */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Upload className="h-5 w-5 mr-2" />
              Gallery Upload
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Upload event images</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
              onClick={() => setIsGalleryModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Images
            </Button>
          </CardContent>
        </Card>

        {/* Event Creation Modal */}
        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-md`}>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-title" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Event Title</Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="event-date" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Date</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="event-description" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Description</Label>
                <Input
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="event-location" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Location</Label>
                <Input
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="event-category" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Category</Label>
                <Select onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}>
                  <SelectTrigger className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  id="event-isVirtual"
                  type="checkbox"
                  checked={newEvent.isVirtual}
                  onChange={(e) => setNewEvent({ ...newEvent, isVirtual: e.target.checked })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50' : 'bg-gray-100 border-blue-300'} h-4 w-4`}
                />
                <Label htmlFor="event-isVirtual" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Virtual Event</Label>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9`}
                onClick={() => setIsEventModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={handleCreateEvent}
                disabled={!newEvent.title || !newEvent.date || !newEvent.description || !newEvent.location || !newEvent.category}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Gallery Upload Modal */}
        <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
          <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-md`}>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Upload Gallery Images</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gallery-files" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Select Images</Label>
                <Input
                  id="gallery-files"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              {galleryFiles.length > 0 && (
                <div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Selected Files:</p>
                  <ul className="list-disc pl-5">
                    {galleryFiles.map((file, index) => (
                      <li key={index} className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9`}
                onClick={() => setIsGalleryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={handleGalleryUpload}
                disabled={galleryFiles.length === 0}
              >
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminAnalytics;
