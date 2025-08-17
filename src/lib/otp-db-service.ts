// Database-based OTP Service for Admin Setup
// This service stores OTPs in MongoDB for persistence across server restarts and development mode
// 
// ⚠️  RATE LIMITING DISABLED FOR TESTING - Remove comments to re-enable in production
// 
// 🔄 OTP LIFECYCLE:
// 1. Generate OTP → Store in database
// 2. Verify OTP → Mark as verified (don't delete yet)
// 3. Use OTP for admin creation → Consume and delete
// 4. If admin creation fails → OTP remains for retry

import { connectToDatabase } from './db';

interface OTPData {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

class OTPDatabaseService {
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;
  private readonly MAX_REQUESTS_PER_HOUR = 3;

  /**
   * Generate a new 6-digit OTP for an email
   */
  async generateOTP(email: string): Promise<{ success: boolean; otp?: string; message: string }> {
    try {
      // Check rate limiting - COMMENTED OUT FOR TESTING
      // if (!(await this.checkRateLimit(email))) {
      //   return {
      //     success: false,
      //     message: 'Too many OTP requests. Please wait before requesting another.'
      //   };
      // }

      // Generate cryptographically secure 6-digit OTP
      const otp = this.generateSecureOTP();
      
      // Store OTP in database
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      
      // Remove any existing OTP for this email
      await otpCollection.deleteMany({ email });
      
      // Store new OTP
      const otpData: OTPData = {
        email,
        otp,
        expiresAt: new Date(Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000)),
        attempts: 0,
        createdAt: new Date()
      };

      await otpCollection.insertOne(otpData);
      
      // Update request count - COMMENTED OUT FOR TESTING
      // await this.updateRequestCount(email);

      console.log(`🔐 Database OTP generated for ${email}: ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);
      
      return {
        success: true,
        otp,
        message: 'OTP generated successfully'
      };

    } catch (error) {
      console.error('❌ Error generating database OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.'
      };
    }
  }

  /**
   * Verify an OTP for an email
   */
  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      
      // Find OTP for this email
      const otpData = await otpCollection.findOne({ email });
      
      if (!otpData) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.'
        };
      }

      // Check if OTP is already verified
      if (otpData.verified) {
        return {
          success: true,
          message: 'OTP already verified successfully!'
        };
      }

      // Check if OTP has expired
      if (new Date() > otpData.expiresAt) {
        await otpCollection.deleteOne({ email });
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check if max attempts exceeded
      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        await otpCollection.deleteOne({ email });
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        };
      }

      // Increment attempt counter
      await otpCollection.updateOne(
        { email },
        { $inc: { attempts: 1 } }
      );

      // Verify OTP
      if (otpData.otp === otp) {
        // OTP verified successfully - DON'T delete it yet, it's needed for admin creation
        // Only mark it as verified, it will be deleted after admin creation
        await otpCollection.updateOne(
          { email },
          { $set: { verified: true, verifiedAt: new Date() } }
        );
        console.log(`✅ Database OTP verified successfully for ${email}`);
        
        return {
          success: true,
          message: 'OTP verified successfully!'
        };
      } else {
        // OTP incorrect
        if (otpData.attempts + 1 >= this.MAX_ATTEMPTS) {
          await otpCollection.deleteOne({ email });
          return {
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.'
          };
        }
        
        return {
          success: false,
          message: `Incorrect OTP. ${this.MAX_ATTEMPTS - (otpData.attempts + 1)} attempts remaining.`
        };
      }

    } catch (error) {
      console.error('❌ Error verifying database OTP:', error);
      return {
        success: false,
        message: 'Error verifying OTP. Please try again.'
      };
    }
  }

  /**
   * Check if an email has a valid OTP
   */
  async hasValidOTP(email: string): Promise<boolean> {
    try {
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      
      const otpData = await otpCollection.findOne({ email });
      if (!otpData) return false;
      
      // Check if expired
      if (new Date() > otpData.expiresAt) {
        await otpCollection.deleteOne({ email });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking OTP validity:', error);
      return false;
    }
  }

  /**
   * Get remaining time for OTP expiry
   */
  async getOTPExpiryTime(email: string): Promise<number | null> {
    try {
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      
      const otpData = await otpCollection.findOne({ email });
      if (!otpData) return null;
      
      const remaining = otpData.expiresAt.getTime() - Date.now();
      return remaining > 0 ? remaining : null;
    } catch (error) {
      console.error('Error getting OTP expiry time:', error);
      return null;
    }
  }

  /**
   * Check if an OTP is already verified (for admin creation flow)
   */
  async checkVerifiedOTP(email: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      
      // Find verified OTP for this email
      const otpData = await otpCollection.findOne({ 
        email, 
        otp: token, 
        verified: true 
      });
      
      if (!otpData) {
        return {
          success: false,
          message: 'No verified OTP found for this email and token.'
        };
      }

      // Check if OTP has expired
      if (new Date() > otpData.expiresAt) {
        await otpCollection.deleteOne({ email });
        return {
          success: false,
          message: 'Verified OTP has expired. Please request a new one.'
        };
      }

      console.log(`✅ Verified OTP found and validated for ${email}`);
      return {
        success: true,
        message: 'OTP already verified successfully!'
      };

    } catch (error) {
      console.error('❌ Error checking verified OTP:', error);
      return {
        success: false,
        message: 'Error checking verified OTP. Please try again.'
      };
    }
  }

  /**
   * Consume and delete OTP after successful use (e.g., admin creation)
   */
  async consumeOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      
      // Delete OTP regardless of verification status
      const result = await otpCollection.deleteOne({ email });
      
      if (result.deletedCount > 0) {
        console.log(`✅ OTP consumed and deleted for ${email}`);
        return {
          success: true,
          message: 'OTP consumed successfully'
        };
      } else {
        console.log(`⚠️ No OTP found to consume for ${email}`);
        return {
          success: false,
          message: 'No OTP found to consume'
        };
      }
    } catch (error) {
      console.error('❌ Error consuming OTP:', error);
      return {
        success: false,
        message: 'Error consuming OTP'
      };
    }
  }

  /**
   * Generate cryptographically secure 6-digit OTP
   */
  private generateSecureOTP(): string {
    const min = 100000;
    const max = 999999;
    
    // Use crypto.randomInt if available (Node.js 14.10+), otherwise fallback to randomBytes
    if (typeof crypto !== 'undefined' && 'randomInt' in crypto) {
      return (crypto as any).randomInt(min, max + 1).toString();
    }
    
    // Fallback: generate random bytes and convert to number
    const bytes = crypto.getRandomValues(new Uint8Array(4));
    const value = new DataView(bytes.buffer).getUint32(0);
    return (min + (value % (max - min + 1))).toString();
  }

  /**
   * Check rate limiting for OTP requests
   */
  private async checkRateLimit(email: string): Promise<boolean> {
    try {
      const { db } = await connectToDatabase();
      const rateLimitCollection = db.collection('otp_rate_limits');
      
      const now = new Date();
      const requestData = await rateLimitCollection.findOne({ email });
      
      if (!requestData) {
        // First request
        await rateLimitCollection.insertOne({
          email,
          count: 1,
          resetTime: new Date(now.getTime() + (60 * 60 * 1000)) // 1 hour from now
        });
        return true;
      }
      
      // Reset counter if hour has passed
      if (now > requestData.resetTime) {
        await rateLimitCollection.updateOne(
          { email },
          { $set: { count: 1, resetTime: new Date(now.getTime() + (60 * 60 * 1000)) } }
        );
        return true;
      }
      
      // Check if limit exceeded
      if (requestData.count >= this.MAX_REQUESTS_PER_HOUR) {
        return false;
      }
      
      // Increment counter
      await rateLimitCollection.updateOne(
        { email },
        { $inc: { count: 1 } }
      );
      
      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow if rate limiting fails
    }
  }

  /**
   * Update request count for rate limiting
   */
  private async updateRequestCount(email: string): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      const rateLimitCollection = db.collection('otp_rate_limits');
      
      const now = new Date();
      const requestData = await rateLimitCollection.findOne({ email });
      
      if (!requestData) {
        await rateLimitCollection.insertOne({
          email,
          count: 1,
          resetTime: new Date(now.getTime() + (60 * 60 * 1000))
        });
      } else {
        await rateLimitCollection.updateOne(
          { email },
          { $inc: { count: 1 } }
        );
      }
    } catch (error) {
      console.error('Error updating request count:', error);
    }
  }

  /**
   * Clean up expired OTPs and old rate limits
   */
  async cleanup(): Promise<void> {
    try {
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      const rateLimitCollection = db.collection('otp_rate_limits');
      
      const now = new Date();
      
      // Clean expired OTPs
      const otpResult = await otpCollection.deleteMany({ expiresAt: { $lt: now } });
      
      // Clean old rate limits (older than 2 hours)
      const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
      const rateLimitResult = await rateLimitCollection.deleteMany({ resetTime: { $lt: twoHoursAgo } });
      
      if (otpResult.deletedCount > 0 || rateLimitResult.deletedCount > 0) {
        console.log(`🧹 Database cleanup: Removed ${otpResult.deletedCount} expired OTPs and ${rateLimitResult.deletedCount} old rate limits`);
      }
    } catch (error) {
      console.error('Error during database cleanup:', error);
    }
  }

  /**
   * Get service statistics (for debugging)
   */
  async getStats(): Promise<{ activeOTPs: number; activeRateLimits: number }> {
    try {
      const { db } = await connectToDatabase();
      const otpCollection = db.collection('otps');
      const rateLimitCollection = db.collection('otp_rate_limits');
      
      const activeOTPs = await otpCollection.countDocuments();
      const activeRateLimits = await rateLimitCollection.countDocuments();
      
      return { activeOTPs, activeRateLimits };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { activeOTPs: 0, activeRateLimits: 0 };
    }
  }
}

// Export singleton instance
export const otpDbService = new OTPDatabaseService();

// Export types for external use
export type { OTPData };
