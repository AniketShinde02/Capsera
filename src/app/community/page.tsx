import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Heart, Trophy, Zap, ExternalLink, Github, Twitter, Linkedin } from 'lucide-react';

export default function CommunityPage() {
  const communityStats = [
    { label: 'Active Members', value: '15K+', icon: Users },
    { label: 'Captions Generated', value: '2M+', icon: Zap },
    { label: 'Success Stories', value: '500+', icon: Trophy },
    { label: 'Daily Messages', value: '1K+', icon: MessageSquare }
  ];

  const communityChannels = [
    {
      name: 'Discord Server',
      description: 'Join our vibrant Discord community for real-time discussions, tips, and support.',
      members: '8K+ members',
      icon: MessageSquare,
      link: 'https://discord.gg/captioncraft',
      color: 'bg-indigo-500'
    },
    {
      name: 'GitHub Discussions',
      description: 'Contribute to development, report issues, and share feature requests.',
      members: '2K+ contributors',
      icon: Github,
      link: 'https://github.com/captioncraft/discussions',
      color: 'bg-gray-800'
    },
    {
      name: 'Twitter Community',
      description: 'Follow us for updates, tips, and showcase your amazing captions.',
      members: '12K+ followers',
      icon: Twitter,
      link: 'https://twitter.com/captioncraft',
      color: 'bg-blue-500'
    },
    {
      name: 'LinkedIn Group',
      description: 'Connect with professionals and businesses using AI for content creation.',
      members: '5K+ professionals',
      icon: Linkedin,
      link: 'https://linkedin.com/groups/captioncraft',
      color: 'bg-blue-700'
    }
  ];

  const featuredContent = [
    {
      title: 'Caption Writing Masterclass',
      type: 'Workshop',
      author: 'Sarah Johnson',
      description: 'Learn advanced techniques for creating engaging social media captions that convert.',
      engagement: '2.5K views'
    },
    {
      title: 'AI vs Human Captions: A Study',
      type: 'Research',
      author: 'Dr. Mike Chen',
      description: 'Comprehensive analysis of engagement rates between AI-generated and human-written captions.',
      engagement: '1.8K views'
    },
    {
      title: 'Building a Content Calendar',
      type: 'Tutorial',
      author: 'Emma Rodriguez',
      description: 'Step-by-step guide to planning and organizing your social media content strategy.',
      engagement: '3.2K views'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Coming Soon Overlay */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold">🌍 Coming Soon</h2>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-purple-100 text-sm">
            User community launching soon! Currently building our amazing platform as a solo developer!
          </p>
        </div>
      </div>

      {/* Diagonal Glassmorphism Under Development Watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 shadow-2xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-white/80 mb-1">🚧</div>
            <div className="text-sm font-semibold text-white/90 uppercase tracking-wider">Under Development</div>
            <div className="text-xs text-white/70 mt-1">Coming Soon</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Users className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our <span className="gradient-text">Amazing Community</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with creators, marketers, and AI enthusiasts from around the world. Share tips, get inspired, and grow together.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Supportive Community
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🌍 Global Network
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              💡 Knowledge Sharing
            </Badge>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            {communityStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Join Our Community Channels</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {communityChannels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`${channel.color} p-3 rounded-lg text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {channel.name}
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {channel.members}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 text-base">
                      {channel.description}
                    </CardDescription>
                    <Button asChild className="w-full">
                      <Link href={channel.link} target="_blank" rel="noopener noreferrer">
                        Join Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Community Content</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredContent.map((content, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{content.type}</Badge>
                    <span className="text-sm text-muted-foreground">{content.engagement}</span>
                  </div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <CardDescription>By {content.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{content.description}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/community">Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Community Guidelines</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Be Respectful
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Treat all community members with kindness and respect. We're all here to learn and grow together.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Share Knowledge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Help others by sharing your experiences, tips, and insights. Knowledge shared is knowledge multiplied.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Celebrate Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your wins, big or small! We love celebrating community achievements and success stories.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Stay On Topic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep discussions relevant to content creation, AI, and social media marketing to maintain quality.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Ready to become part of our amazing community?
            </p>
            <Button asChild size="lg">
              <Link href="https://discord.gg/captioncraft">Join Discord Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
