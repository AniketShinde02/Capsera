"use client";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/context/AuthModalContext";

export function SignUpButton({ className = "" }: { className?: string }) {
  const { setOpen } = useAuthModal();
  
  return (
    <Button onClick={() => setOpen(true)} className={className + " bg-slate-800 text-white hover:bg-slate-500 dark:bg-white dark:text-black dark:hover:bg-white/90"}>
      Sign Up Free
    </Button>
  );
}
