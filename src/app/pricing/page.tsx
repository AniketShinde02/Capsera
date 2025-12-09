'use client';

import { useState } from 'react';
import { Check, X, Zap, Star, Shield, Heart, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: 'Mini',
            description: 'Perfect for individuals & hobbyists',
            monthlyPrice: 99,
            annualPrice: 999,
            features: [
                '50 AI Captions per day',
                'Advanced Image Analysis',
                'Multiple Mood Options',
                'Email Support',
                'Caption History',
            ],
            notIncluded: [
                'Priority Support',
                'Team Collaboration',
                'API Access',
            ],
            icon: Sparkles,
            popular: false,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Pro',
            description: 'For serious creators & influencers',
            monthlyPrice: 249,
            annualPrice: 2499,
            features: [
                '200 AI Captions per day',
                'Advanced Image Analysis',
                'All Mood Options',
                'Priority Support (24/7)',
                'Unlimited Caption History',
                'Trending Hashtags',
                'Multi-language Support',
                'Analytics Dashboard',
            ],
            notIncluded: [],
            icon: Zap,
            popular: true,
            color: 'from-purple-500 to-pink-500',
        },
        {
            name: 'Agency',
            description: 'For teams, agencies & brands',
            monthlyPrice: 999,
            annualPrice: 9999,
            features: [
                'Unlimited AI Captions',
                'Everything in Pro',
                '5 Team Members',
                'Collaborative Workspace',
                'API Access',
                'Dedicated Account Manager',
                'Custom Branding',
                'White-label Option',
            ],
            notIncluded: [],
            icon: Users,
            popular: false,
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

            {/* Coming Soon Banner */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-500/90 via-orange-500/90 to-red-500/90 backdrop-blur-md border-b border-yellow-600/20 shadow-lg">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-white text-sm sm:text-base">
                                🚀 Coming Soon!
                            </span>
                        </div>
                        <span className="text-white text-sm sm:text-base">
                            Payment gateway integration is under development. These plans will be available shortly!
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                {/* Heartfelt Support Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mb-16"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm p-8 shadow-2xl">
                        {/* Decorative hearts */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-2xl" />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full blur-2xl" />

                        <div className="relative z-10 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                                <Heart className="w-8 h-8 text-white fill-white animate-pulse" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                                We Need Your Love & Support! 💖
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                                Right now, Capsera is <span className="font-semibold text-foreground">100% free</span> thanks to our free AI tier.
                                But to keep growing and bring you <span className="font-semibold text-foreground">unlimited captions, faster speeds, and premium features</span>,
                                we need your support! ✨
                            </p>
                            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                                Below are our <span className="font-semibold text-foreground">pocket-friendly plans</span> (in INR)
                                designed for India. Your subscription helps us build the <span className="font-semibold text-foreground">best caption generator</span> for creators like you! 🚀
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 px-4 py-1.5 text-sm">
                                    🎯 Affordable for India
                                </Badge>
                                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-4 py-1.5 text-sm">
                                    💳 Easy UPI/Card Payments
                                </Badge>
                                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-4 py-1.5 text-sm">
                                    🔥 Cancel Anytime
                                </Badge>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight"
                    >
                        Pocket-Friendly Pricing
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        Choose the perfect plan for your content creation journey. All prices in <span className="font-semibold text-foreground">₹ INR</span>.
                    </motion.p>

                    {/* Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-4 mt-8"
                    >
                        <span className={cn("text-sm font-medium transition-colors", !isAnnual && "text-primary")}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="relative w-14 h-7 bg-muted rounded-full p-1 transition-colors hover:bg-muted/80"
                        >
                            <motion.div
                                animate={{ x: isAnnual ? 28 : 0 }}
                                className="w-5 h-5 bg-primary rounded-full shadow-sm"
                            />
                        </button>
                        <span className={cn("text-sm font-medium transition-colors", isAnnual && "text-primary")}>
                            Yearly <Badge variant="secondary" className="ml-1 text-xs text-green-600 bg-green-500/10 border-green-500/20">Save 17%</Badge>
                        </span>
                    </motion.div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className={cn(
                                "relative p-8 rounded-3xl border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
                                plan.popular ? "border-primary shadow-lg shadow-primary/10 scale-105" : "border-border"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm shadow-lg">
                                        ⭐ Most Popular
                                    </Badge>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 text-white shadow-lg", plan.color)}>
                                    <plan.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground mb-6">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        ₹{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                                    </span>
                                    <span className="text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
                                </div>
                                {isAnnual && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                        💰 Save ₹{(plan.monthlyPrice * 12) - plan.annualPrice} per year!
                                    </p>
                                )}
                                {!isAnnual && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        or ₹{plan.annualPrice}/year (save 17%)
                                    </p>
                                )}
                            </div>

                            <Button
                                className={cn(
                                    "w-full mb-8 shadow-lg",
                                    plan.popular
                                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                        : "bg-primary hover:bg-primary/90"
                                )}
                            >
                                {plan.popular ? "🚀 Get Started" : "Choose Plan"}
                            </Button>

                            <div className="space-y-4">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 text-green-500" />
                                        </div>
                                        <span className="text-sm leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3 opacity-40">
                                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                            <X className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm leading-relaxed">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-24 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="grid gap-6">
                        {[
                            { q: "Can I cancel anytime?", a: "Absolutely! You can cancel your subscription at any time. Your access will continue until the end of your billing period. No questions asked." },
                            { q: "What payment methods do you accept?", a: "We accept UPI, Credit/Debit Cards, Net Banking, and all major payment methods popular in India via Razorpay." },
                            { q: "Is there a free trial?", a: "Yes! You can use Capsera for free with limited daily requests. Upgrade anytime to unlock unlimited captions and premium features." },
                            { q: "What happens to my data if I cancel?", a: "Your data is secure and private. Even after cancellation, your caption history remains accessible for 30 days. We never share your content with third parties." },
                            { q: "Can I upgrade or downgrade my plan?", a: "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle." },
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-2xl border bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors"
                            >
                                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24 text-center max-w-2xl mx-auto"
                >
                    <div className="p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                        <p className="text-muted-foreground mb-6">
                            We're here to help! Reach out to our friendly support team.
                        </p>
                        <Link href="/contact">
                            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
                                Contact Us 💬
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
