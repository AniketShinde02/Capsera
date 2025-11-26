"use client";

import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";
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
    },
    {
        name: "Lisa Wong",
        role: "Food Blogger",
        content: "My food pics never looked better with these captions. The 'Foodie' mood is chef's kiss! 👩‍🍳",
        avatar: "L",
        color: "bg-red-500",
        platform: "instagram"
    },
    {
        name: "Tom Baker",
        role: "Tech Reviewer",
        content: "Clean, precise, and technical when I need it. Capsera understands context better than any other tool.",
        avatar: "T",
        color: "bg-slate-500",
        platform: "twitter"
    }
];

const firstRow = testimonials.slice(0, testimonials.length / 2);
const secondRow = testimonials.slice(testimonials.length / 2);

const TestimonialCard = ({
    name,
    role,
    content,
    avatar,
    color,
    platform,
}: {
    name: string;
    role: string;
    content: string;
    avatar: string;
    color: string;
    platform: string;
}) => {
    return (
        <figure
            className={cn(
                "relative w-80 cursor-pointer overflow-hidden rounded-xl border p-6",
                // light styles
                "border-gray-950/10 bg-gray-950/5 hover:bg-gray-950/10",
                // dark styles
                "dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/20",
                "transition-all duration-300 hover:scale-105"
            )}
        >
            <div className="flex flex-row items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md", color)}>
                    {avatar}
                </div>
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">{role}</p>
                </div>
                <div className="ml-auto">
                    {platform === 'twitter' ? (
                        <Twitter className="w-4 h-4 text-blue-400" />
                    ) : platform === 'instagram' ? (
                        <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500" />
                    ) : (
                        <div className="w-4 h-4 bg-blue-700 rounded-sm" />
                    )}
                </div>
            </div>
            <blockquote className="mt-2 text-sm leading-relaxed">{content}</blockquote>
            <div className="mt-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
            </div>
        </figure>
    );
};

export function Testimonials() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

            <div className="container mx-auto px-4 mb-16 text-center">
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

            <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
                <Marquee pauseOnHover className="[--duration:20s]">
                    {firstRow.map((review) => (
                        <TestimonialCard key={review.name} {...review} />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:20s]">
                    {secondRow.map((review) => (
                        <TestimonialCard key={review.name} {...review} />
                    ))}
                </Marquee>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background dark:from-background"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background dark:from-background"></div>
            </div>

            {/* Call to Action */}
            <div className="mt-20 text-center container mx-auto px-4">
                <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent w-full max-w-4xl">
                    <div className="bg-background rounded-2xl p-8 sm:p-12">
                        <h3 className="text-3xl font-bold mb-4">Ready to go viral?</h3>
                        <p className="text-muted-foreground mb-8 text-lg">Stop staring at a blank screen. Let AI write your captions today.</p>
                        <button
                            onClick={() => document.querySelector('[data-section="caption-generator"]')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-primary/25 text-lg"
                        >
                            Try It For Free
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
