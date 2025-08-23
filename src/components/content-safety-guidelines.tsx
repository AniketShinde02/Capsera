'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Info, Cookie } from 'lucide-react';
import { getContentSafetyGuidelines } from '@/lib/content-safety';
import Link from 'next/link';

interface ContentSafetyGuidelinesProps {
  onAccept?: () => void;
  onDecline?: () => void;
  showAcceptance?: boolean;
}

export function ContentSafetyGuidelines({
  onAccept,
  onDecline,
  showAcceptance = false
}: ContentSafetyGuidelinesProps) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const guidelines = getContentSafetyGuidelines();

  const handleAccept = () => {
    setHasAccepted(true);
    onAccept?.();
  };

  const handleDecline = () => {
    onDecline?.();
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Shield className="w-5 h-5" />
          Content Safety Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Guidelines List */}
        <div className="space-y-3">
          {guidelines.map((guideline, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
              {guideline.startsWith('🚫') ? (
                <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm text-foreground">{guideline}</span>
            </div>
          ))}
        </div>

        {/* Warning Box */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Important Notice</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                All images are automatically scanned for inappropriate content. Violations will result in:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                <li>• Immediate rejection of the image</li>
                <li>• Automatic reporting to administrators</li>
                <li>• Potential account restrictions for repeated violations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">How It Works</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI-powered system analyzes every image for:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-xs">Adult Content</Badge>
                <Badge variant="outline" className="text-xs">Violence</Badge>
                <Badge variant="outline" className="text-xs">Hate Speech</Badge>
                <Badge variant="outline" className="text-xs">Spam</Badge>
                <Badge variant="outline" className="text-xs">Illegal Content</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Policy Notice */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Cookie className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Cookie Policy</h4>
              <p className="text-sm text-muted-foreground mt-1">
                To use CaptionCraft, you must agree to our content safety guidelines and cookie policy. 
                <Link href="/cookie-policy" className="text-primary hover:underline ml-1">
                  Read our cookie policy
                </Link> to understand how we use cookies and your data.
              </p>
            </div>
          </div>
        </div>

        {/* Acceptance Buttons */}
        {showAcceptance && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={hasAccepted}
            >
              {hasAccepted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guidelines Accepted
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  I Accept These Guidelines
                </>
              )}
            </Button>
            
            <Link href="/cookie-policy" className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                disabled={hasAccepted}
              >
                <Cookie className="h-4 w-4 mr-2" />
                Read Cookie Policy
              </Button>
            </Link>
          </div>
        )}

        {/* Success Message */}
        {hasAccepted && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
            <CheckCircle className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-accent-foreground font-medium">
              Thank you for accepting our guidelines! You can now upload images safely.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ContentSafetyGuidelines;

