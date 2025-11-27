"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Hero() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const scrollToCaptionGenerator = () => {
        const captionSection = document.querySelector('[data-section="caption-generator"]');
        if (captionSection) {
            captionSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <section className="relative min-h-[65vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-12 md:pt-20 md:pb-16">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-background">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div
                    className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background"
                />

                {/* Floating Blobs that follow mouse slightly */}
                <motion.div
                    animate={{
                        x: mousePosition.x * 20,
                        y: mousePosition.y * 20,
                    }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10"
                />
                <motion.div
                    animate={{
                        x: mousePosition.x * -20,
                        y: mousePosition.y * -20,
                    }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -z-10"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mb-6 md:mb-8 hover:bg-muted/80 transition-colors cursor-default"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            v2.0 is now live
                        </span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 md:mb-8 leading-[1.1]"
                    >
                        Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x">Viral</span> Captions
                        <br />
                        <span className="relative inline-block">
                            in Seconds
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 md:mb-10 leading-relaxed"
                    >
                        Stop staring at a blank screen. Let our advanced AI analyze your photos and write engaging, personalized captions instantly.
                    </motion.p>

                    {/* CTA Button - Centered & Enhanced */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex justify-center w-full"
                    >
                        <Button
                            size="lg"
                            onClick={scrollToCaptionGenerator}
                            className="relative h-12 px-8 text-base sm:h-16 sm:px-12 sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white shadow-xl sm:shadow-2xl shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/70 group overflow-hidden"
                        >
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <span className="relative z-10">Start Generating Free</span>
                            <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
                        </Button>
                    </motion.div>


                </div>
            </div>
        </section>
    );
}
