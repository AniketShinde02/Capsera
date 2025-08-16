import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in session model to include the 'id' property and admin properties.
   */
  interface Session {
    user: {
      /** The user's unique identifier. */
      id: string;
      /** The user's role object with name and displayName */
      role?: {
        name: string;
        displayName: string;
        _id?: string;
      };
      /** The user's username */
      username?: string;
      /** Whether the user is verified */
      isVerified?: boolean;
      /** Whether the user is an admin */
      isAdmin?: boolean;
      /** The user's profile image URL */
      image?: string | null;
    } & DefaultSession['user']; // Inherit the default properties
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT model to include the 'id' property and admin properties.
   */
  interface JWT {
    /** The user's unique identifier. */
    id: string;
    /** The user's role object with name and displayName */
    role?: {
      name: string;
      displayName: string;
      _id?: string;
    };
    /** The user's username */
    username?: string;
    /** Whether the user is verified */
    isVerified?: boolean;
    /** Whether the user is an admin */
    isAdmin?: boolean;
    /** The user's profile image URL */
    image?: string | null;
    /** Timestamp of last validation */
    lastValidated?: number;
  }
}

declare module 'next-auth/core/types' {
  /**
   * Extends the built-in user model to include admin properties.
   */
  interface User {
    /** The user's role object with name and displayName */
    role?: {
      name: string;
      displayName: string;
      _id?: string;
    };
    /** The user's username */
    username?: string;
    /** Whether the user is verified */
    isVerified?: boolean;
    /** Whether the user is an admin */
    isAdmin?: boolean;
  }
}
