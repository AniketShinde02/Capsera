'use client';

import { motion } from 'framer-motion';
import { Users, Heart, Sparkles, Globe } from 'lucide-react';

const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Captions Generated", value: "1M+" },
    { label: "Countries", value: "50+" },
    { label: "Team Members", value: "12" },
];

const values = [
    {
        title: "Creativity First",
        description: "We believe everyone has a story to tell. Our tools are designed to help you tell yours better.",
        icon: Sparkles,
    },
    {
        title: "Global Community",
        description: "Connecting creators from all corners of the world through the power of words.",
        icon: Globe,
    },
    {
        title: "User Obsessed",
        description: "We build what you need. Your feedback shapes every feature we release.",
        icon: Users,
    },
    {
        title: "Made with Love",
        description: "Crafted with passion and attention to detail for the best possible experience.",
        icon: Heart,
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* Hero Section */}
            <div className="relative py-24 lg:py-32">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

                <div className="container mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-bold tracking-tight mb-8"
                    >
                        We are <span className="text-primary">Capsera</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    >
                        Empowering creators to express themselves with AI-driven magic.
                        We're on a mission to make social media content creation effortless and fun.
                    </motion.p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="border-y border-border/50 bg-muted/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">{stat.value}</div>
                                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                    <p className="text-muted-foreground">The principles that guide everything we do.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, index) => (
                        <motion.div
                            key={value.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                <value.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Team Section */}
            <div className="container mx-auto px-4 py-24 border-t border-border/50">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
                    <p className="text-muted-foreground">The creative minds behind the magic.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { name: "Alex Rivera", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80" },
                        { name: "Sarah Chen", role: "Head of AI", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80" },
                        { name: "Marcus Johnson", role: "Lead Designer", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80" },
                        { name: "Emily Davis", role: "Marketing Director", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80" },
                    ].map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-4 bg-muted">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="font-bold">{member.name}</p>
                                        <p className="text-sm text-white/80">{member.role}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center group-hover:opacity-0 transition-opacity duration-300">
                                <h3 className="font-bold text-lg">{member.name}</h3>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
