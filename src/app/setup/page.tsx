'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { 
  Shield, 
  UserPlus, 
  LogIn, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Zap,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Crown,
  Settings
} from 'lucide-react';

interface SetupForm {
  email: string;
  password: string;
  username: string;
}

export default function SetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<'pin' | 'otp' | 'options' | 'signup' | 'login'>('pin');
  const [setupOTP, setSetupOTP] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminExists, setAdminExists] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [verifiedOTPToken, setVerifiedOTPToken] = useState(''); // Store the verified OTP token
  const [isGettingOTP, setIsGettingOTP] = useState(false);
  const [otpRequestMessage, setOtpRequestMessage] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isLimited: boolean; remainingTime: number }>({ isLimited: false, remainingTime: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupForm, setSignupForm] = useState<SetupForm>({
    email: 'sunnyshinde2601@gmail.com',
    password: '',
    username: 'super admin' // Pre-fill with a default username
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginForm, setLoginForm] = useState<SetupForm>({
    email: 'sunnyshinde2601@gmail.com',
    password: '',
    username: ''
  });

  // Particles state for floating animation
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    animationDelay: number;
    animationDuration: number;
  }>>([]);

  // Check if user is already authenticated and redirect them
  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    
    if (session?.user && session.user.isAdmin) {
      console.log('✅ User already authenticated as admin, redirecting to dashboard');
      router.push('/admin/dashboard');
      return;
    }
  }, [session, status, router]);

  // Clear all messages when step changes
  useEffect(() => {
    console.log('🔄 Step changed to:', step);
    console.log('🔍 Current verifiedOTPToken:', verifiedOTPToken);
    
    // Don't clear messages when going to admin actions if OTP is already verified
    if (step === 'signup' || step === 'login') {
      if (otpVerified && verifiedOTPToken) {
        console.log('✅ Keeping OTP verification state for admin actions');
        return; // Don't clear messages, keep OTP state
      }
    }
    
    clearAllMessages();
  }, [step, otpVerified, verifiedOTPToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllMessages();
    };
  }, []);

  // Generate particles on client side only to prevent hydration mismatch
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 3 + Math.random() * 2
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  // Check System Lock status on page load
  useEffect(() => {
    const checkSystemLock = async () => {
      try {
        const response = await fetch('/api/admin/system-lock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'get-status' })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isLocked) {
            // System Lock is enabled, stay on PIN step
            setStep('pin');
            console.log('🔒 System Lock is enabled, PIN verification required');
          } else {
            // System Lock is disabled, go directly to OTP step
            setStep('otp');
            console.log('🔓 System Lock is disabled, proceeding to OTP');
          }
        }
      } catch (error) {
        console.error('Error checking system lock status:', error);
        // If there's an error, default to PIN step for security
        setStep('pin');
      }
    };

    checkSystemLock();
  }, []);

  // Prevent direct access to setup steps without proper verification
  useEffect(() => {
    if (step === 'otp' && !pinVerified) {
      // If someone tries to access OTP step without PIN verification, redirect back to PIN
      setStep('pin');
      setError('PIN verification required before proceeding');
      console.log('🔒 Redirecting to PIN step: PIN verification required');
    }
    
    if ((step === 'signup' || step === 'login') && !otpVerified) {
      // If someone tries to access admin actions without OTP verification, redirect back to OTP
      setStep('otp');
      setError('OTP verification required before proceeding');
      console.log('🔒 Redirecting to OTP step: OTP verification required');
    }
  }, [step, pinVerified, otpVerified]);

  // Force redirect to PIN step if System Lock is enabled and PIN not verified
  useEffect(() => {
    if (step !== 'pin' && !pinVerified) {
      // Check if we need to force redirect to PIN step
      const checkAndRedirect = async () => {
        try {
          const response = await fetch('/api/admin/system-lock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'get-status' })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.isLocked && !pinVerified) {
              setStep('pin');
              setError('System Lock is enabled. PIN verification required.');
              console.log('🔒 Force redirect to PIN: System Lock enabled');
            }
          }
        } catch (error) {
          console.error('Error checking system lock for redirect:', error);
        }
      };

      checkAndRedirect();
    }
  }, [step, pinVerified]);

  // Add URL-based access control
  useEffect(() => {
    // Check if someone is trying to access setup page directly
    const urlParams = new URLSearchParams(window.location.search);
    const directAccess = urlParams.get('direct');
    
    if (directAccess && !pinVerified) {
      // Someone is trying to access setup directly, force PIN verification
      setStep('pin');
      setError('Direct access not allowed. PIN verification required.');
      console.log('🔒 Direct access blocked: PIN verification required');
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [pinVerified]);

  // Add session-based access control
  useEffect(() => {
    // Check if there's an active session that might bypass PIN
    const checkSessionAccess = async () => {
      try {
        const response = await fetch('/api/admin/setup');
        if (response.ok) {
          const data = await response.json();
          if (data.existingAdmin && !pinVerified) {
            // Admin exists but PIN not verified, this might be a security issue
            console.log('⚠️ Admin exists but PIN not verified - potential security issue');
            // Don't redirect here, let the user proceed if they have valid credentials
          }
        }
      } catch (error) {
        console.error('Error checking session access:', error);
      }
    };

    checkSessionAccess();
  }, [pinVerified]);

  // Add browser refresh protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step !== 'pin' && !pinVerified) {
        // Warn user about losing progress
        e.preventDefault();
        e.returnValue = 'You will lose your verification progress. Are you sure?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, pinVerified]);

  // Add direct access blocking
  useEffect(() => {
    // Block direct access to setup page if System Lock is enabled
    const blockDirectAccess = async () => {
      try {
        const response = await fetch('/api/admin/system-lock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'get-status' })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isLocked && !pinVerified) {
            // System Lock is enabled but PIN not verified
            // This could be someone trying to access setup directly
            console.log('🚫 Direct access blocked: System Lock enabled, PIN required');
            
            // Force PIN step
            setStep('pin');
            setError('System Lock is active. PIN verification required to access setup.');
          }
        }
      } catch (error) {
        console.error('Error checking direct access:', error);
      }
    };

    // Check on component mount and when PIN verification status changes
    blockDirectAccess();
  }, [pinVerified]);

  // Add navigation blocking
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent back navigation if PIN not verified
      if (!pinVerified && step !== 'pin') {
        event.preventDefault();
        setStep('pin');
        setError('PIN verification required before proceeding.');
        console.log('🔒 Back navigation blocked: PIN verification required');
        
        // Push current state to prevent back navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pinVerified, step]);

  // Add final security check
  useEffect(() => {
    // Final security check: ensure PIN verification is enforced
    const enforceSecurity = () => {
      if (step !== 'pin' && !pinVerified) {
        // This should never happen, but if it does, force PIN step
        console.error('🚨 Security violation: PIN bypass detected, forcing PIN step');
        setStep('pin');
        setError('Security violation detected. PIN verification required.');
        
        // Log the violation for security monitoring
        console.warn('Security violation details:', {
          step,
          pinVerified,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
    };

    // Check every time the component updates
    enforceSecurity();
  });

  // Add development mode security warnings
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Setup page security features enabled:');
      console.log('- PIN verification required when System Lock is enabled');
      console.log('- Direct access blocking active');
      console.log('- Navigation blocking active');
      console.log('- Security violation logging active');
    }
  }, []);

  // OTP verification handler
  const handleOtpVerification = async () => {
    console.log('🔍 Debug: Starting OTP verification...');
    console.log('🔍 Debug: setupOTP =', setupOTP);
    console.log('🔍 Debug: setupOTP.trim() =', setupOTP.trim());
    
    if (!setupOTP.trim()) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    if (!/^\d{6}$/.test(setupOTP.trim())) {
      setError('Invalid OTP format. Please enter exactly 6 digits.');
      return;
    }
    
    console.log('🔐 Attempting to verify OTP...');
    setIsVerifying(true);
    // Clear ALL message states to prevent conflicts
    setError('');
    setSuccess('');
    setOtpRequestMessage('');
    
    try {
      const requestBody = { 
        action: 'verify-token', 
        token: setupOTP.trim(), 
        email: 'sunnyshinde2601@gmail.com' 
      };
      console.log('📤 Sending request:', requestBody);
      
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (response.ok && data.success) {
        setOtpVerified(true);
        setVerifiedOTPToken(setupOTP.trim()); // Store the verified OTP token
        console.log('✅ OTP verified and token stored:', setupOTP.trim());
        setSuccess('OTP verified successfully!');
        setError('');
        setOtpRequestMessage('');
        if (data.adminExists) {
          setAdminExists(true);
        }
        setTimeout(() => {
          setSuccess('');
          setStep('options');
        }, 1000);
      } else {
        console.log('❌ OTP verification failed:', data.message);
        setError(data.message || 'OTP verification failed');
        setSuccess('');
        setOtpRequestMessage('');
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setError('Failed to verify OTP. Please try again.');
      setSuccess('');
      setOtpRequestMessage('');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP request for production
  const handleGetOTP = async () => {
    setIsGettingOTP(true);
    // Clear ALL message states to prevent conflicts
    setError('');
    setSuccess('');
    setOtpRequestMessage('');
    
    try {
      const response = await fetch('/api/admin/request-setup-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sunnyshinde2601@gmail.com'
        })
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Only set success message, clear everything else
        setOtpRequestMessage('✅ OTP generated and sent to admin email. Please check your email and enter the 6-digit code below.');
        setError('');
        setSuccess('');
      } else {
        // Only set error message, clear success message
        setError(data.message || 'Failed to generate OTP. Please try again.');
        setOtpRequestMessage('');
        setSuccess('');
      }
    } catch (error) {
      console.error('❌ Error requesting OTP:', error);
      setError('Failed to request OTP. Please check your connection and try again.');
      setOtpRequestMessage('');
      setSuccess('');
    } finally {
      setIsGettingOTP(false);
    }
  };

  // Handle admin creation
  const handleCreateAdmin = async () => {
    console.log('🔍 Debug: Starting admin creation...');
    console.log('🔍 Debug: verifiedOTPToken =', verifiedOTPToken);
    console.log('🔍 Debug: otpVerified =', otpVerified);
    console.log('🔍 Debug: signupForm =', signupForm);
    console.log('🔍 Debug: confirmPassword =', confirmPassword);
    
    if (!signupForm.email || !signupForm.password || !signupForm.username) {
      console.log('❌ Validation failed: Missing fields');
      setError('Please fill in all fields');
      return;
    }
    if (signupForm.password !== confirmPassword) {
      console.log('❌ Validation failed: Passwords do not match');
      setError('Passwords do not match');
      return;
    }
    if (signupForm.password.length < 8) {
      console.log('❌ Validation failed: Password too short');
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!verifiedOTPToken) {
      console.log('❌ Validation failed: No verified OTP token');
      setError('OTP verification required. Please verify your OTP first.');
      return;
    }

    console.log('🔐 Creating admin with verified token:', verifiedOTPToken);
    setIsLoading(true);
    setError('');
    
    try {
              const response = await fetch('/api/admin/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create-admin',
            email: signupForm.email,
            password: signupForm.password,
            username: signupForm.username,
            token: verifiedOTPToken || 'EXISTING_ADMIN' // Send the verified OTP token or EXISTING_ADMIN
          })
        });
      
              const data = await response.json();
        console.log('📥 Admin creation response:', data);
        
        if (response.ok && data.success) {
          // ✅ Admin creation successful - NOW clear the OTP token
          setVerifiedOTPToken('');
          setOtpVerified(false);
          setSuccess('Admin user created successfully! Attempting auto-login...');
          
          // Immediate auto-login attempt
          try {
            console.log('🔄 Attempting immediate auto-login...');
            
            // Use NextAuth signIn with the created credentials
            const result = await signIn('admin-credentials', {
              email: signupForm.email,
              password: signupForm.password,
              redirect: false
            });
            
            console.log('🔍 Auto-login result:', result);
            
            if (result?.ok) {
              console.log('✅ Auto-login successful! Redirecting to admin panel...');
              setSuccess('Login successful! Redirecting to admin panel...');
              
              // Force redirect to admin dashboard
              setTimeout(() => {
                router.push('/admin/dashboard');
              }, 1000);
            } else {
              console.log('❌ Auto-login failed:', result?.error);
              setError(`Admin created but auto-login failed: ${result?.error || 'Unknown error'}. Please try manual login.`);
              setStep('login');
            }
          } catch (error) {
            console.error('❌ Auto-login error:', error);
            setError(`Admin created but auto-login failed: ${error}. Please try manual login.`);
            setStep('login');
          }
        } else {
          console.log('❌ Admin creation failed:', data.message);
          setError(`Failed to create admin user: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
      console.error('Error creating admin:', error);
      setError('Failed to create admin user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle admin login
  const handleAdminLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Attempting admin login...');
      console.log('🔍 Login credentials:', { email: loginForm.email, passwordLength: loginForm.password.length });
      
      // Use NextAuth signIn instead of direct fetch
      const result = await signIn('admin-credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false // Don't redirect automatically, we'll handle it
      });
      
      console.log('🔍 Login result:', result);
      
      if (result?.ok) {
        setSuccess('Login successful! Redirecting to admin panel...');
        console.log('✅ Login successful, attempting redirect to /admin/dashboard...');
        
        // Try to redirect immediately and also after a delay as backup
        try {
          router.push('/admin/dashboard');
          console.log('🚀 Router.push called successfully');
        } catch (redirectError) {
          console.error('❌ Router.push failed:', redirectError);
        }
        
        // Backup redirect after delay
        setTimeout(() => {
          try {
            console.log('🔄 Backup redirect attempt...');
            router.push('/admin/dashboard');
          } catch (error) {
            console.error('❌ Backup redirect also failed:', error);
            setError('Login successful but redirect failed. Please navigate manually to /admin/dashboard');
          }
        }, 2000);
      } else {
        console.log('❌ Login failed:', result?.error);
        
        // More specific error messages
        if (result?.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please check your credentials.');
        } else if (result?.error === 'AccessDenied') {
          setError('Access denied. Your account may be locked or suspended.');
        } else {
          setError(`Login failed: ${result?.error || 'Unknown error'}. Please try again.`);
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(`Login failed: ${error}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to OTP step - INTENTIONAL RESET
  const goBackToOtp = () => {
    setStep('otp');
    setOtpVerified(false);
    setVerifiedOTPToken(''); // Clear the verified token when going back
    setSetupOTP(''); // Clear the OTP input field
    clearAllMessages();
  };

  // Clear all messages (but preserve OTP token)
  const clearAllMessages = () => {
    setError('');
    setSuccess('');
    setOtpRequestMessage('');
    // Don't clear verifiedOTPToken - it needs to persist across steps until completion
  };

  // Go back to options step
  const goBackToOptions = () => {
    setStep('options');
    clearAllMessages();
  };

  // Add OTP timeout check (5 minutes)
  useEffect(() => {
    if (verifiedOTPToken && otpVerified) {
      const timeout = setTimeout(() => {
        console.log('⏰ OTP expired after 5 minutes');
        setVerifiedOTPToken('');
        setOtpVerified(false);
        setError('OTP has expired. Please request a new one.');
        setStep('otp');
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timeout);
    }
  }, [verifiedOTPToken, otpVerified]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      {/* Show loading while checking session */}
      {status === 'loading' && (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-white">Checking authentication...</p>
          </div>
        </div>
      )}

      {/* Show setup page only if not authenticated */}
      {status !== 'loading' && !session?.user?.isAdmin && (
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-2xl">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Capsera Admin
            </h1>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {step === 'pin' && 'Enter 6-digit PIN to continue'}
            {step === 'otp' && 'Enter 6-digit OTP to continue'}
            {step === 'options' && 'Choose your next action'}
            {step === 'signup' && 'Create your admin account'}
            {step === 'login' && 'Access your admin panel'}
          </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
                             {[
                 { key: 'pin', label: 'Verify PIN', icon: Key, active: step === 'pin', completed: pinVerified },
                 { key: 'otp', label: 'Verify OTP', icon: Key, active: step === 'otp', completed: otpVerified },
                 { key: 'options', label: 'Choose Action', icon: Settings, active: step === 'options', completed: ['options', 'signup', 'login'].includes(step) },
                 { key: 'signup', label: 'Create Admin', icon: UserPlus, active: step === 'signup', completed: step === 'login' },
                 { key: 'login', label: 'Access Panel', icon: LogIn, active: step === 'login', completed: false }
               ].map((stepInfo, index) => (
                <div key={stepInfo.key} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    stepInfo.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : stepInfo.active 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    {stepInfo.completed ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <stepInfo.icon className="w-6 h-6" />
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                      stepInfo.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 md:p-8 max-w-2xl mx-auto">
            {/* PIN Verification Step */}
            {step === 'pin' && (
              <div className="space-y-6">
                {/* System Lock Warning */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                    <Lock className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">System Lock Active</h2>
                  <p className="text-red-600 font-semibold text-base">
                    PIN verification required to access setup
                  </p>
                </div>

                {/* PIN Input */}
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter Your 6-Digit PIN
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={setupPin}
                        onChange={(e) => setSetupPin(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest transition-all duration-300 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Verify Button */}
                  <div className="text-center">
                    <button
                      onClick={async () => {
                        setIsVerifyingPin(true);
                        setError('');
                        setSuccess('');
                        try {
                          const response = await fetch('/api/admin/verify-setup-pin', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              pin: setupPin.trim(),
                              email: 'sunnyshinde2601@gmail.com'
                            })
                          });
                          const data = await response.json();
                          
                          if (response.ok && data.success) {
                            setPinVerified(true);
                            setVerifiedOTPToken(setupPin.trim());
                            setSuccess('PIN verified successfully!');
                            setError('');
                            setTimeout(() => {
                              setSuccess('');
                              setStep('otp');
                            }, 1000);
                          } else {
                            setError(data.message || 'Invalid PIN. Please try again.');
                            setSuccess('');
                          }
                        } catch (error) {
                          console.error('❌ PIN verification error:', error);
                          setError('Failed to verify PIN. Please try again.');
                          setSuccess('');
                        } finally {
                          setIsVerifyingPin(false);
                        }
                      }}
                      disabled={isVerifyingPin || !setupPin.trim()}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg text-base transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed"
                    >
                      {isVerifyingPin ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                          Verifying PIN...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2 inline" />
                          Verify PIN
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="text-center">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="text-center">
                      <p className="text-green-600 text-sm font-medium">{success}</p>
                    </div>
                  )}


                </div>
              </div>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Get Your Setup OTP</h2>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Click 'Get OTP' to generate and send a 6-digit code to your authorized admin email
                  </p>
                </div>

                {/* Get OTP Button */}
                <div className="text-center space-y-3">
                  <button
                    onClick={handleGetOTP}
                    disabled={isGettingOTP}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg text-base transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGettingOTP ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                        Generating OTP...
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5 mr-2 inline" />
                        Get OTP
                      </>
                    )}
                  </button>
                  
                  {/* Skip OTP for Existing Admin */}
                  <div className="text-center">
                    <button
                      onClick={async () => {
                        try {
                          console.log('🔍 Checking if admin already exists...');
                          const response = await fetch('/api/admin/setup', {
                            method: 'GET'
                          });
                          const data = await response.json();
                          
                          if (data.existingAdmin) {
                            console.log('✅ Admin exists, skipping OTP verification');
                            setOtpVerified(true);
                            setVerifiedOTPToken('EXISTING_ADMIN');
                            setSuccess('Admin account found! Skipping OTP verification.');
                            setTimeout(() => {
                              setSuccess('');
                              setStep('options');
                            }, 1000);
                          } else {
                            setError('No admin account found. Please verify OTP first.');
                          }
                        } catch (error) {
                          console.error('❌ Admin check failed:', error);
                          setError('Failed to check admin status. Please use OTP verification.');
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                    >
                      Already have admin account? Skip OTP
                    </button>
                  </div>
                </div>

                {/* Success Message */}
                {otpRequestMessage && (
                  <div className="text-center">
                    <p className="text-green-600 text-sm font-medium">{otpRequestMessage}</p>
                  </div>
                )}

                {/* OTP Input */}
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter Your 6-Digit OTP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={setupOTP}
                        onChange={(e) => setSetupOTP(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest transition-all duration-300 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Verify Button */}
                  <div className="text-center">
                    <button
                      onClick={handleOtpVerification}
                      disabled={isVerifying || !setupOTP.trim()}
                      className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg text-base transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                          Verifying OTP...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2 inline" />
                          Verify OTP
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="text-center">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="text-center">
                      <p className="text-green-600 text-sm font-medium">{success}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Options Step */}
            {step === 'options' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">What would you like to do?</h2>
                  <p className="text-gray-600 text-sm">Choose your next action to continue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {/* Create Admin Option */}
                  <button
                    onClick={() => {
                      console.log('🚀 Moving to signup step with token:', verifiedOTPToken);
                      setStep('signup');
                    }}
                    className="group relative p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-300 rounded-xl hover:from-blue-500/20 hover:to-purple-500/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Create Admin Account</h3>
                      <p className="text-gray-600 text-sm">Set up a new administrator account for the system</p>
                      
                      {/* OTP Status Indicator */}
                      {verifiedOTPToken && (
                        <div className="flex items-center justify-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span>OTP Verified ✓</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                        <span className="mr-2">Get Started</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </button>

                  {/* Login Option */}
                  <button
                    onClick={() => setStep('login')}
                    className="group relative p-6 bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-300 rounded-xl hover:from-green-500/20 hover:to-teal-500/20 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <LogIn className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Login to Admin Panel</h3>
                      <p className="text-gray-600 text-sm">Access your existing administrator account</p>
                      <div className="flex items-center justify-center text-green-600 group-hover:text-green-700 transition-colors duration-300">
                        <span className="mr-2">Continue</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Back Button */}
                <div className="text-center">
                  <button
                    onClick={goBackToOtp}
                    className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to OTP
                  </button>
                </div>
              </div>
            )}

                        {/* Signup Step */}
            {step === 'signup' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Create Admin Account</h2>
                  <p className="text-gray-600 text-sm">Set up your administrator credentials</p>
                  
                  {/* OTP Status Banner */}
                  {verifiedOTPToken && (
                    <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center justify-center text-green-700 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>OTP Verified - You can now create your admin account</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        placeholder="admin@capsera.com"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Username Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={signupForm.username}
                        onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                        placeholder="admin"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleCreateAdmin}
                    disabled={isLoading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg text-base transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2 inline" />
                        Create Admin Account
                      </>
                    )}
                  </button>

                  <button
                    onClick={goBackToOptions}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-base transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 inline" />
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Login Step */}
            {step === 'login' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Admin Login</h2>
                  <p className="text-gray-600 text-sm">Access your administrator panel</p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="admin@capsera.com"
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleAdminLogin}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg text-base transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                        Logging In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2 inline" />
                        Login to Admin Panel
                      </>
                    )}
                  </button>

                  <button
                    onClick={goBackToOptions}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-base transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 inline" />
                    Back
                  </button>
                </div>
              </div>
            )}




          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-400 text-sm">
            <p>Capsera Admin Setup • Secure • Professional</p>
          </div>
        </div>
      </div>
        )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
