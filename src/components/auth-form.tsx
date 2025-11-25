"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Loader2, LogIn, UserPlus, Eye, EyeOff, Crown, Sparkles } from "lucide-react";
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
    // Ensure we're in the right step
    if (step !== 'otp') {
      console.log('❌ Wrong step for admin creation:', step);
      setError('Please complete OTP verification first');
      return;
    }

    // More robust validation with better error messages
    if (!email || !email.trim()) {
      setError('Email is required');
      return;
    }

    if (!username || !username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password || !password.trim()) {
      setError('Password is required');
      return;
    }

    // Check if OTP is verified
    if (!otpVerified) {
      setError('OTP verification required. Please verify OTP first.');
      return;
    }

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
        setError('OTP verification expired. Please verify OTP again.');
        setOtpVerified(false);
        setStep('otp');
        return;
      }

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

      const signInFunc = signIn;
      const result = await signInFunc('admin-credentials', {
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

  // Skip OTP completely for development/testing
  const handleSkipOTPCompletely = async () => {
    setIsLoading(true);
    setError('');

    try {
      // First check if admin exists (like setup page does)
      const response = await fetch('/api/admin/setup', {
        method: 'GET'
      });
      const data = await response.json();

      if (data.existingAdmin) {
        setOtpVerified(true);
        setOtpToken('EXISTING_ADMIN'); // Set the token like setup page
        setStep('admin-choice');
        setSuccess('Admin account found! Skipping OTP verification.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
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
          setOtpVerified(true);
          setOtpToken('SKIPPED_DEV'); // Set a token for bypassed OTP
          setStep('admin-choice');
          setSuccess('OTP verification bypassed for development. Proceeding to admin choice.');
          setTimeout(() => setSuccess(''), 3000);
        } else {
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ring-1 ring-border/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Admin System Access</h2>
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
            className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
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
                <h3 className="text-lg font-semibold text-foreground mb-2">System Verification</h3>
                <p className="text-sm text-muted-foreground">Enter system password to unlock admin access</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-muted-foreground">System Password</label>
                <input
                  type="password"
                  value={systemPassword}
                  onChange={(e) => setSystemPassword(e.target.value)}
                  placeholder="Enter system password"
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {success && <p className="text-sm text-green-500 text-center">{success}</p>}

              <Button
                onClick={handleSystemPassword}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md"
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Verify System'}
              </Button>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">OTP Verification</h3>
                <p className="text-sm text-muted-foreground">Enter the 6-digit OTP sent to sunnyshinde2601@gmail.com</p>
                {pinVerified && <p className="text-xs text-green-500 mt-1">✅ System PIN Verified</p>}
              </div>

              {/* Simple Skip OTP Text */}
              <div className="text-center">
                <button
                  onClick={handleSkipOTPCompletely}
                  className="text-primary hover:text-primary/80 underline text-lg font-medium cursor-pointer transition-colors"
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
                    className="w-12 h-12 text-center text-lg font-semibold bg-background border-2 border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
                    placeholder="0"
                  />
                ))}
              </div>

              {/* OTP Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleOTPVerification}
                  disabled={isLoading || otp.join('').length !== 6}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md"
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Verify OTP'}
                </Button>

                <Button
                  onClick={generateOTP}
                  disabled={isLoading || otpCooldown > 0}
                  variant="outline"
                  className="w-full border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground font-medium py-2 rounded-xl"
                >
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> :
                    otpCooldown > 0 ? `Wait ${otpCooldown}s` : 'Generate New OTP'}
                </Button>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {success && <p className="text-sm text-green-500 text-center">{success}</p>}
            </div>
          )}

          {/* Admin Choice Step */}
          {step === 'admin-choice' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Admin System Unlocked</h3>
                <p className="text-sm text-muted-foreground">Choose your action</p>
                {otpVerified && <p className="text-xs text-green-500 mt-1">✅ OTP Verified</p>}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setStep('admin-create')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-md"
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Create New Admin Account
                </Button>

                <Button
                  onClick={() => setStep('admin-login')}
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/10 font-semibold py-3 rounded-xl"
                >
                  <LogIn className="mr-2 h-4 w-4" /> Login as Existing Admin
                </Button>
              </div>

              {success && <p className="text-sm text-green-500 text-center">{success}</p>}
            </div>
          )}

          {/* Admin Creation Step */}
          {step === 'admin-create' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Create Admin Account</h3>
                <p className="text-sm text-muted-foreground">Create admin account with any email</p>
                {otpVerified && <p className="text-xs text-green-500 mt-1">✅ OTP Verified</p>}
              </div>

              {/* Back Button */}
              <Button
                onClick={() => setStep('admin-choice')}
                variant="outline"
                className="w-full border-input bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent font-medium py-2 rounded-xl"
              >
                ← Back to Admin Choice
              </Button>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="any@email.com"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {success && <p className="text-sm text-green-500 text-center">{success}</p>}

              <Button
                onClick={handleAdminCreation}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-md"
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Create Admin Account'}
              </Button>
            </div>
          )}

          {/* Admin Login Step */}
          {step === 'admin-login' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Admin Login</h3>
                <p className="text-sm text-muted-foreground">Login with existing admin credentials</p>
                {otpVerified && <p className="text-xs text-green-500 mt-1">✅ OTP Verified</p>}
              </div>

              {/* Back Button */}
              <Button
                onClick={() => setStep('admin-choice')}
                variant="outline"
                className="w-full border-input bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent font-medium py-2 rounded-xl"
              >
                ← Back to Admin Choice
              </Button>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@email.com"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              {success && <p className="text-sm text-green-500 text-center">{success}</p>}

              <Button
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-md"
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

  // OTP Verification State
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Clear messages when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSignInError('');
    setSignUpError('');
    setSignUpSuccess('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setVerificationStep(false);
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

  const forgotPasswordForm = useForm<{ email: string }>({
    defaultValues: { email: "" }
  });

  // Update form values when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      signInForm.setValue('email', initialEmail);
      signUpForm.setValue('email', initialEmail);
    }
  }, [initialEmail, signInForm, signUpForm]);

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`user-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-focus previous input on backspace
    if (!value && index > 0) {
      const prevInput = document.getElementById(`user-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter 6-digit code');
      return;
    }

    setIsLoading(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verificationEmail,
          otp: otpString
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOtpSuccess('Email verified successfully! Signing you in...');

        setTimeout(async () => {
          // Attempt to sign in with the credentials they just used
          const values = signUpForm.getValues();
          const result = await signIn("credentials", {
            email: verificationEmail,
            password: values.password,
            redirect: false,
          });

          if (result?.ok) {
            setOpen(false);
            router.refresh();
            router.push("/");
          } else {
            // Fallback if auto-login fails
            setVerificationStep(false);
            setActiveTab('sign-in');
            setSignInError('Verification successful. Please sign in.');
          }
        }, 1500);
      } else {
        setOtpError(data.message || 'Verification failed');
      }
    } catch (error) {
      setOtpError('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpCooldown > 0) return;

    setIsLoading(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOtpSuccess('Verification code resent!');
        setOtpCooldown(60);
        const interval = setInterval(() => {
          setOtpCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setOtpError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      setOtpError('Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  async function onSignUpSubmit(values: z.infer<typeof signUpSchema>) {
    setIsLoading(true);
    setSignUpError('');
    setSignUpSuccess('');

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requireVerification) {
          setVerificationEmail(values.email);
          setVerificationStep(true);
          setOtpSuccess('Verification code sent to your email');
        } else {
          setSignUpSuccess("Account created! Redirecting...");
          const result = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
          });

          if (result?.ok) {
            setOpen(false);
            router.refresh();
            router.push("/");
          }
        }
      } else {
        setSignUpError(data.message || "Registration failed.");
      }
    } catch (error) {
      setSignUpError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSignInSubmit(values: z.infer<typeof signInSchema>) {
    setIsLoading(true);
    setSignInError('');

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setSignInError("Invalid email or password.");
      } else {
        setOpen(false);
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      setSignInError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onForgotPasswordSubmit(values: { email: string }) {
    if (!values.email) {
      setForgotPasswordError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSuccess("Password reset link sent to your email.");
      } else {
        setForgotPasswordError(data.message || "Failed to send reset link.");
      }
    } catch (error) {
      setForgotPasswordError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // If in verification step, show OTP UI
  if (verificationStep) {
    return (
      <div className="space-y-6 py-4 px-2">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-foreground">Verify Your Email</h3>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to <span className="font-medium text-foreground">{verificationEmail}</span>
          </p>
        </div>

        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`user-otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-12 h-12 text-center text-lg font-semibold border-2 border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground transition-all"
              placeholder="-"
            />
          ))}
        </div>

        {otpError && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">
            {otpError}
          </div>
        )}

        {otpSuccess && (
          <div className="p-3 rounded-lg bg-green-500/10 text-green-500 text-sm text-center font-medium">
            {otpSuccess}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleVerifyOtp}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 shadow-lg"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Email"}
          </Button>

          <div className="flex justify-between items-center px-1">
            <button
              onClick={() => setVerificationStep(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleResendOtp}
              disabled={isLoading || otpCooldown > 0}
              className={`text-sm font-medium transition-colors ${otpCooldown > 0
                ? 'text-muted-foreground cursor-not-allowed'
                : 'text-primary hover:text-primary/80'
                }`}
            >
              {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showAdminModal && (
        <AdminRegistrationModal
          onClose={() => setShowAdminModal(false)}
          onSuccess={() => {
            setShowAdminModal(false);
            setSignUpSuccess("Admin account created successfully! Please login.");
            setActiveTab("sign-in");
          }}
        />
      )}

      <Tabs defaultValue="sign-in" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-black/10 dark:bg-white/10 rounded-xl">
          <TabsTrigger
            value="sign-in"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all duration-200"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger
            value="sign-up"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all duration-200"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sign-in">
          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        {...field}
                        className="bg-background border-input focus:ring-2 focus:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-muted-foreground">Password</FormLabel>
                      <button
                        type="button"
                        onClick={() => setActiveTab("forgot-password")}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showSignInPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="bg-background border-input focus:ring-2 focus:ring-primary rounded-xl pr-10 text-foreground placeholder:text-muted-foreground transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
              </div>

              {signInError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                  {signInError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 border-0"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>



              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or With</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-background border-input hover:bg-accent hover:text-accent-foreground text-foreground h-10 rounded-xl transition-all">
                  <span className="mr-2 font-bold">G</span> Google
                </Button>
                <Button variant="outline" className="bg-background border-input hover:bg-accent hover:text-accent-foreground text-foreground h-10 rounded-xl transition-all">
                  <span className="mr-2">🍎</span> Apple
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab("sign-up")}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="sign-up">
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        {...field}
                        className="bg-background border-input focus:ring-2 focus:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showSignUpPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
                          {...field}
                          className="bg-background border-input focus:ring-2 focus:ring-primary rounded-xl pr-10 text-foreground placeholder:text-muted-foreground transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {signUpError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                  {signUpError}
                </div>
              )}

              {signUpSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 text-green-500 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                  {signUpSuccess}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 border-0"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
              </Button>

              <Button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg border-0"
              >
                <Crown className="mr-2 h-4 w-4" /> Register as Admin
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or With</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-background border-input hover:bg-accent hover:text-accent-foreground text-foreground h-10 rounded-xl transition-all">
                  <span className="mr-2 font-bold">G</span> Google
                </Button>
                <Button variant="outline" className="bg-background border-input hover:bg-accent hover:text-accent-foreground text-foreground h-10 rounded-xl transition-all">
                  <span className="mr-2">🍎</span> Apple
                </Button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab("sign-in")}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="forgot-password">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Reset Password</h3>
              <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <Input
                  {...forgotPasswordForm.register("email")}
                  placeholder="you@example.com"
                  className="bg-background border-input focus:ring-2 focus:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground transition-all"
                />
              </div>

              {forgotPasswordError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-medium">
                  {forgotPasswordError}
                </div>
              )}

              {forgotPasswordSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 text-green-500 text-sm text-center font-medium">
                  {forgotPasswordSuccess}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>

              <button
                type="button"
                onClick={() => setActiveTab("sign-in")}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
