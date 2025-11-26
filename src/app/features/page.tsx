'use client';

import { motion } from 'framer-motion';
import { Wand2, Image as ImageIcon, Hash, Globe, BarChart3, Zap, Layers, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
    {
        title: "AI Caption Generation",
        description: "Generate viral-worthy captions in seconds using advanced AI models that understand your image context perfectly.",
        icon: Wand2,
        className: "md:col-span-2 md:row-span-2",
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        title: "Smart Image Analysis",
        description: "Our vision models analyze every pixel to detect objects, moods, and lighting for accurate context.",
        icon: ImageIcon,
        className: "md:col-span-1 md:row-span-1",
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        title: "Hashtag Strategy",
        description: "Get trending, relevant hashtags automatically generated for maximum reach.",
        icon: Hash,
        className: "md:col-span-1 md:row-span-1",
        color: "bg-pink-500/10 text-pink-500",
    },
    {
        title: "Multi-language",
        description: "Break language barriers. Generate captions in 30+ languages instantly.",
        icon: Globe,
        className: "md:col-span-1 md:row-span-1",
        color: "bg-green-500/10 text-green-500",
    },
    {
        title: "Performance Analytics",
        description: "Track how your generated captions perform and optimize your strategy.",
        icon: BarChart3,
        className: "md:col-span-2 md:row-span-1",
        color: "bg-orange-500/10 text-orange-500",
    },
    {
        title: "Instant Variations",
        description: "Get 3 unique variations for every generation: Professional, Casual, and Viral.",
        icon: Layers,
        className: "md:col-span-1 md:row-span-1",
        color: "bg-cyan-500/10 text-cyan-500",
    },
    {
        title: "One-Click Share",
        description: "Post directly to your favorite platforms or copy with a single click.",
        icon: Share2,
        className: "md:col-span-1 md:row-span-1",
        color: "bg-indigo-500/10 text-indigo-500",
    },
    {
        title: "Lightning Fast",
        description: "Experience zero lag with our edge-optimized generation engine.",
        icon: Zap,
        className: "md:col-span-1 md:row-span-1",
        color: "bg-yellow-500/10 text-yellow-500",
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background" />

            <div className="container mx-auto px-4 py-24 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        Everything you need to <span className="text-primary">go viral</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        Powerful tools designed to supercharge your social media presence.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "group relative p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                                feature.className
                            )}
                        >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300", feature.color)}>
                                <feature.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Decorative gradient blob */}
                            <div className={cn(
                                "absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                                feature.color.split(' ')[0].replace('/10', '')
                            )} />
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block p-[2px] rounded-3xl bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                    >
                        <div className="bg-background rounded-[22px] p-10 md:p-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to transform your content?</h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Join thousands of creators who are saving time and growing their audience with Capsera.
                            </p>
                            <a
                                href="/#caption-generator"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-foreground bg-primary rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-primary/25"
                            >
                                Get Started for Free
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
