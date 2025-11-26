
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

// NextAuth configuration

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

        // Try regular users first
        let user = await (User as any).findOne({ email: credentials.email }).select('+password');
        let isAdminUser = false;

        // If not found, check adminusers collection
        if (!user) {
          const { db } = await connectToDatabase();
          const adminUsersCollection = db.collection('adminusers');
          const adminUser = await adminUsersCollection.findOne({
            email: credentials.email.toLowerCase()
          });

          if (adminUser) {
            user = adminUser;
            isAdminUser = true;
          }
        }

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
        if (isAdminUser) {
          const { db } = await connectToDatabase();
          const adminUsersCollection = db.collection('adminusers');
          await adminUsersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                lastLoginAt: new Date(),
                status: 'active',
                failedLoginAttempts: 0
              }
            }
          );
        } else {
          await (User as any).findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
            status: 'active'
          });
        }

        // Return a plain, serializable object. This is the critical fix.
        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username || user.name,
          role: user.role,
          isAdmin: isAdminUser || user.isAdmin || false,
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

          // Add timeout wrapper for database operations
          const dbOperation = async () => {
            // Use direct MongoDB connection instead of Mongoose to avoid timeout issues
            const { db } = await connectToDatabase();
            const adminUsersCollection = db.collection('adminusers');
            const usersCollection = db.collection('users');

            // Find admin user directly from MongoDB
            const adminUser = await adminUsersCollection.findOne({
              email: credentials.email.toLowerCase(),
              isAdmin: true
            });

            if (!adminUser) {
              console.log('❌ Admin auth: No admin user found with email:', credentials.email);
              return null;
            }

            console.log('✅ Admin auth: Found admin user:', {
              id: adminUser._id,
              email: adminUser.email,
              username: adminUser.username,
              role: adminUser.role
            });

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
              await adminUsersCollection.updateOne(
                { _id: adminUser._id },
                {
                  $inc: { failedLoginAttempts: 1 },
                  $set: { lastFailedLoginAt: new Date() }
                }
              );

              return null;
            }

            // Reset failed login attempts on successful login
            await adminUsersCollection.updateOne(
              { _id: adminUser._id },
              {
                $set: {
                  failedLoginAttempts: 0,
                  lastLoginAt: new Date(),
                  status: 'active'
                }
              }
            );

            // Check if admin user also has a regular user account
            let regularUser = await usersCollection.findOne({
              email: credentials.email.toLowerCase()
            });

            // If no regular user account exists, create one for seamless browsing
            if (!regularUser) {
              console.log('🔄 Admin auth: Creating regular user account for admin browsing...');

              try {
                const regularUserData = {
                  email: adminUser.email,
                  username: adminUser.username || adminUser.email.split('@')[0],
                  password: adminUser.password, // Use same password for convenience
                  firstName: adminUser.firstName || '',
                  lastName: adminUser.lastName || '',
                  phone: adminUser.phone || '',
                  isAdmin: false, // Regular user account
                  isVerified: true,
                  role: 'user',
                  status: 'active',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastLoginAt: new Date(),
                  profileImage: adminUser.profileImage || null,
                  preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                  }
                };

                const result = await usersCollection.insertOne(regularUserData);
                if (result.insertedId) {
                  regularUser = {
                    ...regularUserData,
                    _id: result.insertedId
                  };
                  console.log('✅ Admin auth: Regular user account created for admin browsing');
                }
              } catch (error) {
                console.warn('⚠️ Admin auth: Failed to create regular user account:', error);
                // Don't fail the login if regular user creation fails
              }
            }

            console.log('✅ Admin auth: Login successful for:', credentials.email);

            // Return admin user data with dual-mode capability
            // Use existing properties from adminUser if available, otherwise calculate from regularUser
            const adminUserData = {
              id: adminUser._id.toString(), // Always use admin user ID
              email: adminUser.email,
              username: adminUser.username || adminUser.name,
              role: adminUser.role,
              isAdmin: true, // Force isAdmin to true for admin credentials
              isVerified: adminUser.isVerified || false,
              image: adminUser.image || null,
              // Add dual-mode information - prioritize existing properties from adminUser
              hasRegularUserAccount: adminUser.hasRegularUserAccount !== undefined ? adminUser.hasRegularUserAccount : !!regularUser,
              regularUserId: adminUser.regularUserId || regularUser?._id?.toString(),
              canBrowseAsUser: adminUser.canBrowseAsUser !== undefined ? adminUser.canBrowseAsUser : true
            };

            console.log('🔐 Admin auth: Returning user data:', adminUserData);
            return adminUserData;
          };

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database operation timeout')), 10000); // 10 second timeout
          });

          const result = await Promise.race([dbOperation(), timeoutPromise]);
          return result as any;

        } catch (error: any) {
          console.error('❌ Admin auth error:', error);

          // Return null instead of throwing to prevent 500 errors
          if (error.message === 'Database operation timeout') {
            console.error('❌ Admin auth: Database operation timed out');
          } else {
            console.error('❌ Admin auth: Unexpected error:', error.message);
          }

          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'tier-credentials',
      name: 'Tier User Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Tier auth: Missing credentials');
          return null;
        }

        try {
          console.log('🔐 Tier auth: Attempting login for:', credentials.email);

          // Use direct MongoDB connection
          const { db } = await connectToDatabase();
          const adminUsersCollection = db.collection('adminusers');

          // Find tier user (non-admin users in adminusers collection)
          const tierUser = await adminUsersCollection.findOne({
            email: credentials.email.toLowerCase(),
            isAdmin: { $ne: true }, // Not an admin user
            status: 'active'
          });

          if (!tierUser) {
            console.log('❌ Tier auth: No tier user found with email:', credentials.email);
            return null;
          }

          console.log('✅ Tier auth: Found tier user:', {
            id: tierUser._id,
            email: tierUser.email,
            username: tierUser.username,
            role: tierUser.role
          });

          // Check if account is active
          if (tierUser.status !== 'active') {
            console.log('❌ Tier auth: Account is not active for:', credentials.email);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, tierUser.password);
          if (!isPasswordValid) {
            console.log('❌ Tier auth: Invalid password for:', credentials.email);

            // Increment failed login attempts
            await adminUsersCollection.updateOne(
              { _id: tierUser._id },
              {
                $inc: { failedLoginAttempts: 1 },
                $set: { lastFailedLoginAt: new Date() }
              }
            );

            return null;
          }

          // Reset failed login attempts on successful login
          await adminUsersCollection.updateOne(
            { _id: tierUser._id },
            {
              $set: {
                failedLoginAttempts: 0,
                lastLoginAt: new Date(),
                status: 'active'
              }
            }
          );

          console.log('✅ Tier auth: Login successful for:', credentials.email);

          // Return tier user data
          return {
            id: tierUser._id.toString(),
            email: tierUser.email,
            username: tierUser.username || tierUser.name,
            role: tierUser.role,
            isAdmin: false, // Tier users are not admins
            isVerified: tierUser.isVerified || false,
            image: tierUser.image || null
          };

        } catch (error) {
          console.error('❌ Tier auth error:', error);
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

        // Add user data to token with proper type checking
        token.id = user.id;
        token.email = user.email;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.isAdmin = (user as any).isAdmin;
        token.isVerified = (user as any).isVerified;
        token.image = (user as any).image;
        token.lastValidated = Math.floor(Date.now() / 1000);

        // Add dual-mode information to token
        token.hasRegularUserAccount = (user as any).hasRegularUserAccount;
        token.regularUserId = (user as any).regularUserId;
        token.canBrowseAsUser = (user as any).canBrowseAsUser;

        console.log('🔐 JWT callback - Token created:', {
          id: token.id,
          email: token.email,
          role: token.role,
          isAdmin: token.isAdmin,
          canBrowseAsUser: token.canBrowseAsUser,
          hasRegularUserAccount: token.hasRegularUserAccount
        });
      }

      return token;
    },
    async session({ session, token }) {
      console.log('🔐 Session callback - Token:', { id: token.id, role: token.role, email: token.email, isAdmin: token.isAdmin, exp: token.exp });

      // Check if token has expired
      if (token.exp && typeof token.exp === 'number' && Math.floor(Date.now() / 1000) > token.exp) {
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

        // Add dual-mode information to session
        (session.user as any).hasRegularUserAccount = token.hasRegularUserAccount as boolean;
        (session.user as any).regularUserId = token.regularUserId as string;
        (session.user as any).canBrowseAsUser = token.canBrowseAsUser as boolean;

        console.log('🔐 Session callback - Updated session user:', {
          id: session.user.id,
          role: session.user.role,
          email: session.user.email,
          isAdmin: session.user.isAdmin,
          canBrowseAsUser: (session.user as any).canBrowseAsUser,
          hasRegularUserAccount: (session.user as any).hasRegularUserAccount
        });
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle admin credentials provider
      if (account?.provider === 'admin-credentials') {
        // Admin users are already validated in the authorize callback
        return true;
      }

      // Regular credentials provider validation
      if (account?.provider === 'credentials') {
        try {
          await dbConnect();
          const userExists = await (User as any).findById(user.id);
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
