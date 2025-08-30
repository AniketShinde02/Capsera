"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Loader2, LogIn, UserPlus, Eye, EyeOff, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthModal } from "@/context/AuthModalContext";

// Admin Registration Modal Component
const AdminRegistrationModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [step, setStep] = useState<'system-password' | 'otp' | 'admin-choice' | 'admin-create' | 'admin-login'>('system-password');
  const [systemPassword, setSystemPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [pinVerified, setPinVerified] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpToken, setOtpToken] = useState(''); // Store the OTP token for admin actions

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 State Debug:', { step, pinVerified, otpVerified });
  }, [step, pinVerified, otpVerified]);

  // Ensure otpVerified state is maintained when navigating between admin steps
  useEffect(() => {
    if ((step === 'admin-create' || step === 'admin-login') && !otpVerified) {
      console.log('⚠️ OTP not verified, redirecting back to admin-choice');
      setStep('admin-choice');
    }
  }, [step, otpVerified]);

  // System password verification
  const handleSystemPassword = async () => {
    if (!systemPassword.trim()) {
      setError('System password is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/verify-setup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pin: systemPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPinVerified(true);
        setStep('otp');
        setSuccess('System verified! Now verify OTP to unlock admin creation.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Invalid system password');
      }
    } catch (error) {
      setError('Failed to verify system password');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate OTP
  const generateOTP = async () => {
    if (otpCooldown > 0) {
      setError(`Please wait ${otpCooldown} seconds before requesting another OTP`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/request-setup-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'sunnyshinde2601@gmail.com' })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('OTP generated and sent! Please check your email: sunnyshinde2601@gmail.com');
        setTimeout(() => setSuccess(''), 3000);
        
        // Set 60-second cooldown
        setOtpCooldown(60);
        const cooldownInterval = setInterval(() => {
          setOtpCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(cooldownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to generate OTP');
      }
    } catch (error) {
      setError('Failed to generate OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification
  const handleOTPVerification = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-token',
          token: otpString,
          email: 'sunnyshinde2601@gmail.com'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ OTP verification successful, setting otpVerified to true');
        setOtpVerified(true);
        setOtpToken(otpString); // Store the verified OTP token
        setStep('admin-choice');
        setSuccess('OTP verified! Admin system unlocked. Choose your action.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin creation
  const handleAdminCreation = async () => {
    console.log('🔍 handleAdminCreation called with otpVerified:', otpVerified);
    
    if (!email.trim() || !password.trim() || !username.trim()) {
      setError('All fields are required');
      return;
    }
    
    // Check if OTP is verified
    if (!otpVerified) {
      console.log('❌ OTP not verified, current state:', { otpVerified, step });
      setError('OTP verification required. Please verify OTP first.');
      return;
    }
    
    console.log('✅ OTP verified, proceeding with admin creation');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Username validation
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (username.trim().length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    // Password validation
    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password.trim().length > 50) {
      setError('Password must be less than 50 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use stored OTP token or compute from OTP array
      const tokenToUse = otpToken || otp.join('');
      console.log('🔍 Using token for admin creation:', tokenToUse);
      
      const verifyResponse = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-token',
          token: tokenToUse,
          email: 'sunnyshinde2601@gmail.com'
        })
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok || !verifyData.success) {
        console.log('❌ OTP re-verification failed:', verifyData);
        setError('OTP verification expired. Please verify OTP again.');
        setOtpVerified(false);
        setStep('otp');
        return;
      }
      
      console.log('✅ OTP re-verification successful, creating admin...');
      
      // Now create the admin
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-admin',
          email: email.trim(),
          password: password.trim(),
          username: username.trim(),
          token: tokenToUse
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Admin created successfully! You can now access admin features from your profile.');
        setTimeout(() => {
          // Close modal and stay on home page
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      setError('Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin login
  const handleAdminLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use NextAuth signIn function for proper authentication
      const { signIn } = await import('next-auth/react');
      
      const result = await signIn('admin-credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false // Don't redirect automatically
      });
      
      if (result?.ok) {
        setSuccess('Login successful! You can now access admin features from your profile.');
        setTimeout(() => {
          // Close modal and stay on home page
          onClose();
          // Refresh page to update session state
          window.location.reload();
        }, 2000);
      } else {
        console.log('Login failed:', result?.error);
        setError(result?.error === 'CredentialsSignin' ? 'Invalid admin credentials' : 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^[0-9]*$/.test(value)) return;
    
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Auto-focus previous input on backspace
    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Skip OTP and auto-verify
  const handleSkipOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-token',
          token: otpString,
          email: 'sunnyshinde2601@gmail.com'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ OTP verification successful (skipped), setting otpVerified to true');
        setOtpVerified(true);
        setStep('admin-choice');
        setSuccess('OTP verified! Admin system unlocked. Choose your action.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Skip OTP completely for development/testing
  const handleSkipOTPCompletely = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔍 Checking if admin already exists...');
      
      // First check if admin exists (like setup page does)
      const response = await fetch('/api/admin/setup', {
        method: 'GET'
      });
      const data = await response.json();
      
      if (data.existingAdmin) {
        console.log('✅ Admin exists, skipping OTP verification');
        setOtpVerified(true);
        setOtpToken('EXISTING_ADMIN'); // Set the token like setup page
        setStep('admin-choice');
        setSuccess('Admin account found! Skipping OTP verification.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.log('🔍 No existing admin, using bypass for development...');
        
        // If no admin exists, use the bypass method
        const bypassResponse = await fetch('/api/admin/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'skip-otp',
            email: 'sunnyshinde2601@gmail.com'
          })
        });
        
        const bypassData = await bypassResponse.json();
        
        if (bypassResponse.ok && bypassData.success) {
          console.log('✅ OTP bypass successful:', bypassData);
          setOtpVerified(true);
          setOtpToken('SKIPPED_DEV'); // Set a token for bypassed OTP
          setStep('admin-choice');
          setSuccess('OTP verification bypassed for development. Proceeding to admin choice.');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          console.log('❌ OTP bypass failed:', bypassData);
          setError(bypassData.message || 'Failed to bypass OTP verification');
        }
      }
    } catch (error) {
      console.error('Skip OTP error:', error);
      setError('Failed to skip OTP verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin System Access</h2>
          <button
            onClick={() => {
              // Reset all state when closing
              setStep('system-password');
              setSystemPassword('');
              setOtp(['', '', '', '', '', '']);
              setEmail('');
              setPassword('');
              setUsername('');
              setError('');
              setSuccess('');
              setPinVerified(false);
              setOtpVerified(false);
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* System Password Step */}
          {step === 'system-password' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">System Verification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter system password to unlock admin access</p>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">System Password</label>
                <input
                  type="password"
                  value={systemPassword}
                  onChange={(e) => setSystemPassword(e.target.value)}
                  placeholder="Enter system password"
                  aria-label="System password"
                  aria-describedby="system-password-help"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                <p id="system-password-help" className="text-xs text-gray-500 dark:text-gray-400">
                  Enter the system PIN to verify admin access
                </p>
              </div>
              
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              
              <Button
                onClick={handleSystemPassword}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Verify System'}
              </Button>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">OTP Verification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter the 6-digit OTP sent to sunnyshinde2601@gmail.com</p>
                {pinVerified && <p className="text-xs text-green-600 mt-1">✅ System PIN Verified</p>}
              </div>
              
              {/* Simple Skip OTP Text */}
              <div className="text-center">
                <button
                  onClick={handleSkipOTPCompletely}
                  className="text-blue-600 hover:text-blue-700 underline text-lg font-medium cursor-pointer"
                >
                  Skip OTP
                </button>
              </div>
              
              {/* OTP Input Fields */}
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="0"
                  />
                ))}
              </div>
              
              {/* OTP Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleOTPVerification}
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Verify OTP'}
                </Button>
                
                <Button
                  onClick={generateOTP}
                  disabled={isLoading || otpCooldown > 0}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 rounded-xl"
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 
                   otpCooldown > 0 ? `Wait ${otpCooldown}s` : 'Generate New OTP'}
                </Button>
              </div>
              
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
            </div>
          )}

          {/* Admin Choice Step */}
          {step === 'admin-choice' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Admin System Unlocked</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your action</p>
                {otpVerified && <p className="text-xs text-green-600 mt-1">✅ OTP Verified</p>}
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setStep('admin-create')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Create New Admin Account
                </Button>
                
                <Button
                  onClick={() => setStep('admin-login')}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-semibold py-3 rounded-xl"
                >
                  <LogIn className="mr-2 h-4 w-4" /> Login as Existing Admin
                </Button>
              </div>
              
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
            </div>
          )}

          {/* Admin Creation Step */}
          {step === 'admin-create' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Admin Account</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create admin account with any email</p>
                {otpVerified && <p className="text-xs text-green-600 mt-1">✅ OTP Verified</p>}
              </div>
              
              {/* Back Button */}
              <Button
                onClick={() => setStep('admin-choice')}
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 rounded-xl"
              >
                ← Back to Admin Choice
              </Button>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="any@email.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              
              <Button
                onClick={handleAdminCreation}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Create Admin Account'}
              </Button>
            </div>
          )}

          {/* Admin Login Step */}
          {step === 'admin-login' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Admin Login</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Login with existing admin credentials</p>
                {otpVerified && <p className="text-xs text-green-600 mt-1">✅ OTP Verified</p>}
              </div>
              
              {/* Back Button */}
              <Button
                onClick={() => setStep('admin-choice')}
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2 rounded-xl"
              >
                ← Back to Admin Choice
              </Button>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@email.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
              
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              
              <Button
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Login as Admin'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Password is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function AuthForm({ initialEmail = '' }: { initialEmail?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const router = useRouter();
  const { setOpen } = useAuthModal();
  const [activeTab, setActiveTab] = useState("sign-in");

  // Clear messages when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSignInError('');
    setSignUpError('');
    setSignUpSuccess('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
  });

  // Update form values when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      signInForm.setValue('email', initialEmail);
      signUpForm.setValue('email', initialEmail);
    }
  }, [initialEmail, signInForm, signUpForm]);

  async function onSignUp(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true);
    setSignUpError('');
    setSignUpSuccess('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during sign up");
      }
      
      setSignUpSuccess("Account created successfully! Please sign in below.");
      setTimeout(() => {
        setActiveTab("sign-in");
        signInForm.setValue("email", values.email);
        setSignUpSuccess(''); // Clear success message when switching
      }, 1500);

    } catch (error: any) {
      setSignUpError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignIn(values: z.infer<typeof signInSchema>) {
    setIsLoading(true);
    setSignInError('');
    
    try {
      // First check if the user is blocked
      const blockCheckResponse = await fetch('/api/auth/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      if (blockCheckResponse.ok) {
        const blockData = await blockCheckResponse.json();
        if (blockData.blocked) {
          const reason = blockData.reason || 'suspicious_activity';
          const hoursRemaining = blockData.hoursRemaining || 0;
          
          let reasonMessage = '';
          switch (reason) {
            case 'account_deletion_abuse':
              reasonMessage = 'Account deletion abuse detected';
              break;
            case 'rate_limit_violation':
              reasonMessage = 'Rate limit violations';
              break;
            case 'suspicious_activity':
              reasonMessage = 'Suspicious activity detected';
              break;
            case 'manual_block':
              reasonMessage = 'Account manually blocked by administrators';
              break;
            default:
              reasonMessage = 'Account temporarily blocked';
          }
          
          throw new Error(
            `🚫 Account blocked: ${reasonMessage}. Please try again in ${hoursRemaining} hours.`
          );
        }
      }

      // If not blocked, proceed with sign-in
      // Try admin credentials first, then regular credentials
      let result = await signIn("admin-credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      // If admin login fails, try regular user login
      if (result?.error) {
        console.log('🔐 Admin login failed, trying regular user login...');
        result = await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });
      }

      if (result?.error) {
        throw new Error("Invalid email or password. Please try again.");
      }
      
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      setSignInError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleForgotPassword = async () => {
    const email = signInForm.getValues('email');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    
    if (!email) {
      setForgotPasswordError('Please enter your email above, then click Forgot Password.');
      return;
    }
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setForgotPasswordSuccess('Reset link sent! Check your email for the password reset link. Please check your spam folder if you don\'t see it.');
      } else {
        const d = await res.json().catch(() => ({}));
        
        // Handle specific error cases
        if (res.status === 429) {
          if (d.message.includes('daily limit')) {
            setForgotPasswordError('You have reached the maximum password reset requests for today. Please try again tomorrow.');
          } else if (d.message.includes('location')) {
            setForgotPasswordError('Too many reset attempts from this location. Please try again later.');
          } else {
            setForgotPasswordError('Too many reset attempts. Please wait before requesting another reset link.');
          }
        } else {
          throw new Error(d.message || 'Failed to send reset link');
        }
      }
    } catch (e: any) {
      setForgotPasswordError(e.message);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {/* Tabs List - Compact Design with Rich Whites */}
      <TabsList className="grid w-full grid-cols-2 bg-[#E3E1D9]/80 dark:bg-muted/50 border border-[#C7C8CC]/60 dark:border-border h-12 rounded-2xl p-2 gap-2">
        <TabsTrigger 
          value="sign-in" 
          className="text-sm font-medium rounded-xl data-[state=active]:bg-[#F2EFE5] dark:data-[state=active]:bg-slate-300 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-700 dark:data-[state=inactive]:text-slate-700 data-[state=inactive]:bg-transparent dark:data-[state=inactive]:bg-slate-100/60 data-[state=active]:shadow-sm transition-all duration-200"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger 
          value="sign-up" 
          className="text-sm font-medium rounded-xl data-[state=active]:bg-[#F2EFE5] dark:data-[state=active]:bg-slate-300 data-[state=inactive]:text-slate-700 dark:data-[state=inactive]:text-slate-700 data-[state=inactive]:bg-transparent dark:data-[state=inactive]:bg-slate-100/60 data-[state=active]:shadow-sm transition-all duration-200"
        >
          Sign Up
        </TabsTrigger>
      </TabsList>
      
      {/* Sign In Tab - Compact Design with Rich Whites */}
      <TabsContent value="sign-in" className="mt-3 sm:mt-4">
        <div className="space-y-3 sm:space-y-4">
          {/* Admin Login Note
          <div className="text-center p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              👑 <strong>Admin users:</strong> Use your admin credentials to access unlimited features
            </p>
          </div> */}
          
          <Form {...signInForm}>
            <form
              onSubmit={signInForm.handleSubmit(onSignIn)}
              className="space-y-3 sm:space-y-4"
            >
              {/* Email Field - Compact Design with Rich Whites */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-foreground">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 dark:text-muted-foreground text-sm sm:text-base">@</span>
                  </div>
                  <Input
                    type="email"
                    placeholder="Enter your Email"
                    className="pl-10 h-9 sm:h-10 bg-[#F2EFE5]/90 dark:bg-background/80 border-[#C7C8CC]/80 dark:border-border rounded-xl text-sm focus:ring-2 focus:ring-[#B4B4B8] dark:focus:ring-primary/20 focus:border-[#B4B4B8] dark:focus:border-primary transition-all duration-200 text-slate-700 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground"
                    {...signInForm.register('email')}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-xs text-red-600 dark:text-destructive">{signInForm.formState.errors.email.message}</p>
                )}
              </div>
              
              {/* Password Field - Compact Design with Rich Whites */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-foreground">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 dark:text-muted-foreground text-sm sm:text-base">🔒</span>
                  </div>
                  <Input
                    type={showSignInPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    className="pl-10 h-9 sm:h-10 bg-[#F2EFE5]/90 dark:bg-background/80 border-[#C7C8CC]/80 dark:border-border rounded-xl text-sm focus:ring-2 focus:ring-[#B4B4B8] dark:focus:ring-primary/20 focus:border-[#B4B4B8] dark:focus:border-primary transition-all duration-200 text-slate-700 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground"
                    {...signInForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground transition-colors"
                  >
                    {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-xs text-red-600 dark:text-destructive">{signInForm.formState.errors.password.message}</p>
                )}
              </div>
              
              {/* Remember Me & Forgot Password - Compact Layout with Rich Whites */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-primary bg-[#F2EFE5] dark:bg-background border-[#C7C8CC] dark:border-border rounded focus:ring-2 focus:ring-[#B4B4B8] dark:focus:ring-primary/20"
                  />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-xs sm:text-sm text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 transition-colors font-medium"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Messages - Text Only */}
              {signInError && (
                <p className="text-sm text-red-700 dark:text-destructive text-center">{signInError}</p>
              )}

              {forgotPasswordError && (
                <p className="text-sm text-red-700 dark:text-destructive text-center">{forgotPasswordError}</p>
              )}

              {forgotPasswordSuccess && (
                <p className="text-sm text-green-700 dark:text-green-400 text-center">{forgotPasswordSuccess}</p>
              )}

              {/* Sign In Button - Compact Design with Rich Whites */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-9 sm:h-10 bg-slate-800 dark:bg-foreground hover:bg-slate-700 dark:hover:bg-foreground/90 text-white dark:text-background font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Sign Up Link - Compact Design with Rich Whites */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab("sign-up")}
                className="text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 font-medium transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Social Login - Compact Design with Rich Whites */}
          <div className="space-y-2 sm:space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#C7C8CC]/60 dark:border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F2EFE5] dark:bg-background px-2 text-slate-500 dark:text-muted-foreground">Or With</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-9 sm:h-10 bg-[#F2EFE5]/90 dark:bg-background border-[#C7C8CC]/80 dark:border-border hover:bg-[#E3E1D9]/90 dark:hover:bg-muted/50 rounded-xl transition-all duration-200 text-slate-700 dark:text-foreground"
              >
                <span className="text-base mr-2">G</span>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 sm:h-10 bg-[#F2EFE5]/90 dark:bg-background border-[#C7C8CC]/80 dark:border-border hover:bg-[#E3E1D9]/90 dark:hover:bg-muted/50 rounded-xl transition-all duration-200 text-slate-700 dark:text-foreground"
              >
                <span className="text-base mr-2">🍎</span>
                Apple
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      
      {/* Sign Up Tab - Compact Design with Rich Whites */}
      <TabsContent value="sign-up" className="mt-4">
        <div className="space-y-4">
          <Form {...signUpForm}>
            <form
              onSubmit={signUpForm.handleSubmit(onSignUp)}
              className="space-y-4"
            >
              {/* Email Field - Compact Design with Rich Whites */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-foreground">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 dark:text-muted-foreground text-base">@</span>
                  </div>
                  <Input
                    type="email"
                    placeholder="Enter your Email"
                    className="pl-10 h-10 bg-[#F2EFE5]/90 dark:bg-background/80 border-[#C7C8CC]/80 dark:border-border rounded-xl text-sm focus:ring-2 focus:ring-[#B4B4B8] dark:focus:ring-primary/20 focus:border-[#B4B4B8] dark:focus:border-primary transition-all duration-200 text-slate-700 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground"
                    {...signUpForm.register('email')}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-xs text-red-600 dark:text-destructive">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>
              
              {/* Password Field - Compact Design with Rich Whites */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-foreground">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 dark:text-muted-foreground text-base">🔒</span>
                  </div>
                  <Input
                    type={showSignUpPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    className="pl-10 h-10 bg-[#F2EFE5]/90 dark:bg-background/80 border-[#C7C8CC]/80 dark:border-border rounded-xl text-sm focus:ring-2 focus:ring-[#B4B4B8] dark:focus:ring-primary/20 focus:border-[#B4B4B8] dark:focus:border-primary transition-all duration-200 text-slate-700 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground"
                    {...signUpForm.register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground transition-colors"
                  >
                    {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-xs text-red-600 dark:text-destructive">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Error/Success Messages - Text Only */}
              {signUpError && (
                <p className="text-sm text-red-700 dark:text-destructive text-center">{signUpError}</p>
              )}

              {signUpSuccess && (
                <p className="text-sm text-green-700 dark:text-green-400 text-center">{signUpSuccess}</p>
              )}

              {/* Sign Up Button - Compact Design with Rich Whites */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-10 bg-slate-800 dark:bg-foreground hover:bg-slate-700 dark:hover:bg-foreground/90 text-white dark:text-background font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </>
                )}
              </Button>

              {/* Admin Registration Button - Same Theme Style */}
              <Button 
                type="button" 
                onClick={() => setShowAdminModal(true)}
                className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg border-0"
              >
                <Crown className="mr-2 h-4 w-4" /> Register as Admin
              </Button>
            </form>
          </Form>

          {/* Sign In Link - Compact Design with Rich Whites */}
          <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab("sign-in")}
                className="text-blue-600 dark:text-primary hover:text-blue-700 dark:hover:text-primary/80 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Social Login - Compact Design with Rich Whites */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#C7C8CC]/60 dark:border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F2EFE5] dark:bg-background px-2 text-slate-500 dark:text-muted-foreground">Or With</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 bg-[#F2EFE5]/90 dark:bg-background border-[#C7C8CC]/80 dark:border-border hover:bg-[#E3E1D9]/90 dark:hover:bg-muted/50 rounded-xl transition-all duration-200 text-slate-700 dark:text-foreground"
              >
                <span className="text-base mr-2">G</span>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 bg-[#F2EFE5]/90 dark:bg-background border-[#C7C8CC]/80 dark:border-border hover:bg-[#E3E1D9]/90 dark:hover:bg-muted/50 rounded-xl transition-all duration-200 text-slate-700 dark:text-foreground"
              >
                <span className="text-base mr-2">🍎</span>
                Apple
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Admin Registration Modal */}
      {showAdminModal && (
        <AdminRegistrationModal 
          onClose={() => setShowAdminModal(false)}
          onSuccess={() => {
            setShowAdminModal(false);
            setOpen(false);
            // Redirect to admin dashboard after successful admin creation/login
            router.push('/admin/dashboard');
          }}
        />
      )}
    </Tabs>
  );
}
