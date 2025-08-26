import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Award, Upload, Sun, Moon, Settings, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  rollNumber: string;
}

interface Certificate {
  id: string;
  userId: string;
  userName: string;
  issuedAt: string;
  projectId?: string;
}

const BulkCertificate: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [certificateHistory, setCertificateHistory] = useState<Certificate[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUsers(data.users);
      } catch (error) {
        console.error('BulkCertificate: Fetch users error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users',
          variant: 'destructive',
        });
      }
    };

    const fetchCertificateHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/certificates/history`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCertificateHistory(data.certificates);
      } catch (error) {
        console.error('BulkCertificate: Fetch certificate history error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch certificate history',
          variant: 'destructive',
        });
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchCertificateHistory()]);
      setLoading(false);
    };

    loadData();
  }, [toast]);

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkIssueCertificates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/certificates/bulk-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCertificateHistory((prev) => [...prev, ...data.certificates]);
      setSelectedUsers([]);
      toast({
        title: 'Success',
        description: `Issued ${data.certificates.length} certificates successfully`,
      });
    } catch (error: any) {
      console.error('BulkCertificate: Bulk issue certificates error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to issue certificates',
        variant: 'destructive',
      });
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      const res = await fetch(`${API_BASE_URL}/admin/certificates/bulk-issue-csv`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCertificateHistory((prev) => [...prev, ...data.certificates]);
      setCsvFile(null);
      setIsCsvModalOpen(false);
      toast({
        title: 'Success',
        description: `Issued ${data.certificates.length} certificates successfully via CSV`,
      });
    } catch (error: any) {
      console.error('BulkCertificate: CSV upload error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process CSV file',
        variant: 'destructive',
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) {
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
            <h1 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bulk Certificate Issuing</h1>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
                onClick={toggleTheme}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
                onClick={() => navigate('/members')}
                aria-label="Members"
              >
                <Users className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} backdrop-blur-sm h-9 w-9 p-0`}
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
        {/* User Selection */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Users className="h-5 w-5 mr-2" />
              Select Users for Certificates
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Choose users to issue certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Name</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Email</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Roll Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No users available</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelection(user.id)}
                          className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50' : 'bg-gray-100 border-blue-300'} h-4 w-4`}
                        />
                      </TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{user.fullName}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{user.email}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{user.rollNumber}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <Button
              className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9 mt-4`}
              onClick={handleBulkIssueCertificates}
              disabled={selectedUsers.length === 0}
            >
              <Award className="h-4 w-4 mr-1" />
              Issue Certificates ({selectedUsers.length})
            </Button>
            <Button
              variant="outline"
              className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9 mt-4 ml-2`}
              onClick={() => setIsCsvModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload CSV
            </Button>
          </CardContent>
        </Card>

        {/* Certificate History */}
        <Card className={`${isDarkMode ? 'bg-black/40 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm`}>
          <CardHeader>
            <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg sm:text-xl flex items-center`}>
              <Award className="h-5 w-5 mr-2" />
              Certificate History
            </CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Track issued certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Certificate ID</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Issued At</TableHead>
                  <TableHead className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Project ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificateHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No certificates issued</TableCell>
                  </TableRow>
                ) : (
                  certificateHistory.map((certificate) => (
                    <TableRow key={certificate.id}>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{certificate.id}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{certificate.userName}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{new Date(certificate.issuedAt).toLocaleString()}</TableCell>
                      <TableCell className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>{certificate.projectId || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CSV Upload Modal */}
        <Dialog open={isCsvModalOpen} onOpenChange={setIsCsvModalOpen}>
          <DialogContent className={`${isDarkMode ? 'bg-black/80 border-cyan-500/20' : 'bg-white border-blue-200'} backdrop-blur-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} max-w-[90vw] sm:max-w-md`}>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Upload CSV for Certificates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className={`${isDarkMode ? 'bg-black/60 border-cyan-400/50 text-white' : 'bg-gray-100 border-blue-300 text-gray-900'} text-sm h-9`}
                />
              </div>
              {csvFile && (
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm`}>Selected File: {csvFile.name}</p>
              )}
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs`}>
                CSV should contain columns: userId, fullName, email, rollNumber
              </p>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className={`${isDarkMode ? 'text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10' : 'text-blue-600 border-blue-300 hover:bg-blue-100'} text-sm h-9`}
                onClick={() => setIsCsvModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className={`${isDarkMode ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'} text-white text-sm h-9`}
                onClick={handleCsvUpload}
                disabled={!csvFile}
              >
                Upload & Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BulkCertificate;
