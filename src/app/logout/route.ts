import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  
  // CRITICAL: Add cache-busting headers to prevent session revival
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  res.headers.set('Surrogate-Control', 'no-store');
  
  // Expire both possible names (dev & prod) with more aggressive clearing
  res.cookies.set("next-auth.session-token", "", { 
    path: "/", 
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.cookies.set("__Secure-next-auth.session-token", "", { 
    path: "/", 
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  });
  
  // Clear ALL possible NextAuth cookies with multiple variations
  const cookieNames = [
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url", 
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.state",
    "__Secure-next-auth.state",
    "next-auth.session",
    "__Secure-next-auth.session",
    "next-auth.provider",
    "next-auth.verifier"
  ];
  
  cookieNames.forEach(cookieName => {
    // Clear with multiple variations to ensure complete removal
    res.cookies.set(cookieName, "", { 
      path: "/", 
      expires: new Date(0),
      maxAge: 0
    });
    res.cookies.set(cookieName, "", { 
      path: "/", 
      expires: new Date(0),
      maxAge: 0,
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
    });
  });
  
  return res;
}
