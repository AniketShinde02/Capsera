'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Shield, Home } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribeConfirmationPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Successfully Unsubscribed
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              You have been successfully unsubscribed from promotional emails.
            </p>
            
            {email && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Email address:</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    What this means:
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• You won't receive promotional emails anymore</li>
                    <li>• You'll still get important account notifications</li>
                    <li>• You can re-enable promotional emails in your settings</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-900">
                    Still receiving emails?
                  </p>
                  <p className="text-sm text-yellow-800 mt-1">
                    It may take up to 24 hours for all emails to stop. If you continue to receive emails, please contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link href="/" className="w-full">
              <Button className="w-full" size="lg">
                <Home className="h-4 w-4 mr-2" />
                Return to CaptionCraft
              </Button>
            </Link>
            
            <Link href="/contact" className="w-full">
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Changed your mind? You can re-enable promotional emails in your{' '}
              <Link href="/settings" className="text-blue-600 hover:underline">
                account settings
              </Link>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
