import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Data & Types ---

type BlogPost = {
    slug: string;
    title: string;
    excerpt: string;
    image: string;
    date: string;
    readTime: string;
    category: string;
    author: {
        name: string;
        role: string;
        avatar: string;
    };
    content: React.ReactNode;
};

const BLOG_POSTS: Record<string, BlogPost> = {
    'science-of-viral-captions': {
        slug: 'science-of-viral-captions',
        title: 'The Science of Viral Captions: Why AI Does It Better',
        excerpt: 'Discover the psychological triggers that make people stop scrolling and start engaging. See how Gemini Vision analyzes these patterns instantly.',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
        date: 'May 20, 2025',
        readTime: '5 min read',
        category: 'AI Technology',
        author: {
            name: 'Sarah Chen',
            role: 'Head of AI Strategy',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
        content: (
            <>
                <p className="lead text-xl text-muted-foreground mb-8">
                    We've all been there. You have the perfect photo—lighting is on point, the outfit is fire, the vibe is immaculate. You open Instagram, upload the photo, and then... you freeze. The cursor blinks. "Caption this..." mocks you.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">The "Nice Pic" Problem</h2>
                <p className="mb-6">
                    Most people default to describing what's in the photo. "Sunset at the beach." "Coffee time." "Me and the girls."
                    While accurate, these captions are <strong>engagement killers</strong>. They offer no value, provoke no thought, and give your followers no reason to comment.
                </p>
                <p className="mb-6">
                    In 2025, the algorithm doesn't just look at likes; it looks at <em>dwell time</em> and <em>conversation</em>. To trigger these, you need more than a label. You need a story.
                </p>

                <div className="bg-muted/30 border-l-4 border-primary p-6 my-8 rounded-r-xl">
                    <h3 className="font-bold text-lg mb-2">The Golden Rule of Virality</h3>
                    <p className="italic text-muted-foreground">
                        "Your caption shouldn't describe the photo. It should describe how the photo <strong>feels</strong> or what it <strong>means</strong>."
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">How AI "Sees" Differently</h2>
                <p className="mb-6">
                    This is where Capsera's Gemini Vision integration changes the game. Unlike old-school caption generators that just looked for keywords (e.g., "beach", "sun"), our AI analyzes the <em>context</em>.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>It detects <strong>emotions</strong> (is the smile genuine or sarcastic?)</li>
                    <li>It analyzes <strong>aesthetics</strong> (is this cottagecore, cyberpunk, or minimalist?)</li>
                    <li>It reads <strong>text</strong> in the background (street signs, book titles)</li>
                </ul>
                <p className="mb-6">
                    By understanding these nuances, the AI can generate a caption that feels human because it's reacting to the same visual cues a human would.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">The Hook-Value-CTA Formula</h2>
                <p className="mb-6">
                    Every viral caption follows a specific structure that our AI is trained to replicate:
                </p>
                <ol className="list-decimal pl-6 space-y-4 mb-8">
                    <li>
                        <strong>The Hook:</strong> The first sentence must stop the scroll. It's often a controversial statement, a question, or a relatable confession.
                        <br /><span className="text-sm text-muted-foreground">Example: "I almost didn't post this..."</span>
                    </li>
                    <li>
                        <strong>The Value:</strong> This is the "meat" of the caption. A story, a tip, or a joke.
                        <br /><span className="text-sm text-muted-foreground">Example: "...but then I remembered that growth happens outside the comfort zone."</span>
                    </li>
                    <li>
                        <strong>The CTA (Call to Action):</strong> Tell them what to do.
                        <br /><span className="text-sm text-muted-foreground">Example: "Drop a 🔥 if you needed to hear this today."</span>
                    </li>
                </ol>

                <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
                <p className="mb-6">
                    You don't need to be a professional copywriter to go viral. You just need to understand the psychology behind the scroll. Or better yet, let Capsera handle the psychology for you while you focus on creating the content.
                </p>
            </>
        )
    },
    'instagram-caption-trends-2025': {
        slug: 'instagram-caption-trends-2025',
        title: '5 Instagram Caption Trends Taking Over 2025',
        excerpt: 'From "chaotic storytelling" to "micro-blogging," here are the caption styles that are dominating feeds right now.',
        image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1974&auto=format&fit=crop',
        date: 'May 18, 2025',
        readTime: '4 min read',
        category: 'Trends',
        author: {
            name: 'Alex Rivera',
            role: 'Social Media Analyst',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
        },
        content: (
            <>
                <p className="lead text-xl text-muted-foreground mb-8">
                    Instagram is no longer just a photo-sharing app; it's a micro-blogging platform. The days of one-word captions are over (unless you're Beyoncé). Here are the trends defining 2025.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">1. Chaotic Storytelling</h2>
                <p className="mb-6">
                    Gen Z has ushered in an era of "unfiltered" captions. These are long, rambling, stream-of-consciousness stories that feel like a FaceTime call with a best friend. They build immense trust because they feel authentic.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">2. The "Photo Dump" Listicle</h2>
                <p className="mb-6">
                    For carousel posts, the caption acts as a table of contents.
                    <br />
                    1. Coffee run ☕
                    <br />
                    2. Fit check 👗
                    <br />
                    3. The sky was showing off today 🌅
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">3. Educational Deep Dives</h2>
                <p className="mb-6">
                    With TikTok becoming a search engine, Instagram is following suit. Captions that teach something—a recipe, a workout routine, a coding tip—are being saved at record rates. Saves are the new Likes.
                </p>

                <div className="bg-primary/5 p-6 rounded-xl my-8">
                    <p className="font-medium text-center">
                        🚀 <strong>Pro Tip:</strong> Capsera's "Professional" mood is specifically tuned to write these educational, value-packed captions.
                    </p>
                </div>
            </>
        )
    },
    'hook-value-cta-formula': {
        slug: 'hook-value-cta-formula',
        title: 'Stop Using Boring Captions: The Hook-Value-CTA Formula',
        excerpt: 'The proven 3-step formula used by top influencers to double their comments. Learn how to apply it to every post.',
        image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=2031&auto=format&fit=crop',
        date: 'May 15, 2025',
        readTime: '6 min read',
        category: 'Strategy',
        author: {
            name: 'Mike Johnson',
            role: 'Growth Hacker',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
        },
        content: (
            <>
                <p className="lead text-xl text-muted-foreground mb-8">
                    If you take nothing else away from this blog, take this: <strong>Structure beats creativity.</strong> You can be the funniest person in the world, but if your caption is a wall of text, no one will read it.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Why Structure Matters</h2>
                <p className="mb-6">
                    Human attention spans are now shorter than a goldfish's (literally 8 seconds). A structured caption acts as a visual ladder, guiding the reader down to the comment section.
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 1: The Hook</h2>
                <p className="mb-6">
                    This is the headline. It needs to be punchy.
                    <br />
                    <em>Bad:</em> "I went to the gym."
                    <br />
                    <em>Good:</em> "I hated every second of this workout, but..."
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 2: The Value</h2>
                <p className="mb-6">
                    Deliver on the promise of the hook. Give them the "why".
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Step 3: The CTA</h2>
                <p className="mb-6">
                    Never assume people know what to do. Tell them. "Save this for later," "Send to a friend," "Comment your favorite emoji."
                </p>
            </>
        )
    }
};

