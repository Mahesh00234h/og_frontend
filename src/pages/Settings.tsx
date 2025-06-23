
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:5000/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    projectUpdates: true,
    eventReminders: true,
    weeklyDigest: false,
    darkMode: true,
    language: 'english',
    timezone: 'Asia/Kolkata',
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showProjects: true,
    allowMessages: true
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include'
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSettings(data.settings);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to fetch settings",
          variant: "destructive"
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate, toast]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="text-white">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications" className="text-white">Push Notifications</Label>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="projectUpdates" className="text-white">Project Updates</Label>
              <Switch
                id="projectUpdates"
                checked={settings.projectUpdates}
                onCheckedChange={(checked) => setSettings({ ...settings, projectUpdates: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="eventReminders" className="text-white">Event Reminders</Label>
              <Switch
                id="eventReminders"
                checked={settings.eventReminders}
                onCheckedChange={(checked) => setSettings({ ...settings, eventReminders: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyDigest" className="text-white">Weekly Digest</Label>
              <Switch
                id="weeklyDigest"
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold">Appearance</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="text-white">Dark Mode</Label>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>
            <div>
              <Label htmlFor="language" className="text-white">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="bg-black/20 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-purple-500/20">
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timezone" className="text-white">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger className="bg-black/20 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-purple-500/20">
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-semibold">Privacy</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="profileVisibility" className="text-white">Profile Visibility</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value) => setSettings({ ...settings, profileVisibility: value })}
              >
                <SelectTrigger className="bg-black/20 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-purple-500/20">
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="members">Club Members Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showEmail" className="text-white">Show Email</Label>
              <Switch
                id="showEmail"
                checked={settings.showEmail}
                onCheckedChange={(checked) => setSettings({ ...settings, showEmail: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showPhone" className="text-white">Show Phone</Label>
              <Switch
                id="showPhone"
                checked={settings.showPhone}
                onCheckedChange={(checked) => setSettings({ ...settings, showPhone: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showProjects" className="text-white">Show Projects</Label>
              <Switch
                id="showProjects"
                checked={settings.showProjects}
                onCheckedChange={(checked) => setSettings({ ...settings, showProjects: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowMessages" className="text-white">Allow Messages</Label>
              <Switch
                id="allowMessages"
                checked={settings.allowMessages}
                onCheckedChange={(checked) => setSettings({ ...settings, allowMessages: checked })}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
