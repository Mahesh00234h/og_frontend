import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Code, User } from 'lucide-react';
import SmallLoader from '@/components/ui/SmallLoader';
import OGLoader from '@/components/ui/OGLoader';
import QRCode from 'qrcode.react';

const CERTIFICATE_API_BASE_URL = import.meta.env.VITE_CERTIFICATE_API_BASE_URL || 'https://certi-og-backend.onrender.com';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  rollNumber: string | null;
  department: string | null;
  year: string | null;
  role?: string;
}

interface UIDResponse {
  uid: string;
  verify_url: string;
}

const RegisterUID: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: '',
    year: '',
  });
  const [generatedUID, setGeneratedUID] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${CERTIFICATE_API_BASE_URL}/current-user`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP error: ${res.status}`);
        if (data.user.role !== 'admin') {
          toast({
            title: 'Access Denied',
            description: 'Only admins can access the UID registration page',
            variant: 'destructive',
          });
          navigate('/dashboard');
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error('RegisterUID: Fetch user error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Please log in to access the UID registration page',
          variant: 'destructive',
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value || '' });
  };

  const handleGenerateUID = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least a name and email.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        rollNumber: formData.rollNumber?.trim() || '',
        department: formData.department?.trim() || '',
        year: formData.year?.trim() || '',
      };
      console.log('RegisterUID: Sending payload to /register-uid:', payload);
      const res = await fetch(`${CERTIFICATE_API_BASE_URL}/register-uid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data: UIDResponse = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP error: ${res.status}`);
      setGeneratedUID(data.uid);
      setVerifyUrl(data.verify_url);
      toast({
        title: 'UID Generated',
        description: `UID ${data.uid} generated successfully. QR code is displayed below.`,
      });
      setFormData({
        name: '',
        email: '',
        rollNumber: '',
        department: '',
        year: '',
      });
    } catch (error: any) {
      console.error('RegisterUID: Generate UID error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate UID',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.email.trim();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800 flex justify-center items-center">
        <OGLoader />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800 overflow-x-hidden">
      <header className="bg-black/30 backdrop-blur-xl border-b border-green-500/20 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <h1 className="text-xl font-bold text-white">Register UID</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-400 border-green-500/50 hover:bg-green-400/10 backdrop-blur-sm h-8"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-green-400 border-green-500/50 hover:bg-green-400/10 backdrop-blur-sm h-8"
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
              <User className="h-4 w-4 mr-2" />
              Register Unique ID
            </CardTitle>
            <CardDescription className="text-gray-300">
              Register a new user and generate a unique ID with a QR code for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-white font-semibold">User Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber" className="text-white">Roll Number</Label>
                  <Input
                    id="rollNumber"
                    name="rollNumber"
                    type="text"
                    placeholder="12345"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-white">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="Computer Science"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-white">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="text"
                    placeholder="2nd Year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                    disabled={submitting}
                  />
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                onClick={handleGenerateUID}
                disabled={submitting || !isFormValid}
              >
                {submitting ? (
                  <>
                    <SmallLoader className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  'Generate UID & QR Code'
                )}
              </Button>
            </div>
            {generatedUID && verifyUrl && (
              <div className="space-y-4 mt-6">
                <h3 className="text-white font-semibold">Generated UID and QR Code</h3>
                <p className="text-gray-300">UID: <span className="font-mono">{generatedUID}</span></p>
                <div className="flex justify-center">
                  <QRCode
                    value={verifyUrl}
                    size={200}
                    bgColor="#000000"
                    fgColor="#ffffff"
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-gray-300 text-center">Scan to verify at: <a href={verifyUrl} className="text-green-400">{verifyUrl}</a></p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default RegisterUID;
