import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('AdminLogin: Cookies before login:', document.cookie);
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('AdminLogin: Login response headers:', Object.fromEntries(response.headers));
      console.log('AdminLogin: Cookies after login:', document.cookie);
      const data = await response.json();
      console.log('AdminLogin: Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user && data.user.role !== 'admin') {
        throw new Error('Only admins can log in here. Use the regular login page.');
      }

      toast({
        title: 'Admin Login Successful',
        description: 'Welcome to the admin panel',
      });
      navigate('/admin-dashboard');
    } catch (error: any) {
      console.error('AdminLogin: Login error:', error);
      toast({
        title: 'Login Failed',
        description:
          error.message === 'Only admins can log in here. Use the regular login page.'
            ? 'Please use the regular login page at /login'
            : error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      if (error.message === 'Only admins can log in here. Use the regular login page.') {
        navigate('/login');
      }
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
            <span className="text-2xl font-bold text-white">Admin Portal</span>
          </div>
          <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
          <CardDescription className="text-gray-300">Sign in to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
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
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Admin Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/20 border-red-500/20 text-white placeholder:text-gray-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading ? 'Signing in...' : 'Admin Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Not an admin?{' '}
              <Link to="/login" className="text-red-400 hover:text-red-300">
                Regular Login
              </Link>
              {' | '}
              <Link to="/admin-register" className="text-red-400 hover:text-red-300">
                Register as Admin
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;