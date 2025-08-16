
import 'dotenv/config';
import mongoose, { Mongoose } from 'mongoose';
import { MongoClient } from 'mongodb';

// Debug: Check environment variables
console.log('🔍 Environment Check:', {
  MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
  NODE_ENV: process.env.NODE_ENV || 'undefined',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
  // IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY ? '✅ Set' : '❌ Missing' // Commented out - migrated to Cloudinary
});

// CRITICAL: Use the provided MongoDB Atlas URI - NO LOCAL CONNECTIONS
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://inquiry:JzCq395jQl13b9DL@cluster0.ucqycoj.mongodb.net/Caption_Generator';

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined in .env file.');
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

// Validate that we're using Atlas, not local
if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
  console.error('❌ CRITICAL: Using local MongoDB connection. Must use Atlas for production.');
  throw new Error('MongoDB Atlas connection required. Local connections are not allowed.');
}

console.log('✅ Using MongoDB Atlas connection:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;
let cachedClient = (global as any).mongoClient;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

if (!cachedClient) {
  cachedClient = (global as any).mongoClient = { client: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    console.log('🔄 Using cached Mongoose connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    console.log('🔗 Attempting to connect to MongoDB Atlas with Mongoose...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ New Mongoose connection established to Atlas');
      return mongoose;
    }).catch(err => {
      console.error('❌ Mongoose connection error:', err);
      cached.promise = null; // Reset promise on error
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Mongoose connection ready');
  } catch (e) {
    console.error('❌ Failed to establish Mongoose connection:', e);
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!cachedClient.promise) {
    client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedClient.promise = client.connect();
  }
  clientPromise = cachedClient.promise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  clientPromise = client.connect();
}

export { clientPromise };
export default dbConnect;

/**
 * Connect to MongoDB and return database instance for direct operations
 * This function is used for admin operations that need direct MongoDB access
 */
export async function connectToDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas via MongoClient...');
    const client = await clientPromise;
    const db = client.db();
    
    // Test the connection
    await db.admin().ping();
    console.log('✅ MongoDB Atlas connection successful');
    
    return { client, db };
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    throw new Error('Database connection failed - check Atlas connection string');
  }
}
