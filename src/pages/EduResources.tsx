import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, FileText, Search, Filter, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5001/api';
const MAIN_API_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Resource {
  _id: string;
  year: string;
  subject: string;
  type: string;
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  originalSize?: number;
  compressionRatio?: number;
  uploadedAt: string;
  downloads: number;
}

const YEARS = ['FE', 'SE', 'TE', 'BE'];
const RESOURCE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'pdf', label: 'PDF Notes' },
  { value: 'imp', label: 'Important Questions' },
  { value: 'question_paper', label: 'Question Papers' },
  { value: 'notes', label: 'Study Notes' }
];

const EduResources = () => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch subjects when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchSubjects(selectedYear);
    } else {
      setSubjects([]);
      setSelectedSubject('');
    }
  }, [selectedYear]);

  // Fetch resources when filters change
  useEffect(() => {
    if (selectedYear && selectedSubject) {
      fetchResources();
    }
  }, [selectedYear, selectedSubject, selectedType]);

  // Filter resources by search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResources(filtered);
    } else {
      setFilteredResources(resources);
    }
  }, [searchQuery, resources]);

  const fetchSubjects = async (year: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/subjects?year=${year}`);
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      setSubjects(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        year: selectedYear,
        subject: selectedSubject
      });
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      
      const res = await fetch(`${API_BASE_URL}/resources?${params}`);
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data);
      setFilteredResources(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Track download
      await fetch(`${API_BASE_URL}/resources/${resource._id}/download`, {
        method: 'POST'
      });
      
      // Fetch the file and trigger download with correct filename
      const response = await fetch(resource.fileUrl);
      const blob = await response.blob();
      
      // Create download link with original filename
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.fileName; // Use original filename
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Download Started',
        description: `Downloading ${resource.title}`
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-blue-500',
      imp: 'bg-yellow-500',
      question_paper: 'bg-red-500',
      notes: 'bg-green-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const handleAdminAccess = async () => {
    try {
      // Check if user is already logged in as admin
      const response = await fetch(`${MAIN_API_URL}/admin/check-session`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          // User is admin, redirect directly to admin resources
          navigate('/admin-resources');
        } else {
          // Not admin, redirect to admin login with return URL
          navigate('/admin-login?returnUrl=/admin-resources');
        }
      } else {
        // No session, redirect to admin login with return URL
        navigate('/admin-login?returnUrl=/admin-resources');
      }
    } catch (error) {
      // Error checking session, redirect to admin login
      navigate('/admin-login?returnUrl=/admin-resources');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Education Resources
          </h1>
          <p className="text-gray-300 text-sm">
            Access study materials, notes, and question papers
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link to="/">
              <Button variant="outline" className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 text-xs">
                ← Back to Home
              </Button>
            </Link>
            <Button 
              onClick={handleAdminAccess}
              variant="outline" 
              className="text-red-400 border-red-400/50 hover:bg-red-400/10 text-xs"
            >
              <Shield className="h-3 w-3 mr-1" />
              Admin Panel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-cyan-400" />
              Filter Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Year Selection */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Select Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-black/20 border-cyan-500/30 text-white">
                    <SelectValue placeholder="Choose year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-500/30">
                    {YEARS.map(year => (
                      <SelectItem key={year} value={year} className="text-white hover:bg-cyan-500/20">
                        {year} (First Year, Second Year, etc.)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Select Subject</label>
                <Select 
                  value={selectedSubject} 
                  onValueChange={setSelectedSubject}
                  disabled={!selectedYear || subjects.length === 0}
                >
                  <SelectTrigger className="bg-black/20 border-cyan-500/30 text-white">
                    <SelectValue placeholder={selectedYear ? "Choose subject" : "Select year first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-500/30">
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject} className="text-white hover:bg-cyan-500/20">
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Resource Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-black/20 border-cyan-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-500/30">
                    {RESOURCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-cyan-500/20">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black/20 border-cyan-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent"></div>
            <p className="text-gray-300 mt-4">Loading resources...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <Card 
                key={resource._id} 
                className="bg-black/40 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-sm mb-2 group-hover:text-cyan-300 transition-colors">
                        {resource.title}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${getTypeColor(resource.type)} text-white text-xs`}>
                          {resource.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400/50 text-xs">
                          {resource.fileType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-cyan-400/50" />
                  </div>
                </CardHeader>
                <CardContent>
                  {resource.description && (
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2">{resource.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(resource.uploadedAt).toLocaleDateString()}
                    </span>
                    <span>
                      {formatFileSize(resource.fileSize)}
                      {resource.compressionRatio && resource.compressionRatio > 0 && (
                        <span className="text-green-400 ml-1">⚡</span>
                      )}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleDownload(resource)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white text-xs"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download ({resource.downloads} downloads)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : selectedYear && selectedSubject ? (
          <Card className="bg-black/40 border-gray-500/20 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-sm">No resources found</p>
              <p className="text-gray-400 text-xs mt-2">
                Try changing filters or check back later
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-black/40 border-cyan-500/20 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-300 text-sm">Select year and subject to view resources</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EduResources;
