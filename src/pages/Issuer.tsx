import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Code, Plus, User } from 'lucide-react';
import OGLoader from '@/components/ui/OGLoader';

const CLUB_API_BASE_URL = import.meta.env.VITE_CLUB_API_BASE_URL || 'https://og-backend-mwwi.onrender.com/api';
const CERTIFICATE_API_BASE_URL = import.meta.env.VITE_CERTIFICATE_API_BASE_URL || 'https://certi-og-backend.onrender.com';

interface User {
  id: string;
  fullName: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  role: string;
}

const Issuer: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    recipient: '',
    issuer: 'OG Techminds',
    email: '',
    event_name: '',
    type: 'Participation',
    prize: '',
    placement: '',
    description: '',
    pdf_hash: '',
    rollNumber: '',
    department: '',
    year: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleUserSelect = (value: string) => {
    setSelectedUser(value);
    const user = users.find((u) => u.id === value);
    if (user) {
      setFormData({
        ...formData,
        recipient: user.fullName,
        email: user.email,
        rollNumber: user.rollNumber,
        department: user.department,
        year: user.year,
      });
    } else {
      setFormData({
        ...formData,
        recipient: '',
        email: '',
        rollNumber: '',
        department: '',
        year: '',
      });
    }
  };

  const handleIssueCertificate = async () => {
    if (!formData.recipient.trim() || !formData.event_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Recipient name and event name are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        recipient: formData.recipient.trim(),
        issuer: formData.issuer.trim(),
        email: formData.email.trim(),
        event_name: formData.event_name.trim(),
        type: formData.type,
        prize: formData.prize.trim(),
        placement: formData.placement.trim(),
        description: formData.description.trim(),
        pdf_hash: formData.pdf_hash.trim(),
        rollNumber: formData.rollNumber.trim(),
        department: formData.department.trim(),
        year: formData.year.trim(),
        recipientId: selectedUser || undefined, // Include if user is selected
      };
      console.log('Issuer: Sending payload to /generate-certificate:', payload);
      const res = await fetch(`${CERTIFICATE_API_BASE_URL}/generate-certificate`, {
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
        description: `Certificate #${data.certificate.id} issued for ${data.certificate.recipient}`,
      });
      setFormData({
        recipient: '',
        issuer: 'OG Techminds',
        email: '',
        event_name: '',
        type: 'Participation',
        prize: '',
        placement: '',
        description: '',
        pdf_hash: '',
        rollNumber: '',
        department: '',
        year: '',
      });
      setSelectedUser('');
    } catch (error: any) {
      console.error('Issuer: Issue certificate error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to issue certificate',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isCustomFormValid = formData.recipient.trim() && formData.event_name.trim();
  const isMongoFormValid = selectedUser && formData.event_name.trim();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-600 flex justify-center items-center">
        <OGLoader />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-600 overflow-x-hidden">
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
              <h3 className="text-white font-semibold">Issue Custom Certificate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'recipient', label: 'Recipient Name', placeholder: 'John Doe', type: 'text' },
                  { id: 'email', label: 'Recipient Email', placeholder: 'john@example.com', type: 'email' },
                  { id: 'event_name', label: 'Event Name', placeholder: 'OG Techminds Event', type: 'text' },
                  { id: 'prize', label: 'Prize/Award', placeholder: 'First Place', type: 'text' },
                  { id: 'placement', label: 'Placement', placeholder: '1st', type: 'text' },
                  { id: 'description', label: 'Description', placeholder: 'Certificate details', type: 'text' },
                  { id: 'pdf_hash', label: 'Document Hash (0x..)', placeholder: '0x...', type: 'text' },
                ].map(({ id, label, placeholder, type }) => (
                  <div className="space-y-2" key={id}>
                    <Label htmlFor={id} className="text-white">{label}</Label>
                    <Input
                      id={id}
                      name={id}
                      type={type}
                      placeholder={placeholder}
                      value={(formData as any)[id]}
                      onChange={handleInputChange}
                      className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                      disabled={loading}
                      required={id === 'recipient' || id === 'event_name'}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-white">Certificate Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                    disabled={loading}
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
              </div>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                onClick={handleIssueCertificate}
                disabled={loading || !isCustomFormValid}
              >
                {loading ? (
                  <>
                    <OGLoader className="mr-2 h-4 w-4" />
                    Issuing...
                  </>
                ) : (
                  'Issue on Blockchain'
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold">Issue from MongoDB Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_name_mongo" className="text-white">Event Name</Label>
                  <Input
                    id="event_name_mongo"
                    name="event_name"
                    type="text"
                    placeholder="OG Techminds Event"
                    value={formData.event_name}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type_mongo" className="text-white">Certificate Type</Label>
                  <Select
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                    disabled={loading}
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
                    value={formData.prize}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="placement_mongo" className="text-white">Placement</Label>
                  <Input
                    id="placement_mongo"
                    name="placement"
                    type="text"
                    placeholder="1st"
                    value={formData.placement}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_mongo" className="text-white">Description</Label>
                  <Input
                    id="description_mongo"
                    name="description"
                    type="text"
                    placeholder="Certificate details"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user_select" className="text-white">Select User</Label>
                  <Select
                    value={selectedUser}
                    onValueChange={handleUserSelect}
                    disabled={loading || users.length === 0}
                  >
                    <SelectTrigger className="bg-black/20 border-green-500/20 text-white">
                      <SelectValue placeholder={users.length === 0 ? 'No users available' : 'Select a user'} />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-green-500/20 text-white">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id} className="hover:bg-green-500/10">
                          {user.fullName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                onClick={handleIssueCertificate}
                disabled={loading || !isMongoFormValid}
              >
                {loading ? (
                  <>
                    <OGLoader className="mr-2 h-4 w-4" />
                    Issuing...
                  </>
                ) : (
                  'Generate, Issue & Email'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Issuer;
