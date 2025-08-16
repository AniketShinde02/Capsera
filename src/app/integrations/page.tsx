import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, Clock, Star, ExternalLink, Smartphone, Globe, Code } from 'lucide-react';

export default function IntegrationsPage() {
  // Redirect to feature development page
  redirect('/feature-development');

  // Original integrations code (this won't execute due to redirect, but kept for future use)
  const integrationCategories = [
    {
      name: 'Social Media Platforms',
      icon: Smartphone,
      description: 'Direct integration with major social platforms',
      count: '8 integrations'
    },
    {
      name: 'Content Management',
      icon: Globe,
      description: 'CMS and website builders',
      count: '12 integrations'
    },
    {
      name: 'Developer Tools',
      icon: Code,
      description: 'APIs and development frameworks',
      count: '6 integrations'
    }
  ];

  const featuredIntegrations = [
    {
      name: 'Instagram',
      description: 'Automatically generate captions for your Instagram posts and stories.',
      logo: '📸',
      status: 'live',
      features: ['Auto-posting', 'Story captions', 'Hashtag optimization'],
      category: 'Social Media'
    },
    {
      name: 'Facebook',
      description: 'Create engaging captions for Facebook posts and ads.',
      logo: '📘',
      status: 'live',
      features: ['Page management', 'Ad captions', 'Event descriptions'],
      category: 'Social Media'
    },
    {
      name: 'Twitter/X',
      description: 'Generate compelling tweets and thread content.',
      logo: '🐦',
      status: 'live',
      features: ['Tweet scheduling', 'Thread creation', 'Hashtag suggestions'],
      category: 'Social Media'
    },
    {
      name: 'LinkedIn',
      description: 'Professional captions for business and personal branding.',
      logo: '💼',
      status: 'live',
      features: ['Professional tone', 'Company updates', 'Article summaries'],
      category: 'Social Media'
    },
    {
      name: 'WordPress',
      description: 'Integrate caption generation directly into your WordPress site.',
      logo: '📝',
      status: 'live',
      features: ['Plugin available', 'Bulk generation', 'SEO optimization'],
      category: 'CMS'
    },
    {
      name: 'Shopify',
      description: 'Generate product descriptions and social media captions.',
      logo: '🛒',
      status: 'live',
      features: ['Product captions', 'Marketing copy', 'Social commerce'],
      category: 'E-commerce'
    },
    {
      name: 'Zapier',
      description: 'Connect CaptionCraft with 5000+ apps through Zapier.',
      logo: '⚡',
      status: 'live',
      features: ['Workflow automation', 'Multi-app sync', 'Custom triggers'],
      category: 'Automation'
    },
    {
      name: 'Canva',
      description: 'Generate captions for your Canva designs automatically.',
      logo: '🎨',
      status: 'coming-soon',
      features: ['Design integration', 'Template captions', 'Brand consistency'],
      category: 'Design'
    },
    {
      name: 'Buffer',
      description: 'Schedule posts with AI-generated captions through Buffer.',
      logo: '📅',
      status: 'coming-soon',
      features: ['Scheduling integration', 'Multi-platform', 'Analytics'],
      category: 'Social Media'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>;
      case 'coming-soon':
        return <Badge variant="secondary">Coming Soon</Badge>;
      case 'beta':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Beta</Badge>;
      default:
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Zap className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful <span className="gradient-text">Integrations</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect CaptionCraft with your favorite tools and platforms. Streamline your workflow and generate captions wherever you need them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              25+ Integrations
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              More Coming Soon
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Easy Setup
            </Badge>
          </div>
        </div>
      </section>

      {/* Integration Categories */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Integration Categories</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
            {integrationCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">{category.count}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Integrations */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Available Integrations</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredIntegrations.map((integration, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{integration.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 text-sm">
                    {integration.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    asChild 
                    className="w-full" 
                    variant={integration.status === 'live' ? 'default' : 'outline'}
                    disabled={integration.status !== 'live'}
                  >
                    <Link href={integration.status === 'live' ? '/contact' : '#'}>
                      {integration.status === 'live' ? 'Connect Now' : 'Coming Soon'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Integration */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Integration?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't see your favorite tool? We can build custom integrations for enterprise clients and popular requests.
            </p>
          </div>
          
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Custom Development</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Dedicated development team
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Full API documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Ongoing support and maintenance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Priority feature requests
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <Button asChild size="lg" className="mb-4">
                    <Link href="/contact">Request Integration</Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Enterprise plans include custom integrations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Access */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Developer-Friendly API</h2>
            <p className="text-xl text-muted-foreground">
              Build your own integrations with our comprehensive REST API.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  RESTful API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Simple, powerful API with comprehensive documentation and code examples.
                </p>
                <Button asChild variant="outline">
                  <Link href="/api-docs" className="flex items-center gap-2">
                    View API Docs
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Real-time notifications and event-driven integrations for seamless workflows.
                </p>
                <Button asChild variant="outline">
                  <Link href="/contact">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
