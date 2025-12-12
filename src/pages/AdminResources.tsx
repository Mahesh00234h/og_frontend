import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2, Shield, ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://og-edu-resources.onrender.com/api';

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
  compressedSize?: number;
  compressionRatio?: number;
  isCompressed?: boolean;
  uploadedAt: string;
  downloads: number;
}

const YEARS = ['FE', 'SE', 'TE', 'BE'];
const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Programming', 'Data Structures', 'Database', 'OS', 'Networks'];
const RESOURCE_TYPES = ['pdf', 'imp', 'question_paper', 'notes'];

const AdminResources = () => {
  const [year, setYear] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentResources();
  }, []);

  const fetchRecentResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/resources`);
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(data.slice(0, 10)); // Show 10 most recent
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !year || !subject || !type || !title) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', year);
      formData.append('subject', subject);
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('uploadedBy', 'admin'); // You can get this from auth context

      const res = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await res.json();

      toast({
        title: 'Upload Successful',
        description: `${data.resource.title} uploaded successfully${data.resource.compressionRatio > 0 ? ` (${data.resource.compressionRatio}% compressed)` : ''}`
      });

      // Reset form
      setYear('');
      setSubject('');
      setType('');
      setTitle('');
      setDescription('');
      setFile(null);
      (document.getElementById('file-input') as HTMLInputElement).value = '';

      // Refresh resources list
      fetchRecentResources();
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete resource');

      toast({
        title: 'Deleted',
        description: 'Resource deleted successfully'
      });

      fetchRecentResources();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-400" />
              Admin Resources Panel
            </h1>
            <p className="text-gray-300 text-sm">Upload and manage educational resources</p>
          </div>
          <Link to="/admin-dashboard">
            <Button variant="outline" className="text-red-400 border-red-400/50 hover:bg-red-400/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Upload Form */}
        <Card className="bg-black/40 border-red-500/20 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-red-400" />
              Upload New Resource
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Year */}
                <div>
                  <Label className="text-gray-300">Year *</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="bg-black/20 border-red-500/30 text-white">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-red-500/30">
                      {YEARS.map(y => (
                        <SelectItem key={y} value={y} className="text-white hover:bg-red-500/20">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <Label className="text-gray-300">Subject *</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="bg-black/20 border-red-500/30 text-white">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-red-500/30">
                      {SUBJECTS.map(s => (
                        <SelectItem key={s} value={s} className="text-white hover:bg-red-500/20">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div>
                  <Label className="text-gray-300">Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="bg-black/20 border-red-500/30 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-red-500/30">
                      {RESOURCE_TYPES.map(t => (
                        <SelectItem key={t} value={t} className="text-white hover:bg-red-500/20">
                          {t.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File */}
                <div>
                  <Label className="text-gray-300">File *</Label>
                  <Input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="bg-black/20 border-red-500/30 text-white file:text-white file:bg-red-500/20 file:border-0 file:mr-4"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Unit 1 - Introduction to Programming"
                  className="bg-black/20 border-red-500/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <Label className="text-gray-300">Description (Optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the resource..."
                  className="bg-black/20 border-red-500/30 text-white placeholder:text-gray-500 min-h-[80px]"
                />
              </div>

              {file && (
                <div className="text-sm text-gray-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Selected: {file.name} ({formatFileSize(file.size)})
                </div>
              )}

              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Resource'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card className="bg-black/40 border-red-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-400" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-400 border-r-transparent"></div>
                <p className="text-gray-300 mt-4">Loading...</p>
              </div>
            ) : resources.length > 0 ? (
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div
                    key={resource._id}
                    className="flex items-center justify-between p-4 bg-black/20 border border-red-500/20 rounded-lg hover:border-red-400/40 transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm">{resource.title}</h3>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge className="bg-red-500 text-white text-xs">{resource.year}</Badge>
                        <Badge className="bg-purple-500 text-white text-xs">{resource.subject}</Badge>
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400/50 text-xs">
                          {resource.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          {formatFileSize(resource.fileSize)}
                          {resource.compressionRatio && resource.compressionRatio > 0 && (
                            <span className="text-green-400 ml-1">⚡ {resource.compressionRatio}%</span>
                          )}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {resource.downloads} downloads
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete(resource._id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No resources uploaded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminResources;
