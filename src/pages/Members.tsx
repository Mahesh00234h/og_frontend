import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import OGLoader from './components/OGLoader';
// Set axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL =  'https://og-backend-mwwi.onrender.com/api';


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

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        console.log('Fetching members from /members...');
        const response = await axios.get('/members', {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        console.log('Members response:', response.data);
        // Validate and normalize response
        const membersData = Array.isArray(response.data.members)
          ? response.data.members.map((member: any) => ({
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
        setMembers(membersData);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch members error:', err);
        const errorMessage =
          err.response?.status === 401
            ? 'Please log in to view members'
            : err.response?.data?.error || 'Failed to fetch members';
        setError(errorMessage);
        setLoading(false);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchMembers();
  }, [navigate, toast]);

  const handleViewProfile = (memberId: string) => {
    navigate(`/profile/${memberId}`);
  };

  const handleMessage = (memberId: string) => {
    navigate(`/chat/${memberId}`);
  };

  const filteredMembers = members.filter((member) => {
    const name = member.name || '';
    const department = member.department || '';
    const skills = Array.isArray(member.skills) ? member.skills : [];
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skills.some((skill) => (skill || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

 if (loading) {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <OGLoader />
    </div>
  );
}


  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-red-400 p-6 bg-black/40 rounded-lg">
          <p className="text-lg mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Members</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 w-64"
              />
            </div>
            <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Members</p>
                  <p className="text-2xl font-bold text-white">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Online Now</p>
                  <p className="text-2xl font-bold text-white">
                    {members.filter((m) => m.isOnline).length}
                  </p>
                </div>
                <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-white">
                    {members.reduce((sum, member) => sum + member.projects, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Stars</p>
                  <p className="text-2xl font-bold text-white">
                    {members.reduce((sum, member) => sum + member.stars, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="bg-black/40 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white text-lg">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-black" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {member.rollNumber} • {member.department}
                    </CardDescription>
                    <Badge className="bg-purple-600 text-white mt-1">{member.year}</Badge>
                    {!member.isActive && (
                      <Badge className="bg-yellow-600 text-white mt-1 ml-2">Pending Approval</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{member.stars}</span>
                    <span className="text-gray-300 text-sm">Stars</span>
                  </div>
                  <div className="text-white">
                    <span className="font-semibold">{member.projects}</span> projects
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-sm">{member.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-sm">{member.phone}</span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-purple-500/30 text-purple-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleMessage(member.id)}
                  >
                    Message
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-purple-500 text-purple-400"
                    onClick={() => handleViewProfile(member.id)}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
