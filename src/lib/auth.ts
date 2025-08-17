
import type {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Debug: Check NextAuth environment variables
console.log('🔐 NextAuth Environment Check:', {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'undefined',
  NODE_ENV: process.env.NODE_ENV || 'undefined',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing'
});

export const authOptions: NextAuthOptions = {
  // Use JWT strategy only - no database sessions
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day (shorter for security)
  },
  jwt: {
    maxAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // Explicit cookie config so we can nuke it reliably
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials.password) {
          throw new Error('Missing email or password.');
        }

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          // Security best practice: use a generic error message
          // to prevent user enumeration attacks.
          throw new Error('Invalid credentials.');
        }
        
        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          throw new Error('Invalid credentials.');
        }
        
        // Update user's last login time and status
        await User.findByIdAndUpdate(user._id, { 
          lastLoginAt: new Date(),
          status: 'active' // Ensure user is marked as active on login
        });
        
        // Return a plain, serializable object. This is the critical fix.
        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
          isAdmin: user.isAdmin || false,
          isVerified: user.isVerified || false,
          image: user.image || null
        };
      },
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Admin auth: Missing credentials');
          return null;
        }

        try {
          console.log('🔐 Admin auth: Attempting login for:', credentials.email);
          
          // Find admin user using AdminUser model
          const adminUser = await AdminUser.findOne({
            email: credentials.email.toLowerCase(),
            isAdmin: true
          }).select('+password');

          if (!adminUser) {
            console.log('❌ Admin auth: No admin user found with email:', credentials.email);
            return null;
          }

          console.log('✅ Admin auth: Found admin user:', { id: adminUser._id, role: adminUser.role });

          // Check if account is locked
          if (adminUser.isLocked) {
            console.log('❌ Admin auth: Account is locked for:', credentials.email);
            return null;
          }

          // Check if account is suspended
          if (adminUser.status === 'suspended') {
            console.log('❌ Admin auth: Account is suspended for:', credentials.email);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, adminUser.password);
          if (!isPasswordValid) {
            console.log('❌ Admin auth: Invalid password for:', credentials.email);
            
            // Increment failed login attempts
            await AdminUser.findByIdAndUpdate(adminUser._id, {
              $inc: { failedLoginAttempts: 1 },
              lastFailedLoginAt: new Date()
            });
            
            return null;
          }

          // Reset failed login attempts on successful login
          await AdminUser.findByIdAndUpdate(adminUser._id, {
            failedLoginAttempts: 0,
            lastLoginAt: new Date(),
            status: 'active'
          });

          console.log('✅ Admin auth: Login successful for:', credentials.email);

          // Return admin user data
          return {
            id: adminUser._id.toString(),
            email: adminUser.email,
            username: adminUser.username || adminUser.name,
            role: adminUser.role,
            isAdmin: adminUser.isAdmin,
            isVerified: adminUser.isVerified || false,
            image: adminUser.image || null
          };

        } catch (error) {
          console.error('❌ Admin auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log('🔐 JWT callback - Initial sign in for user:', user.email);
        
        // Add user data to token
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
        token.isVerified = user.isVerified;
        token.image = user.image;
        token.lastValidated = Math.floor(Date.now() / 1000);
        
        console.log('🔐 JWT callback - Token created:', { 
          id: token.id, 
          email: token.email, 
          role: token.role, 
          isAdmin: token.isAdmin 
        });
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('🔐 Session callback - Token:', { id: token.id, role: token.role, email: token.email, isAdmin: token.isAdmin, exp: token.exp });
      
      // Check if token has expired
      if (token.exp && Math.floor(Date.now() / 1000) > token.exp) {
        console.log('🔐 Session expired, clearing user data');
        return { ...session, user: { id: '', email: '', name: '' } };
      }
      
      if (token && session.user) {
        // JWT-only strategy: No database validation needed
        // Token contains all necessary user information
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.username = token.username as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.image = (token as any).image || null;
        
        console.log('🔐 Session callback - Updated session user:', { 
          id: session.user.id, 
          role: session.user.role, 
          email: session.user.email,
          isAdmin: session.user.isAdmin
        });
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle admin credentials provider
      if (account?.provider === 'admin-credentials') {
        // Admin users are already validated in the authorize callback
        return (user as any).role?.name === 'admin';
      }
      
      // Regular credentials provider validation
      if (account?.provider === 'credentials') {
        try {
          await dbConnect();
          const userExists = await User.findById(user.id);
          return !!userExists; // Only allow sign in if user exists in database
        } catch (error) {
          console.error('Error validating user during sign in:', error);
          return false;
        }
      }
      return true;
    }
  },
  // Add event handlers for better session management
  events: {
    async signOut({ token, session }) {
      // Minimal sign out logging
    },
    async session({ session, token }) {
      // Session event logging disabled for cleaner console
    }
  },
  // Remove auto-redirect configuration to prevent auto-login loops
  // pages: {
  //   signIn: '/',  // ← This was causing auto-redirect to homepage
  // },
  // Disable debug mode to reduce console noise
  debug: false,
};
