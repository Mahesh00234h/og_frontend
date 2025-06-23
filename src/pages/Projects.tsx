
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Code, 
  Star, 
  Users, 
  Eye,
  GitBranch,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const Projects = () => {
  const [projects] = useState([
    {
      id: 1,
      title: 'E-commerce Website',
      description: 'Full-stack e-commerce platform with React frontend and Node.js backend',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
      stars: 24,
      views: 156,
      contributors: [
        { name: 'John Doe', avatar: '' },
        { name: 'Jane Smith', avatar: '' },
        { name: 'Bob Wilson', avatar: '' }
      ],
      status: 'completed',
      category: 'Web Development',
      createdBy: 'John Doe',
      createdAt: '2024-01-10'
    },
    {
      id: 2,
      title: 'Mobile Weather App',
      description: 'Cross-platform weather application built with React Native',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop',
      technologies: ['React Native', 'JavaScript', 'Weather API'],
      stars: 18,
      views: 89,
      contributors: [
        { name: 'Alice Johnson', avatar: '' },
        { name: 'Charlie Brown', avatar: '' }
      ],
      status: 'in-progress',
      category: 'Mobile Development',
      createdBy: 'Alice Johnson',
      createdAt: '2024-01-05'
    },
    {
      id: 3,
      title: 'IoT Home Automation',
      description: 'Smart home automation system using Arduino and sensors',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
      technologies: ['Arduino', 'C++', 'IoT', 'Sensors'],
      stars: 31,
      views: 203,
      contributors: [
        { name: 'Mike Davis', avatar: '' },
        { name: 'Sarah Wilson', avatar: '' },
        { name: 'Tom Anderson', avatar: '' },
        { name: 'Lisa Chen', avatar: '' }
      ],
      status: 'completed',
      category: 'IoT',
      createdBy: 'Mike Davis',
      createdAt: '2023-12-15'
    },
    {
      id: 4,
      title: 'AI Chatbot',
      description: 'Intelligent chatbot using natural language processing',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
      technologies: ['Python', 'TensorFlow', 'NLP', 'Flask'],
      stars: 42,
      views: 287,
      contributors: [
        { name: 'Emma Watson', avatar: '' },
        { name: 'David Kim', avatar: '' }
      ],
      status: 'completed',
      category: 'AI/ML',
      createdBy: 'Emma Watson',
      createdAt: '2023-11-20'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'in-progress': return 'bg-yellow-600';
      case 'planning': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Web Development': return 'border-blue-500 text-blue-400';
      case 'Mobile Development': return 'border-green-500 text-green-400';
      case 'IoT': return 'border-orange-500 text-orange-400';
      case 'AI/ML': return 'border-purple-500 text-purple-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Projects</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 w-64"
              />
            </div>
            <Button variant="outline" className="text-white border-purple-400">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Featured Projects */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-black/40 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getStatusColor(project.status)} text-white`}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className={`bg-black/50 border-purple-500/30 ${getCategoryColor(project.category)}`}>
                      {project.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-white">{project.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-white text-sm">{project.stars}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-white text-sm">{project.views}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div className="flex -space-x-2">
                      {project.contributors.slice(0, 3).map((contributor, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-black">
                          <AvatarImage src={contributor.avatar} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {contributor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.contributors.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-gray-600 border-2 border-black flex items-center justify-center">
                          <span className="text-white text-xs">+{project.contributors.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-500 text-purple-400">
                      <GitBranch className="h-4 w-4 mr-1" />
                      Fork
                    </Button>
                    <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-400">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
                    Created by {project.createdBy} on {project.createdAt}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Project Categories */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Web Development', 'Mobile Development', 'IoT', 'AI/ML', 'Data Science', 'Game Development', 'Blockchain', 'Cybersecurity'].map((category) => (
              <Card key={category} className="bg-black/40 border-purple-500/20 backdrop-blur-md hover:border-purple-400/40 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Code className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-white font-medium">{category}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {Math.floor(Math.random() * 20) + 5} projects
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
