import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session status...');
        const res = await fetch(`${API_BASE_URL}/check-session-status`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        console.log('Session check response:', res.status);
        if (!res.ok) {
          throw new Error('No active session');
        }
      } catch (error) {
        console.error('Session check error:', error);
        navigate('/login');
        toast({
          title: 'Session Expired',
          description: 'Please log in to view notifications',
          variant: 'destructive'
        });
        return false;
      }
      return true;
    };

    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications...');
        const res = await fetch(`${API_BASE_URL}/notifications`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        console.log('Notifications response:', res.status, data);
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login');
            toast({
              title: 'Unauthorized',
              description: 'Please log in to view notifications',
              variant: 'destructive'
            });
            return;
          }
          throw new Error(data.error || 'Failed to fetch notifications');
        }
        setNotifications(data.notifications);
      } catch (error: any) {
        console.error('Fetch notifications error:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    checkSession().then((isAuthenticated) => {
      if (isAuthenticated) fetchNotifications();
    });
  }, [toast, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            notifications.map((notification: any) => (
              <div key={notification.id} className="p-3 bg-purple-500/10 rounded-lg mb-2">
                <p className="text-white text-sm font-medium">{notification.message}</p>
                <p className="text-gray-400 text-xs">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No notifications available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;