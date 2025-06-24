import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { 
  MessageCircle, 
  Send, 
  Users,
  Search,
  Settings,
  Phone,
  Video,
  MoreVertical,
  Smile
} from 'lucide-react';

// Set axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://og-backend-mwwi.onrender.com/api';
;

interface Message {
  id: number;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system';
}

interface Channel {
  id: string;
  name: string;
  unread: number;
  type: 'public';
}

interface User {
  id: string;
  name: string;
  status: string;
  avatar: string;
}

const Chat = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState<string | null>(id ? null : 'general');
  const [recipient, setRecipient] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(id ? true : false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [channels] = useState<Channel[]>([
    { id: 'general', name: 'General', unread: 0, type: 'public' },
    { id: 'announcements', name: 'Announcements', unread: 2, type: 'public' },
    { id: 'web-dev', name: 'Web Development', unread: 5, type: 'public' },
    { id: 'mobile-dev', name: 'Mobile Development', unread: 0, type: 'public' },
    { id: 'ai-ml', name: 'AI & Machine Learning', unread: 3, type: 'public' },
    { id: 'random', name: 'Random', unread: 1, type: 'public' }
  ]);

  const [onlineUsers] = useState<User[]>([
    { id: '1', name: 'John Doe', status: 'online', avatar: '' },
    { id: '2', name: 'Jane Smith', status: 'online', avatar: '' },
    { id: '3', name: 'Bob Wilson', status: 'away', avatar: '' },
    { id: '4', name: 'Alice Johnson', status: 'online', avatar: '' },
    { id: '5', name: 'Mike Davis', status: 'busy', avatar: '' }
  ]);

  const [messages, setMessages] = useState<Message[]>(id ? [] : [
    {
      id: 1,
      user: 'John Doe',
      avatar: '',
      message: 'Hey everyone! Just finished the React workshop. It was amazing! 🚀',
      timestamp: '10:30 AM',
      type: 'message'
    },
    {
      id: 2,
      user: 'Jane Smith',
      avatar: '',
      message: 'Great job on the presentation John! The examples were really helpful.',
      timestamp: '10:32 AM',
      type: 'message'
    },
    {
      id: 3,
      user: 'System',
      avatar: '',
      message: 'Bob Wilson joined the channel',
      timestamp: '10:35 AM',
      type: 'system'
    },
    {
      id: 4,
      user: 'Bob Wilson',
      avatar: '',
      message: 'Sorry I missed the workshop! Will there be a recording available?',
      timestamp: '10:36 AM',
      type: 'message'
    },
    {
      id: 5,
      user: 'Alice Johnson',
      avatar: '',
      message: 'I can share my notes from the workshop if anyone wants them',
      timestamp: '10:38 AM',
      type: 'message'
    }
  ]);

  useEffect(() => {
    if (!id) return;

    const fetchRecipient = async () => {
      try {
        const response = await axios.get(`/users/${id}`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        setRecipient({
          id: response.data.id,
          name: response.data.name || 'Unknown',
          status: response.data.status || 'offline',
          avatar: response.data.avatar || ''
        });
        // Fetch existing messages for this user (placeholder)
        const messagesResponse = await axios.get(`/messages/${id}`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        setMessages(messagesResponse.data.messages || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch recipient error:', err);
        const errorMessage =
          err.response?.status === 404
            ? 'User not found'
            : err.response?.status === 401
            ? 'Please log in to start a chat'
            : err.response?.data?.error || 'Failed to fetch user';
        setError(errorMessage);
        setLoading(false);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          navigate('/members');
        }
      }
    };

    fetchRecipient();
  }, [id, navigate, toast]);

  const sendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const newMessage: Message = {
      id: messages.length + 1,
      user: 'You',
      avatar: '',
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'message'
    };

    try {
      if (id && recipient) {
        // Send direct message to backend
        await axios.post(
          `/messages/${id}`,
          { content: message },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      setMessages([...messages, newMessage]);
      setMessage('');
      toast({
        title: 'Success',
        description: 'Message sent',
      });
    } catch (err: any) {
      console.error('Send message error:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'busy': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <Button
              onClick={() => navigate('/members')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Back to Members
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">
              {recipient ? `Chat with ${recipient.name}` : 'Club Chat'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {recipient && (
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 ${getStatusColor(recipient.status)} rounded-full`} />
                <span className="text-gray-300">{recipient.status}</span>
              </div>
            )}
            {!recipient && (
              <Badge className="bg-green-600 text-white">
                {onlineUsers.filter(u => u.status === 'online').length} online
              </Badge>
            )}
            <Button
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => navigate('/members')}
            >
              Back to Members
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex h-[calc(100vh-80px)]">
        {/* Sidebar (hidden for direct messages) */}
        {!recipient && (
          <div className="w-80 bg-black/20 backdrop-blur-md border-r border-purple-500/20 flex flex-col">
            {/* Channels */}
            <div className="p-4 border-b border-purple-500/20">
              <h3 className="text-white font-semibold mb-3">Channels</h3>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      activeChannel === channel.id 
                        ? 'bg-purple-600/30 text-white' 
                        : 'text-gray-300 hover:bg-purple-500/20'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>#</span>
                      <span>{channel.name}</span>
                    </span>
                    {channel.unread > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {channel.unread}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Online Users */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-white font-semibold mb-3">Online Members</h3>
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-purple-500/20 cursor-pointer"
                    onClick={() => navigate(`/chat/${user.id}`)}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-purple-600 text-white text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 ${getStatusColor(user.status)} rounded-full border-2 border-black`} />
                    </div>
                    <span className="text-gray-300 text-sm">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-black/20 backdrop-blur-md border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {recipient ? (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={recipient.avatar} />
                    <AvatarFallback className="bg-purple-600 text-white">
                      {recipient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-white font-semibold">{recipient.name}</h2>
                </>
              ) : (
                <>
                  <span className="text-gray-400">#</span>
                  <h2 className="text-white font-semibold">
                    {channels.find(c => c.id === activeChannel)?.name}
                  </h2>
                  <Badge variant="outline" className="text-gray-400 border-gray-500">
                    {messages.length} messages
                  </Badge>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {recipient && (
                <>
                  <Button variant="outline" size="sm" className="text-black border-purple-400">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-black border-purple-400">
                    <Video className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" className="text-black border-purple-400">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-black border-purple-400">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-gray-400 text-center italic">
                {recipient ? 'No messages yet. Start the conversation!' : 'No messages in this channel.'}
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start space-x-3 ${msg.type === 'system' ? 'justify-center' : ''}`}>
                {msg.type === 'system' ? (
                  <div className="text-gray-400 text-sm italic">
                    {msg.message}
                  </div>
                ) : (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {msg.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-medium">{msg.user}</span>
                        <span className="text-gray-400 text-xs">{msg.timestamp}</span>
                      </div>
                      <p className="text-gray-300">{msg.message}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-black/20 backdrop-blur-md border-t border-purple-500/20">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={recipient ? `Message ${recipient.name}` : `Message #${channels.find(c => c.id === activeChannel)?.name}`}
                  className="bg-black/20 border-purple-500/20 text-white placeholder:text-gray-400 pr-12"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1 text-gray-400 hover:text-white"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                onClick={sendMessage}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
