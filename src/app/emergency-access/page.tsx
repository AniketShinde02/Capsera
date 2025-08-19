'use client';

import { useState } from 'react';
import { Shield, Key, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function EmergencyAccessPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const verifyToken = async () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter the emergency access token.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/maintenance/emergency-access?token=${encodeURIComponent(token.trim())}`);
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Access Granted",
          description: `Welcome back! You can now access the site.`,
        });
        
        // Redirect to home page
        router.push('/');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid token');
      }
    } catch (error: any) {
      console.error('Error verifying token:', error);
      toast({
        title: "Access Denied",
        description: error?.message || "Invalid or expired emergency access token.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Emergency Access
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Enter your emergency access token to bypass maintenance mode
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="token" className="text-sm font-medium text-gray-700">
                Emergency Access Token
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter your emergency token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && verifyToken()}
                />
              </div>
            </div>

            <Button 
              onClick={verifyToken} 
              disabled={loading || !token.trim()}
              className="w-full py-3 text-lg font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Verify Token & Access Site'
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Contact your administrator if you need an emergency access token
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">How Emergency Access Works:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Administrator generates a token for whitelisted emails</li>
                  <li>• Token expires after 24 hours for security</li>
                  <li>• One-time use only</li>
                  <li>• Only works for authorized users</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
