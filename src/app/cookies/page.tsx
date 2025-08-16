import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Shield, Settings, Eye } from 'lucide-react';

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      icon: Shield,
      description: 'Required for the website to function properly',
      examples: ['Authentication', 'Security', 'Form submissions'],
      canDisable: false
    },
    {
      name: 'Performance Cookies',
      icon: Eye,
      description: 'Help us understand how visitors use our website',
      examples: ['Page views', 'Click tracking', 'Error reporting'],
      canDisable: true
    },
    {
      name: 'Preference Cookies',
      icon: Settings,
      description: 'Remember your choices and personalize your experience',
      examples: ['Theme preferences', 'Language settings', 'UI customizations'],
      canDisable: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Cookie className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Cookie <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Learn about how CaptionCraft uses cookies to improve your experience and protect your privacy.
          </p>
          <Badge variant="secondary" className="px-4 py-2">
            Last updated: January 2025
          </Badge>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Types of Cookies We Use</h2>
          
          <div className="space-y-6">
            {cookieTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          {type.name}
                          {!type.canDisable && (
                            <Badge variant="secondary">Required</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">{type.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-semibold mb-2">Examples:</h4>
                      <ul className="space-y-1">
                        {type.examples.map((example, exampleIndex) => (
                          <li key={exampleIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Policy */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Cookie Policy Details</h2>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>What Are Cookies?</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
                  They help websites remember information about your visit, which can make it easier to visit the site again 
                  and make the site more useful to you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>CaptionCraft uses cookies for several purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Authentication:</strong> To keep you logged in and secure your account</li>
                  <li><strong>Preferences:</strong> To remember your theme, language, and other settings</li>
                  <li><strong>Analytics:</strong> To understand how our website is used and improve our services</li>
                  <li><strong>Security:</strong> To protect against fraud and ensure website security</li>
                  <li><strong>Performance:</strong> To optimize loading times and user experience</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Managing Your Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>You have several options for managing cookies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                  <li><strong>Cookie Consent:</strong> Use our cookie consent banner to manage preferences</li>
                  <li><strong>Opt-out Tools:</strong> Use industry opt-out tools for advertising cookies</li>
                </ul>
                <p className="mt-4">
                  <em>Note: Disabling certain cookies may affect website functionality.</em>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Third-Party Cookies</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  We may use third-party services that set their own cookies. These include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                  <li><strong>Authentication Providers:</strong> For secure login functionality</li>
                  <li><strong>CDN Services:</strong> For faster content delivery</li>
                </ul>
                <p className="mt-4">
                  These third parties have their own privacy policies and cookie practices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <ul className="list-none space-y-2">
                  <li><strong>Email:</strong> ai.captioncraft@outlook.com</li>
                  <li><strong>Address:</strong> San Francisco, CA</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
