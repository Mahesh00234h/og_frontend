import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Github, Link, MapPin, Briefcase } from 'lucide-react';

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
  skills: string[];
  avatar: string;
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
    skills: [],
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check session status and determine if this is the user's own profile
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Profile: Checking session with cookies:', document.cookie);
        const response = await fetch(`${API_BASE_URL}/check-session-status`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('Profile: Session check response headers:', Object.fromEntries(response.headers));
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Session not active');
        }
        setIsAuthenticated(true);
        // If no id param or id matches current user, it's the user's own profile
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

  // Fetch profile data
  useEffect(() => {
    if (isAuthenticated !== true) return;

    const fetchProfile = async () => {
      try {
        const endpoint = id ? `${API_BASE_URL}/users/${id}` : `${API_BASE_URL}/profile`;
        console.log(`Profile: Fetching from ${endpoint} with credentials: include`);
        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('Profile: Response headers:', Object.fromEntries(response.headers));
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }
        setProfile({
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
          skills: Array.isArray(data.skills || data.profile?.skills) ? data.skills || data.profile?.skills : [],
          avatar: data.avatar || data.profile?.avatar || ''
        });
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

    fetchProfile();
  }, [isAuthenticated, id, navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setProfile(prev => ({ ...prev, skills }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      console.log('Profile: Sending update profile request with credentials: include');
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
      console.log('Profile: Update profile response headers:', Object.fromEntries(response.headers));
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

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-black/40 border-red-500/20 backdrop-blur-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">User Profile</CardTitle>
              {isOwnProfile && (
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  className={isEditing ? 'bg-red-600 hover:bg-red-700' : 'text-black border-red-400'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-gray-300">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={profile.department}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-gray-300">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      value={profile.year}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rollNumber" className="text-gray-300">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      value={profile.rollNumber}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-300">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-gray-300">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={profile.website}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-gray-300">GitHub</Label>
                    <Input
                      id="github"
                      name="github"
                      value={profile.github}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin" className="text-gray-300">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={profile.linkedin}
                      onChange={handleInputChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="skills" className="text-gray-300">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={profile.skills.join(', ')}
                      onChange={handleSkillsChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="avatar" className="text-gray-300">Profile Picture</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-black/20 text-white border-red-500/30"
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Save Changes
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-2 border-red-500/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-red-500/30 flex items-center justify-center">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                    <p className="text-gray-300">{profile.email}</p>
                    <p className="text-gray-400">{profile.rollNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {profile.department} - {profile.year}
                    </p>
                    {profile.phone && (
                      <p className="text-gray-300 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {profile.phone}
                      </p>
                    )}
                    {profile.location && (
                      <p className="text-gray-300 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                  <div>
                    {profile.website && (
                      <p className="text-gray-300 flex items-center">
                        <Link className="h-4 w-4 mr-2" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                          Website
                        </a>
                      </p>
                    )}
                    {profile.github && (
                      <p className="text-gray-300 flex items-center">
                        <Github className="h-4 w-4 mr-2" />
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                          GitHub
                        </a>
                      </p>
                    )}
                    {profile.linkedin && (
                      <p className="text-gray-300 flex items-center">
                        <Link className="h-4 w-4 mr-2" />
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                          LinkedIn
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Bio</h3>
                    <p className="text-gray-300">{profile.bio}</p>
                  </div>
                )}
                {profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-gray-400 text-sm">Joined: {new Date(profile.joinedDate).toLocaleDateString()}</p>
                {!isOwnProfile && (
                  <Button
                    className="bg-red-600 hover:bg-red-700"
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