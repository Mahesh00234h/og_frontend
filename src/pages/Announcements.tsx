import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';


interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
}

const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const response = await fetch(`${API_BASE_URL}/announcements`, {
    method: 'GET',
    credentials: 'include', // Include cookies for session authentication
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch announcements');
  }

  const data = await response.json();
  return data.announcements;
};

// Utility function to format "time ago"
const timeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

const AnnouncementsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: announcements, isLoading, error } = useQuery<Announcement[], Error>({
    queryKey: ['announcements'],
    queryFn: fetchAnnouncements,
    retry: 1, // Retry once on failure
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <OGLoader />
      </div>
    );
  }

  if (error) {
    toast({
      title: 'Error',
      description: error.message || 'Failed to fetch announcements',
      variant: 'destructive',
    });
    // Redirect to login if authentication error (e.g., 401)
    if (error.message.includes('No active session')) {
      navigate('/login');
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6">
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Latest Announcements
            </CardTitle>
            <CardDescription className="text-gray-300">
              Stay updated with the latest club announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length === 0 ? (
              <p className="text-gray-400">No announcements available</p>
            ) : (
              <ul className="space-y-2">
                {announcements?.map((announcement) => (
                  <li
                    key={announcement.id}
                    className="p-2 rounded-md bg-purple-900/30"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-semibold">{announcement.title}</span>
                        <p className="text-gray-300 text-sm">{announcement.message}</p>
                        <p className="text-gray-400 text-sm">{timeAgo(announcement.createdAt)}</p>
                      </div>
                      <Badge
                        variant={
                          announcement.priority === 'high'
                            ? 'destructive'
                            : announcement.priority === 'normal'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
