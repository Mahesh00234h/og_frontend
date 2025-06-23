import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminRegister = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('AdminRegister: Cookies before register:', document.cookie);
      const response = await fetch(`${API_BASE_URL}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Admin-Secret': secretKey,
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          fullName,
          password,
          confirmPassword,
        }),
      });
      console.log('AdminRegister: Register response headers:', Object.fromEntries(response.headers));
      const data = await response.json();
      console.log('AdminRegister: Register response data:', data);
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast({
        title: 'Admin Registration Successful',
        description: 'You can now log in as an admin.',
      });
      navigate('/admin-login');
    } catch (error: any) {
      console.error('AdminRegister: Register error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/40 border-red-500/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-white">Admin Registration</span>
          </div>
          <CardTitle className="text-2xl text-white">Create Admin Account</CardTitle>
          <CardDescription className="text-gray-300">Register as an admin for OG Techminds</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-black/20 border-red-500/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Admin Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ogtechminds.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/20 border-red-500/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/20 border-red-500/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-black/20 border-red-500/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretKey" className="text-white">Admin Secret Key</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="secretKey"
                  type="text"
                  placeholder="Enter admin secret key"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="pl-10 bg-black/20 border-red-500/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading ? 'Registering...' : 'Register Admin'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an admin account?{' '}
              <Link to="/admin-login" className="text-red-400 hover:text-red-300">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRegister;