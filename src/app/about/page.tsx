import { Sparkles,Users, Zap, Heart} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              We believe in the power <br className="hidden md:block" />
              of authentic connection.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
              CaptionCraft was born from a simple idea: to empower creators and
              individuals to express themselves more effectively. In a digital world cluttered with
              noise, we provide the tools to make your voice heard, one perfectly crafted
              caption at a time.
            </p>
            <Button size="lg" className="mt-4 w-full sm:w-auto max-w-[280px] sm:max-w-none">
              Get Started Now
            </Button>
          </div>
        </section>

        {/* Our Genesis Story */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">
                  Our Genesis Story
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base sm:text-lg mb-6">
                  As content marketing flourished, we knew even the most agile freelancers
                  faced spent brainstorming, writing, and revising captions that never
                  quite hit the mark. We conceived the idea to be a game-changer. We
                  envisioned a tool that would let a generation, but a creative partner —
                  one that understood every voice and the unique appeal of storytelling.
                </p>
                <div className="grid grid-cols-2 gap-4 sm:gap-8 mt-6 sm:mt-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">1M+</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Captions Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">50K+</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Happy Users</div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 flex justify-center">
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 p-3 sm:p-4 max-w-sm w-full">
                  <CardContent className="p-0">
                    <div className="relative bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl p-4 sm:p-6 shadow-xl">
                      <div className="relative z-10 text-white text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">Team Collaboration</h3>
                        <p className="text-xs sm:text-sm opacity-90">Building the future together</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* The Minds Behind the Magic */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">The Minds Behind the Magic</h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-12 sm:mb-16 max-w-3xl mx-auto px-2">
              We're a diverse team of technologists, writers, and designers united by a 
              passion for building beautiful, impactful products.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
              <div className="group text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image alt="Sarah Chen" width={96} height={96} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1560011316-90b2677df5d9?q=80&w=626&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8f" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg">Sarah Chen</h3>
                <p className="text-xs sm:text-sm text-primary font-medium">Founder & CEO</p>
              </div>
              <div className="group text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image alt="David Lee" width={96} height={96} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg">David Lee</h3>
                <p className="text-xs sm:text-sm text-primary font-medium">Chief Technology Officer</p>
              </div>
              <div className="group text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image alt="Emily Wong" width={96} height={96} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg">Emily Wong</h3>
                <p className="text-xs sm:text-sm text-primary font-medium">Head of Design</p>
              </div>
              <div className="group text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Image alt="Michael Rodriguez" width={96} height={96} className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base lg:text-lg">Michael Rodriguez</h3>
                <p className="text-xs sm:text-sm text-primary font-medium">AI Research Lead</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Core Values */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-12 sm:mb-16 max-w-3xl mx-auto px-2">
              These principles guide every decision we make. From the features we build to the 
              community we foster.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Creator-Obsessed</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base px-2">
                  We are devoted to the success of our creative 
                  community. We listen, learn, and build to solve their 
                  toughest challenges, providing intelligent solutions.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Push Boundaries</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base px-2">
                  We pride ourselves on pushing design boundaries 
                  that it's never been. Just sit a rock new 
                  forms of creativity, our philosophy: anything.
                </p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Craft with Integrity</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base px-2">
                  We love committed to responsible AI 
                  development, prioritizing authenticity, 
                  transparency and ethical innovation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join the Caption Revolution */}
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Join the Caption Revolution
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Ready to transform your social media presence? Join thousands of creators using 
              CaptionCraft today. It's free to get started.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
              Start Crafting for Free
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
