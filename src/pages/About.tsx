
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // Assuming you're using react-router-dom for navigation
import { 
  Code, 
  Users, 
  Target,
  Heart,
  Award,
  BookOpen,
  Lightbulb,
  Globe
} from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: 'Gaurav Pandit',
      role: 'Founder',
      department: 'Computer Science',
      image: '',
      bio: 'Passionate about fostering innovation and technical excellence in students.'
    },
    {
      name: 'Prajwal Nivangune',
      role: 'co-founder',
      department: 'Computer Science',
      year: '4th Year',
      image: '',
      bio: 'Leading the club towards new heights of technical innovation and collaboration.'
    },
    {
      name: 'TSSMS',
      role: 'President',
      department: 'Information Technology',
      year: '3rd Year',
      image: '',
      bio: 'Organizing events and workshops to enhance learning experiences for all members.'
    },
    {
      name: 'JSPM',
      role: 'president',
      department: 'Electronics',
      year: '3rd Year',
      image: '',
      bio: 'Driving technical projects and mentoring junior members in latest technologies.'
    }
  ];

  const achievements = [
    {
      title: 'Best Technical Club 2023',
      description: 'Awarded by the University for outstanding technical contributions',
      icon: '🏆'
    },
    {
      title: '500+ Active Members',
      description: 'Growing community of passionate tech enthusiasts',
      icon: '👥'
    },
    {
      title: '50+ Successful Events',
      description: 'Workshops, hackathons, and technical seminars conducted',
      icon: '📅'
    },
    {
      title: '100+ Projects Completed',
      description: 'Innovative solutions developed by our members',
      icon: '💻'
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We foster creative thinking and encourage innovative solutions to real-world problems.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and collaborative learning experiences.'
    },
    {
      icon: BookOpen,
      title: 'Learning',
      description: 'Continuous learning and skill development are at the core of our mission.'
    },
    {
      icon: Globe,
      title: 'Impact',
      description: 'We strive to create technology that makes a positive impact on society.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <Code className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">About OG Techminds</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Building the <span className="text-purple-400">Future</span> Together
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              OG Techminds is a vibrant community of passionate technologists, innovators, and future leaders. 
              We're dedicated to fostering technical excellence, encouraging collaboration, and creating 
              meaningful impact through technology.
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <h3 className="text-3xl font-bold text-purple-400">500+</h3>
                <p className="text-gray-300">Members</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-400">100+</h3>
                <p className="text-gray-300">Projects</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-400">50+</h3>
                <p className="text-gray-300">Events</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-purple-400">5+</h3>
                <p className="text-gray-300">Years</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-6 w-6 mr-2 text-purple-400" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                To empower students with cutting-edge technical skills, foster innovation through 
                collaborative projects, and create a supportive community where technology enthusiasts 
                can learn, grow, and make a meaningful impact on the world.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Heart className="h-6 w-6 mr-2 text-purple-400" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                To be the leading technical community that bridges the gap between academic learning 
                and industry requirements, producing skilled professionals who drive technological 
                advancement and positive social change.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Core Values */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="bg-black/40 border-purple-500/20 backdrop-blur-md text-center">
                <CardHeader>
                  <value.icon className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                  <CardTitle className="text-white">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Our Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="bg-black/40 border-purple-500/20 backdrop-blur-md">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{achievement.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{achievement.title}</h3>
                  <p className="text-gray-300 text-sm">{achievement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Members */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="bg-black/40 border-purple-500/20 backdrop-blur-md">
                <CardHeader className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={member.image} />
                    <AvatarFallback className="bg-purple-600 text-white text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-purple-400">{member.role}</CardDescription>
                  <div className="space-y-1">
                    <Badge className="bg-purple-600 text-white">
                      {member.department}
                    </Badge>
                    {member.year && (
                      <Badge variant="outline" className="border-purple-500 text-purple-300">
                        {member.year}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm text-center">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What We Do */}
        <section>
          <h2 className="text-3xl font-bold text-white text-center mb-8">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Workshops & Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Regular workshops on cutting-edge technologies, programming languages, 
                  and industry best practices to enhance technical skills.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <Code className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Project Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Collaborative project development opportunities where members work together 
                  to build innovative solutions and gain hands-on experience.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
              <CardHeader>
                <Award className="h-12 w-12 text-purple-400 mb-4" />
                <CardTitle className="text-white">Competitions & Hackathons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Organizing and participating in hackathons, coding competitions, 
                  and technical challenges to foster competitive programming skills.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Join Us */}
        <section className="text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Our Community?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Become part of a thriving community of tech enthusiasts, innovators, and future leaders. 
            Let's build the future together!
          </p>
          <div className="space-x-4">
            <Link to="/register">
                    <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25">
                      Join Now
                    </Button>
                  </Link>
              <Link to="/contact">
                    <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/25">
                      Contact Us
                    </Button>
                  </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
