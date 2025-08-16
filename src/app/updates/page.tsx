import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Zap, Bug, Star, ArrowRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function UpdatesPage() {
  const updates = [
    {
      version: 'v2.4.0',
      date: 'January 9, 2025',
      type: 'major',
      title: 'Enhanced Contact System & Image Analysis',
      description: 'Major improvements to caption generation and user communication.',
      features: [
        'Complete contact form system with email notifications',
        '100% image-based caption generation with deep analysis',
        'Inline form validation across all pages',
        'New pricing, careers, and community pages',
        'Scrollbar removal for cleaner UI'
      ],
      fixes: [
        'Fixed duplicate error messages in forms',
        'Resolved navigation issues across pages',
        'Improved dark mode consistency'
      ]
    },
    {
      version: 'v2.3.5',
      date: 'January 5, 2025',
      type: 'minor',
      title: 'Performance & UI Improvements',
      description: 'Speed optimizations and user interface enhancements.',
      features: [
        'Faster caption generation (30% speed improvement)',
        'Improved mobile responsiveness',
        'Enhanced loading animations',
        'Better error handling'
      ],
      fixes: [
        'Fixed memory leaks in image processing',
        'Resolved authentication edge cases',
        'Improved database connection stability'
      ]
    },
    {
      version: 'v2.3.0',
      date: 'December 28, 2024',
      type: 'major',
      title: 'AI Model Upgrade & New Features',
      description: 'Upgraded to GPT-4 Vision and added powerful new capabilities.',
      features: [
        'GPT-4 Vision integration for better image understanding',
        'Advanced mood detection and matching',
        'Bulk caption generation (Pro feature)',
        'Caption history and favorites',
        'Export options (JSON, CSV, TXT)'
      ],
      fixes: [
        'Improved caption relevance by 45%',
        'Fixed occasional timeout issues',
        'Better handling of large images'
      ]
    },
    {
      version: 'v2.2.8',
      date: 'December 20, 2024',
      type: 'patch',
      title: 'Security & Bug Fixes',
      description: 'Important security updates and stability improvements.',
      features: [
        'Enhanced security measures',
        'Improved data encryption',
        'Better spam protection'
      ],
      fixes: [
        'Fixed XSS vulnerability in user inputs',
        'Resolved CSRF token issues',
        'Fixed rare database deadlock scenarios',
        'Improved error logging and monitoring'
      ]
    },
    {
      version: 'v2.2.5',
      date: 'December 15, 2024',
      type: 'minor',
      title: 'User Experience Enhancements',
      description: 'Focus on improving user workflow and satisfaction.',
      features: [
        'Redesigned dashboard with better navigation',
        'Quick action buttons for common tasks',
        'Improved onboarding flow for new users',
        'Enhanced search and filter capabilities'
      ],
      fixes: [
        'Fixed drag-and-drop image upload issues',
        'Resolved theme switching glitches',
        'Improved accessibility compliance'
      ]
    }
  ];

  const upcomingFeatures = [
    {
      title: 'Video Caption Generation',
      description: 'Generate captions for video content automatically',
      status: 'In Development',
      eta: 'Q2 2025'
    },
    {
      title: 'Multi-language Support',
      description: 'Generate captions in 15+ languages',
      status: 'Planning',
      eta: 'Q2 2025'
    },
    {
      title: 'Advanced Analytics',
      description: 'Track caption performance and engagement',
      status: 'In Development',
      eta: 'Q1 2025'
    },
    {
      title: 'Team Collaboration',
      description: 'Share and collaborate on caption projects',
      status: 'Planning',
      eta: 'Q3 2025'
    }
  ];

  const getVersionBadge = (type: string) => {
    switch (type) {
      case 'major':
        return <Badge className="bg-green-500 hover:bg-green-600">Major Update</Badge>;
      case 'minor':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Minor Update</Badge>;
      case 'patch':
        return <Badge variant="secondary">Patch</Badge>;
      default:
        return <Badge variant="outline">Update</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Development':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Planning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Released':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Zap className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Product <span className="gradient-text">Updates</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stay up-to-date with the latest features, improvements, and fixes in CaptionCraft. We're constantly evolving to serve you better.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              Regular Updates
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🚀 New Features Monthly
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🔧 Bug Fixes Weekly
            </Badge>
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold mb-8">Recent Updates</h2>
          
          <div className="space-y-8">
            {updates.map((update, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        {update.version}
                      </Badge>
                      {getVersionBadge(update.type)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {update.date}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{update.title}</CardTitle>
                  <CardDescription>{update.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {update.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          New Features
                        </h4>
                        <ul className="space-y-2">
                          {update.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {update.fixes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Bug className="w-4 h-4 text-red-500" />
                          Bug Fixes
                        </h4>
                        <ul className="space-y-2">
                          {update.fixes.map((fix, fixIndex) => (
                            <li key={fixIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Coming Soon</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(feature.status)}
                      <Badge variant={feature.status === 'In Development' ? 'default' : 'secondary'}>
                        {feature.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{feature.eta}</span>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Have a feature request? We'd love to hear from you!
            </p>
            <Button asChild>
              <Link href="/contact" className="flex items-center gap-2">
                Request Feature
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get notified about new features, updates, and improvements. Join our newsletter for exclusive insights and early access.
              </p>
              <Button asChild size="lg">
                <Link href="/contact">Subscribe to Updates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
