import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Code, Settings, Shield, UserCheck, UserX, Mail, FileText, Search, Filter } from 'lucide-react';
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
      const membersData = await membersResponse.json();
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
      const response = await fetch(`${API_BASE_URL}/admin/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
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
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <ErrorBoundary fallback={<div className="text-white text-center p-6">An error occurred. Please refresh the page.</div>}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <header className="bg-black/20 backdrop-blur-md border-b border-red-500/20 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-400" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isAnnouncementModalOpen} onOpenChange={setIsAnnouncementModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/80 border-red-500/20">
                  <DialogHeader>
                    <DialogTitle className="text-white">Send Announcement</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSendAnnouncement} className="space-y-4">
                    <div>
                      <Label htmlFor="announcement-title" className="text-white">Title</Label>
                      <Input
                        id="announcement-title"
                        value={announcement.title}
                        onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                        className="bg-gray-800 text-white border-red-500/30"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="announcement-message" className="text-white">Message</Label>
                      <Textarea
                        id="announcement-message"
                        value={announcement.message}
                        onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                        className="bg-gray-800 text-white border-red-500/30"
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="announcement-target" className="text-white">Target</Label>
                      <Select
                        value={announcement.target}
                        onValueChange={(value) => setAnnouncement({ ...announcement, target: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-red-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-red-500/30">
                          <SelectItem value="all">All Members</SelectItem>
                          <SelectItem value="CSE">CSE</SelectItem>
                          <SelectItem value="ECE">ECE</SelectItem>
                          <SelectItem value="ME">ME</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="announcement-priority" className="text-white">Priority</Label>
                      <Select
                        value={announcement.priority}
                        onValueChange={(value) => setAnnouncement({ ...announcement, priority: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-red-500/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-red-500/30">
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">Send</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="text-black border-red-400"
                onClick={() => navigate('/members')}
              >
                <Users className="h-4 w-4 mr-2" />
                
              </Button>
              <Button
                variant="outline"
                className="text-black border-red-400"
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
                <Settings className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Members</CardTitle>
                <Users className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalMembers}</div>
                <p className="text-xs text-gray-400">Active members</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.activeEvents}</div>
                <p className="text-xs text-gray-400">Upcoming events</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Pending Approvals</CardTitle>
                <UserCheck className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendingApprovals}</div>
                <p className="text-xs text-gray-400">Awaiting review</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Projects</CardTitle>
                <Code className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
                <p className="text-xs text-gray-400">Club projects</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Announcements</CardTitle>
                <Mail className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalAnnouncements}</div>
                <p className="text-xs text-gray-400">Sent announcements</p>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue="approvals" className="space-y-4">
            <TabsList className="bg-black/20 border-red-500/20">
              <TabsTrigger value="approvals" className="data-[state=active]:bg-red-600">Pending Approvals</TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-red-600">Members</TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-red-600">Events</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="approvals">
              <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Pending Member Approvals</CardTitle>
                  <CardDescription className="text-gray-300">Review and approve new member registrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingMembers.length === 0 ? (
                    <p className="text-gray-300">No pending approvals</p>
                  ) : (
                    pendingMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">{member.name || 'Unknown'}</h4>
                          <p className="text-gray-400 text-sm">{member.email || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">{member.department || ''} - {member.year || ''}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproval(member.id, 'approve')}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400"
                            onClick={() => handleApproval(member.id, 'reject')}
                          >
                            <UserX className="h-4 w-4 mr-1" />
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
                <CardHeader>
                  <CardTitle className="text-white">Member Management</CardTitle>
                  <CardDescription className="text-gray-300">Manage all club members and their permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" className="text-white border-red-400" onClick={handleExportMembers}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export List
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or roll number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 bg-gray-800 text-white border-red-500/30"
                      />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-[180px] bg-gray-800 text-white border-red-500/30">
                        <SelectValue placeholder="Filter by Department" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-red-500/30">
                        <SelectItem value="">All Departments</SelectItem>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="ECE">ECE</SelectItem>
                        <SelectItem value="ME">ME</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="w-[180px] bg-gray-800 text-white border-red-500/30">
                        <SelectValue placeholder="Filter by Year" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-red-500/30">
                        <SelectItem value="">All Years</SelectItem>
                        <SelectItem value="1st">1st</SelectItem>
                        <SelectItem value="2nd">2nd</SelectItem>
                        <SelectItem value="3rd">3rd</SelectItem>
                        <SelectItem value="4th">4th</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-red-500/20">
                        <TableHead className="text-white">Name</TableHead>
                        <TableHead className="text-white">Email</TableHead>
                        <TableHead className="text-white">Roll Number</TableHead>
                        <TableHead className="text-white">Department</TableHead>
                        <TableHead className="text-white">Year</TableHead>
                        <TableHead className="text-white">Projects</TableHead>
                        <TableHead className="text-white">Skills</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-gray-300 text-center">
                            No members found
                          </TableCell>
                        </TableRow>
                      ) : (
                        members.map((member: Member) => (
                          <TableRow key={member.id || Math.random()} className="border-red-500/20">
                            <TableCell className="text-white">{member.name || 'Unknown'}</TableCell>
                            <TableCell className="text-gray-300">{member.email || 'Unknown'}</TableCell>
                            <TableCell className="text-gray-300">{member.rollNumber || ''}</TableCell>
                            <TableCell className="text-gray-300">{member.department || ''}</TableCell>
                            <TableCell className="text-gray-300">{member.year || ''}</TableCell>
                            <TableCell className="text-gray-300">{member.projects || 0}</TableCell>
                            <TableCell className="text-gray-300">
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
                <CardHeader>
                  <CardTitle className="text-white">Event Management</CardTitle>
                  <CardDescription className="text-gray-300">Create and manage club events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        Create New Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/80 border-red-500/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create Event</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                          <Label htmlFor="event-title" className="text-white">Title</Label>
                          <Input
                            id="event-title"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-date" className="text-white">Date & Time</Label>
                          <Input
                            id="event-date"
                            type="datetime-local"
                            value={eventData.date}
                            onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-description" className="text-white">Description</Label>
                          <Textarea
                            id="event-description"
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30"
                            rows={4}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-location" className="text-white">Location</Label>
                          <Input
                            id="event-location"
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                            className="bg-gray-800 text-white border-red-500/30"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-category" className="text-white">Category</Label>
                          <Select
                            value={eventData.category}
                            onValueChange={(value) => setEventData({ ...eventData, category: value })}
                          >
                            <SelectTrigger className="bg-gray-800 text-white border-red-500/30">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-red-500/30">
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
                          <Label htmlFor="event-isVirtual" className="text-white">Virtual Event</Label>
                        </div>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700">Create</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <p className="text-gray-300">Event list and management features will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Analytics & Reports</CardTitle>
                  <CardDescription className="text-gray-300">View club statistics and generate reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Member Growth</h4>
                      <p className="text-2xl font-bold text-red-400">+23%</p>
                      <p className="text-gray-400 text-sm">This quarter</p>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Event Attendance</h4>
                      <p className="text-2xl font-bold text-red-400">87%</p>
                      <p className="text-gray-400 text-sm">Average rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-gray-300">No recent activities</p>
              ) : (
                recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{activity.message || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">By Admin</p>
                    </div>
                    <Badge variant="outline" className="text-gray-300 border-red-500/30">
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
