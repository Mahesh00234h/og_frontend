import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, AlertCircle, Settings, Bell, Users, Sun, Moon, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
}

interface ChallengeSubmission {
  id: string;
  week: number;
  projectName: string;
  githubRepo: string;
  linkedinPost: string;
  deploymentUrl: string;
  domain: string;
  submittedAt: string;
}

const Challenge: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false);
  const [newSubmission, setNewSubmission] = useState<{
    week: number;
    projectName: string;
    githubRepo: string;
    linkedinPost: string;
    deploymentUrl: string;
    domain: string;
  }>({
    week: 1,
    projectName: '',
    githubRepo: '',
    linkedinPost: '',
    deploymentUrl: '',
    domain: '',
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
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
      } catch (error) {
        console.error('Challenge: Fetch user error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Please log in to access the challenge page',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/challenges/submissions`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSubmissions(data.submissions);
        setProgress(Math.round((data.submissions.length / 11) * 100));
      } catch (error) {
        console.error('Challenge: Fetch submissions error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch submissions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchSubmissions();
  }, [navigate, toast]);

  const getAvailableWeeks = () => {
    const submittedWeeks = submissions.map((sub) => sub.week);
    return Array.from({ length: 11 }, (_, i) => i + 1).filter((week) => !submittedWeeks.includes(week));
  };

  const handleSubmissionChange = (field: string, value: string | number) => {
    setNewSubmission((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmission = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/challenges/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newSubmission),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: 'Success',
        description: 'Submission created successfully',
      });
      const updatedSubmissions = [...submissions, { ...newSubmission, id: data.id, submittedAt: new Date().toISOString() }];
      setSubmissions(updatedSubmissions);
      setProgress(Math.round((updatedSubmissions.length / 11) * 100));
      setIsSubmissionModalOpen(false);
      setNewSubmission({
        week: getAvailableWeeks()[0] || 1,
        projectName: '',
        githubRepo: '',
        linkedinPost: '',
        deploymentUrl: '',
        domain: '',
      });
    } catch (error: any) {
      console.error('Challenge: Create submission error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create submission',
        variant: 'destructive',
      });
    }
  };

  const handleGetCertificate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/challenges/certificate`, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to generate certificate');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '11-week-challenge-certificate.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast({
        title: 'Success',
        description: 'Certificate downloaded',
      });
    } catch (error) {
      console.error('Challenge: Get certificate error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get certificate',
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

  const availableWeeks = getAvailableWeeks();
  const isComplete = submissions.length === 11;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} overflow-x-hidden transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'} backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>11-Week Challenge</h1>
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
              <Avatar className="cursor-pointer h-9 w-9" onClick={() => navigate('/profile')}>
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
        {/* Progress Card */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl sm:text-2xl`}>
              11-Week Challenge Progress
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Submit 11 projects to complete the challenge and earn your certificate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{submissions.length}/11 Projects Submitted</span>
              </div>
              <Progress value={progress} className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} [&>div]:bg-gradient-to-r [&>div]:from-cyan-600 [&>div]:to-purple-600`} />
              {isComplete && (
                <Button
                  className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                  onClick={handleGetCertificate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Get Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submission Action */}
        {!isComplete && (
          <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl`}>
                Submit a Project
              </CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Add your next project submission</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={() => setIsSubmissionModalOpen(true)}
                disabled={availableWeeks.length === 0}
              >
                Submit New Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Submissions List */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl`}>
              Your Submissions
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Track your weekly projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 11 }, (_, i) => i + 1).map((week) => {
                const sub = submissions.find((s) => s.week === week);
                return (
                  <Card key={week} className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        {sub ? (
                          <CheckCircle className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                        ) : (
                          <AlertCircle className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        )}
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>Week {week}</span>
                      </div>
                      {sub ? (
                        <>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{sub.projectName}</span>
                          <Badge className="text-xs">{sub.domain}</Badge>
                        </>
                      ) : (
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Not Submitted</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Submission Modal */}
        <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
          <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-md`}>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Submit Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="week" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Week</Label>
                <Select
                  onValueChange={(value) => handleSubmissionChange('week', parseInt(value))}
                  defaultValue={availableWeeks[0]?.toString() || ''}
                >
                  <SelectTrigger className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWeeks.map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projectName" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Project Name</Label>
                <Input
                  id="projectName"
                  value={newSubmission.projectName}
                  onChange={(e) => handleSubmissionChange('projectName', e.target.value)}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="githubRepo" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>GitHub Repo</Label>
                <Input
                  id="githubRepo"
                  value={newSubmission.githubRepo}
                  onChange={(e) => handleSubmissionChange('githubRepo', e.target.value)}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="linkedinPost" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>LinkedIn Post URL</Label>
                <Input
                  id="linkedinPost"
                  value={newSubmission.linkedinPost}
                  onChange={(e) => handleSubmissionChange('linkedinPost', e.target.value)}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="deploymentUrl" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Deployment URL</Label>
                <Input
                  id="deploymentUrl"
                  value={newSubmission.deploymentUrl}
                  onChange={(e) => handleSubmissionChange('deploymentUrl', e.target.value)}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              <div>
                <Label htmlFor="domain" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Domain</Label>
                <Input
                  id="domain"
                  value={newSubmission.domain}
                  onChange={(e) => handleSubmissionChange('domain', e.target.value)}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9`}
                onClick={() => setIsSubmissionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={handleCreateSubmission}
                disabled={
                  !newSubmission.week ||
                  !newSubmission.projectName ||
                  !newSubmission.githubRepo ||
                  !newSubmission.linkedinPost ||
                  !newSubmission.deploymentUrl ||
                  !newSubmission.domain
                }
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Challenge;
