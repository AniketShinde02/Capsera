'use client';

import { AdminModeProvider } from '@/context/AdminModeContext';
import { ReactNode } from 'react';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <AdminModeProvider>
      {children}
    </AdminModeProvider>
  );
}
