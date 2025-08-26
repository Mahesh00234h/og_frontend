import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Calendar, Code, Star, Bell, Settings, Sun, Moon, Edit, Award, Github, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  github?: string;
  linkedin?: string;
}

interface Project {
  id: string;
  title: string;
  domain: string;
  stars: number;
  githubRepo: string;
  linkedinPost: string;
  deploymentUrl: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
}

const MyDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [certificateStatus, setCertificateStatus] = useState<string>('Not Eligible');
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [editProfile, setEditProfile] = useState<{
    fullName: string;
    skills: string;
    github: string;
    linkedin: string;
  }>({ fullName: '', skills: '', github: '', linkedin: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

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
        setEditProfile({
          fullName: data.user.fullName,
          skills: data.user.skills?.join(', ') || '',
          github: data.user.github || '',
          linkedin: data.user.linkedin || '',
        });
        // Calculate profile completion
        const fields = [
          data.user.fullName,
          data.user.email,
          data.user.rollNumber,
          data.user.department,
          data.user.year,
          data.user.skills?.length,
          data.user.github,
          data.user.linkedin,
        ];
        const completedFields = fields.filter(Boolean).length;
        setProfileCompletion(Math.round((completedFields / 8) * 100));
      } catch (error) {
        console.error('MyDashboard: Fetch user error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Please log in to access the dashboard',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/projects?user=true`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProjects(data.projects);
      } catch (error) {
        console.error('MyDashboard: Fetch projects error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive',
        });
      }
    };

    const fetchAchievements = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/achievements`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAchievements(data.achievements);
      } catch (error) {
        console.error('MyDashboard: Fetch achievements error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch achievements',
          variant: 'destructive',
        });
      }
    };

    const fetchBadges = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/badges`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBadges(data.badges);
      } catch (error) {
        console.error('MyDashboard: Fetch badges error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch badges',
          variant: 'destructive',
        });
      }
    };

    const fetchCertificateStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/challenges/certificate/status`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCertificateStatus(data.status); // e.g., 'Not Eligible', 'Eligible', 'Issued'
      } catch (error) {
        console.error('MyDashboard: Fetch certificate status error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch certificate status',
          variant: 'destructive',
        });
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchProjects(), fetchAchievements(), fetchBadges(), fetchCertificateStatus()]);
      setLoading(false);
    };

    loadData();
  }, [navigate, toast]);

  const handleEditProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: editProfile.fullName,
          skills: editProfile.skills.split(',').map((s) => s.trim()),
          github: editProfile.github,
          linkedin: editProfile.linkedin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser((prev) => ({
        ...prev!,
        fullName: editProfile.fullName,
        skills: editProfile.skills.split(',').map((s) => s.trim()),
        github: editProfile.github,
        linkedin: editProfile.linkedin,
      }));
      setProfileCompletion(
        Math.round(
          ([
            editProfile.fullName,
            user?.email,
            user?.rollNumber,
            user?.department,
            user?.year,
            editProfile.skills.split(',').map((s) => s.trim()).length,
            editProfile.github,
            editProfile.linkedin,
          ].filter(Boolean).length / 8) * 100
        )
      );
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditProfileModalOpen(false);
    } catch (error: any) {
      console.error('MyDashboard: Update profile error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} overflow-x-hidden transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'} backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My TechMinds Dashboard</h1>
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
              <Avatar className="cursor-pointer h-9 w-9" onClick={() => setIsEditProfileModalOpen(true)}>
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white text-sm`}>
                  {user.fullName.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 space-y-6">
        {/* User Card */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl sm:text-2xl`}>
              Welcome, {user.fullName}! 👋
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Member ID: {user.rollNumber} | {user.department} | {user.year}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-1">
              <Star className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>
                {projects.reduce((acc, p) => acc + p.stars, 0)} Stars
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Code className={`h-5 w-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{projects.length} Projects</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{achievements.length} Achievements</span>
            </div>
          </CardContent>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Award className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Certificate Status: {certificateStatus}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Edit className={`h-5 w-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Profile Completion: {profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} [&>div]:bg-gradient-to-r [&>div]:from-cyan-600 [&>div]:to-purple-600`} />
              {profileCompletion < 100 && (
                <Button
                  variant="link"
                  className={`${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} text-sm`}
                  onClick={() => setIsEditProfileModalOpen(true)}
                >
                  Complete Your Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Code className="h-5 w-5 mr-2" />
              My Projects
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Your submitted projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No projects submitted yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}>
                    <div className="flex flex-col space-y-3">
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{project.title}</span>
                      <Badge className="text-xs w-fit">{project.domain}</Badge>
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
            <Button
              variant="outline"
              className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm mt-4 h-9`}
              onClick={() => navigate('/challenge')}
            >
              Submit New Project
            </Button>
          </CardContent>
        </Card>

        {/* Achievements Section */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Your accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No achievements yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}>
                    <div className="flex flex-col space-y-2">
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{achievement.title}</span>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{achievement.description}</p>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{new Date(achievement.date).toLocaleDateString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Award className="h-5 w-5 mr-2" />
              Badges
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Your earned badges</CardDescription>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No badges earned yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {badges.map((badge) => (
                  <Badge key={badge.id} className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white text-sm p-2`}>
                    {badge.icon} {badge.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Modal */}
        <Dialog open={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen}>
          <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-md`}>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Full Name</Label>
                <Input
                  id="fullName"
                  value={editProfile.fullName}
                  onChange={(e) => setEditProfile({ ...editProfile, fullName: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="skills" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={editProfile.skills}
                  onChange={(e) => setEditProfile({ ...editProfile, skills: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="github" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>GitHub URL</Label>
                <Input
                  id="github"
                  value={editProfile.github}
                  onChange={(e) => setEditProfile({ ...editProfile, github: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={editProfile.linkedin}
                  onChange={(e) => setEditProfile({ ...editProfile, linkedin: e.target.value })}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9`}
                onClick={() => setIsEditProfileModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={handleEditProfile}
                disabled={!editProfile.fullName}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyDashboard;
