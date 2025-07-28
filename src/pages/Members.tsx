import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Search, Filter, Star, Project, Globe } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

// Set axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://og-backend-mwwi.onrender.com/api';

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        console.log(`Fetching members from /members?page=${page}&page_size=${pageSize}...`);
        setLoading(true);
        const response = await axios.get(`/members?page=${page}&page_size=${pageSize}`, {
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
        setTotalPages(response.data.total_pages || 1);
        setTotalMembers(response.data.total_members || 0);
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
  }, [navigate, toast, page, pageSize]);

  const handleViewProfile = (memberId: string) => {
    navigate(`/profile/${memberId}`);
  };

  const handleMessage = (memberId: string) => {
    navigate(`/chat/${memberId}`);
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page on size change
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
      <div className="min-h-screen bg-black flex justify-center items-center">
        <OGLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-red-400 p-6 bg-black/40 rounded-lg max-w-sm w-full">
          <p className="text-base mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Compact Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Members</h1>
            </div>
            <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
              {totalMembers} Total
            </Badge>
          </div>
          
          {/* Mobile-optimized search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 w-full text-sm h-10"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-3">
        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-3">
              <div className="text-center">
                <Users className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Total</p>
                <p className="text-lg font-bold text-white">{totalMembers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="h-5 w-5 bg-green-400 rounded-full animate-pulse mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Online</p>
                <p className="text-lg font-bold text-white">
                  {members.filter((m) => m.isOnline).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-3">
              <div className="text-center">
                <Project className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Projects</p>
                <p className="text-lg font-bold text-white">
                  {members.reduce((sum, member) => sum + member.projects, 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardContent className="p-3">
              <div className="text-center">
                <Star className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-gray-400 text-xs">Stars</p>
                <p className="text-lg font-bold text-white">
                  {members.reduce((sum, member) => sum + member.stars, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Pagination Info */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-gray-300 text-sm">
            {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalMembers)} of {totalMembers}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm">Per page:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-black/20 border-purple-500/20 text-white p-1 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Mobile-optimized Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="bg-black/40 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white text-sm">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-base leading-tight truncate">
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-xs">
                      {member.rollNumber}
                    </CardDescription>
                    <CardDescription className="text-gray-300 text-xs truncate">
                      {member.department}
                    </CardDescription>
                    <div className="flex gap-1 mt-1">
                      <Badge className="bg-purple-600 text-white text-xs px-1 py-0">
                        {member.year}
                      </Badge>
                      {!member.isActive && (
                        <Badge className="bg-yellow-600 text-white text-xs px-1 py-0">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                {/* Stats Row */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span className="text-white font-semibold text-sm">{member.stars}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Project className="h-3 w-3 text-cyan-400" />
                    <span className="text-white text-sm">{member.projects}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1">
                  <div className="text-gray-300 text-xs truncate">{member.email}</div>
                  <div className="text-gray-300 text-xs truncate">{member.phone}</div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-gray-400 text-xs mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-purple-500/30 text-purple-300 px-1 py-0"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {member.skills.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-purple-500/30 text-purple-300 px-1 py-0"
                      >
                        +{member.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs py-2"
                    onClick={() => handleMessage(member.id)}
                  >
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-400 text-xs py-2 px-3"
                    onClick={() => handleViewProfile(member.id)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 text-base">No members found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
          </div>
        )}

        {/* Mobile-optimized Pagination */}
        <div className="mt-6">
          {/* Mobile Pagination - Show only current page and arrows */}
          <div className="flex justify-between items-center sm:hidden mb-4">
            <Button
              onClick={handlePrevious}
              disabled={page === 1}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-sm px-3 py-2"
            >
              Previous
            </Button>
            <span className="text-gray-300 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={handleNext}
              disabled={page === totalPages}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-sm px-3 py-2"
            >
              Next
            </Button>
          </div>

          {/* Desktop Pagination - Show all page numbers */}
          <div className="hidden sm:flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={page === 1}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              Previous
            </Button>
            <div className="flex gap-2 overflow-x-auto">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={pageNum === page}
                    className={`bg-purple-600 hover:bg-purple-700 min-w-[40px] ${
                      pageNum === page ? 'opacity-50' : ''
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              onClick={handleNext}
              disabled={page === totalPages}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
