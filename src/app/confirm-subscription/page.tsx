"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ConfirmSubscriptionContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('No email provided for confirmation.');
      return;
    }

    confirmSubscription();
  }, [email]);

  const confirmSubscription = async () => {
    try {
      const response = await fetch('/api/email-subscription/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscription confirmed successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to confirm subscription.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while confirming your subscription.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <CardTitle>Confirming Subscription...</CardTitle>
            <CardDescription>
              Please wait while we confirm your email subscription.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'success' ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className={status === 'success' ? 'text-green-600' : 'text-red-600'}>
            {status === 'success' ? 'Subscription Confirmed!' : 'Confirmation Failed'}
          </CardTitle>
          <CardDescription className="mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {email && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Email: <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            {status === 'success' ? (
              <>
                <p className="text-sm text-muted-foreground">
                  You're now subscribed to our feature updates! We'll notify you when new features are ready.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/">
                      🏠 Go to Homepage
                    </Link>
                  </Button>
                  <Button asChild className="w-full outline">
                    <Link href="/features">
                      ✨ Explore Features
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Something went wrong. Please try subscribing again or contact support.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link href="/feature-development">
                      🔄 Try Again
                    </Link>
                  </Button>
                  <Button asChild className="w-full outline">
                    <Link href="/contact">
                      📧 Contact Support
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmSubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load the confirmation page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ConfirmSubscriptionContent />
    </Suspense>
  );
}
