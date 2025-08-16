'use client';

import { ThemeProvider } from '@/components/theme-provider';

export default function AdminThemeProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
