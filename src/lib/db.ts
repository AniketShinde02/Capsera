
import 'dotenv/config';
import mongoose, { Mongoose } from 'mongoose';
import { MongoClient } from 'mongodb';

// Environment validation

// CRITICAL: Use the provided MongoDB Atlas URI - NO LOCAL CONNECTIONS
const MONGODB_URI = process.env.MONGODB_URI;

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

// Connection validated

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

export async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    console.log('🔄 Using cached Mongoose connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Reduced pool size for better connection management
      serverSelectionTimeoutMS: 60000, // Increased to 60s
      socketTimeoutMS: 120000, // Increased to 2 minutes
      connectTimeoutMS: 60000, // Increased to 60s
      heartbeatFrequencyMS: 5000, // Reduced heartbeat for faster detection
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      retryWrites: true, // Enable retry for write operations
      retryReads: true, // Enable retry for read operations
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
      maxPoolSize: 5, // Reduced pool size for better connection management
      serverSelectionTimeoutMS: 60000, // Increased to 60s
      socketTimeoutMS: 120000, // Increased to 2 minutes
      connectTimeoutMS: 60000, // Increased to 60s
      heartbeatFrequencyMS: 5000, // Reduced heartbeat for faster detection
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      retryWrites: true, // Enable retry for write operations
      retryReads: true, // Enable retry for read operations
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
export async function connectToDatabase(retryCount = 0) {
  const maxRetries = 3;

  try {
    console.log(`🔗 Connecting to MongoDB Atlas via MongoClient... (attempt ${retryCount + 1})`);
    const client = await clientPromise;
    const db = client.db();

    // Test the connection with timeout
    const pingPromise = db.admin().ping();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Ping timeout')), 10000)
    );

    await Promise.race([pingPromise, timeoutPromise]);
    console.log('✅ MongoDB Atlas connection successful');

    return { client, db };
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB Atlas (attempt ${retryCount + 1}):`, error);

    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying connection in 2 seconds... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectToDatabase(retryCount + 1);
    }

    throw new Error(`Database connection failed after ${maxRetries} attempts - check Atlas connection string`);
  }
}
