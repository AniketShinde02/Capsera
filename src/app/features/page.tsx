import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Bot, Sparkles, Palette, Hash, Pencil, Copy, Share, RefreshCcw, 
  Eye, ImageIcon, Languages, Zap, Clock, Shield, BarChart3, 
  Users, Heart, TrendingUp, Smartphone, Cloud, CheckCircle,
  ArrowRight, Lightbulb, Target, MessageSquare, Globe
} from 'lucide-react';
import { checkMaintenanceMode } from '@/lib/server-maintenance-check';

export default async function FeaturesPage() {
  // Check maintenance mode before rendering the page
  await checkMaintenanceMode();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04]" style={{ maskImage: 'linear-gradient(to bottom, white 0%, transparent 70%)' }} />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto mb-6 sm:mb-8 p-3 sm:p-4 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 w-fit">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-[1.4] tracking-tighter">
            Everything You Need to Create 
            <span className="gradient-text block mt-3 pb-2">Amazing Captions</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2">
            Discover the comprehensive suite of AI-powered tools designed to transform your social media presence. 
            From intelligent image analysis to mood-based generation, we've got every aspect of caption creation covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto max-w-[280px] sm:max-w-none">
              <Link href="/">
                <Zap className="w-5 h-5 mr-2" />
                Start Creating Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto max-w-[280px] sm:max-w-none">
              <Link href="/about">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
              The essential tools that make CaptionCraft the ultimate caption generation platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* AI-Powered Caption Generation */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-center">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform min-w-[48px] min-h-[48px] flex items-center justify-center">
                    <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">AI-Powered Generation</h3>
                <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base ml-4">
                  Advanced AI that understands context, emotion, and brand voice to create captions that truly resonate with your audience.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm ml-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Natural language processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Context-aware generation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Brand voice adaptation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Image Analysis */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-center">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-green-500/10 text-green-600 w-fit group-hover:scale-110 transition-transform min-w-[48px] min-h-[48px] flex items-center justify-center">
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Smart Image Analysis</h3>
                <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base ml-4">
                  Upload any image and our AI will analyze objects, scenes, emotions, and context to generate perfectly matched captions.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm ml-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Object & scene recognition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Emotion detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Color palette analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Mood & Tone Selection */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-center">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-pink-500/10 text-pink-600 w-fit group-hover:scale-110 transition-transform min-w-[48px] min-h-[48px] flex items-center justify-center">
                    <Palette className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Mood & Tone Selection</h3>
                <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base ml-4">
                  Choose from a wide variety of moods and tones to match your brand personality and audience preferences.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm ml-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Professional & casual tones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Emotional expressions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Industry-specific styles</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Hashtag Suggestions */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-center">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform min-w-[48px] min-h-[48px] flex items-center justify-center">
                    <Hash className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Smart Hashtags</h3>
                <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base ml-4">
                  Get intelligent hashtag recommendations based on your content, industry trends, and audience engagement patterns.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm ml-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Trending hashtag analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Niche-specific suggestions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Engagement optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Multi-Platform Optimization */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-center">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-purple-500/10 text-purple-600 w-fit group-hover:scale-110 transition-transform min-w-[48px] min-h-[48px] flex items-center justify-center">
                    <Smartphone className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Multi-Platform Ready</h3>
                <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base ml-4">
                  Captions optimized for Instagram, Twitter, LinkedIn, Facebook, and more, respecting each platform's best practices.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm ml-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Platform-specific formatting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Character limit optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Audience targeting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Caption History & Management */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-center">
              <CardContent className="p-6 sm:p-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-orange-500/10 text-orange-600 w-fit group-hover:scale-110 transition-transform min-w-[48px] min-h-[48px] flex items-center justify-center">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Caption Management</h3>
                <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  Save, organize, and manage all your generated captions with powerful search and categorization features.
                </p>
                <ul className="space-y-3 text-xs sm:text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Unlimited caption storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Smart search & filtering</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Export capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20 md:py-32 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Capabilities</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Professional-grade features that set CaptionCraft apart from the competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="ml-[15%]">
              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-slate-800 dark:text-slate-200">Performance Analytics</h3>
                    <p className="text-muted-foreground text-sm ml-6 pl-2">Track caption performance and optimize your content strategy with detailed analytics.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-slate-800 dark:text-slate-200">Team Collaboration</h3>
                    <p className="text-muted-foreground text-sm ml-6 pl-2">Work together with your team, share caption libraries, and maintain brand consistency.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-slate-800 dark:text-slate-200">Brand Safety</h3>
                    <p className="text-muted-foreground text-sm ml-6 pl-2">Advanced content filtering ensures all generated captions align with your brand guidelines.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Globe className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-1.5 text-slate-800 dark:text-slate-200">Multi-Language Support</h3>
                    <p className="text-muted-foreground text-sm ml-6 pl-2">Generate captions in multiple languages to reach global audiences effectively.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Caption Performance Dashboard */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 text-center w-[85%] max-w-sm mx-auto">
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-center mb-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 w-fit group-hover:scale-110 transition-transform min-w-[40px] min-h-[40px] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold mb-2.5 text-slate-800 dark:text-slate-200">Caption Performance Dashboard</h3>
                <p className="text-muted-foreground leading-relaxed mb-3.5 text-sm">
                  Track your caption performance and optimize your content strategy with real-time analytics.
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Engagement Rate</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">+24%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Reach Growth</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">+18%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get perfect captions in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 p-6 rounded-full bg-primary/10 text-primary w-fit">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="mb-4 p-2 rounded-full bg-primary text-primary-foreground w-8 h-8 mx-auto flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4">Upload or Describe</h3>
              <p className="text-muted-foreground">
                Upload an image or describe your content. Our AI will understand the context and visual elements.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 p-6 rounded-full bg-purple-500/10 text-purple-600 w-fit">
                <Lightbulb className="w-8 h-8" />
              </div>
              <div className="mb-4 p-2 rounded-full bg-primary text-primary-foreground w-8 h-8 mx-auto flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4">Choose Your Style</h3>
              <p className="text-muted-foreground">
                Select the mood, tone, and platform to customize the caption generation to your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 p-6 rounded-full bg-green-500/10 text-green-600 w-fit">
                <Target className="w-8 h-8" />
              </div>
              <div className="mb-4 p-2 rounded-full bg-primary text-primary-foreground w-8 h-8 mx-auto flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4">Get Perfect Captions</h3>
              <p className="text-muted-foreground">
                Receive multiple engaging captions with hashtags, ready to copy and paste to your social media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 to-blue-500/10 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of creators, brands, and marketers who are already using CaptionCraft to create engaging content that drives results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              <Link href="/">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="/about">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
