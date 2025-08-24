import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Code, Search, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import SmallLoader from "@/components/ui/SmallLoader";
import { cn } from '@/lib/utils';

const CERTIFICATE_API_BASE_URL = import.meta.env.VITE_CERTIFICATE_API_BASE_URL || "https://certi-og-backend.onrender.com";

const VerifyCertificate: React.FC = () => {
  const [certId, setCertId] = useState('');
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentCertSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches).slice(0, 5));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (id: string) => {
    const updatedSearches = [id, ...recentSearches.filter(search => search !== id)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentCertSearches', JSON.stringify(updatedSearches));
  };

  // Extract certId from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id && !isNaN(Number(id))) {
      setCertId(id);
      handleVerify(id);
    }
  }, [location.search]);

  const handleVerify = async (id: string = certId) => {
    if (!id || isNaN(Number(id))) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid certificate ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const res = await fetch(`${CERTIFICATE_API_BASE_URL}/verify/${id}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify certificate');

      if (data.verified) {
        setCertificate(data);
        saveRecentSearch(id);
        toast({
          title: 'Certificate Verified',
          description: `Certificate #${id} is valid`,
        });
      } else {
        throw new Error(data.message || 'Certificate not found');
      }
    } catch (error: any) {
      console.error('VerifyCertificate: Error:', error);
      setError(error.message || 'Failed to verify certificate');
      toast({
        title: 'Verification Failed',
        description: error.message || 'Certificate not found or invalid',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Verification URL copied to clipboard',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/50 border-green-500/30 backdrop-blur-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="h-8 w-8 text-green-400 animate-pulse" />
            <span className="text-2xl font-bold text-white">OG Techminds</span>
          </div>
          <CardTitle className="text-3xl text-white font-bold">Verify Certificate</CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            Authenticate your certificate on the Aptos blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="certId" className="text-white text-sm font-semibold">Certificate ID</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <Input
                id="certId"
                type="number"
                placeholder="Enter certificate ID"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="pl-10 bg-black/30 border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring focus:ring-green-400/30 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white text-sm font-semibold">Recent Searches</Label>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((id) => (
                  <Button
                    key={id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCertId(id);
                      handleVerify(id);
                    }}
                    className="bg-black/20 border-green-500/30 text-white hover:bg-green-500/20"
                    disabled={loading}
                  >
                    #{id}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Verify Button */}
          <Button
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all"
            onClick={() => handleVerify()}
            disabled={loading}
          >
            {loading ? (
              <>
                <SmallLoader className="mr-2 h-4 w-4" />
                Verifying...
              </>
            ) : (
              'Verify Certificate'
            )}
          </Button>

          {/* Certificate Details */}
          {certificate && certificate.verified && (
            <div className="p-6 rounded-lg bg-green-900/20 border border-green-500/30 animate-fade-in">
              <h3 className="text-white font-semibold text-lg mb-4">Certificate Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-200">
                <div>
                  <p><span className="font-semibold">ID:</span> {certificate.certificate.id}</p>
                  <p><span className="font-semibold">Recipient:</span> {certificate.certificate.recipient}</p>
                  <p><span className="font-semibold">Issuer:</span> {certificate.certificate.issuer}</p>
                  <p><span className="font-semibold">Event:</span> {certificate.event_name || 'OG Techminds Event'}</p>
                  <p><span className="font-semibold">Type:</span> {certificate.type || 'Participation'}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Prize:</span> {certificate.prize || 'N/A'}</p>
                  <p><span className="font-semibold">Placement:</span> {certificate.placement || 'N/A'}</p>
                  <p><span className="font-semibold">PDF Hash:</span> <span className="font-mono text-xs break-all">{certificate.certificate.pdf_hash}</span></p>
                  {certificate.verify_url && (
                    <p className="flex items-center space-x-2">
                      <span className="font-semibold">Verify URL:</span>
                      <a href={certificate.verify_url} className="text-green-400 underline flex items-center" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" /> Link
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(certificate.verify_url)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </p>
                  )}
                  {certificate.cloudinary_url && (
                    <p>
                      <span className="font-semibold">PDF:</span>{' '}
                      <a href={certificate.cloudinary_url} className="text-green-400 underline flex items-center" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" /> Download PDF
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-6 rounded-lg bg-red-900/20 border border-red-500/30 animate-fade-in">
              <p className="text-red-300 text-sm">{error}</p>
              <div className="mt-4 flex space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify()}
                  className="bg-black/20 border-red-500/30 text-white hover:bg-red-500/20"
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Retry
                </Button>
                <a
                  href="mailto:support@ogtechminds.local"
                  className="text-red-400 underline flex items-center text-sm"
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> Contact Support
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCertificate;
