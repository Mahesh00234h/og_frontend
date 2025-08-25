import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster'; // Updated to import from toaster
import { Code, Plus, User } from 'lucide-react';
import SmallLoader from "@/components/ui/SmallLoader";

const CLUB_API_BASE_URL = import.meta.env.VITE_CLUB_API_BASE_URL || 'https://og-backend-mwwi.onrender.com/api';
const CERTIFICATE_API_BASE_URL = import.meta.env.VITE_CERTIFICATE_API_BASE_URL || 'https://certi-og-backend.onrender.com';

interface User {
  id: string;
  name: string | null; // Backend returns 'name' instead of 'fullName'
  email: string | null;
  rollNumber: string | null;
  department: string | null;
  year: string | null;
  role?: string; // Optional, only used for current-user endpoint
}

const Issuer: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [formData, setFormData] = useState({
    user_id: '',
    event_name: '',
    issuer: 'OG Techminds',
    type: 'Participation',
    prize: '',
    placement: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${CLUB_API_BASE_URL}/current-user`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP error: ${res.status}`);
        if (data.user.role !== 'admin') {
          toast({
            title: 'Access Denied',
            description: 'Only admins can access the issuer dashboard',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error('Issuer: Fetch user error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Please log in to access the issuer dashboard',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${CERTIFICATE_API_BASE_URL}/users`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP error: ${res.status}`);
        if (!Array.isArray(data.users)) throw new Error('Expected users array in response');
        setUsers(data.users);
      } catch (error) {
        console.error('Issuer: Fetch users error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchUsers();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value || '' });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value || '' });
  };

  const handleUserSelect = (value: string) => {
    setSelectedUser(value);
    const selected = users.find((u) => u.id === value);
    if (selected) {
      setFormData({
        ...formData,
        user_id: value,
      });
    } else {
      setFormData({
        ...formData,
        user_id: '',
      });
    }
  };

  const handleGenerateIssueEmail = async () => {
    if (!selectedUser || !formData.event_name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select a user and enter an event name.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: selectedUser,
        event_name: formData.event_name?.trim() || '',
        issuer: formData.issuer?.trim() || 'OG Techminds',
        type: formData.type || 'Participation',
        prize: formData.prize?.trim() || '',
        placement: formData.placement?.trim() || '',
      };
      console.log('Issuer: Sending payload to /generate-issue-email:', payload);
      const res = await fetch(`${CERTIFICATE_API_BASE_URL}/generate-issue-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP error: ${res.status}`);
      toast({
        title: 'Certificate Issued',
        description: `Certificate #${data.certificate.id} issued and emailed for ${data.certificate.recipient}`,
      });
      setFormData({
        user_id: '',
        event_name: '',
        issuer: 'OG Techminds',
        type: 'Participation',
        prize: '',
        placement: '',
      });
      setSelectedUser('');
    } catch (error: any) {
      console.error('Issuer: Generate issue email error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to issue and email certificate',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isMongoFormValid = selectedUser && formData.event_name?.trim();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800 flex justify-center items-center">
        <SmallLoader />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800 overflow-x-hidden">
      <header className="bg-black/30 backdrop-blur-xl border-b border-green-500/20 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <h1 className="text-xl font-bold text-white">Issuer Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-400 border-green-400/50 hover:bg-green-400/10 backdrop-blur-sm h-8"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-400 border-green-400/50 hover:bg-green-400/10 backdrop-blur-sm h-8"
                onClick={() => navigate('/login')}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 space-y-4">
        <Card className="bg-black/40 border-green-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Issue Certificates
            </CardTitle>
            <CardDescription className="text-gray-300">
              Create verifiable certificates on the Aptos blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Issue from MongoDB Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_name_mongo" className="text-white">
                    Event Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="event_name_mongo"
                    name="event_name"
                    type="text"
                    placeholder="OG Techminds Event"
                    value={formData.event_name || ''}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type_mongo" className="text-white">Certificate Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                    disabled={submitting}
                  >
                    <SelectTrigger className="bg-black/20 border-green-500/20 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-green-500/20 text-white">
                      {['Participation', 'Winner', 'Runner-up', 'Achievement', 'Merit', 'Custom'].map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-green-500/10">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize_mongo" className="text-white">Prize/Award</Label>
                  <Input
                    id="prize_mongo"
                    name="prize"
                    type="text"
                    placeholder="First Place"
                    value={formData.prize || ''}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement_mongo" className="text-white">Placement</Label>
                  <Input
                    id="placement_mongo"
                    name="placement"
                    type="text"
                    placeholder="1st"
                    value={formData.placement || ''}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_select" className="text-white">
                    Select User <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    value={selectedUser}
                    onValueChange={handleUserSelect}
                    disabled={submitting || users.length === 0}
                  >
                    <SelectTrigger className="bg-black/20 border-green-500/20 text-white">
                      <SelectValue placeholder={users.length === 0 ? 'No users available' : 'Select a user'} />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-green-500/20 text-white">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="hover:bg-green-500/10">
                          {user.name || 'Unknown'} ({user.email || 'No email'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                onClick={handleGenerateIssueEmail}
                disabled={submitting || !isMongoFormValid}
              >
                {submitting ? (
                  <>
                    <SmallLoader className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  'Generate, Issue & Email'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default Issuer;
