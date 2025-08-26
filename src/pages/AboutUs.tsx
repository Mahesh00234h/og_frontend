import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Sun, Moon, Settings, Bell, Briefcase, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OGLoader from '@/components/ui/OGLoader';
import { hierarchy, tree } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { useRef } from 'react';

const API_BASE_URL = 'https://og-backend-mwwi.onrender.com/api';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  linkedin: string;
  avatar?: string;
  team: 'TSSM' | 'JSPM';
  parentId?: string;
}

interface ClubInfo {
  description: string;
  founded: string;
  milestones: { year: string; event: string }[];
}

const AboutUs: React.FC = () => {
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [keyMembers, setKeyMembers] = useState<TeamMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeTeam, setActiveTeam] = useState<'TSSM' | 'JSPM'>('TSSM');
  const navigate = useNavigate();
  const { toast } = useToast();
  const treeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClubInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/about`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setClubInfo(data.clubInfo);
      } catch (error) {
        console.error('AboutUs: Fetch club info error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch club information',
          variant: 'destructive',
        });
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/team`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setKeyMembers(data.members.filter((m: TeamMember) =>
          ['Founder', 'Co-Founder', 'President'].includes(m.role)
        ).slice(0, 4));
        setTeamMembers(data.members);
      } catch (error) {
        console.error('AboutUs: Fetch team members error:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch team members',
          variant: 'destructive',
        });
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchClubInfo(), fetchTeamMembers()]);
      setLoading(false);
    };

    loadData();
  }, [toast]);

  useEffect(() => {
    if (!teamMembers.length || !treeContainerRef.current) return;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 20, left: 30 };

    // Clear previous SVG
    select(treeContainerRef.current).selectAll('svg').remove();

    // Create SVG container
    const svg = select(treeContainerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter members by active team
    const filteredMembers = teamMembers.filter((member) => member.team === activeTeam);

    // Create hierarchy
    const rootMember = filteredMembers.find((m) => !m.parentId) || filteredMembers[0];
    const memberMap = new Map(filteredMembers.map((m) => [m.id, { ...m, children: [] as TeamMember[] }]));
    filteredMembers.forEach((member) => {
      if (member.parentId && memberMap.get(member.parentId)) {
        memberMap.get(member.parentId)!.children.push(memberMap.get(member.id)!);
      }
    });

    const root = hierarchy(memberMap.get(rootMember.id)!);

    // Create tree layout
    const treeLayout = tree<TeamMember>().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    const treeData = treeLayout(root);

    // Draw links
    svg
      .selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', isDarkMode ? '#4B5EAA' : '#60A5FA')
      .attr('stroke-width', 2)
      .attr('d', (d: any) => {
        return `M${d.source.x},${d.source.y}C${d.source.x},${(d.source.y + d.target.y) / 2} ${d.target.x},${
          (d.source.y + d.target.y) / 2
        } ${d.target.x},${d.target.y}`;
      });

    // Draw nodes
    const nodes = svg
      .selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Node circles
    nodes
      .append('circle')
      .attr('r', 20)
      .attr('fill', isDarkMode ? '#1E3A8A' : '#93C5FD');

    // Node text
    nodes
      .append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', isDarkMode ? '#E0F2FE' : '#1E40AF')
      .attr('font-size', '12px')
      .text((d) => d.data.name);

    // LinkedIn links
    nodes
      .append('a')
      .attr('xlink:href', (d) => d.data.linkedin)
      .attr('target', '_blank')
      .append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', isDarkMode ? '#38BDF8' : '#2563EB')
      .attr('font-size', '10px')
      .text((d) => d.data.role);
  }, [teamMembers, activeTeam, isDarkMode]);

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
              About OGTechMinds
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
        {/* Club Information */}
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
              <Briefcase className="h-5 w-5 mr-2" />
              About OGTechMinds
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Our mission and journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clubInfo ? (
              <div className="space-y-4">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  {clubInfo.description}
                </p>
                <p
                  className={`${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  } text-sm font-semibold`}
                >
                  Founded: {clubInfo.founded}
                </p>
                <div>
                  <h3
                    className={`${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    } text-sm font-semibold mb-2`}
                  >
                    Timeline
                  </h3>
                  <ul className="space-y-2">
                    {clubInfo.milestones.map((milestone, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span
                          className={`${
                            isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                          } text-sm font-semibold`}
                        >
                          {milestone.year}:
                        </span>
                        <span
                          className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                        >
                          {milestone.event}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No club information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Key Members */}
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
              Key Members
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Meet our leadership team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {keyMembers.length === 0 ? (
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                No key members available
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {keyMembers.map((member) => (
                  <Card
                    key={member.id}
                    className={`${isDarkMode ? 'bg-cyan-900/30' : 'bg-blue-50'} p-4`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={member.avatar || 'https://via.placeholder.com/100'}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <span
                        className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        } text-sm font-semibold`}
                      >
                        {member.name}
                      </span>
                      <span
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
                      >
                        {member.role}
                      </span>
                      <Button
                        variant="link"
                        className={`${
                          isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                        } text-sm p-0 h-auto flex items-center`}
                        onClick={() => window.open(member.linkedin, '_blank')}
                      >
                        <Linkedin className="h-4 w-4 mr-1" />
                        LinkedIn
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Core Team */}
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
              Core Team
            </CardTitle>
            <CardDescription
              className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}
            >
              Our team structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="TSSM" onValueChange={(value) => setActiveTeam(value as 'TSSM' | 'JSPM')}>
              <TabsList
                className={`${
                  isDarkMode ? 'bg-black/60' : 'bg-gray-100'
                } grid w-[200px] grid-cols-2`}
              >
                <TabsTrigger value="TSSM">TSSM</TabsTrigger>
                <TabsTrigger value="JSPM">JSPM</TabsTrigger>
              </TabsList>
              <TabsContent value="TSSM">
                <div ref={treeContainerRef} className="w-full h-[400px] overflow-auto"></div>
              </TabsContent>
              <TabsContent value="JSPM">
                <div ref={treeContainerRef} className="w-full h-[400px] overflow-auto"></div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutUs;
