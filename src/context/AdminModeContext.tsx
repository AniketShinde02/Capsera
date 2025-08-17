'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AdminModeContextType {
  isAdminMode: boolean;
  currentMode: 'admin' | 'user';
  switchToUserMode: () => void;
  switchToAdminMode: () => void;
  canBrowseAsUser: boolean;
  hasRegularUserAccount: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const { data: session, update } = useSession();
  const [isAdminMode, setIsAdminMode] = useState(true);
  const [currentMode, setCurrentMode] = useState<'admin' | 'user'>('admin');

  // Check if user is admin and has dual-mode capability
  const isAdmin = session?.isAdmin;
  const canBrowseAsUser = session?.canBrowseAsUser;
  const hasRegularUserAccount = session?.hasRegularUserAccount;

  useEffect(() => {
    // Set initial mode based on session
    if (session) {
      const mode = session.mode || (session.isAdmin ? 'admin' : 'user');
      setIsAdminMode(mode === 'admin');
      setCurrentMode(mode);
    }
  }, [session]);

  const switchToUserMode = async () => {
    if (!isAdmin || !canBrowseAsUser) return;

    try {
      await update({
        ...session,
        isAdmin: false,
        role: 'user',
        mode: 'user'
      });
      setIsAdminMode(false);
      setCurrentMode('user');
    } catch (error) {
      console.error('Error switching to user mode:', error);
    }
  };

  const switchToAdminMode = async () => {
    if (!isAdmin) return;

    try {
      await update({
        ...session,
        isAdmin: true,
        role: session.role || 'admin',
        mode: 'admin'
      });
      setIsAdminMode(true);
      setCurrentMode('admin');
    } catch (error) {
      console.error('Error switching to admin mode:', error);
    }
  };

  const value: AdminModeContextType = {
    isAdminMode,
    currentMode,
    switchToUserMode,
    switchToAdminMode,
    canBrowseAsUser: canBrowseAsUser || false,
    hasRegularUserAccount: hasRegularUserAccount || false,
  };

  return (
    <AdminModeContext.Provider value={value}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error('useAdminMode must be used within an AdminModeProvider');
  }
  return context;
}
