import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Sun, Moon, Settings, Bell, Send, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Team {
  id: string;
  name: string;
  projectIdea: string;
  skillsNeeded: string[];
  currentMembers: number;
  maxMembers: number;
  teamCode: string;
  members: { id: string; name: string; avatar: string }[];
}

interface Activity {
  id: string;
  message: string;
  timestamp: string;
}

const CollaborationHub: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Team>>({});
  const [teamCode, setTeamCode] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; user: string; message: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/teams`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTeams(data.teams);
        setFilteredTeams(data.teams);
      } catch (error) {
        console.error('CollaborationHub: Fetch teams error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch teams',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/activities`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setActivities(data.activities);
      } catch (error) {
        console.error('CollaborationHub: Fetch activities error:', error);
      }
    };

    fetchTeams();
    fetchActivities();
  }, [toast]);

  useEffect(() => {
    const filtered = teams.filter(
      (team) =>
        (team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         team.projectIdea.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterType === 'all' || team.projectIdea.toLowerCase().includes(filterType.toLowerCase())) &&
        (filterSkill === 'all' || team.skillsNeeded.includes(filterSkill))
    );
    setFilteredTeams(filtered);
  }, [searchQuery, filterType, filterSkill, teams]);

  const handleCreateTeam = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTeams([...teams, data.team]);
      setFilteredTeams([...teams, data.team]);
      setIsCreateModalOpen(false);
      setFormData({});
      toast({
        title: 'Success',
        description: `Team ${data.team.name} created successfully`,
      });
    } catch (error) {
      console.error('CollaborationHub: Create team error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  const handleJoinTeam = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ teamCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      navigate(`/team/${data.team.id}`);
    } catch (error) {
      console.error('CollaborationHub: Join team error:', error);
      toast({
        title: 'Error',
        description: 'Invalid team code or failed to join',
        variant: 'destructive',
      });
    }
  };

  const handleJoinRequest = async (teamId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}/request`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: 'Success',
        description: 'Join request sent successfully',
      });
    } catch (error) {
      console.error('CollaborationHub: Join request error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send join request',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTeam || !newMessage.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${selectedTeam.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: newMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMessages([...chatMessages, data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('CollaborationHub: Send message error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTeam || !event.target.files) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMessages([...chatMessages, { id: data.id, user: 'You', message: `File uploaded: ${data.url}`, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error('CollaborationHub: File upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
            : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'
        } flex justify-center items-center`}
      >
        <OGLoader />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
          : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'
      } overflow-x-hidden transition-colors duration-300`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'
        } backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Collaboration Hub
              </h1>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                Find teammates, join projects, or create your own team to collaborate in real time.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className={`${
                  isDarkMode
                    ? 'bg-cyan-600 hover:bg-cyan-500'
                    : 'bg-blue-600 hover:bg-blue-500'
                } text-white`}
              >
                + Create Team
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/members')}
                aria-label="Members"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 flex flex-col lg:flex-row gap-6">
        {/* Team Discovery Section */}
        <div className="flex-1 space-y-6">
          <Card
            className={`${
              isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
            } backdrop-blur-sm`}
          >
            <CardHeader>
              <CardTitle
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-lg sm:text-xl flex items-center`}
              >
                <Users className="h-5 w-5 mr-2" />
                Team Discovery
              </CardTitle>
              <CardDescription
                className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
              >
                Find teams to join or filter by project type and skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input
                  type="text"
                  placeholder="Search teams or projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${
                    isDarkMode
                      ? 'bg-gray-800 text-white border-cyan-500/50'
                      : 'bg-white text-gray-900 border-blue-300'
                  } flex-1`}
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger
                    className={`${
                      isDarkMode
                        ? 'bg-gray-800 text-white border-cyan-500/50'
                        : 'bg-white text-gray-900 border-blue-300'
                    } w-full sm:w-40`}
                  >
                    <SelectValue placeholder="Project Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="mobile">Mobile Apps</SelectItem>
                    <SelectItem value="ai">AI/ML</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="iot">IoT</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSkill} onValueChange={setFilterSkill}>
                  <SelectTrigger
                    className={`${
                      isDarkMode
                        ? 'bg-gray-800 text-white border-cyan-500/50'
                        : 'bg-white text-gray-900 border-blue-300'
                    } w-full sm:w-40`}
                  >
                    <SelectValue placeholder="Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="ML">Machine Learning</SelectItem>
                    <SelectItem value="UI/UX">UI/UX</SelectItem>
                    <SelectItem value="Node.js">Node.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeams.length === 0 ? (
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                    No teams found
                  </p>
                ) : (
                  filteredTeams.map((team) => (
                    <Card
                      key={team.id}
                      className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                    >
                      <div className="flex flex-col space-y-3">
                        <h3
                          className={`${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          } text-sm font-semibold`}
                        >
                          {team.name}
                        </h3>
                        <p
                          className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                        >
                          {team.projectIdea}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {team.skillsNeeded.map((skill, index) => (
                            <Badge key={index} className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p
                          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}
                        >
                          {team.currentMembers}/{team.maxMembers} Members
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              isDarkMode
                                ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                                : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                            }`}
                            onClick={() => handleJoinRequest(team.id)}
                          >
                            Request to Join
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              isDarkMode
                                ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                                : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                            }`}
                            onClick={() => setSelectedTeam(team)}
                          >
                            View Dashboard
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Join Team with Code */}
          <Card
            className={`${
              isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
            } backdrop-blur-sm`}
          >
            <CardHeader>
              <CardTitle
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-lg sm:text-xl`}
              >
                Join Team with Code
              </CardTitle>
              <CardDescription
                className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
              >
                Enter a team code to join instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Enter Team Code"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  className={`${
                    isDarkMode
                      ? 'bg-gray-800 text-white border-cyan-500/50'
                      : 'bg-white text-gray-900 border-blue-300'
                  }`}
                />
                <Button
                  onClick={handleJoinTeam}
                  className={`${
                    isDarkMode
                      ? 'bg-cyan-600 hover:bg-cyan-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  } text-white`}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="w-full lg:w-80">
          <Card
            className={`${
              isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
            } backdrop-blur-sm`}
          >
            <CardHeader>
              <CardTitle
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-lg sm:text-xl`}
              >
                Activity Feed
              </CardTitle>
              <CardDescription
                className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
              >
                Recent updates and invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                  No recent activity
                </p>
              ) : (
                <ul className="space-y-2">
                  {activities.map((activity) => (
                    <li
                      key={activity.id}
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                    >
                      <span className="font-semibold">
                        {new Date(activity.timestamp).toLocaleDateString()}:
                      </span>{' '}
                      {activity.message}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Team Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          className={`${
            isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          } max-w-md`}
        >
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-sm font-semibold`}
              >
                Team Name
              </label>
              <Input
                name="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 text-white border-cyan-500/50'
                    : 'bg-white text-gray-900 border-blue-300'
                } mt-1`}
              />
            </div>
            <div>
              <label
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-sm font-semibold`}
              >
                Project Idea
              </label>
              <Input
                name="projectIdea"
                value={formData.projectIdea || ''}
                onChange={(e) => setFormData({ ...formData, projectIdea: e.target.value })}
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 text-white border-cyan-500/50'
                    : 'bg-white text-gray-900 border-blue-300'
                } mt-1`}
              />
            </div>
            <div>
              <label
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-sm font-semibold`}
              >
                Required Skills (comma-separated)
              </label>
              <Input
                name="skillsNeeded"
                value={formData.skillsNeeded?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skillsNeeded: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 text-white border-cyan-500/50'
                    : 'bg-white text-gray-900 border-blue-300'
                } mt-1`}
              />
            </div>
            <div>
              <label
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-sm font-semibold`}
              >
                Max Team Size
              </label>
              <Input
                type="number"
                name="maxMembers"
                value={formData.maxMembers || ''}
                onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })}
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 text-white border-cyan-500/50'
                    : 'bg-white text-gray-900 border-blue-300'
                } mt-1`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateTeam}
              className={`${
                isDarkMode
                  ? 'bg-cyan-600 hover:bg-cyan-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              } text-white`}
            >
              Create Team
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className={`${
                isDarkMode
                  ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                  : 'text-blue-600 border-blue-300 hover:bg-blue-100'
              }`}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Dashboard Modal */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent
          className={`${
            isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
          } max-w-2xl`}
        >
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name} Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-sm font-semibold`}
              >
                Project Idea
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                {selectedTeam?.projectIdea}
              </p>
            </div>
            <div>
              <h3
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-sm font-semibold`}
              >
                Members
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedTeam?.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                    >
                      {member.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3
                className={`${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                } text-sm font-semibold`}
              >
                Team Chat
              </h3>
              <div
                className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                } h-64 overflow-y-auto p-4 rounded-md`}
              >
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <span
                      className={`${
                        isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                      } text-xs font-semibold`}
                    >
                      {msg.user} ({new Date(msg.timestamp).toLocaleTimeString()}):
                    </span>{' '}
                    <span
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                    >
                      {msg.message}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`${
                    isDarkMode
                      ? 'bg-gray-800 text-white border-cyan-500/50'
                      : 'bg-white text-gray-900 border-blue-300'
                  }`}
                />
                <Button
                  onClick={handleSendMessage}
                  className={`${
                    isDarkMode
                      ? 'bg-cyan-600 hover:bg-cyan-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  } text-white`}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className={`${
                    isDarkMode
                      ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                      : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/team/${selectedTeam?.id}`)}
              className={`${
                isDarkMode
                  ? 'bg-cyan-600 hover:bg-cyan-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              } text-white`}
            >
              Open Chat Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollaborationHub;
