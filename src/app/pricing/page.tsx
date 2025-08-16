import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

export default function PricingPage() {
  // Redirect to feature development page
  redirect('/feature-development');

  // Original pricing code (this won't execute due to redirect, but kept for future use)
  const plans = [
    {
      name: 'Free',
      price: '$0',
      priceInr: '₹0',
      period: 'forever',
      description: 'Perfect for getting started with AI captions',
      icon: Sparkles,
      features: [
        '10 captions per month',
        'Basic mood selection',
        'Standard image analysis',
        'Community support',
        'Basic templates'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outline' as const,
      popular: false,
      savings: null
    },
    {
      name: 'Pro',
      price: '$9.99',
      priceInr: '₹799',
      period: 'per month',
      description: 'Ideal for content creators and small businesses',
      icon: Zap,
      features: [
        'Unlimited captions',
        'Advanced mood options',
        'Deep image analysis',
        'Priority support',
        'Custom templates',
        'Bulk generation',
        'Export options',
        'Analytics dashboard'
      ],
      buttonText: 'Start Pro Trial',
      buttonVariant: 'default' as const,
      popular: true,
      savings: 'Save 20% with annual'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      priceInr: '₹Custom',
      period: 'contact us',
      description: 'For agencies and large organizations',
      icon: Crown,
      features: [
        'Everything in Pro',
        'API access',
        'Custom integrations',
        'Dedicated support',
        'Custom AI training',
        'White-label options',
        'SLA guarantee',
        'Advanced analytics'
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const,
      popular: false,
      savings: null
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Under Development Overlay */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-6 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold">🚧 Under Development</h2>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <p className="text-amber-100 text-sm">
            Pricing plans are being finalized. Currently building our amazing platform as a solo developer!
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Choose Your <span className="gradient-text">Perfect Plan</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Start free and scale as you grow. All plans include our powerful AI caption generation.
          </p>
          
          {/* Currency Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-sm font-medium text-muted-foreground">Currency:</span>
            <div className="flex bg-muted rounded-lg p-1">
              <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                USD
              </button>
              <button className="px-3 py-1.5 text-sm font-medium bg-background text-foreground rounded-md shadow-sm">
                INR
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              ✨ 14-day free trial on Pro plans
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              🚫 No setup fees
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
              💰 Money-back guarantee
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name} 
                  className={`relative h-fit transition-all duration-300 cursor-pointer ${
                    plan.popular 
                      ? 'border-primary shadow-xl scale-105 ring-2 ring-primary/20 bg-primary/5' 
                      : 'hover:shadow-lg hover:scale-[1.02] border-border hover:border-primary/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                        ⭐ Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-3">
                      <div className={`p-2.5 rounded-full ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">{plan.description}</CardDescription>
                    
                    {/* Pricing Display */}
                    <div className="mt-3">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl sm:text-3xl font-bold">{plan.priceInr}</span>
                        {plan.period !== 'contact us' && (
                          <span className="text-muted-foreground text-sm">/{plan.period}</span>
                        )}
                      </div>
                      {plan.savings && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {plan.savings}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      asChild
                      variant={plan.buttonVariant} 
                      className={`w-full mt-4 transition-all duration-300 ${
                        plan.popular 
                          ? 'shadow-lg hover:shadow-xl hover:scale-105' 
                          : 'hover:scale-105'
                      }`}
                      size="default"
                    >
                      <Link href={plan.name === 'Enterprise' ? '/contact' : '/'}>
                        {plan.buttonText}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Can I change plans anytime?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div className="space-y-3 sm:gap-4">
              <h3 className="text-base sm:text-lg font-semibold">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                We accept all major credit cards, PayPal, and offer enterprise billing options for larger organizations.
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Is there a free trial?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Yes! All Pro plans come with a 14-day free trial. No credit card required to start your free account.
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                We offer a 30-day money-back guarantee for all paid plans. Contact our support team for assistance.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Still have questions? We're here to help!
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
