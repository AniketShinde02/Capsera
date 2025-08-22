'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import { getContentSafetyGuidelines } from '@/lib/content-safety';

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <CardTitle className="text-2xl">Content Safety Guidelines</CardTitle>
        </div>
        <CardDescription>
          Please review our community guidelines before uploading images
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Guidelines List */}
        <div className="space-y-3">
          {guidelines.map((guideline, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              {guideline.startsWith('🚫') ? (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-700">{guideline}</span>
            </div>
          ))}
        </div>

        {/* Warning Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Important Notice</h4>
              <p className="text-sm text-amber-700 mt-1">
                All images are automatically scanned for inappropriate content. Violations will result in:
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• Immediate rejection of the image</li>
                <li>• Automatic reporting to administrators</li>
                <li>• Potential account restrictions for repeated violations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800">How It Works</h4>
              <p className="text-sm text-blue-700 mt-1">
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

        {/* Acceptance Buttons */}
        {showAcceptance && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-green-600 hover:bg-green-700"
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
            
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
              disabled={hasAccepted}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {/* Success Message */}
        {hasAccepted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium">
              Thank you for accepting our guidelines! You can now upload images safely.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ContentSafetyGuidelines;
