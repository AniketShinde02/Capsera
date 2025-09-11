import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Zap, Sparkles, Instagram, TrendingUp } from 'lucide-react';
import { CaptionGenerator } from '@/components/caption-generator';

export const metadata: Metadata = {
  title: 'Instagram Caption Generator | Capsera - AI-Powered Viral Captions',
  description: 'Best Instagram caption generator online. Create viral Instagram captions with AI. Free Instagram caption maker for maximum engagement. Try Capsera now!',
  keywords: ['Instagram caption generator', 'Instagram caption maker', 'Instagram captions', 'viral Instagram captions', 'Instagram caption tool', 'AI Instagram captions'],
  openGraph: {
    title: 'Instagram Caption Generator | Capsera - AI-Powered Viral Captions',
    description: 'Best Instagram caption generator online. Create viral Instagram captions with AI. Free Instagram caption maker for maximum engagement.',
    url: 'https://capsera.online/instagram-caption-generator',
  },
  twitter: {
    title: 'Instagram Caption Generator | Capsera - AI-Powered Viral Captions',
    description: 'Best Instagram caption generator online. Create viral Instagram captions with AI. Free Instagram caption maker for maximum engagement.',
  },
  alternates: {
    canonical: '/instagram-caption-generator',
  },
};

export default function InstagramCaptionGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5"></div>
          <div className="container mx-auto px-3 sm:px-4 md:px-6 relative">
            <Badge className="mb-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-600 border-pink-500/20">
              <Instagram className="w-4 h-4 mr-2" />
              Instagram Optimized
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tighter">
              <span className="gradient-text">Instagram Caption Generator</span><br className="hidden sm:block" /> with AI
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 px-3 sm:px-4 leading-relaxed">
              Create viral Instagram captions that get more likes, comments, and shares. 
              Our AI-powered Instagram caption generator understands what makes content perform on Instagram.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8">
              <Button size="lg" asChild className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full sm:w-auto">
                <Link href="#generator">
                  <Instagram className="w-5 h-5 mr-2" />
                  Generate Instagram Captions
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Instagram Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-pink-500 mb-1">300%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">More Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-500 mb-1">AI</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-500 mb-1">Free</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Forever</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">Viral</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Captions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Caption Generator */}
        <section id="generator" className="py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <CaptionGenerator />
          </div>
        </section>

        {/* Instagram Features */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/20">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Why Our Instagram Caption Generator Works
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Our AI understands Instagram's algorithm and creates captions optimized for maximum engagement, 
                reach, and viral potential on the platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="bg-pink-500/10 text-pink-500 w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-lg">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <CardTitle>Algorithm Optimized</CardTitle>
                  <CardDescription>
                    Our Instagram caption generator creates captions that work with Instagram's algorithm to maximize reach and engagement.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="bg-purple-500/10 text-purple-500 w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <CardTitle>Trending Hashtags</CardTitle>
                  <CardDescription>
                    AI-powered hashtag suggestions that are trending and relevant to your content for maximum discoverability.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="bg-blue-500/10 text-blue-500 w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>Engagement Focused</CardTitle>
                  <CardDescription>
                    Captions designed to encourage likes, comments, and shares by understanding what drives Instagram engagement.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Instagram Tips */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
                Instagram Caption Best Practices
              </h2>
              
              <div className="grid gap-6 sm:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Optimal Length
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Our Instagram caption generator creates captions of optimal length - not too short to miss engagement opportunities, 
                      not too long to lose attention. Perfect for Instagram's algorithm.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Call-to-Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Every caption includes strategic call-to-actions that encourage engagement - asking questions, 
                      requesting comments, or prompting shares to boost your Instagram performance.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Hashtag Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Smart hashtag placement and selection based on trending topics and your content type. 
                      Our AI finds the perfect hashtags to maximize your Instagram reach.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Brand Voice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Captions that match your brand voice and personality. Whether you're casual, professional, 
                      or quirky, our Instagram caption generator adapts to your style.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Boost Your Instagram Engagement?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Instagram creators who use our AI caption generator to create viral content. 
              Start generating Instagram captions that actually perform!
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
              <Link href="#generator">
                <Instagram className="w-5 h-5 mr-2" />
                Generate Instagram Captions Now
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
