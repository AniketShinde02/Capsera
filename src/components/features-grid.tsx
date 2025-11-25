"use client";

import { Bot, Zap, Palette, Shield, Lock, Clock, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeaturesGrid() {
    return (
        <section className="py-20 container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4">
                    Why Choose Our AI?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Built for creators who want results, not just fancy tech.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                {/* Feature 1: Contextual AI (Large Square) */}
                <div className="md:col-span-2 row-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Bot className="w-48 h-48 text-primary" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Contextual Understanding</h3>
                            <p className="text-muted-foreground text-lg">
                                Our AI doesn't just see pixels; it understands the story. It analyzes emotions, lighting, and context to write captions that feel human.
                            </p>
                        </div>
                        <div className="mt-8 flex gap-2">
                            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">#Smart</div>
                            <div className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">#HumanLike</div>
                        </div>
                    </div>
                </div>

                {/* Feature 2: Lightning Fast (Tall) */}
                <div className="md:col-span-1 row-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                    <div className="relative z-10 h-full flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 animate-pulse">
                            <Zap className="w-8 h-8 text-orange-500 fill-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                        <p className="text-muted-foreground text-sm mb-8">
                            Generate 3 unique captions in under 5 seconds. Speed matters.
                        </p>
                        {/* Simulated Speedometer/Loader */}
                        <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[90%] animate-loading-bar" />
                        </div>
                        <div className="mt-2 font-mono text-xs text-orange-500 font-bold">0.8s Processing...</div>
                    </div>
                </div>

                {/* Feature 3: 40+ Moods (Wide) */}
                <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Palette className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">New Styles</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">40+ Unique Moods</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        From 'Savage' to 'Professional', 'Funny' to 'Poetic'. Match your vibe perfectly.
                    </p>
                    <div className="flex gap-2 overflow-hidden mask-linear-fade">
                        {['🔥 Savage', '💼 Professional', '✨ Aesthetic', '🤣 Funny', '🧘‍♀️ Zen', '🎨 Creative', '🚀 Hype'].map((mood, i) => (
                            <span key={i} className="whitespace-nowrap px-3 py-1 rounded-lg bg-muted text-xs font-medium border border-border/50">
                                {mood}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Feature 4: Privacy (Standard) */}
                <div className="md:col-span-1 group relative overflow-hidden rounded-3xl bg-card border border-border/50 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Shield className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                            <Lock className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Privacy First</h3>
                        <p className="text-muted-foreground text-sm">
                            Your images are processed securely and never stored.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
