import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Sun, Moon, Settings, Bell, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface SearchResult {
  id: string;
  type: 'project' | 'event' | 'alumni' | 'blog';
  title: string;
  description: string;
  date?: string;
  tags: string[];
  thumbnail?: string;
  link?: string;
}

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&type=${filterType}&sort=${sortBy}`,
          {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            credentials: 'include',
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSearchResults(data.results);
      } catch (error) {
        console.error('SearchPage: Fetch search results error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch search results',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, filterType, sortBy, toast]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
              Search & Explore
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
        {/* Search Bar and Filters */}
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
              <Search className="h-5 w-5 mr-2" />
              Search & Explore
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Find projects, events, alumni, and blogs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Search for projects, events, alumni, or blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 text-white border-cyan-500/50'
                    : 'bg-white text-gray-900 border-blue-300'
                } flex-1`}
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger
                  className={`${
                    isDarkMode
                      ? 'bg-gray-800 text-white border-cyan-500/50'
                      : 'bg-white text-gray-900 border-blue-300'
                  } w-full sm:w-40`}
                >
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                  <SelectItem value="blog">Blogs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  className={`${
                    isDarkMode
                      ? 'bg-gray-800 text-white border-cyan-500/50'
                      : 'bg-white text-gray-900 border-blue-300'
                  } w-full sm:w-40`}
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card
          className={`${
            isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'
          } backdrop-blur-sm`}
        >
          <CardHeader>
            <CardTitle
              className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl`}
            >
              Results
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              {searchResults.length} items found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <OGLoader />
            ) : searchResults.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No results found
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <Card
                    key={result.id}
                    className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                  >
                    <div className="flex flex-col space-y-3">
                      {result.thumbnail && (
                        <img
                          src={result.thumbnail}
                          alt={result.title}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <h3
                          className={`${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          } text-sm font-semibold`}
                        >
                          {result.title}
                        </h3>
                        <Badge className="text-xs capitalize">{result.type}</Badge>
                      </div>
                      <p
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                      >
                        {result.description}
                      </p>
                      {result.date && (
                        <p
                          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}
                        >
                          {new Date(result.date).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {result.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${
                            isDarkMode
                              ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10'
                              : 'text-blue-600 border-blue-300 hover:bg-blue-100'
                          } w-fit`}
                          onClick={() => window.open(result.link, '_blank')}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchPage;
