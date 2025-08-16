
"use client"

import * as React from "react"
import { ThemeProvider } from '@/components/theme-provider';
import { SessionProvider } from 'next-auth/react';
import { AuthModalProvider } from "@/context/AuthModalContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider
        // Never automatically refetch - completely disable
        refetchInterval={0}
        // Never refetch on window focus
        refetchOnWindowFocus={false}
        // Don't refetch when offline
        refetchWhenOffline={false}
      >
        <AuthModalProvider>
          {children}
        </AuthModalProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
