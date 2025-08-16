import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Home, ArrowLeft, Bot, Sparkles, 
   BookOpen, HelpCircle 
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-8xl md:text-9xl font-extrabold text-primary/20 select-none">
              404
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/20">
                <Bot className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            It looks like the page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-muted-foreground">
            Don't worry though - our AI is still here to help you create amazing captions!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 p-3 rounded-full bg-blue-500/10 text-blue-600 w-fit mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Generate Captions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create AI-powered captions for your content
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Start Creating</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 p-3 rounded-full bg-emerald-500/10 text-emerald-600 w-fit mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Features</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover all our amazing features
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/features">Explore Features</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 p-3 rounded-full bg-purple-500/10 text-purple-600 w-fit mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Get Help</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Need assistance? We're here to help
              </p>
              <Button variant="ghost" size="sm" asChild>
                <a href="mailto:ai.captioncraft@outlook.com">Contact Us</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Suggestion */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific? Try searching or check out our most popular features:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/">AI Caption Generator</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/features">All Features</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/profile">My Profile</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/about">About Us</Link>
            </Button>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error or you're looking for a specific page, 
            please <Link href="/contact" className="text-primary hover:underline">contact our support team</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
