import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState('email'); // 'email', 'otp', 'reset'
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Login: Cookies before login:', document.cookie);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login: Login response headers:', Object.fromEntries(response.headers));
      console.log('Login: Cookies after login:', document.cookie);
      const data = await response.json();
      console.log('Login: Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user && data.user.role === 'admin') {
        throw new Error('Admins must use the Admin Login page');
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back to OG Techminds',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login: Login error:', error);
      toast({
        title: 'Login Failed',
        description:
          error.message === 'Admins must use the Admin Login page'
            ? 'Please use the Admin Login page at /admin-login'
            : error.message || 'Please check your credentials and try again',
        variant: 'destructive',
      });
      if (error.message === 'Admins must use the Admin Login page') {
        navigate('/admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse?.credential) {
      toast({
        title: 'Google Login Failed',
        description: 'Invalid Google response. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      toast({
        title: 'Google Login Successful!',
        description: `Welcome ${data.name || ''}`,
      });
      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Google Login Failed',
        description: err.message || 'An error occurred during Google login.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
      toast({
        title: 'OTP Sent',
        description: 'Check your email for the OTP code.',
      });
      setForgotStep('otp');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: forgotEmail,
          otp,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated. Please log in.',
      });
      setIsForgotPasswordOpen(false);
      setForgotStep('email');
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/40 border-purple-500/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">OG Techminds</span>
          </div>
          <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-300">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                  required
                  disabled={loading}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-sm text-purple-400 hover:text-purple-300"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  toast({
                    title: 'Google Login Failed',
                    description: 'Please try again.',
                    variant: 'destructive',
                  })
                }
              />
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300">
                Join the club
              </Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link to="/admin-login" className="text-sm text-purple-400 hover:text-purple-300">
              Admin Login
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="bg-black/40 border-purple-500/20 backdrop-blur-md text-white">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription className="text-gray-300">
              {forgotStep === 'email' && 'Enter your email to receive a password reset OTP.'}
              {forgotStep === 'otp' && 'Enter the OTP sent to your email.'}
              {forgotStep === 'reset' && 'Enter your new password.'}
            </DialogDescription>
          </DialogHeader>
          {forgotStep === 'email' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                    required
                    disabled={forgotLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
          {forgotStep === 'otp' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setForgotStep('reset');
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                  required
                  disabled={forgotLoading}
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={forgotLoading}
                >
                  Verify OTP
                </Button>
              </DialogFooter>
            </form>
          )}
          {forgotStep === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-white">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                    required
                    disabled={forgotLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                    required
                    disabled={forgotLoading}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
