import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class ConnectionChecker {
  private static instance: ConnectionChecker;

  private constructor() {}

  public static getInstance(): ConnectionChecker {
    if (!ConnectionChecker.instance) {
      ConnectionChecker.instance = new ConnectionChecker();
    }
    return ConnectionChecker.instance;
  }

  /**
   * Check all connections (MongoDB + Cloudinary)
   */
  async checkAllConnections(): Promise<{
    mongodb: { success: boolean; message: string; details?: any };
    cloudinary: { success: boolean; message: string; details?: any };
    overall: boolean;
  }> {
    console.log('🔍 Starting comprehensive connection check...\n');

    const results = {
      mongodb: await this.checkMongoDB(),
      cloudinary: await this.checkCloudinary(),
      overall: false
    };

    results.overall = results.mongodb.success && results.cloudinary.success;

    // Print summary
    console.log('\n📊 Connection Check Summary:');
    console.log('='.repeat(50));
    console.log(`🗄️ MongoDB: ${results.mongodb.success ? '✅' : '❌'} ${results.mongodb.message}`);
    console.log(`☁️ Cloudinary: ${results.cloudinary.success ? '✅' : '❌'} ${results.cloudinary.message}`);
    console.log(`🎯 Overall: ${results.overall ? '✅ ALL GOOD' : '❌ ISSUES FOUND'}`);
    console.log('='.repeat(50));

    return results;
  }

  /**
   * Check MongoDB connection
   */
  private async checkMongoDB(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🗄️ Checking MongoDB connection...');
      
      if (!process.env.DISCORD_MONGODB_URI) {
        return {
          success: false,
          message: 'DISCORD_MONGODB_URI not found in environment variables'
        };
      }

      if (!process.env.DISCORD_DB_NAME) {
        return {
          success: false,
          message: 'DISCORD_DB_NAME not found in environment variables'
        };
      }

      console.log(`📊 URI: ${process.env.DISCORD_MONGODB_URI.substring(0, 50)}...`);
      console.log(`🗄️ Database: ${process.env.DISCORD_DB_NAME}`);

      // Connect to MongoDB
      await mongoose.connect(process.env.DISCORD_MONGODB_URI);
      console.log('✅ MongoDB connection successful!');

      // List all databases
      const adminDb = mongoose.connection.db.admin();
      const dbList = await adminDb.listDatabases();
      
      console.log('📚 Available databases:');
      dbList.databases.forEach((db: any) => {
        const sizeMB = (db.sizeOnDisk / 1024 / 1024).toFixed(2);
        console.log(`  - ${db.name} (${sizeMB} MB)`);
      });

      // Check if target database exists
      const targetDb = dbList.databases.find((db: any) => db.name === process.env.DISCORD_DB_NAME);
      if (targetDb) {
        console.log(`✅ Database '${process.env.DISCORD_DB_NAME}' exists!`);
      } else {
        console.log(`📝 Database '${process.env.DISCORD_DB_NAME}' will be created on first use`);
      }

      // Test collection creation
      const testCollection = mongoose.connection.db.collection('connection_test');
      await testCollection.insertOne({
        test: true,
        timestamp: new Date(),
        message: 'Discord bot connection test',
        source: 'connection_checker'
      });
      console.log('✅ Test collection created successfully');

      // Clean up test data
      await testCollection.deleteOne({ test: true });
      console.log('🧹 Test data cleaned up');

      // Close connection
      await mongoose.disconnect();
      console.log('🔌 MongoDB connection closed');

      return {
        success: true,
        message: 'MongoDB connection and operations successful',
        details: {
          databaseCount: dbList.databases.length,
          targetDatabaseExists: !!targetDb,
          connectionString: process.env.DISCORD_MONGODB_URI.substring(0, 30) + '...'
        }
      };

    } catch (error) {
      console.error('❌ MongoDB check failed:', error);
      return {
        success: false,
        message: `MongoDB connection failed: ${error}`,
        details: { error: error.toString() }
      };
    }
  }

  /**
   * Check Cloudinary connection
   */
  private async checkCloudinary(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('\n☁️ Checking Cloudinary connection...');

      // Check environment variables
      const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        return {
          success: false,
          message: `Missing Cloudinary environment variables: ${missingVars.join(', ')}`
        };
      }

      console.log(`☁️ Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      console.log(`🔑 API Key: ${process.env.CLOUDINARY_API_KEY?.substring(0, 10)}...`);
      console.log(`🔒 API Secret: ${process.env.CLOUDINARY_API_SECRET?.substring(0, 10)}...`);

      // Configure Cloudinary
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Test Cloudinary connection by getting account info
      const accountInfo = await cloudinary.api.ping();
      console.log('✅ Cloudinary connection successful!');
      console.log(`📊 Account Status: ${accountInfo.status}`);

      // Test folder creation (this will create the folder if it doesn't exist)
      const testFolder = 'discord_bot/test_connection';
      console.log(`📁 Testing folder creation: ${testFolder}`);

      // Upload a small test image (1x1 pixel transparent PNG)
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const uploadResult = await cloudinary.uploader.upload(testImageData, {
        folder: testFolder,
        public_id: 'test_connection_image',
        overwrite: true,
        tags: ['test', 'connection_check']
      });

      console.log('✅ Test image uploaded successfully');
      console.log(`📁 Folder: ${uploadResult.folder}`);
      console.log(`🆔 Public ID: ${uploadResult.public_id}`);

      // Clean up test image
      await cloudinary.uploader.destroy(uploadResult.public_id);
      console.log('🧹 Test image cleaned up');

      return {
        success: true,
        message: 'Cloudinary connection and operations successful',
        details: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          accountStatus: accountInfo.status,
          testFolder: testFolder,
          uploadTest: 'passed'
        }
      };

    } catch (error) {
      console.error('❌ Cloudinary check failed:', error);
      return {
        success: false,
        message: `Cloudinary connection failed: ${error}`,
        details: { error: error.toString() }
      };
    }
  }

  /**
   * Quick health check
   */
  async quickHealthCheck(): Promise<boolean> {
    try {
      const results = await this.checkAllConnections();
      return results.overall;
    } catch (error) {
      console.error('❌ Quick health check failed:', error);
      return false;
    }
  }
}

export default ConnectionChecker;
