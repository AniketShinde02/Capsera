
"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthForm } from "./auth-form";
import { Sparkles } from "lucide-react";

export function AuthModal() {
  const { isOpen, setOpen, initialEmail, setInitialEmail } = useAuthModal();

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    // Clear initial email when modal is closed
    if (!open) {
      setInitialEmail('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[80vw] max-w-xs sm:max-w-sm md:max-w-md bg-[#F2EFE5]/95 dark:bg-background/95 backdrop-blur-sm border border-[#C7C8CC]/80 dark:border-border rounded-2xl shadow-2xl p-0 max-h-[85vh] overflow-y-auto">
        {/* Header Section - Compact & Smooth Design with Rich Whites */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#F2EFE5] to-[#E3E1D9] dark:from-primary/20 dark:to-secondary/20 rounded-full flex items-center justify-center">
            <img 
              src="/favicon.svg" 
              alt="Capsera Logo" 
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8"
            />
          </div>
          <DialogHeader className="space-y-2 text-center w-full">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-foreground leading-tight text-center !text-center">
              Welcome to Capsera
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-muted-foreground leading-relaxed max-w-xs mx-auto text-center !text-center">
              Sign in or create an account to start generating captions.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Form Section - Compact & Smooth Design with Rich Whites */}
        <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
          <AuthForm initialEmail={initialEmail} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
