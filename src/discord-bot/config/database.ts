// Discord-specific database configuration
export class DiscordDatabase {
  private static instance: DiscordDatabase;
  private isConnected: boolean = false;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): DiscordDatabase {
    if (!DiscordDatabase.instance) {
      DiscordDatabase.instance = new DiscordDatabase();
    }
    return DiscordDatabase.instance;
  }

  // Connect to Discord-specific database
  public async connect(): Promise<void> {
    try {
      // Check for Discord-specific MongoDB URI first
      const discordMongoUri = process.env.DISCORD_MONGODB_URI;
      const mainMongoUri = process.env.MONGODB_URI;
      
      const mongoUri = discordMongoUri || mainMongoUri;
      
      if (!mongoUri) {
        throw new Error('No MongoDB URI found for Discord bot');
      }

      // Import mongoose dynamically to avoid conflicts
      const mongoose = await import('mongoose');
      
      // Connect with Discord-specific options
      await mongoose.connect(mongoUri, {
        dbName: process.env.DISCORD_DB_NAME || 'capsera_discord',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      
      if (discordMongoUri) {
        console.log('✅ Connected to Discord-specific MongoDB');
      } else {
        console.log('⚠️ Using main site MongoDB (shared database)');
      }

    } catch (error) {
      console.error('❌ Discord database connection failed:', error);
      throw error;
    }
  }

  // Check connection status
  public isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  // Disconnect from database
  public async disconnect(): Promise<void> {
    try {
      const mongoose = await import('mongoose');
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Discord database disconnected');
    } catch (error) {
      console.error('❌ Discord database disconnection failed:', error);
    }
  }
}

// Export singleton instance
export const discordDatabase = DiscordDatabase.getInstance();
