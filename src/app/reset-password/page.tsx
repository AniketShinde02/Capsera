"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, CheckCircle, Clock, Shield, RefreshCw, LogIn } from 'lucide-react';
import Link from 'next/link';

interface TokenValidationResult {
  valid: boolean;
  message: string;
  expiresAt?: string;
}

function ResetPasswordContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => sp.get('token') || '', [sp]);
  const email = useMemo(() => sp.get('email') || '', [sp]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<Date | null>(null);
  const [requestingNewLink, setRequestingNewLink] = useState(false);
  const [newLinkMessage, setNewLinkMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const disabled = submitting || !tokenValid || !strong.test(password) || password !== confirm;

  // Validate token on page load
  useEffect(() => {
    if (!token || !email) {
      setTokenValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token }),
        });

        const data: TokenValidationResult = await res.json();
        
        if (data.valid) {
          setTokenValid(true);
          if (data.expiresAt) {
            setTokenExpiresAt(new Date(data.expiresAt));
          }
        } else {
          setTokenValid(false);
          setError(data.message);
        }
      } catch (err) {
        setTokenValid(false);
        setError('Failed to validate reset token. Please try again.');
      } finally {
        setTokenValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  // Handle countdown and redirect after successful password reset
  useEffect(() => {
    if (redirecting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (redirecting && countdown === 0) {
      // Redirect to homepage with login modal open and email pre-filled
      const loginUrl = `/?login=true&email=${encodeURIComponent(email)}`;
      router.push(loginUrl);
    }
  }, [redirecting, countdown, router, email]);

  const handleRequestNewLink = async () => {
    if (!email) {
      setError('Email address is required to request a new reset link.');
      return;
    }

    setRequestingNewLink(true);
    setError('');
    setNewLinkMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setNewLinkMessage('New reset link sent! Check your email for the password reset link. Please check your spam folder if you don\'t see it.');
        setSuccess(''); // Clear any previous success message
      } else {
        const d = await res.json().catch(() => ({}));
        
        if (res.status === 429) {
          if (d.message.includes('daily limit')) {
            setError('You have reached the maximum password reset requests for today. Please try again tomorrow.');
          } else if (d.message.includes('location')) {
            setError('Too many reset attempts from this location. Please try again later.');
          } else {
            setError('Too many reset attempts. Please wait before requesting another reset link.');
          }
        } else {
          setError(d.message || 'Failed to send new reset link. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setRequestingNewLink(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: 'Enter password', color: 'text-muted-foreground', width: 'w-0' };
    if (strong.test(password)) return { text: 'Strong', color: 'text-green-600', width: 'w-full bg-green-500' };
    if (password.length >= 6) return { text: 'Medium', color: 'text-yellow-600', width: 'w-1/2 bg-yellow-500' };
    return { text: 'Weak', color: 'text-red-600', width: 'w-1/4 bg-red-500' };
  };

  const strengthInfo = getPasswordStrength();

  const formatTimeRemaining = () => {
    if (!tokenExpiresAt) return '';
    
    const now = new Date();
    const diff = tokenExpiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show loading state while validating token
  if (tokenValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 p-6 sm:p-8">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Validating Reset Link</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Please wait while we verify your reset link...</p>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Show success state with countdown
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 p-6 sm:p-8">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-green-600">Password Reset Successful!</h1>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Your password has been updated successfully.</p>
              </div>
            </CardHeader>
            
            <CardContent className="text-center space-y-6 p-6 sm:p-8">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <LogIn className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 dark:text-green-200 font-medium text-sm sm:text-base">Redirecting to Login</span>
                </div>
                <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm">
                  Redirecting to login page in <span className="font-bold text-lg">{countdown}</span> seconds...
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                  You can now sign in with your new password
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    const loginUrl = `/?login=true&email=${encodeURIComponent(email)}`;
                    router.push(loginUrl);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 h-11 sm:h-10"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Go to Login Now
                </Button>
                
                <Button asChild variant="outline" className="w-full h-11 sm:h-10">
                  <Link href="/">Return to Homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 p-6 sm:p-8">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Reset Your Password</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Create a new secure password for your account</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6 sm:p-8">
            {/* Email Display - Mobile First */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium truncate">{email || 'No email provided'}</span>
              </div>
            </div>

            {/* Token Validation Status - Mobile First */}
            {tokenValid && tokenExpiresAt && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-green-800 dark:text-green-200 font-medium">Reset link is valid</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-green-700 dark:text-green-300">
                  <Clock className="w-3 h-3" />
                  <span>Expires in: {formatTimeRemaining()}</span>
                </div>
              </div>
            )}

            {/* Error Display - Mobile First */}
            {error && (
              <p className="text-xs sm:text-sm text-destructive text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">{error}</p>
            )}

            {/* Success Display - Mobile First */}
            {success && (
              <p className="text-xs sm:text-sm text-green-500 text-center p-3 bg-green-500/10 rounded-lg border border-green-200">{success}</p>
            )}

            {/* New Link Message - Mobile First */}
            {newLinkMessage && (
              <p className="text-xs sm:text-sm text-green-500 text-center p-3 bg-green-500/10 rounded-lg border border-green-200">{newLinkMessage}</p>
            )}

            {/* Invalid Token or Missing Parameters - Mobile First */}
            {(!token || !email || !tokenValid) ? (
              <div className="text-center py-6 sm:py-8">
                <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-xs sm:text-sm text-destructive font-medium mb-4">
                  {!token || !email ? 'Invalid or missing reset link' : 'Reset link is invalid or expired'}
                </p>
                <p className="text-xs text-muted-foreground mb-6 px-2">
                  {!token || !email 
                    ? 'This link may have expired or is invalid. Please request a new password reset.'
                    : 'This reset link has already been used or has expired. Please request a new password reset link.'
                  }
                </p>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full h-11 sm:h-10">
                    <Link href="/">Return to Home</Link>
                  </Button>
                  <Button 
                    onClick={handleRequestNewLink}
                    disabled={requestingNewLink}
                    className="w-full bg-primary hover:bg-primary/90 h-11 sm:h-10"
                  >
                    {requestingNewLink ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Request New Reset Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Password Input - Mobile First */}
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-12 h-11 sm:h-10 text-sm sm:text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator - Mobile First */}
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.width}`}></div>
                    </div>
                    <p className={`text-xs ${strengthInfo.color}`}>{strengthInfo.text}</p>
                  </div>
                </div>

                {/* Confirm Password Input - Mobile First */}
                <div className="space-y-2 sm:space-y-3">
                  <label htmlFor="confirm" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={show2 ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pr-12 h-11 sm:h-10 text-sm sm:text-base"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShow2(!show2)}
                    >
                      {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Match Indicator - Mobile First */}
                  {confirm && (
                    <div className="flex items-center gap-2 text-xs">
                      {password === confirm ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          <span className="text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Security Notice - Mobile First */}
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p>This reset link can only be used once and will expire in 1 hour. Make sure to use a strong, unique password.</p>
                    </div>
                  </div>
                </div>

                {/* Reset Button - Mobile First */}
                <Button
                  className="w-full h-11 sm:h-10 text-sm sm:text-base"
                  disabled={disabled}
                  onClick={async () => {
                    if (password !== confirm) {
                      setError('Passwords do not match');
                      return;
                    }

                    if (!strong.test(password)) {
                      setError('Password does not meet security requirements');
                      return;
                    }

                    setSubmitting(true);
                    setError('');

                    try {
                      const res = await fetch('/api/auth/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, token, newPassword: password }),
                      });
                      
                      if (!res.ok) {
                        const d = await res.json().catch(() => ({}));
                        setError(d.message || 'Reset failed. Please request a new link and try again.');
                        return;
                      }
                      
                      // Password reset successful - start redirect countdown
                      setSuccess('Password reset successful! Redirecting to login page...');
                      setRedirecting(true);
                    } catch (err) {
                      setError('Network error. Please check your connection and try again.');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
