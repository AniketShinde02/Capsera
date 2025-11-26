'use client';

import { useState } from 'react';
import { Check, X, Zap, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: 'Starter',
            description: 'Perfect for trying out Capsera',
            price: 0,
            features: [
                '5 AI Captions per day',
                'Basic Image Analysis',
                'Standard Support',
                'Community Access',
            ],
            notIncluded: [
                'Advanced Mood Analysis',
                'Trending Hashtags',
                'Multi-language Support',
                'Analytics Dashboard',
            ],
            icon: Star,
            popular: false,
        },
        {
            name: 'Pro',
            description: 'For serious content creators',
            price: isAnnual ? 9 : 12,
            features: [
                'Unlimited AI Captions',
                'Advanced Image Analysis',
                'Priority Support',
                'Trending Hashtags',
                'Multi-language Support',
                'Analytics Dashboard',
                'Custom Moods',
            ],
            notIncluded: [],
            icon: Zap,
            popular: true,
        },
        {
            name: 'Team',
            description: 'For agencies and brands',
            price: isAnnual ? 29 : 39,
            features: [
                'Everything in Pro',
                '5 Team Members',
                'Collaborative Workspace',
                'API Access',
                'Dedicated Account Manager',
                'Custom Branding',
            ],
            notIncluded: [],
            icon: Shield,
            popular: false,
        },
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

            <div className="container mx-auto px-4 py-24">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold tracking-tight"
                    >
                        Simple, transparent pricing
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        Choose the perfect plan for your content creation journey.
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
                            Yearly <Badge variant="secondary" className="ml-1 text-xs text-primary bg-primary/10">Save 25%</Badge>
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
                                plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm">Most Popular</Badge>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                    <plan.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-muted-foreground mb-6">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                {isAnnual && plan.price > 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">Billed ${plan.price * 12} yearly</p>
                                )}
                            </div>

                            <Button
                                className={cn("w-full mb-8", plan.popular ? "bg-primary" : "bg-secondary hover:bg-secondary/80")}
                                variant={plan.popular ? "default" : "secondary"}
                            >
                                {plan.price === 0 ? "Get Started Free" : "Start Free Trial"}
                            </Button>

                            <div className="space-y-4">
                                {plan.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-green-500" />
                                        </div>
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 opacity-50">
                                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <X className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm">{feature}</span>
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
                            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period." },
                            { q: "Is there a free trial?", a: "Yes, all paid plans come with a 14-day free trial. No credit card required to start." },
                            { q: "What happens to my data?", a: "Your data is secure and private. We never share your content or usage data with third parties." },
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-2xl border bg-card/30 backdrop-blur-sm"
                            >
                                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
