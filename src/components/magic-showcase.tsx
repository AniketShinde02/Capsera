"use client";

import { useState, useEffect } from "react";
import { Sparkles, Scan, Zap, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function MagicShowcase() {
    const [isScanning, setIsScanning] = useState(true);
    const [activeTag, setActiveTag] = useState(0);

    // Simulated detected tags
    const tags = [
        { text: "Sunset", x: "20%", y: "30%" },
        { text: "Ocean", x: "70%", y: "60%" },
        { text: "Golden Hour", x: "40%", y: "15%" },
        { text: "Peaceful", x: "80%", y: "40%" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTag((prev) => (prev + 1) % (tags.length + 1));
        }, 1500);
        return () => clearInterval(interval);
    }, [tags.length]);

    return (
        <section className="py-20 bg-muted/10 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4 animate-pulse">
                        <Sparkles className="w-4 h-4 text-primary mr-2" />
                        <span className="text-sm font-medium text-primary">AI Processing Demo</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4">
                        See the Magic in Action
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Watch how our AI analyzes every pixel to generate the perfect caption.
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Main Showcase Container */}
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-4 sm:p-8 bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden">

                        {/* Left: Image Scanner */}
                        <div className="relative group rounded-2xl overflow-hidden aspect-[4/3] shadow-lg border border-border/50 bg-black">
                            {/* Background Image */}
                            <img
                                src="https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=2070&auto=format&fit=crop"
                                alt="Sunset Scan Demo"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
                            />

                            {/* Scanning Beam */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="w-full h-[2px] bg-primary shadow-[0_0_20px_rgba(var(--primary),0.8)] absolute top-0 animate-scan" />
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent h-[10%] animate-scan-gradient" />
                            </div>

                            {/* Detected Tags Overlay */}
                            {tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "absolute px-3 py-1 bg-background/90 backdrop-blur-md border border-primary/50 rounded-full text-xs font-bold text-primary shadow-lg transition-all duration-500 transform",
                                        index < activeTag ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-4"
                                    )}
                                    style={{ left: tag.x, top: tag.y }}
                                >
                                    <div className="flex items-center gap-1">
                                        <Scan className="w-3 h-3" />
                                        {tag.text}
                                    </div>
                                </div>
                            ))}

                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 pointer-events-none" />
                        </div>

                        {/* Right: AI Output */}
                        <div className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    Analysis Complete
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, i) => (
                                        <span key={i} className={cn(
                                            "text-xs px-2 py-1 rounded-md bg-muted transition-colors duration-300",
                                            i < activeTag ? "bg-primary/20 text-primary" : "text-muted-foreground"
                                        )}>
                                            #{tag.text}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary" />
                                <p className="text-lg font-medium leading-relaxed text-foreground/90">
                                    "Chasing horizons and embracing the <span className="text-primary font-bold">golden hour</span>. ✨ There's nothing quite like the peace of a <span className="text-secondary font-bold">sunset</span> by the ocean. Grateful for moments like this."
                                </p>
                                <div className="mt-4 flex gap-2 text-sm text-muted-foreground font-mono">
                                    <Hash className="w-4 h-4" />
                                    <span>SunsetLovers</span>
                                    <span>NatureVibes</span>
                                    <span>DailyGratitude</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    AI Confidence: 98%
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75" />
                                    Mood: Inspiring
                                </div>
                            </div>
                        </div>

                        {/* Decorative Background Blobs */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-blob" />
                        <div className="absolute -left-20 -top-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    </div>
                </div>
            </div>
        </section>
    );
}
