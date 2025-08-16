import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search, MessageSquare, Book, Video, Mail, Phone, Clock, CheckCircle } from 'lucide-react';

export default function SupportCenterPage() {
  // Redirect to feature development page
  redirect('/feature-development');

  // Original support center code (this won't execute due to redirect, but kept for future use)
  const quickHelp = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using CaptionCraft',
      icon: Book,
      articles: 8,
      color: 'bg-blue-500'
    },
    {
      title: 'Account & Billing',
      description: 'Manage your subscription and payments',
      icon: CheckCircle,
      articles: 12,
      color: 'bg-green-500'
    },
    {
      title: 'Troubleshooting',
      description: 'Fix common issues and problems',
      icon: HelpCircle,
      articles: 15,
      color: 'bg-yellow-500'
    },
    {
      title: 'API Documentation',
      description: 'Developer resources and guides',
      icon: Book,
      articles: 6,
      color: 'bg-purple-500'
    }
  ];

  const popularArticles = [
    {
      title: 'How to generate your first caption',
      category: 'Getting Started',
      views: '12K views',
      helpful: '95% helpful'
    },
    {
      title: 'Understanding different mood options',
      category: 'Features',
      views: '8.5K views',
      helpful: '92% helpful'
    },
    {
      title: 'Upgrading to Pro: What\'s included?',
      category: 'Billing',
      views: '7.2K views',
      helpful: '88% helpful'
    },
    {
      title: 'API rate limits and best practices',
      category: 'API',
      views: '5.8K views',
      helpful: '94% helpful'
    },
    {
      title: 'Troubleshooting image upload issues',
      category: 'Troubleshooting',
      views: '4.9K views',
      helpful: '89% helpful'
    },
    {
      title: 'Managing your caption history',
      category: 'Features',
      views: '4.1K views',
      helpful: '91% helpful'
    }
  ];

  const contactOptions = [
    {
      method: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      responseTime: 'Usually responds in minutes',
      icon: MessageSquare,
      action: 'Start Chat',
      primary: true
    },
    {
      method: 'Email Support',
      description: 'Send us a detailed message about your issue',
      availability: 'Always available',
      responseTime: 'Response within 4 hours',
      icon: Mail,
      action: 'Send Email',
      primary: false
    },
    {
      method: 'Phone Support',
      description: 'Speak directly with our support team',
      availability: 'Mon-Fri, 9AM-6PM PST',
      responseTime: 'Available during business hours',
      icon: Phone,
      action: 'Call Now',
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <HelpCircle className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How can we <span className="gradient-text">help you?</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find answers, get support, and learn how to make the most of CaptionCraft.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search for help articles, guides, and more..."
                className="pl-12 pr-4 py-6 text-lg"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickHelp.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className={`${category.color} p-4 rounded-full w-fit mx-auto mb-4 text-white group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary">{category.articles} articles</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Help Articles</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{article.category}</Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{article.views}</span>
                      <span className="text-green-600">{article.helpful}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/help">View All Articles</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-xl text-muted-foreground">
              Our support team is here to help you succeed with CaptionCraft.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Card key={index} className={`hover:shadow-lg transition-all duration-300 ${option.primary ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                  <CardHeader className="text-center">
                    {option.primary && (
                      <Badge className="mb-4 w-fit mx-auto">Recommended</Badge>
                    )}
                    <div className={`${option.primary ? 'bg-primary text-primary-foreground' : 'bg-muted'} p-4 rounded-full w-fit mx-auto mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl">{option.method}</CardTitle>
                    <CardDescription className="text-base">{option.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        {option.availability}
                      </div>
                      <p>{option.responseTime}</p>
                    </div>
                    
                    <Button 
                      asChild 
                      className="w-full" 
                      variant={option.primary ? 'default' : 'outline'}
                    >
                      <Link href="/contact">{option.action}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Additional Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>
                  Watch step-by-step video guides to master CaptionCraft features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/tutorials">Watch Tutorials</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Community Forum
                </CardTitle>
                <CardDescription>
                  Connect with other users and share tips in our community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/community">Join Community</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Status Banner */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">All Systems Operational</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">CaptionCraft is running smoothly</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/status">View Status</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
