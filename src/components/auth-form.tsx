"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Loader2, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
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

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
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
      <TabsList className="grid w-full grid-cols-2 bg-[#E3E1D9]/80 dark:bg-muted/50 border border-[#C7C8CC]/60 dark:border-border h-12 rounded-2xl p-2">
        <TabsTrigger 
          value="sign-in" 
          className="text-sm font-medium rounded-xl data-[state=active]:bg-[#F2EFE5] dark:data-[state=active]:bg-slate-300 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-700 dark:data-[state=inactive]:text-slate-700 data-[state=inactive]:bg-transparent dark:data-[state=inactive]:bg-slate-100/60 data-[state=active]:shadow-sm transition-all duration-200"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger 
          value="sign-up" 
          className="text-sm font-medium rounded-xl data-[state=active]:bg-[#F2EFE5] dark:data-[state=active]:bg-slate-300 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-700 dark:data-[state=inactive]:text-slate-700 data-[state=inactive]:bg-transparent dark:data-[state=inactive]:bg-slate-100/60 data-[state=active]:shadow-sm transition-all duration-200"
        >
          Sign Up
        </TabsTrigger>
      </TabsList>
      
      {/* Sign In Tab - Compact Design with Rich Whites */}
      <TabsContent value="sign-in" className="mt-3 sm:mt-4">
        <div className="space-y-3 sm:space-y-4">
          {/* Admin Login Note */}
          <div className="text-center p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-xs text-purple-700 dark:text-purple-300">
              👑 <strong>Admin users:</strong> Use your admin credentials to access unlimited features
            </p>
          </div>
          
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
    </Tabs>
  );
}
