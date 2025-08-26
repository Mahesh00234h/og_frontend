import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Sun, Moon, Settings, Bell, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Hackathon {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  isVirtual: boolean;
  winners: {
    teamName: string;
    members: string[];
    award: string;
    rank: number;
  }[];
  gallery: {
    id: string;
    url: string;
    description: string;
    uploadedAt: string;
  }[];
}

const HackathonWallOfFame: React.FC = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/hackathons`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setHackathons(data.hackathons);
      } catch (error) {
        console.error('HackathonWallOfFame: Fetch hackathons error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch hackathon data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, [toast]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
            : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'
        } flex justify-center items-center`}
      >
        <OGLoader />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'
          : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'
      } overflow-x-hidden transition-colors duration-300`}
    >
      {/* Header */}
      <header
        className={`${
          isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'
        } backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1
              className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Hackathon Wall of Fame
            </h1>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/members')}
                aria-label="Members"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  isDarkMode
                    ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                    : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                } backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/settings')}
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 space-y-6">
        {hackathons.length === 0 ? (
          <Card
            className={`${
              isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
            } backdrop-blur-sm`}
          >
            <CardContent>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm pt-4`}>
                No hackathons available
              </p>
            </CardContent>
          </Card>
        ) : (
          hackathons.map((hackathon) => (
            <Card
              key={hackathon.id}
              className={`${
                isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
              } backdrop-blur-sm`}
            >
              <CardHeader>
                <CardTitle
                  className={`${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  } text-lg sm:text-xl flex items-center`}
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  {hackathon.title}
                </CardTitle>
                <CardDescription
                  className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                >
                  {new Date(hackathon.date).toLocaleDateString()} | {hackathon.location}{' '}
                  {hackathon.isVirtual ? '(Virtual)' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Hackathon Details */}
                  <div>
                    <h3
                      className={`${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } text-sm font-semibold mb-2`}
                    >
                      Details
                    </h3>
                    <p
                      className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                    >
                      {hackathon.description}
                    </p>
                  </div>

                  {/* Winners */}
                  <div>
                    <h3
                      className={`${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } text-sm font-semibold mb-2`}
                    >
                      Winners
                    </h3>
                    {hackathon.winners.length === 0 ? (
                      <p
                        className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}
                      >
                        No winners recorded
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hackathon.winners.map((winner) => (
                          <Card
                            key={winner.teamName}
                            className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                          >
                            <div className="flex flex-col space-y-3">
                              <span
                                className={`${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                } text-sm font-semibold`}
                              >
                                {winner.teamName}
                              </span>
                              <p
                                className={`${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                } text-sm`}
                              >
                                Rank: {winner.rank}
                              </p>
                              <p
                                className={`${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                } text-sm`}
                              >
                                Award: {winner.award}
                              </p>
                              <div>
                                <p
                                  className={`${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                  } text-sm font-semibold`}
                                >
                                  Team Members:
                                </p>
                                <ul className="list-disc list-inside">
                                  {winner.members.map((member, index) => (
                                    <li
                                      key={index}
                                      className={`${
                                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                      } text-sm`}
                                    >
                                      {member}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Event Gallery */}
                  <div>
                    <h3
                      className={`${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } text-sm font-semibold mb-2 flex items-center`}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Event Gallery
                    </h3>
                    {hackathon.gallery.length === 0 ? (
                      <p
                        className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}
                      >
                        No gallery images available
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hackathon.gallery.map((image) => (
                          <Card
                            key={image.id}
                            className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                          >
                            <div className="flex flex-col space-y-3">
                              <img
                                src={image.url}
                                alt={image.description}
                                className="w-full h-48 object-cover rounded-md"
                              />
                              <p
                                className={`${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                } text-sm`}
                              >
                                {image.description}
                              </p>
                              <Badge className="text-xs w-fit">
                                Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HackathonWallOfFame;
