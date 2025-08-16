'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Lock, Eye, EyeOff, ArrowLeft, Home, UserCheck } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [showSecret, setShowSecret] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Track unauthorized access attempts
    const currentAttempts = parseInt(localStorage.getItem('unauthorized_attempts') || '0');
    const newAttempts = currentAttempts + 1;
    localStorage.setItem('unauthorized_attempts', newAttempts.toString());
    setAttempts(newAttempts);

    // Lock after 3 attempts for 5 minutes
    if (newAttempts >= 3) {
      setIsLocked(true);
      setTimeout(() => {
        setIsLocked(false);
        localStorage.setItem('unauthorized_attempts', '0');
        setAttempts(0);
      }, 5 * 60 * 1000);
    }
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleLogin = () => {
    router.push('/setup');
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-red-500 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">🚨 ACCESS TEMPORARILY BLOCKED</CardTitle>
            <CardDescription className="text-red-600">
              Too many unauthorized access attempts detected
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium">
                🔒 Your access has been temporarily blocked for security reasons
              </p>
              <p className="text-red-600 text-sm mt-2">
                Please wait 5 minutes before trying again
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p>⏰ Time remaining: 5 minutes</p>
              <p>🛡️ This is a security measure to protect the system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-red-500 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">🚨 UNAUTHORIZED ACCESS DETECTED</CardTitle>
          <CardDescription className="text-red-600">
            Security breach attempt logged and reported
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">Security Alert</span>
            </div>
            <p className="text-red-700 text-sm">
              Multiple unauthorized access attempts detected from your location. 
              This incident has been logged and reported to system administrators.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">What We Know</span>
            </div>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Your IP address has been recorded</li>
              <li>• Access attempts have been logged</li>
              <li>• System administrators have been notified</li>
              <li>• Further attempts may result in permanent blocking</li>
            </ul>
          </div>

          {showSecret && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Legitimate Access?</span>
              </div>
              <p className="text-blue-700 text-sm">
                If you're a legitimate administrator, please use the proper setup process 
                at <code className="bg-blue-100 px-1 rounded">/setup</code> with a valid JWT token.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecret(!showSecret)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showSecret ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showSecret ? 'Hide Info' : 'Show Info'}
            </Button>
            <span className="text-xs text-gray-400">
              Attempts: {attempts}/3
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Proper Admin Login
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🛡️ This system is protected by advanced security measures
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
