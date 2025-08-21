import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Code, Settings, Shield, UserCheck, UserX, Mail, FileText, Search, Filter, FileCheck,LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  rollNumber: string;
  isActive: boolean;
  avatar: string;
  skills: string[];
  projects: number;
  stars: number;
  isOnline: boolean;
}

// Simple Error Boundary Component
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const errorHandler = (error) => {
      console.error('ErrorBoundary caught error:', error);
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);
  if (hasError) return fallback;
  return children;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeEvents: 0,
    pendingApprovals: 0,
    totalProjects: 0,
    totalAnnouncements: 0,
  });
  const [pendingMembers, setPendingMembers] = useState([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [announcement, setAnnouncement] = useState({ title: '', message: '', target: 'all', priority: 'normal' });
  const [eventData, setEventData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 16),
    description: '',
    location: '',
    category: 'General',
    isVirtual: false,
    attendees: 0,
    image: null as File | null,
  });
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check session status on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('AdminDashboard: Checking session with cookies:', document.cookie);
        const response = await fetch(`${API_BASE_URL}/check-session-status`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('AdminDashboard: Session check response headers:', Object.fromEntries(response.headers));
        const data = await response.json();
        if (!response.ok || data.role !== 'admin') {
          throw new Error('Admin access required');
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('AdminDashboard: Session check error:', error);
        setIsAuthenticated(false);
        toast({
          title: 'Session Error',
          description: 'Please log in as an admin to access the dashboard.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/admin-login'), 2000);
      }
    };

    checkSession();
  }, [navigate, toast]);

  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchData = async () => {
      try {
        console.log('AdminDashboard: Cookies before analytics request:', document.cookie);
        const analyticsResponse = await fetch(`${API_BASE_URL}/admin/analytics`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('AdminDashboard: Analytics response headers:', Object.fromEntries(analyticsResponse.headers));
        const analyticsData = await analyticsResponse.json();
        if (!analyticsResponse.ok) {
          throw new Error(analyticsData.error || 'Failed to fetch analytics');
        }
        setStats(analyticsData.stats || { totalMembers: 0, activeEvents: 0, pendingApprovals: 0, totalProjects: 0, totalAnnouncements: 0 });

        console.log('AdminDashboard: Sending approvals request with credentials: include');
        const approvalsResponse = await fetch(`${API_BASE_URL}/admin/pending-approvals`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('AdminDashboard: Approvals response headers:', Object.fromEntries(approvalsResponse.headers));
        const approvalsData = await approvalsResponse.json();
        if (!approvalsResponse.ok) {
          throw new Error(approvalsData.error || 'Failed to fetch pending approvals');
        }
        setPendingMembers(approvalsData.pendingApprovals || []);

        console.log('AdminDashboard: Sending members request with credentials: include');
        const membersResponse = await fetch(
          `${API_BASE_URL}/admin/members?search=${encodeURIComponent(searchQuery)}&department=${encodeURIComponent(departmentFilter)}&year=${encodeURIComponent(yearFilter)}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
          }
        );
        console.log('AdminDashboard: Members response headers:', Object.fromEntries(membersResponse.headers));
        const membersData = await membersResponse.json();
        console.log('AdminDashboard: Members response data:', membersData);
        if (!membersResponse.ok) {
          throw new Error(membersData.error || 'Failed to fetch members');
        }
        const membersArray = Array.isArray(membersData.members)
          ? membersData.members.map((member: any) => ({
              id: member.id || '',
              name: member.name || 'Unknown',
              email: member.email || '',
              phone: member.phone || '',
              department: member.department || '',
              year: member.year || '',
              rollNumber: member.rollNumber || '',
              isActive: member.isActive ?? true,
              avatar: member.avatar || '',
              skills: Array.isArray(member.skills) ? member.skills : [],
              projects: member.projects || 0,
              stars: member.stars || 0,
              isOnline: member.isOnline ?? false,
            }))
          : [];
        setMembers(membersArray);

        console.log('AdminDashboard: Sending notifications request with credentials: include');
        const notificationsResponse = await fetch(`${API_BASE_URL}/notifications`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('AdminDashboard: Notifications response headers:', Object.fromEntries(notificationsResponse.headers));
        const notificationsData = await notificationsResponse.json();
        if (!notificationsResponse.ok) {
          throw new Error(notificationsData.error || 'Failed to fetch notifications');
        }
        setRecentActivities(notificationsData.notifications || []);
      } catch (error) {
        console.error('AdminDashboard: Fetch error:', error);
        toast({
          title: 'Error',
          description: error.message || 'An error occurred while fetching data',
          variant: 'destructive',
        });
        setMembers([]);
        if (error.message.includes('401')) {
          setTimeout(() => navigate('/admin-login'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, searchQuery, departmentFilter, yearFilter, toast, navigate]);

  const handleApproval = async (userId: string, action: 'approve' | 'reject') => {
    try {
      console.log(`AdminDashboard: Sending approval request for user ${userId} with action: ${action}`);
      const response = await fetch(`${API_BASE_URL}/admin/approve-member/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      console.log('AdminDashboard: Approval response headers:', Object.fromEntries(response.headers));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process approval');
      }

      toast({
        title: action === 'approve' ? 'Member Approved' : 'Member Rejected',
        description: data.message,
      });

      console.log('AdminDashboard: Refreshing pending approvals');
      const approvalsResponse = await fetch(`${API_BASE_URL}/admin/pending-approvals`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      console.log('AdminDashboard: Approvals refresh response headers:', Object.fromEntries(approvalsResponse.headers));
      const approvalsData = await approvalsResponse.json();
      if (approvalsResponse.ok) {
        setPendingMembers(approvalsData.pendingApprovals || []);
      }

      // Refresh members list
      const membersResponse = await fetch(
        `${API_BASE_URL}/admin/members?search=${encodeURIComponent(searchQuery)}&department=${encodeURIComponent(departmentFilter)}&year=${encodeURIComponent(yearFilter)}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        }
      );
      const membersData = await response.json();
      if (membersResponse.ok) {
        const membersArray = Array.isArray(membersData.members)
          ? membersData.members.map((member: any) => ({
              id: member.id || '',
              name: member.name || 'Unknown',
              email: member.email || '',
              phone: member.phone || '',
              department: member.department || '',
              year: member.year || '',
              rollNumber: member.rollNumber || '',
              isActive: member.isActive ?? true,
              avatar: member.avatar || '',
              skills: Array.isArray(member.skills) ? member.skills : [],
              projects: member.projects || 0,
              stars: member.stars || 0,
              isOnline: member.isOnline ?? false,
            }))
          : [];
        setMembers(membersArray);
      }
    } catch (error) {
      console.error('AdminDashboard: Approval error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      if (error.message.includes('401')) {
        setTimeout(() => navigate('/admin-login'), 2000);
      }
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('AdminDashboard: Sending create event request with credentials: include');
      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('date', eventData.date);
      formData.append('description', eventData.description);
      formData.append('location', eventData.location);
      formData.append('category', eventData.category);
      formData.append('isVirtual', eventData.isVirtual.toString());
      formData.append('attendees', eventData.attendees.toString());
      if (eventData.image) {
        formData.append('image', eventData.image);
      }

      const response = await fetch(`${API_BASE_URL}/admin/events`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      console.log('AdminDashboard: Create event response headers:', Object.fromEntries(response.headers));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      toast({
        title: 'Event Created',
        description: data.message,
      });
      setIsEventModalOpen(false);
      setEventData({
        title: '',
        date: new Date().toISOString().slice(0, 16),
        description: '',
        location: '',
        category: 'General',
        isVirtual: false,
        attendees: 0,
        image: null,
      });
    } catch (error) {
      console.error('AdminDashboard: Create event error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      if (error.message.includes('401')) {
        setTimeout(() => navigate('/admin-login'), 2000);
      }
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('AdminDashboard: Sending announcement request with data:', announcement);
      const response = await fetch(`${API_BASE_URL}/admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(announcement),
      });

      console.log('AdminDashboard: Announcement response headers:', Object.fromEntries(response.headers));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send announcement');
      }

      toast({
        title: 'Announcement Sent',
        description: data.message,
      });
      setIsAnnouncementModalOpen(false);
      setAnnouncement({ title: '', message: '', target: 'all', priority: 'normal' });
      // Refresh recent activities
      const notificationsResponse = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      const notificationsData = await notificationsResponse.json();
      if (notificationsResponse.ok) {
        setRecentActivities(notificationsData.notifications || []);
      }
    } catch (error) {
      console.error('AdminDashboard: Announcement error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      if (error.message.includes('401')) {
        setTimeout(() => navigate('/admin-login'), 2000);
      }
    }
  };

  const handleExportMembers = () => {
    if (members.length === 0) {
      toast({
        title: 'No Members',
        description: 'There are no members to export.',
        variant: 'destructive',
      });
      return;
    }
    const headers = ['Name', 'Email', 'Roll Number', 'Department', 'Year', 'Projects', 'Stars', 'Skills'];
    const csvRows = [
      headers.join(','),
      ...members.map((member: any) =>
        [
          `"${member.name || 'Unknown'}"`,
          member.email || 'Unknown',
          member.rollNumber || '',
          member.department || '',
          member.year || '',
          member.projects || 0,
          member.stars || 0,
          `"${(Array.isArray(member.skills) ? member.skills : []).join(';')}"`,
        ].join(',')
      ),
    ];
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'members_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isAuthenticated === null || loading) {
    return <div className="text-white text-center text-sm p-4">Loading...</div>;
  }

  return (
    <ErrorBoundary fallback={<div className="text-white text-center text-sm p-4">An error occurred. Please refresh the page.</div>}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <header className="bg-black/20 backdrop-blur-md border-b border-red-500/20 p-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Shield className="h-5 w-5 text-red-400" />
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-1">
              <Dialog open={isAnnouncementModalOpen} onOpenChange={setIsAnnouncementModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-xs py-1 px-2">
                    <Mail className="h-3 w-3 mr-1" />
                    
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/80 border-red-500/20 max-w-[90vw] sm:max-w-md p-4">
                  <DialogHeader>
                    <DialogTitle className="text-white text-base">Send Announcement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSendAnnouncement} className="space-y-3">
                    <div>
                      <Label htmlFor="announcement-title" className="text-white text-sm">Title</Label>
                      <Input
                        id="announcement-title"
                        value={announcement.title}
                        onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                        className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="announcement-message" className="text-black text-sm">Message</Label>
                      <Textarea
                        id="announcement-message"
                        value={announcement.message}
                        onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                        className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="announcement-target" className="text-white text-sm">Target</Label>
                      <Select
                        value={announcement.target}
                        onValueChange={(value) => setAnnouncement({ ...announcement, target: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-red-500/30 text-sm py-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-red-500/30 text-sm">
                          <SelectItem value="all">All Members</SelectItem>
                          <SelectItem value="CSE">CSE</SelectItem>
                          <SelectItem value="ECE">ECE</SelectItem>
                          <SelectItem value="ME">ME</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="announcement-priority" className="text-white text-sm">Priority</Label>
                      <Select
                        value={announcement.priority}
                        onValueChange={(value) => setAnnouncement({ ...announcement, priority: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-red-500/30 text-sm py-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-red-500/30 text-sm">
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-sm py-1 px-3">Send</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="text-black border-red-400 text-xs py-1 px-2"
                onClick={() => navigate('/members')}
              >
                <Users className="h-3 w-3 mr-1" />
                
              </Button>
              <Button
                variant="outline"
                className="text-black border-red-400 text-xs py-1 px-2"
                onClick={() => navigate('/issuer')}
              >
                <FileCheck className="h-3 w-3 mr-1" />
                
              </Button>
              <Button
                variant="outline"
                className="text-black border-red-400 text-xs py-1 px-2"
                onClick={async () => {
                  try {
                    await fetch(`${API_BASE_URL}/logout`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: { 'Accept': 'application/json' },
                    });
                    navigate('/admin-login');
                  } catch (error) {
                    console.error('AdminDashboard: Logout error:', error);
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto p-3 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
                <CardTitle className="text-sm font-medium text-white">Total Members</CardTitle>
                <Users className="h-3 w-3 text-red-400" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-white">{stats.totalMembers}</div>
                <p className="text-xs text-gray-400">Active members</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
                <CardTitle className="text-sm font-medium text-white">Active Events</CardTitle>
                <Calendar className="h-3 w-3 text-red-400" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-white">{stats.activeEvents}</div>
                <p className="text-xs text-gray-400">Upcoming events</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
                <CardTitle className="text-sm font-medium text-white">Pending Approvals</CardTitle>
                <UserCheck className="h-3 w-3 text-red-400" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-white">{stats.pendingApprovals}</div>
                <p className="text-xs text-gray-400">Awaiting review</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
                <CardTitle className="text-sm font-medium text-white">Total Projects</CardTitle>
                <Code className="h-3 w-3 text-red-400" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-white">{stats.totalProjects}</div>
                <p className="text-xs text-gray-400">Club projects</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
                <CardTitle className="text-sm font-medium text-white">Announcements</CardTitle>
                <Mail className="h-3 w-3 text-red-400" />
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-white">{stats.totalAnnouncements}</div>
                <p className="text-xs text-gray-400">Sent announcements</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="approvals" className="space-y-3">
            <TabsList className="bg-black/20 border-red-500/20 flex overflow-x-auto">
              <TabsTrigger value="approvals" className="data-[state=active]:bg-red-600 text-sm py-1 px-2">Approvals</TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-red-600 text-sm py-1 px-2">Members</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-red-600 text-sm py-1 px-2">Events</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600 text-sm py-1 px-2">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="approvals">
              <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
                <CardHeader className="p-3">
                  <CardTitle className="text-base text-white">Pending Member Approvals</CardTitle>
                  <CardDescription className="text-xs text-gray-300">Review and approve new member registrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-3">
                  {pendingMembers.length === 0 ? (
                    <p className="text-gray-300 text-xs">No pending approvals</p>
                  ) : (
                    pendingMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium text-sm">{member.name || 'Unknown'}</h4>
                          <p className="text-gray-400 text-xs">{member.email || 'Unknown'}</p>
                          <p className="text-gray-400 text-xs">{member.department || ''} - {member.year || ''}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-xs py-1 px-2"
                            onClick={() => handleApproval(member.id, 'approve')}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400 text-xs py-1 px-2"
                            onClick={() => handleApproval(member.id, 'reject')}
                          >
                            <UserX className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="members">
              <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
                <CardHeader className="p-3">
                  <CardTitle className="text-base text-white">Member Management</CardTitle>
                  <CardDescription className="text-xs text-gray-300">Manage all club members and their permissions</CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex space-x-1">
                      <Button variant="outline" className="text-white border-red-400 text-xs py-1 px-2" onClick={handleExportMembers}>
                        <FileText className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 mb-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or roll number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-7 bg-gray-800 text-white border-red-500/30 text-sm py-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-full bg-gray-800 text-white border-red-500/30 text-sm py-1">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-red-500/30 text-sm">
                          <SelectItem value="">All Departments</SelectItem>
                          <SelectItem value="CSE">CSE</SelectItem>
                          <SelectItem value="ECE">ECE</SelectItem>
                          <SelectItem value="ME">ME</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-full bg-gray-800 text-white border-red-500/30 text-sm py-1">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-red-500/30 text-sm">
                          <SelectItem value="">All Years</SelectItem>
                          <SelectItem value="1st">1st</SelectItem>
                          <SelectItem value="2nd">2nd</SelectItem>
                          <SelectItem value="3rd">3rd</SelectItem>
                          <SelectItem value="4th">4th</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-red-500/20">
                        <TableHead className="text-white text-xs">Name</TableHead>
                        <TableHead className="text-white text-xs">Email</TableHead>
                        <TableHead className="text-white text-xs">Roll</TableHead>
                        <TableHead className="text-white text-xs">Dept</TableHead>
                        <TableHead className="text-white text-xs">Year</TableHead>
                        <TableHead className="text-white text-xs">Projects</TableHead>
                        <TableHead className="text-white text-xs">Skills</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-gray-300 text-center text-xs">
                            No members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        members.map((member: Member) => (
                          <TableRow key={member.id || Math.random()} className="border-red-500/20">
                            <TableCell className="text-white text-xs">{member.name || 'Unknown'}</TableCell>
                            <TableCell className="text-gray-300 text-xs">{member.email || 'Unknown'}</TableCell>
                            <TableCell className="text-gray-300 text-xs">{member.rollNumber || ''}</TableCell>
                            <TableCell className="text-gray-300 text-xs">{member.department || ''}</TableCell>
                            <TableCell className="text-gray-300 text-xs">{member.year || ''}</TableCell>
                            <TableCell className="text-gray-300 text-xs">{member.projects || 0}</TableCell>
                            <TableCell className="text-gray-300 text-xs">
                              {(Array.isArray(member.skills) ? member.skills : []).join(', ') || 'None'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="events">
              <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
                <CardHeader className="p-3">
                  <CardTitle className="text-base text-white">Event Management</CardTitle>
                  <CardDescription className="text-xs text-gray-300">Create and manage club events</CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 text-xs py-1 px-2 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        New Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 border-red-500/20 max-w-[90vw] sm:max-w-md p-4">
                      <DialogHeader>
                        <DialogTitle className="text-white text-base">Create Event</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateEvent} className="space-y-3">
                        <div>
                          <Label htmlFor="event-title" className="text-white text-sm">Title</Label>
                          <Input
                            id="event-title"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-date" className="text-white text-sm">Date & Time</Label>
                          <Input
                            id="event-date"
                            type="datetime-local"
                            value={eventData.date}
                            onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-description" className="text-white text-sm">Description</Label>
                          <Textarea
                            id="event-description"
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                            rows={3}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-location" className="text-white text-sm">Location</Label>
                          <Input
                            id="event-location"
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-attendees" className="text-white text-sm">Expected Attendees</Label>
                          <Input
                            id="event-attendees"
                            type="number"
                            value={eventData.attendees}
                            onChange={(e) => setEventData({ ...eventData, attendees: parseInt(e.target.value) || 0 })}
                            className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-image" className="text-white text-sm">Event Image</Label>
                          <Input
                            id="event-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEventData({ ...eventData, image: e.target.files ? e.target.files[0] : null })}
                            className="bg-gray-800 text-white border-red-500/30 text-sm py-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-category" className="text-white text-sm">Category</Label>
                          <Select
                            value={eventData.category}
                            onValueChange={(value) => setEventData({ ...eventData, category: value })}
                          >
                            <SelectTrigger className="bg-gray-800 text-white border-red-500/30 text-sm py-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-red-500/30 text-sm">
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Workshop">Workshop</SelectItem>
                              <SelectItem value="Hackathon">Hackathon</SelectItem>
                              <SelectItem value="Seminar">Seminar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="event-isVirtual"
                            checked={eventData.isVirtual}
                            onCheckedChange={(checked) => setEventData({ ...eventData, isVirtual: !!checked })}
                          />
                          <Label htmlFor="event-isVirtual" className="text-white text-sm">Virtual Event</Label>
                        </div>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-sm py-1 px-3">Create</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <p className="text-gray-300 text-xs">Event list and management features will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
                <CardHeader className="p-3">
                  <CardTitle className="text-base text-white">Analytics & Reports</CardTitle>
                  <CardDescription className="text-xs text-gray-300">View club statistics and generate reports</CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <h4 className="text-white font-medium text-sm mb-1">Member Growth</h4>
                      <p className="text-lg font-bold text-red-400">+23%</p>
                      <p className="text-gray-400 text-xs">This quarter</p>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <h4 className="text-white font-medium text-sm mb-1">Event Attendance</h4>
                      <p className="text-lg font-bold text-red-400">87%</p>
                      <p className="text-gray-400 text-xs">Average rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
            <CardHeader className="p-3">
              <CardTitle className="text-base text-white">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {recentActivities.length === 0 ? (
                <p className="text-gray-300 text-xs">No recent activities</p>
              ) : (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex justify-between items-center p-2 bg-red-500/10 rounded-lg">
                    <div>
                      <p className="text-white font-medium text-sm">{activity.message || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">By Admin</p>
                    </div>
                    <Badge variant="outline" className="text-gray-300 border-red-500/30 text-xs">
                      {new Date(activity.createdAt).toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
