import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  
  // Expire both possible names (dev & prod)
  res.cookies.set("next-auth.session-token", "", { 
    path: "/", 
    expires: new Date(0) 
  });
  res.cookies.set("__Secure-next-auth.session-token", "", { 
    path: "/", 
    expires: new Date(0) 
  });
  
  // Also clear any other NextAuth cookies that might exist
  res.cookies.set("next-auth.callback-url", "", { 
    path: "/", 
    expires: new Date(0) 
  });
  res.cookies.set("next-auth.csrf-token", "", { 
    path: "/", 
    expires: new Date(0) 
  });
  res.cookies.set("next-auth.state", "", { 
    path: "/", 
    expires: new Date(0) 
  });
  
  return res;
}