// --- Page Component ---

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = BLOG_POSTS[params.slug];
    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | Capsera Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
            type: 'article',
            authors: [post.author.name],
        },
    };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = BLOG_POSTS[params.slug];

    if (!post) {
        notFound();
    }

    // JSON-LD for Article
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        image: post.image,
        author: {
            '@type': 'Person',
            name: post.author.name,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Capsera',
            logo: {
                '@type': 'ImageObject',
                url: 'https://capsera.online/logo.png',
            },
        },
        datePublished: post.date, // Should be ISO format in real app
        description: post.excerpt,
    };

    return (
        <article className="min-h-screen bg-background text-foreground pb-20">
            {/* Article Header Image */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 z-20">
                    <Link href="/blog">
                        <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-md bg-background/50 hover:bg-background/80">
                            <ArrowLeft className="w-4 h-4" /> Back to Blog
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-20">
                <div className="max-w-3xl mx-auto bg-card border border-border/50 rounded-3xl p-6 md:p-12 shadow-2xl">
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full">
                            {post.category}
                        </span>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Author */}
                    <div className="flex items-center justify-between border-b border-border/50 pb-8 mb-8">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-10 h-10 rounded-full bg-muted"
                            />
                            <div>
                                <p className="font-semibold text-sm">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">{post.author.role}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-500/10 hover:text-blue-500">
                                <Twitter className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-700/10 hover:text-blue-700">
                                <Linkedin className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-600/10 hover:text-blue-600">
                                <Facebook className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {post.content}
                    </div>

                    {/* CTA Box */}
                    <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl border border-primary/10 text-center">
                        <h3 className="text-2xl font-bold mb-2">Ready to go viral?</h3>
                        <p className="text-muted-foreground mb-6">
                            Stop guessing and start generating. Try Capsera's AI caption generator now.
                        </p>
                        <Link href="/">
                            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25">
                                Generate Captions Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </article>
    );
}
