import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Sun, Moon, Settings, Bell, Edit, Github, LinkedIn, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Profile {
  id: string;
  fullName: string;
  bio: string;
  skills: string[];
  badges: { id: string; name: string; icon: string; earnedAt: string }[];
  certificates: { id: string; title: string; issuer: string; date: string }[];
  github?: string;
  linkedIn?: string;
  portfolio?: string;
  contributions: { id: string; description: string; date: string }[];
  activity: { id: string; event: string; date: string }[];
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProfile(data.profile);
        setFormData(data.profile);
      } catch (error) {
        console.error('ProfilePage: Fetch profile error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch profile data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map((skill) => skill.trim());
    setFormData((prev) => ({ ...prev, skills }));
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(data.profile);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('ProfilePage: Update profile error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
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

  if (!profile) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
            : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'
        } flex justify-center items-center`}
      >
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          No profile data available
        </p>
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
            <h1
              className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Profile
            </h1>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => setIsEditing(!isEditing)}
                aria-label={isEditing ? 'Cancel editing' : 'Edit profile'}
              >
                <Edit className="h-5 w-5" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 space-y-6">
        {/* Profile Information */}
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
              {profile.fullName}
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Personal Profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label
                    className={`${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    } text-sm font-semibold`}
                  >
                    Bio
                  </label>
                  <Textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
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
                    Skills (comma-separated)
                  </label>
                  <Input
                    name="skills"
                    value={formData.skills?.join(', ') || ''}
                    onChange={handleSkillsChange}
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
                    GitHub
                  </label>
                  <Input
                    name="github"
                    value={formData.github || ''}
                    onChange={handleInputChange}
                    className={`${
                      isDarkMode
                        ? 'bg-gray-800 text-white border-cyan-500/50'
                        : 'bg-white text-gray-900 border-blue-300'
                    } mt-1`}
                  />
                </div>
                <div>
                  <label
                    className=`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`
                  >
                    LinkedIn
                  </label>
                  <Input
                    name="linkedIn"
                    value={formData.linkedIn || ''}
                    onChange={handleInputChange}
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
                    Portfolio
                  </label>
                  <Input
                    name="portfolio"
                    value={formData.portfolio || ''}
                    onChange={handleInputChange}
                    className={`${
                      isDarkMode
                        ? 'bg-gray-800 text-white border-cyan-500/50'
                        : 'bg-white text-gray-900 border-blue-300'
                    } mt-1`}
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={handleUpdateProfile}
                    className={`${
                      isDarkMode
                        ? 'bg-cyan-600 hover:bg-cyan-500'
                        : 'bg-blue-600 hover:bg-blue-500'
                    } text-white`}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className={`${
                      isDarkMode
                        ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                        : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3
                    className={`${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    } text-sm font-semibold`}
                  >
                    Bio
                  </h3>
                  <p
                    className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                  >
                    {profile.bio || 'No bio provided'}
                  </p>
                </div>
                <div>
                  <h3
                    className={`${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    } text-sm font-semibold`}
                  >
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <Badge key={index} className="text-xs">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p
                        className={`${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        } text-sm`}
                      >
                        No skills listed
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3
                    className={`${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    } text-sm font-semibold`}
                  >
                    Social Links
                  </h3>
                  <div className="flex space-x-4">
                    {profile.github && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          isDarkMode
                            ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                            : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                        }`}
                        onClick={() => window.open(profile.github, '_blank')}
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                    {profile.linkedIn && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          isDarkMode
                            ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                            : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                        }`}
                        onClick={() => window.open(profile.linkedIn, '_blank')}
                      >
                        <LinkedIn className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {profile.portfolio && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          isDarkMode
                            ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                            : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                        }`}
                        onClick={() => window.open(profile.portfolio, '_blank')}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Portfolio
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
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
              Badges
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Achievements earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.badges.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No badges earned
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                  >
                    <div className="flex flex-col space-y-3">
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="w-16 h-16 object-contain mx-auto"
                      />
                      <span
                        className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        } text-sm font-semibold text-center`}
                      >
                        {badge.name}
                      </span>
                      <Badge className="text-xs w-fit mx-auto">
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificates */}
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
              Certificates
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Certifications earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.certificates.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No certificates earned
              </p>
            ) : (
              <div className="space-y-4">
                {profile.certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className={`${
                      isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'
                    } p-4 rounded-md`}
                  >
                    <h3
                      className={`${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } text-sm font-semibold`}
                    >
                      {certificate.title}
                    </h3>
                    <p
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                    >
                      Issuer: {certificate.issuer}
                    </p>
                    <p
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                    >
                      Date: {new Date(certificate.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contributions */}
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
              Contributions
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Your contributions to the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.contributions.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No contributions recorded
              </p>
            ) : (
              <ul className="space-y-2">
                {profile.contributions.map((contribution) => (
                  <li
                    key={contribution.id}
                    className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                  >
                    <span className="font-semibold">
                      {new Date(contribution.date).toLocaleDateString()}:
                    </span>{' '}
                    {contribution.description}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
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
              Activity
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Recent activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.activity.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No activity recorded
              </p>
            ) : (
              <ul className="space-y-2">
                {profile.activity.map((event) => (
                  <li
                    key={event.id}
                    className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                  >
                    <span className="font-semibold">
                      {new Date(event.date).toLocaleDateString()}:
                    </span>{' '}
                    {event.event}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
