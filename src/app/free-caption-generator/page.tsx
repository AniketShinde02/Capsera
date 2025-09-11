import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Zap, Sparkles, Shield, Users } from 'lucide-react';
import { CaptionGenerator } from '@/components/caption-generator';

export const metadata: Metadata = {
  title: 'Free Caption Generator Online | Capsera - No Signup Required',
  description: 'Free caption generator online. Create viral Instagram captions instantly with Capsera. No signup required. Best free AI caption tool for social media. Try now!',
  keywords: ['free caption generator', 'free AI caption generator', 'free online caption generator', 'free Instagram caption generator', 'free caption maker', 'free caption tool'],
  openGraph: {
    title: 'Free Caption Generator Online | Capsera - No Signup Required',
    description: 'Free caption generator online. Create viral Instagram captions instantly with Capsera. No signup required. Best free AI caption tool for social media.',
    url: 'https://capsera.online/free-caption-generator',
  },
  twitter: {
    title: 'Free Caption Generator Online | Capsera - No Signup Required',
    description: 'Free caption generator online. Create viral Instagram captions instantly with Capsera. No signup required. Best free AI caption tool for social media.',
  },
  alternates: {
    canonical: '/free-caption-generator',
  },
};

export default function FreeCaptionGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-900/[0.2] [mask-image:linear-gradient(to_bottom,white_0%,transparent_70%)]"></div>
          <div className="container mx-auto px-3 sm:px-4 md:px-6 relative">
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              100% Free Forever
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight tracking-tighter">
              Free <span className="gradient-text">Caption Generator</span><br className="hidden sm:block" /> Online
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 px-3 sm:px-4 leading-relaxed">
              Create viral Instagram captions instantly with our completely free AI caption generator. 
              No signup, no payment, no limits. The best free caption tool for social media creators.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Link href="#generator">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Generating Free Captions
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Free Forever</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">No</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Signup Required</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">∞</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Unlimited Captions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">AI</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Powered</div>
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

        {/* Why Free Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-muted/20">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Why Our Free Caption Generator is the Best
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Unlike other caption generators that charge or limit usage, Capsera is completely free forever. 
                We believe everyone deserves access to powerful AI tools for content creation.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="bg-green-500/10 text-green-500 w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-lg">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>100% Free Forever</CardTitle>
                  <CardDescription>
                    No hidden costs, no premium plans, no credit card required. Our free caption generator is completely free forever.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="bg-blue-500/10 text-blue-500 w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>No Signup Required</CardTitle>
                  <CardDescription>
                    Start generating captions instantly without creating an account. Just upload your image and get captions immediately.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="bg-purple-500/10 text-purple-500 w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <CardTitle>Unlimited Usage</CardTitle>
                  <CardDescription>
                    Generate as many captions as you want. No daily limits, no monthly caps. Create captions for all your content.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
                Free Caption Generator FAQ
              </h2>
              
              <div className="grid gap-6 sm:gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Is this caption generator really free?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! Our AI caption generator is completely free forever. No hidden costs, no premium plans, no credit card required. 
                      We believe everyone should have access to powerful AI tools for content creation.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Do I need to create an account?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      No account required! Our free caption generator works instantly without any signup. 
                      Just upload your image and get captions immediately. It's that simple.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Are there any usage limits?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      No limits at all! Generate as many captions as you want. No daily limits, no monthly caps, no restrictions. 
                      Create captions for all your content without any limitations.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Can I use the captions commercially?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Absolutely! All captions generated by our free AI caption generator are yours to use for any purpose - 
                      personal, commercial, or business. No restrictions or watermarks.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-primary/5">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Ready to Create Viral Captions?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who use our free AI caption generator to create engaging content. 
              Start generating captions now - it's completely free!
            </p>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link href="#generator">
                <Zap className="w-5 h-5 mr-2" />
                Start Generating Free Captions
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
