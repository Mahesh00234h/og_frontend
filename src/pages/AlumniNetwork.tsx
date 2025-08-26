import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Sun, Moon, Settings, Bell, MapPin, LinkedIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface Alumni {
  id: string;
  fullName: string;
  profilePicture: string;
  role: string;
  graduationYear: number;
  linkedIn: string;
  successStory: string;
  mentorshipAvailable: boolean;
  contributions: string[];
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
}

const AlumniNetwork: React.FC = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/alumni`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAlumni(data.alumni);
        setFilteredAlumni(data.alumni);
      } catch (error) {
        console.error('AlumniNetwork: Fetch alumni error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch alumni data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [toast]);

  useEffect(() => {
    const filtered = alumni.filter(
      (alum) =>
        alum.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alum.location.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAlumni(filtered);
  }, [searchQuery, alumni]);

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
              Alumni Network
            </h1>
            <div className="flex items-center space-x-3">
              <Input
                type="text"
                placeholder="Search alumni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 text-white border-cyan-500/50'
                    : 'bg-white text-gray-900 border-blue-300'
                } h-9 w-40 sm:w-64`}
              />
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
        {/* Alumni Directory */}
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
              <Users className="h-5 w-5 mr-2" />
              Alumni Directory
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Connect with our alumni network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAlumni.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No alumni found
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAlumni.map((alum) => (
                  <Card
                    key={alum.id}
                    className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                  >
                    <div className="flex flex-col space-y-3">
                      <img
                        src={alum.profilePicture}
                        alt={alum.fullName}
                        className="w-16 h-16 rounded-full object-cover mx-auto"
                      />
                      <h3
                        className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        } text-sm font-semibold text-center`}
                      >
                        {alum.fullName}
                      </h3>
                      <p
                        className={`${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        } text-sm text-center`}
                      >
                        {alum.role}
                      </p>
                      <p
                        className={`${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        } text-sm text-center`}
                      >
                        Graduated: {alum.graduationYear}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${
                          isDarkMode
                            ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                            : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                        } w-fit mx-auto`}
                        onClick={() => window.open(alum.linkedIn, '_blank')}
                      >
                        <LinkedIn className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      {alum.mentorshipAvailable && (
                        <Badge className="text-xs w-fit mx-auto">Mentor Available</Badge>
                      )}
                      {alum.successStory && (
                        <p
                          className={`${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          } text-sm italic text-center`}
                        >
                          "{alum.successStory}"
                        </p>
                      )}
                      {alum.contributions.length > 0 && (
                        <div className="text-center">
                          <p
                            className={`${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            } text-sm font-semibold`}
                          >
                            Contributions:
                          </p>
                          <ul className="list-disc list-inside">
                            {alum.contributions.map((contribution, index) => (
                              <li
                                key={index}
                                className={`${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                } text-sm`}
                              >
                                {contribution}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Map */}
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
              <MapPin className="h-5 w-5 mr-2" />
              Alumni Locations
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Explore where our alumni are located
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MapContainer
              center={[0, 0]}
              zoom={2}
              style={{ height: '400px', width: '100%' }}
              className={`${isDarkMode ? 'leaflet-dark' : ''}`}
            >
              <TileLayer
                url={
                  isDarkMode
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredAlumni.map(
                (alum) =>
                  alum.location.lat && alum.location.lng && (
                    <Marker key={alum.id} position={[alum.location.lat, alum.location.lng]}>
                      <Popup>
                        <div>
                          <h3 className="font-semibold">{alum.fullName}</h3>
                          <p>{alum.role}</p>
                          <p>
                            {alum.location.city}, {alum.location.country}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )
              )}
            </MapContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlumniNetwork;
