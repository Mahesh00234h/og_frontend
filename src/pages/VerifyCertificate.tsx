import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Code, Search } from 'lucide-react';
import OGLoader from '@/components/ui/OGLoader';

const CERTIFICATE_API_BASE_URL = import.meta.env.VITE_CERTIFICATE_API_BASE_URL || "https://certi-og-backend.onrender.com";

const VerifyCertificate: React.FC = () => {
  const [certId, setCertId] = useState('');
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!certId || isNaN(Number(certId))) {
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
      const res = await fetch(`${CERTIFICATE_API_BASE_URL}/verify/${certId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify certificate');
      setCertificate(data.certificate);
      toast({
        title: 'Certificate Verified',
        description: `Certificate #${certId} is valid`,
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/40 border-green-500/20 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Code className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">OG Techminds</span>
          </div>
          <CardTitle className="text-2xl text-white">Verify Certificate</CardTitle>
          <CardDescription className="text-gray-300">
            Check the authenticity of a certificate on the Aptos blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certId" className="text-white">Certificate ID</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <Input
                id="certId"
                type="number"
                placeholder="Enter certificate ID"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="pl-10 bg-black/20 border-green-500/20 text-white placeholder:text-gray-400 focus:border-green-400"
                disabled={loading}
              />
            </div>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <>
                <OGLoader className="mr-2 h-4 w-4" />
                Verifying...
              </>
            ) : (
              'Verify Certificate'
            )}
          </Button>
          {certificate && (
            <div className="p-4 rounded-md bg-green-900/30 border border-green-500/20">
              <h3 className="text-white font-semibold mb-2">Certificate Details</h3>
              <div className="space-y-2 text-sm text-gray-200">
                <p><span className="font-semibold">ID:</span> {certificate.id}</p>
                <p><span className="font-semibold">Recipient:</span> {certificate.recipient}</p>
                <p><span className="font-semibold">Issuer:</span> {certificate.issuer}</p>
                <p><span className="font-semibold">PDF Hash:</span> <span className="font-mono">{certificate.pdf_hash}</span></p>
                {certificate.verify_url && (
                  <p><span className="font-semibold">Verify URL:</span> <a href={certificate.verify_url} className="text-green-400 underline" target="_blank" rel="noopener noreferrer">{certificate.verify_url}</a></p>
                )}
                {certificate.cloudinary_url && (
                  <p><span className="font-semibold">PDF:</span> <a href={certificate.cloudinary_url} className="text-green-400 underline" target="_blank" rel="noopener noreferrer">Download PDF</a></p>
                )}
              </div>
            </div>
          )}
          {error && (
            <div className="p-4 rounded-md bg-red-900/30 border border-red-500/20">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCertificate;
