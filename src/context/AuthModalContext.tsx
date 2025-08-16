
"use client";

import { createContext, useState, useContext, ReactNode } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  initialEmail: string;
  setInitialEmail: (email: string) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [initialEmail, setInitialEmail] = useState('');

  return (
    <AuthModalContext.Provider value={{ isOpen, setOpen, initialEmail, setInitialEmail }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
