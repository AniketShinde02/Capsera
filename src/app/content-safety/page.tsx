import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, Cookie } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Content Safety Guidelines - CaptionCraft',
  description: 'Learn about our content safety policies and guidelines for using CaptionCraft.',
};

export default function ContentSafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Content Safety Guidelines
          </h1>
          <p className="text-muted-foreground text-lg">
            Ensuring a safe and family-friendly environment for all users
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Overview Card */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Info className="w-5 h-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                CaptionCraft is committed to maintaining a safe, family-friendly environment. 
                Our AI-powered content safety system automatically detects and prevents inappropriate 
                content from being processed.
              </p>
            </CardContent>
          </Card>

          {/* Cookie Policy and Consent Card */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Cookie className="w-5 h-5" />
                Cookie Policy & Consent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  To use CaptionCraft, you must agree to our content safety guidelines and cookie policy. 
                  This ensures we can provide you with a safe and personalized experience.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/cookie-policy" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Cookie className="w-4 h-4 mr-2" />
                      Read Cookie Policy
                    </Button>
                  </Link>
                  
                  <Link href="/terms" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Terms of Service
                    </Button>
                  </Link>
                </div>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Important Notice
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        By using CaptionCraft, you automatically agree to our content safety guidelines. 
                        Violations may result in account restrictions or termination. 
                        <Link href="/cookie-policy" className="underline ml-1 hover:text-amber-800 dark:hover:text-amber-200">
                          Learn more about our cookie policy
                        </Link>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
