import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Heart, Share2, Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import debounce from 'lodash.debounce';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  uploadedAt: string;
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [likedImages, setLikedImages] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('likedImages') || '[]');
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('events');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const lastImageRef = useRef<HTMLDivElement | null>(null);

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

  const checkAdminStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/check-session-status`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role === 'admin') {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const fetchImages = async (pageNum: number, reset: boolean = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        category: category !== 'all' ? category : '',
        search: searchQuery,
      });
      const res = await fetch(`${API_BASE_URL}/gallery?${params}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch images');
      setImages((prev) => (reset ? data.images : [...prev, ...data.images]));
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Gallery: Fetch images error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch gallery images',
        variant: 'destructive',
      });
    } finally {
      if (pageNum === 1) setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    fetchImages(1, true);
  }, [category, searchQuery]);

  const handleInfiniteScroll = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
        fetchImages(page + 1);
      }
    },
    [hasMore, loading, page]
  );

  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(handleInfiniteScroll, { threshold: 0.1 });
    if (lastImageRef.current) observer.current.observe(lastImageRef.current);
    return () => observer.current?.disconnect();
  }, [images, handleInfiniteScroll]);

  useEffect(() => {
    localStorage.setItem('likedImages', JSON.stringify(likedImages));
  }, [likedImages]);

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
    setPage(1);
    setImages([]);
  }, 300);

  const toggleLike = (imageId: string) => {
    setLikedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
    toast({
      title: likedImages.includes(imageId) ? 'Image Unliked' : 'Image Liked',
      description: likedImages.includes(imageId) ? 'Removed from your likes' : 'Added to your likes',
    });
  };

  const handleShare = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Image URL copied to clipboard',
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadDescription || !uploadCategory) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDescription);
    formData.append('category', uploadCategory);

    try {
      const res = await fetch(`${API_BASE_URL}/gallery/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
      setUploadModalOpen(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadCategory('events');
      setUploadFile(null);
      fetchImages(1, true); // Refresh images
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  if (loading && page === 1) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} flex justify-center items-center`}>
        <OGLoader />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' : 'bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100'} overflow-x-hidden transition-colors duration-300`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-black/30 border-cyan-500/20' : 'bg-white/80 border-blue-200'} backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TechMinds Gallery</h1>
            <Button
              variant="outline"
              size="sm"
              className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 space-y-6">
        {/* Gallery Header */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-xl sm:text-2xl flex items-center`}>
              <Plus className="h-5 w-5 mr-2" />
              TechMinds Gallery
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Explore moments from our club events, projects, and collaborations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Select value={category} onValueChange={(value) => { setCategory(value); setPage(1); setImages([]); }}>
              <SelectTrigger className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} w-full sm:w-[180px] text-sm h-9`}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20 text-white' : 'bg-white border-blue-200 text-gray-900'}`}>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search by title or description..."
              className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isAdmin && (
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload Image
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl`}>Gallery</CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Browse our collection</CardDescription>
          </CardHeader>
          <CardContent>
            {images.length === 0 && !loading ? (
              <div className="text-center py-8">
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-4`}>No images available yet. Check back later!</p>
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative group rounded-md overflow-hidden mb-4 break-inside-avoid ${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'}`}
                    ref={index === images.length - 1 ? lastImageRef : null}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{image.title}</span>
                    </div>
                    <div className="p-3">
                      <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-semibold`}>{image.title}</p>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{image.description}</p>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{image.category} • {timeAgo(image.uploadedAt)}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'} text-sm p-1`}
                          onClick={(e) => { e.stopPropagation(); toggleLike(image.id); }}
                          aria-label={likedImages.includes(image.id) ? 'Unlike image' : 'Like image'}
                        >
                          <Heart className={`h-4 w-4 ${likedImages.includes(image.id) ? 'fill-current' : ''}`} />
                          <span className="ml-1">{likedImages.includes(image.id) ? 'Liked' : 'Like'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'} text-sm p-1`}
                          onClick={(e) => { e.stopPropagation(); handleShare(image.url); }}
                          aria-label="Share image"
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="ml-1">Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && page > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-md overflow-hidden">
                        <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200'} h-48 animate-pulse`}></div>
                        <div className="p-3 space-y-2">
                          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200'} h-4 w-3/4 animate-pulse`}></div>
                          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200'} h-4 w-1/2 animate-pulse`}></div>
                          <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-200'} h-3 w-1/3 animate-pulse`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-4xl`}>
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          <TransformWrapper>
            <TransformComponent>
              <img
                src={selectedImage?.url}
                alt={selectedImage?.title}
                className="w-full h-auto max-h-[60vh] object-contain rounded-md"
              />
            </TransformComponent>
          </TransformWrapper>
          <div className="space-y-4">
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{selectedImage?.description}</p>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{selectedImage?.category} • {selectedImage && timeAgo(selectedImage.uploadedAt)}</p>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'} text-sm p-1`}
                onClick={() => toggleLike(selectedImage!.id)}
                aria-label={likedImages.includes(selectedImage?.id || '') ? 'Unlike image' : 'Like image'}
              >
                <Heart className={`h-4 w-4 ${likedImages.includes(selectedImage?.id || '') ? 'fill-current' : ''}`} />
                <span className="ml-1">{likedImages.includes(selectedImage?.id || '') ? 'Liked' : 'Like'}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-500'} text-sm p-1`}
                onClick={() => handleShare(selectedImage!.url)}
                aria-label="Share image"
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-1">Share</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Upload Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
            />
            <Input
              placeholder="Description"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
            />
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} w-full text-sm h-9`}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20 text-white' : 'bg-white border-blue-200 text-gray-900'}`}>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
            />
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9 w-full`}
              onClick={handleUpload}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
