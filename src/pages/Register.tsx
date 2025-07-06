import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Mail, Lock, User, Phone, GraduationCap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoogleLogin } from '@react-oauth/google';

// Environment-based API URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://og-backend-mwwi.onrender.com/api';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    rollNumber: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { fullName, email, phone, rollNumber, department, year, password, confirmPassword } = formData;
    
    if (!fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (!phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required",
        variant: "destructive"
      });
      return false;
    }

    if (!rollNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Roll number is required",
        variant: "destructive"
      });
      return false;
    }

    if (!department.trim()) {
      toast({
        title: "Validation Error",
        description: "Department is required",
        variant: "destructive"
      });
      return false;
    }

    if (!year.trim()) {
      toast({
        title: "Validation Error",
        description: "Year is required",
        variant: "destructive"
      });
      return false;
    }

    if (!password) {
      toast({
        title: "Validation Error",
        description: "Password is required",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("Sending OTP request to:", `${API_BASE_URL}/send-otp`);
      console.log("Form data:", formData);

      const res = await fetch(`${API_BASE_URL}/send-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }

      setOtpSent(true);
      setResendCooldown(60); // 60 second cooldown
      
      // Start cooldown timer
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "OTP Sent Successfully!",
        description: `Verification code sent to ${formData.email}. Check your email inbox.`
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/resend-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "OTP Resent!",
        description: "A new verification code has been sent to your email"
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "OTP Required",
        description: "Please enter the complete 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast({
        title: "Invalid OTP",
        description: "OTP must contain only numbers",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Verifying OTP:", otp);
      
      const res = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ ...formData, otp })
      });

      const data = await res.json();
      console.log("Verification response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      toast({
        title: "Registration Successful! 🎉",
        description: "Welcome to OG Techminds! You can now sign in to your account."
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        rollNumber: '',
        department: '',
        year: '',
        password: '',
        confirmPassword: ''
      });
      setOtp('');
      setOtpSent(false);

      // Navigate to login after a brief delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Please check your OTP and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setOtpSent(false);
    setOtp('');
    setResendCooldown(0);
  };

  // ✅ Google Login handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const res = await fetch(`${API_BASE_URL}/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: credentialResponse.credential }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Google login failed");

        toast({
          title: "Google Login Successful!",
          description: `Welcome ${data.name || ""}`
        });

        navigate("/dashboard"); // or wherever you want to redirect

      } catch (err: any) {
        toast({
          title: "Google Login Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/40 border-purple-500/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">OG Techminds</span>
          </div>
          <CardTitle className="text-2xl text-white">Join Our Club</CardTitle>
          <CardDescription className="text-gray-300">
            {!otpSent 
              ? 'Create your account to become a member' 
              : `Enter the OTP sent to ${formData.email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <>
              <div className="space-y-4">
                {/* existing registration fields here (unchanged) */}
                {/* same form as before */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[ ... ] /* your fields stay unchanged here */}
                </div>
                <Button 
                  onClick={handleSendOTP} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>

              {/* ✅ Google Sign-In */}
              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    toast({
                      title: "Google Login Failed",
                      description: "Please try again.",
                      variant: "destructive"
                    })
                  }
                />
              </div>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP verification section stays unchanged */}
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
