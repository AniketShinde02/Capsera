import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Viral Social Media Insights & AI Tips | Capsera Blog',
    description: 'Discover the secrets to viral Instagram and TikTok captions. Learn how to use AI for content creation, master the latest trends, and boost your engagement.',
    keywords: ['social media tips', 'viral caption secrets', 'ai content creation', 'instagram growth', 'tiktok trends 2025'],
};

const BLOG_POSTS = [
    {
        slug: 'science-of-viral-captions',
        title: 'The Science of Viral Captions: Why AI Does It Better',
        excerpt: 'Discover the psychological triggers that make people stop scrolling and start engaging. See how Gemini Vision analyzes these patterns instantly.',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
        date: 'May 20, 2025',
        readTime: '5 min read',
        category: 'AI Technology',
        gradient: 'from-blue-500 to-purple-600'
    },
    {
        slug: 'instagram-caption-trends-2025',
        title: '5 Instagram Caption Trends Taking Over 2025',
        excerpt: 'From "chaotic storytelling" to "micro-blogging," here are the caption styles that are dominating feeds right now.',
        image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1974&auto=format&fit=crop',
        date: 'May 18, 2025',
        readTime: '4 min read',
        category: 'Trends',
        gradient: 'from-pink-500 to-rose-500'
    },
    {
        slug: 'hook-value-cta-formula',
        title: 'Stop Using Boring Captions: The Hook-Value-CTA Formula',
        excerpt: 'The proven 3-step formula used by top influencers to double their comments. Learn how to apply it to every post.',
        image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=2031&auto=format&fit=crop',
        date: 'May 15, 2025',
        readTime: '6 min read',
        category: 'Strategy',
        gradient: 'from-amber-500 to-orange-600'
    }
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4 animate-fade-in">
                            <Sparkles className="w-4 h-4 text-primary mr-2" />
                            <span className="text-sm font-medium text-primary">Capsera Insights</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            Master the Art of <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Viral Content</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Deep dives into AI technology, social media psychology, and the secrets behind the world's most engaging captions.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Posts Grid */}
            <section className="py-12 pb-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {BLOG_POSTS.map((post, index) => (
                            <Link
                                href={`/blog/${post.slug}`}
                                key={post.slug}
                                className="group relative flex flex-col h-full bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
                            >
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-20 group-hover:opacity-30 transition-opacity z-10`} />
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="px-3 py-1 bg-background/90 backdrop-blur-md text-xs font-bold rounded-full border border-border/50 shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-grow p-6 space-y-4">
                                    <div className="flex items-center text-xs text-muted-foreground gap-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {post.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-muted-foreground text-sm line-clamp-3 flex-grow">
                                        {post.excerpt}
                                    </p>

                                    <div className="pt-4 flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                                        Read Article <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* AEO / SEO Content Section (Hidden from main visual flow but visible to bots/users who scroll deep) */}
            <section className="py-16 bg-muted/30 border-t border-border/50">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Why AI Caption Generators Are the Future</h2>
                            <p className="text-muted-foreground">Understanding the technology behind Capsera</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Contextual Understanding
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Unlike simple text generators, Capsera uses <strong>Computer Vision</strong> (Gemini 1.5 Flash & Groq Vision) to "see" your image. It identifies lighting, objects, emotions, and aesthetics to write captions that actually match the photo.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                    Engagement Optimization
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Our AI is trained on millions of viral posts. It understands the <strong>Hook-Value-CTA</strong> structure that drives comments and shares, automatically applying these patterns to your captions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
