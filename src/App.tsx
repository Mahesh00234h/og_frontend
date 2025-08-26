import { useState, useEffect, lazy, Suspense, Component, ReactNode } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OGLoader from "@/components/ui/OGLoader";

// Lazy-loaded components
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Members = lazy(() => import("./pages/Members"));
const Events = lazy(() => import("./pages/Events"));
const Projects = lazy(() => import("./pages/Projects"));
const Chat = lazy(() => import("./pages/Chat"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminRegister = lazy(() => import("./pages/AdminRegister"));
const Announcements = lazy(() => import("./pages/Announcements"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Issuer = lazy(() => import("./pages/Issuer"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const AchievementsAndBadges = lazy(() => import("./pages/AchievementsAndBadges"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AlumniNetwork = lazy(() => import("./pages/AlumniNetwork"));
const BulkCertificate = lazy(() => import("./pages/BulkCertificate"));
const Challenge = lazy(() => import("./pages/Challenge"));
const CollaborationHub = lazy(() => import("./pages/CollaborationHub"));
const EventsAndGallery = lazy(() => import("./pages/EventsAndGallery"));
const HackathonWallOfFame = lazy(() => import("./pages/HackathonWallOfFame"));
const MyDashboard = lazy(() => import("./pages/MyDashboard"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProjectsShowcase = lazy(() => import("./pages/ProjectsShowcase"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

const queryClient = new QueryClient();
const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface SessionData {
  message: string;
  role?: string;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1 className="text-white text-center min-h-screen flex items-center justify-center">Something went wrong. Please try again.</h1>;
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element; requireAdmin?: boolean }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('ProtectedRoute: Checking session, cookies:', document.cookie);
        const response = await fetch(`${API_BASE_URL}/check-session-status`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });
        console.log('ProtectedRoute: Session check headers:', Object.fromEntries(response.headers));
        const data: SessionData = await response.json();
        console.log('ProtectedRoute: Session check response:', data);
        if (response.ok && data.message === 'Session active') {
          setIsAuthenticated(true);
          setRole(data.role || 'user');
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('ProtectedRoute: Session check error:', error);
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  if (isAuthenticated === null) {
    return <div className="text-white text-center min-h-screen flex items-center justify-center"><OGLoader /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? '/admin-login' : '/login'} replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<div className="text-white text-center min-h-screen flex items-center justify-center"><OGLoader /></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-register" element={<AdminRegister />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/about" element={<About />} />
              <Route path="/verify-certificate" element={<VerifyCertificate />} />
              <Route path="/mydashboard" element={<MyDashboard />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/achievements" element={<AchievementsAndBadges />} />
              <Route path="/admin-analytics" element={<AdminAnalytics />} />
              <Route path="/alumni" element={<AlumniNetwork />} />
              <Route path="/bulk-certificate" element={<BulkCertificate />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/collaboration" element={<CollaborationHub />} />
              <Route path="/eventsandgallery" element={<EventsAndGallery />} />
              <Route path="/hackathon-wall" element={<HackathonWallOfFame />} />
              <Route path="/profilepage" element={<ProfilePage />} />
              <Route path="/projectsshowcase" element={<ProjectsShowcase />} />
              <Route path="/search" element={<SearchPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <Members />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:id"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issuer"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Issuer />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
