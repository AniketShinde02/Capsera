"use client";

import { cn } from "@/lib/utils";
import { Star, Quote, Twitter, Heart } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Social Media Manager",
        content: "Capsera has completely changed my workflow. I used to spend hours brainstorming captions, now it takes seconds!",
        avatar: "S",
        color: "bg-blue-500",
        platform: "twitter"
    },
    {
        name: "Mike Chen",
        role: "Travel Blogger",
        content: "The 'Travel' mood is spot on! It captures the vibe of my hiking photos perfectly. Highly recommend for influencers.",
        avatar: "M",
        color: "bg-green-500",
        platform: "instagram"
    },
    {
        name: "Jessica Alba",
        role: "Content Creator",
        content: "Finally, an AI that doesn't sound like a robot. The captions are witty, relevant, and actually funny. Love it! 💖",
        avatar: "J",
        color: "bg-pink-500",
        platform: "twitter"
    },
    {
        name: "David Ross",
        role: "Small Business Owner",
        content: "I use this for all my product posts. It generates professional yet engaging captions that drive sales.",
        avatar: "D",
        color: "bg-purple-500",
        platform: "linkedin"
    },
    {
        name: "Emily White",
        role: "Lifestyle Influencer",
        content: "The variety of moods is insane. From 'Savage' to 'Professional', it has everything I need for my feed.",
        avatar: "E",
        color: "bg-orange-500",
        platform: "instagram"
    },
    {
        name: "Alex Turner",
        role: "Photographer",
        content: "As a photographer, I'm great with images but terrible with words. Capsera bridges that gap perfectly.",
        avatar: "A",
        color: "bg-indigo-500",
        platform: "twitter"
    }
];

export function Testimonials() {
    return (
        <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl animate-blob" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-accent/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
                        <Heart className="w-4 h-4 text-primary fill-primary mr-2" />
                        <span className="text-sm font-medium text-primary">Loved by Creators</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
                        What People Are Saying
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of creators who are saving time and boosting engagement with Capsera.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative bg-card hover:bg-card/50 border border-border/50 hover:border-primary/20 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                                index === 1 || index === 4 ? "md:translate-y-8" : ""
                            )}
                        >
                            <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform rotate-12">
                                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    #CapseraLove
                                </div>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md", testimonial.color)}>
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm">{testimonial.name}</h3>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                                {testimonial.platform === 'twitter' ? (
                                    <Twitter className="w-4 h-4 text-blue-400" />
                                ) : testimonial.platform === 'instagram' ? (
                                    <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" />
                                ) : (
                                    <div className="w-4 h-4 bg-blue-700 rounded-sm" />
                                )}
                            </div>

                            <div className="relative">
                                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/10 transform -scale-x-100" />
                                <p className="text-foreground/90 text-sm leading-relaxed pl-2 relative z-10">
                                    "{testimonial.content}"
                                </p>
                            </div>

                            <div className="mt-4 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 text-center">
                    <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent">
                        <div className="bg-background rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto">
                            <h3 className="text-2xl font-bold mb-4">Ready to go viral?</h3>
                            <p className="text-muted-foreground mb-6">Stop staring at a blank screen. Let AI write your captions today.</p>
                            <button
                                onClick={() => document.querySelector('[data-section="caption-generator"]')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                            >
                                Try It For Free
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
