'use client';

import { motion } from 'framer-motion';
import { Users, Sparkles, Heart, TrendingUp, Zap, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AboutPage() {
    const [activeUsers, setActiveUsers] = useState(0);
    const [totalCaptions, setTotalCaptions] = useState(0);

    // Animated counter effect
    useEffect(() => {
        const userInterval = setInterval(() => {
            setActiveUsers(prev => (prev < 50 ? prev + 1 : 50));
        }, 30);

        const captionInterval = setInterval(() => {
            setTotalCaptions(prev => (prev < 200 ? prev + 5 : 200));
        }, 20);

        return () => {
            clearInterval(userInterval);
            clearInterval(captionInterval);
        };
    }, []);

    const team = [
        {
            name: "Aniket Shinde",
            role: "Founder & Developer",
            image: "https://i.imgur.com/placeholder.jpg", // You'll need to upload your photo
            description: "Building AI-powered tools to empower creators worldwide"
        },
        {
            name: "Gemini AI",
            role: "AI Vision Partner",
            image: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
            description: "Powering intelligent caption generation"
        },
        {
            name: "Cursor AI",
            role: "Development Partner",
            image: "https://www.cursor.com/brand/icon.svg",
            description: "Accelerating development with AI-powered coding"
        },
        {
            name: "Antigravity",
            role: "AI Assistant",
            image: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
            description: "Google's advanced agentic coding assistant"
        }
    ];

    const values = [
        {
            icon: Sparkles,
            title: "Creativity First",
            description: "We believe everyone has a story to tell. Our tools are designed to help you tell yours better.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Globe,
            title: "Global Community",
            description: "Connecting creators from all corners of the world through the power of words.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Zap,
            title: "User Obsessed",
            description: "We build what you need. Your feedback shapes every feature we release.",
            color: "from-orange-500 to-red-500"
        },
        {
            icon: Heart,
            title: "Made with Love",
            description: "Crafted with passion and attention to detail for the best possible experience.",
            color: "from-green-500 to-emerald-500"
        }
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background" />

            <div className="container mx-auto px-4 py-24 relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-4xl mx-auto mb-20"
                >
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
                        We are <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Capsera</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                        Empowering creators to express themselves with AI-driven magic. We're on a mission to make social media content creation effortless and fun.
                    </p>
                </motion.div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 max-w-5xl mx-auto">
                    {[
                        { value: `${activeUsers}+`, label: "Active Users", icon: Users },
                        { value: `${totalCaptions}+`, label: "Captions Generated", icon: Sparkles },
                        { value: "3", label: "AI Partners", icon: Zap },
                        { value: "24/7", label: "Availability", icon: TrendingUp }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center">
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                                <div className="text-3xl md:text-4xl font-black text-foreground mb-2">{stat.value}</div>
                                <div className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Core Values */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground text-lg">The principles that guide everything we do</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {values.map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${value.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />
                                <div className="relative bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/50 transition-all">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-4`}>
                                        <value.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Team Section */}
                <div>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Meet the Team</h2>
                        <p className="text-muted-foreground text-lg">The creative minds behind the magic</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {team.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity" />
                                <div className="relative bg-card/30 backdrop-blur-sm border border-border/50 rounded-3xl p-6 hover:bg-card/50 transition-all overflow-hidden">
                                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-muted/30 flex items-center justify-center">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=400&background=random`;
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                                    <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
