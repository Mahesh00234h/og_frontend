import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Sun, Moon, Settings, Bell, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface UserAchievement {
  userId: string;
  fullName: string;
  badges: Badge[];
}

interface LeaderboardEntry {
  userId: string;
  fullName: string;
  points: number;
  rank: number;
}

const AchievementsAndBadges: React.FC = () => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/achievements`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUserAchievements(data.achievements);
      } catch (error) {
        console.error('AchievementsAndBadges: Fetch achievements error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch achievements',
          variant: 'destructive',
        });
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/leaderboard`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error('AchievementsAndBadges: Fetch leaderboard error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch leaderboard',
          variant: 'destructive',
        });
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAchievements(), fetchLeaderboard()]);
      setLoading(false);
    };

    loadData();
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
              Achievements & Badges
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
        {/* Leaderboard */}
        <Card
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
              Leaderboard
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Top contributors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Rank
                  </TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Name
                  </TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Points
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}
                    >
                      No leaderboard data available
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboard.map((entry) => (
                    <TableRow key={entry.userId}>
                      <TableCell
                        className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}
                      >
                        {entry.rank}
                      </TableCell>
                      <TableCell
                        className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}
                      >
                        {entry.fullName}
                      </TableCell>
                      <TableCell
                        className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}
                      >
                        {entry.points}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Achievements & Badges */}
        <Card
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
              <Award className="h-5 w-5 mr-2" />
              Achievements & Badges
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Your earned badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userAchievements.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No achievements available
              </p>
            ) : (
              <div className="space-y-6">
                {userAchievements.map((user) => (
                  <div key={user.userId} className="space-y-4">
                    <h3
                      className={`${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } text-sm font-semibold`}
                    >
                      {user.fullName}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {user.badges.map((badge) => (
                        <Card
                          key={badge.id}
                          className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                        >
                          <div className="flex flex-col space-y-3">
                            <img
                              src={badge.icon}
                              alt={badge.name}
                              className="w-16 h-16 object-contain mx-auto"
                            />
                            <span
                              className={`${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              } text-sm font-semibold text-center`}
                            >
                              {badge.name}
                            </span>
                            <p
                              className={`${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              } text-sm text-center`}
                            >
                              {badge.description}
                            </p>
                            <Badge className="text-xs w-fit mx-auto">
                              Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AchievementsAndBadges;
