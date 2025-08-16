import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Key, Zap, Shield, Book, ExternalLink } from 'lucide-react';

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: 'POST',
      endpoint: '/api/captions/generate',
      description: 'Generate AI captions for an image',
      params: ['imageUrl', 'mood', 'description (optional)']
    },
    {
      method: 'GET',
      endpoint: '/api/captions',
      description: 'Retrieve user\'s generated captions',
      params: ['limit (optional)', 'offset (optional)']
    },
    {
      method: 'DELETE',
      endpoint: '/api/captions/:id',
      description: 'Delete a specific caption',
      params: ['id (path parameter)']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">API Documentation</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Integrate CaptionCraft's AI-powered caption generation into your applications with our simple REST API.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Fast & Reliable
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Secure Authentication
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <Code className="w-4 h-4 mr-2" />
              RESTful API
            </Badge>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Getting Started</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Get API Key</CardTitle>
                <CardDescription>
                  Sign up for a Pro account to get your API key
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/pricing">Get API Key</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>2. Make Requests</CardTitle>
                <CardDescription>
                  Use your API key to authenticate requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>3. Generate Captions</CardTitle>
                <CardDescription>
                  Start generating AI captions programmatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="#examples">View Examples</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* API Endpoints */}
          <h3 className="text-2xl font-bold mb-8">API Endpoints</h3>
          
          <div className="space-y-6">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Badge variant={endpoint.method === 'POST' ? 'default' : endpoint.method === 'GET' ? 'secondary' : 'destructive'}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-lg font-mono">{endpoint.endpoint}</code>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-semibold mb-2">Parameters:</h4>
                    <ul className="space-y-1">
                      {endpoint.params.map((param, paramIndex) => (
                        <li key={paramIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <code>{param}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section id="examples" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Code Examples</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Generate Captions</CardTitle>
              <CardDescription>JavaScript example using fetch API</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-6 rounded-lg overflow-x-auto">
                <pre className="text-sm">
{`const response = await fetch('/api/captions/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    imageUrl: 'https://example.com/image.jpg',
    mood: 'Professional',
    description: 'Business meeting photo'
  })
});

const data = await response.json();
console.log(data.captions);`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Need help integrating our API? We're here to help!
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="https://github.com/captioncraft/api-examples" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
