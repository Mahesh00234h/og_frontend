import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { User, Github, Link, MapPin, Briefcase, Twitter, Sun, Moon, ArrowLeft, Code, Globe } from 'lucide-react';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  rollNumber: string;
  bio: string;
  location: string;
  joinedDate: string;
  website: string;
  github: string;
  linkedin: string;
  twitter: string;
  portfolio: string;
  skills: string[];
  avatar: string;
}

interface Project {
  id: string;
  title: string;
  technology: string;
  stars: number;
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    rollNumber: '',
    bio: '',
    location: '',
    joinedDate: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    portfolio: '',
    skills: [],
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'HTML', 'CSS', 'TypeScript', 'SQL'];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/check-session-status`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Session not active');
        }
        setIsAuthenticated(true);
        setIsOwnProfile(!id || data.user?.id === id);
      } catch (error) {
        console.error('Profile: Session check error:', error);
        setIsAuthenticated(false);
        toast({
          title: 'Session Error',
          description: 'Please log in to access profiles.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    checkSession();
  }, [id, navigate, toast]);

  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchProfile = async () => {
      try {
        const endpoint = id ? `${API_BASE_URL}/users/${id}` : `${API_BASE_URL}/profile`;
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }
        const profileData = {
          id: data.id || data.profile?.id || '',
          name: data.name || data.profile?.name || '',
          email: data.email || data.profile?.email || '',
          phone: data.phone || data.profile?.phone || '',
          department: data.department || data.profile?.department || '',
          year: data.year || data.profile?.year || '',
          rollNumber: data.rollNumber || data.profile?.rollNumber || '',
          bio: data.bio || data.profile?.bio || '',
          location: data.location || data.profile?.location || '',
          joinedDate: data.joinedDate || data.profile?.joinedDate || '',
          website: data.website || data.profile?.website || '',
          github: data.github || data.profile?.github || '',
          linkedin: data.linkedin || data.profile?.linkedin || '',
          twitter: data.twitter || data.profile?.twitter || '',
          portfolio: data.portfolio || data.profile?.portfolio || '',
          skills: Array.isArray(data.skills || data.profile?.skills) ? data.skills || data.profile?.skills : [],
          avatar: data.avatar || data.profile?.avatar || ''
        };
        setProfile(profileData);
        const fields = [
          profileData.name, profileData.email, profileData.phone, profileData.department,
          profileData.year, profileData.rollNumber, profileData.bio, profileData.location,
          profileData.website, profileData.github, profileData.linkedin, profileData.twitter,
          profileData.portfolio, profileData.skills.length > 0
        ];
        const completedFields = fields.filter(Boolean).length;
        setProfileCompletion(Math.round((completedFields / 14) * 100));
      } catch (error: any) {
        console.error('Profile: Fetch error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch profile',
          variant: 'destructive',
        });
        if (error.message.includes('401') || error.message.includes('404')) {
          setTimeout(() => navigate('/members'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id || 'me'}/projects`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Profile: Fetch projects error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch projects',
          variant: 'destructive',
        });
      }
    };

    fetchProfile();
    fetchProjects();
  }, [isAuthenticated, id, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setProfile(prev => ({ ...prev, skills }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAvatarPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile) {
      toast({
        title: 'Error',
        description: 'You can only edit your own profile.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (key === 'skills') {
          formData.append(key, JSON.stringify(value));
        } else if (value) {
          formData.append(key, value);
        }
      });
      if (file) {
        formData.append('avatar', file);
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
      setFile(null);
      setAvatarPreview(null);
    } catch (error: any) {
      console.error('Profile: Update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
      if (error.message.includes('401')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 bg-pattern-dark' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 bg-pattern-light'} flex items-center justify-center font-[Poppins]`}>
        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 bg-pattern-dark' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 bg-pattern-light'} transition-colors duration-300 font-[Poppins]`}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} h-9 w-9 p-0 transition-transform hover:scale-105`}
              onClick={() => navigate('/dashboard')}
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <img src="/techminds-logo.png" alt="TechMinds Logo" className="h-8 w-8" />
              <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} animate-fade-in`}>TechMinds Profile</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} h-9 w-9 p-0 transition-transform hover:scale-105`}
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <Card className={`${isDarkMode ? 'bg-black/40 border-gradient-to-r from-cyan-500/30 to-purple-500/30' : 'bg-white border-gradient-to-r from-blue-200 to-purple-200'} backdrop-blur-md shadow-lg animate-fade-in`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl sm:text-2xl`}>User Profile</CardTitle>
              {isOwnProfile && (
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  className={`${isEditing ? (isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600') : (isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100')} h-9 transition-transform hover:scale-105`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              )}
            </div>
            {isOwnProfile && (
              <div className="mt-4">
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Profile Completion: {profileCompletion}%</span>
                <Progress value={profileCompletion} className={`h-2 mt-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} [&>div]:bg-gradient-to-r [&>div]:from-cyan-600 [&>div]:to-purple-600`} />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={profile.department}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Year</Label>
                    <Input
                      id="year"
                      name="year"
                      value={profile.year}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rollNumber" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Roll Number</Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      value={profile.rollNumber}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="bio" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-24 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={profile.website}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>GitHub</Label>
                    <Input
                      id="github"
                      name="github"
                      value={profile.github}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={profile.linkedin}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Twitter/X</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={profile.twitter}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="portfolio" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Portfolio</Label>
                    <Input
                      id="portfolio"
                      name="portfolio"
                      value={profile.portfolio}
                      onChange={handleInputChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm transition-all hover:border-cyan-400`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="skills" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Skills (select or type, comma-separated)</Label>
                    <Select onValueChange={handleSkillsChange} defaultValue={profile.skills.join(', ')}>
                      <SelectTrigger className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm`}>
                        <SelectValue placeholder="Select skills or type" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonSkills.map((skill) => (
                          <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="skills"
                      name="skills"
                      value={profile.skills.join(', ')}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} mt-2 h-9 text-sm transition-all hover:border-cyan-400`}
                      placeholder="Type additional skills, comma-separated"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="avatar" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Profile Picture</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={`${isDarkMode ? 'bg-black/20 text-white border-cyan-500/30' : 'bg-gray-100 text-gray-900 border-blue-300'} h-9 text-sm`}
                    />
                    {avatarPreview && (
                      <img src={avatarPreview} alt="Avatar Preview" className="mt-2 w-24 h-24 rounded-full border-2 border-cyan-500/30 transition-all hover:scale-105 hover:border-cyan-400" />
                    )}
                  </div>
                </div>
                <Button type="submit" className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white h-9 transition-transform hover:scale-105`}>
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  {profile.avatar ? (
                    <div className="relative">
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-cyan-500/30 transition-all hover:scale-105 hover:border-cyan-400"
                      />
                      <div className={`${isDarkMode ? 'border-cyan-400/50' : 'border-blue-300/50'} absolute inset-0 rounded-full border-4 animate-spin-slow`}></div>
                    </div>
                  ) : (
                    <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full ${isDarkMode ? 'bg-cyan-500/30' : 'bg-blue-200'} flex items-center justify-center transition-all hover:scale-105`}>
                      <User className={`h-16 w-16 sm:h-20 sm:w-20 ${isDarkMode ? 'text-white' : 'text-gray-900'} animate-bounce`} />
                    </div>
                  )}
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} animate-fade-in`}>{profile.name}</h2>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{profile.email}</p>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{profile.rollNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-fade-in`}>
                      <Briefcase className="h-5 w-5 mr-2" />
                      {profile.department} - {profile.year}
                    </p>
                    {profile.phone && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-fade-in`}>
                        <User className="h-5 w-5 mr-2" />
                        {profile.phone}
                      </p>
                    )}
                    {profile.location && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-fade-in`}>
                        <MapPin className="h-5 w-5 mr-2" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {profile.website && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-bounce`} title="Website">
                        <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} transition-transform hover:scale-125 hover:text-purple-500`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                        </svg>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-cyan-400 hover:text-purple-500' : 'text-blue-600 hover:text-purple-600'} hover:underline transition-colors`}>Website</a>
                      </p>
                    )}
                    {profile.github && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-bounce`} title="GitHub">
                        <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} transition-transform hover:scale-125 hover:text-purple-500`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.41 2.87 8.14 6.84 9.49.5.09.68-.22.68-.48v-1.75c-2.78.61-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0112 6.8c.85 0 1.71.11 2.52.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .26.19.57.69.49C19.13 20.14 22 16.41 22 12c0-5.52-4.48-10-10-10z"/>
                        </svg>
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-cyan-400 hover:text-purple-500' : 'text-blue-600 hover:text-purple-600'} hover:underline transition-colors`}>GitHub</a>
                      </p>
                    )}
                    {profile.linkedin && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-bounce`} title="LinkedIn">
                        <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} transition-transform hover:scale-125 hover:text-purple-500`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.91 1.65-1.87 3.39-1.87 3.62 0 4.29 2.39 4.29 5.49v6.27zM5.34 7.45c-1.14 0-2.06-.92-2.06-2.06s.92-2.06 2.06-2.06 2.06.92 2.06 2.06-.92 2.06-2.06 2.06zm1.78 13h-3.56V9h3.56v11.45zM22 2H2v20h20V2z"/>
                        </svg>
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-cyan-400 hover:text-purple-500' : 'text-blue-600 hover:text-purple-600'} hover:underline transition-colors`}>LinkedIn</a>
                      </p>
                    )}
                    {profile.twitter && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-bounce`} title="Twitter/X">
                        <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} transition-transform hover:scale-125 hover:text-purple-500`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.24 4.15c.66.44 1.22 1.03 1.64 1.72-.61.2-1.25.34-1.93.41.69-.42 1.23-1.08 1.48-1.87-.65.39-1.37.67-2.13.82-1.25-1.33-3.39-1.43-4.72-.18-1.33 1.25-1.43 3.39-.18 4.72-2.6-.13-5.03-1.38-6.61-3.29-.85 1.46-.43 3.36.98 4.33-.52-.02-1.02-.16-1.46-.39v.04c0 1.62 1.15 2.97 2.68 3.28-.49.14-1.01.16-1.52.06.43 1.34 1.68 2.32 3.16 2.35-1.15.9-2.6 1.44-4.17 1.44-.27 0-.54-.02-.81-.06 1.55.99 3.39 1.56 5.36 1.56 6.44 0 9.96-5.34 9.96-9.96 0-.15 0-.3-.01-.45.68-.49 1.27-1.1 1.74-1.79-.63.28-1.3.47-2.01.55.72-.43 1.27-1.12 1.53-1.94z"/>
                        </svg>
                        <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-cyan-400 hover:text-purple-500' : 'text-blue-600 hover:text-purple-600'} hover:underline transition-colors`}>Twitter/X</a>
                      </p>
                    )}
                    {profile.portfolio && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm flex items-center animate-bounce`} title="Portfolio">
                        <svg className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} transition-transform hover:scale-125 hover:text-purple-500`} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zm-2-14h-4v2h4V6zm0 4h-4v2h4v-2zm-6 4H8v2h4v-2zm0-4H8v2h4v-2z"/>
                        </svg>
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-cyan-400 hover:text-purple-500' : 'text-blue-600 hover:text-purple-600'} hover:underline transition-colors`}>Portfolio</a>
                      </p>
                    )}
                  </div>
                </div>
                {profile.bio && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 animate-fade-in`}>Bio</h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{profile.bio}</p>
                  </div>
                )}
                {profile.skills.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 animate-fade-in`}>Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className={`${isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-600'} px-2 py-1 rounded-md text-sm transition-transform hover:scale-105`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {projects.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 animate-fade-in`}>Recent Projects</h3>
                    <ul className="space-y-3 max-h-64 overflow-y-auto">
                      {projects.slice(0, 5).map((project) => (
                        <li key={project.id} className={`p-3 rounded-md ${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} transition-transform hover:scale-[1.02]`}>
                          <div className="flex flex-col justify-between items-start space-y-2">
                            <div>
                              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{project.title}</span>
                              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{project.technology}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Code className={`h-4 w-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-500'}`} />
                              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{project.stars} Stars</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm animate-fade-in`}>Joined: {new Date(profile.joinedDate).toLocaleDateString()}</p>
                {!isOwnProfile && (
                  <Button
                    className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white h-9 transition-transform hover:scale-105`}
                    onClick={() => navigate(`/chat/${profile.id}`)}
                  >
                    Message
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
