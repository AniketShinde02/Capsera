// OTP Service for Admin Setup - In-Memory Implementation
// This service provides secure, fast OTP generation and verification

interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

class OTPService {
  private otpStore = new Map<string, OTPData>();
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  // OTP configuration
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;
  private readonly MAX_REQUESTS_PER_HOUR = 3;
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Start cleanup timer
    this.startCleanupTimer();
  }

  /**
   * Generate a new 6-digit OTP for an email
   */
  generateOTP(email: string): { success: boolean; otp?: string; message: string } {
    try {
      // Rate limiting check
      if (!this.checkRateLimit(email)) {
        return {
          success: false,
          message: 'Too many OTP requests. Please wait before requesting another.'
        };
      }

      // Generate cryptographically secure 6-digit OTP
      const otp = this.generateSecureOTP();
      
      // Store OTP with metadata
      const otpData: OTPData = {
        otp,
        expiresAt: Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000),
        attempts: 0,
        createdAt: Date.now()
      };

      this.otpStore.set(email, otpData);
      
      // Update request count
      this.updateRequestCount(email);

      console.log(`🔐 OTP generated for ${email}: ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);
      
      return {
        success: true,
        otp,
        message: 'OTP generated successfully'
      };

    } catch (error) {
      console.error('❌ Error generating OTP:', error);
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.'
      };
    }
  }

  /**
   * Verify an OTP for an email
   */
  verifyOTP(email: string, otp: string): { success: boolean; message: string } {
    try {
      const otpData = this.otpStore.get(email);
      
      if (!otpData) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.'
        };
      }

      // Check if OTP has expired
      if (Date.now() > otpData.expiresAt) {
        this.otpStore.delete(email);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check if max attempts exceeded
      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        this.otpStore.delete(email);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        };
      }

      // Increment attempt counter
      otpData.attempts++;

      // Verify OTP
      if (otpData.otp === otp) {
        // OTP verified successfully - remove it
        this.otpStore.delete(email);
        console.log(`✅ OTP verified successfully for ${email}`);
        
        return {
          success: true,
          message: 'OTP verified successfully!'
        };
      } else {
        // OTP incorrect
        if (otpData.attempts >= this.MAX_ATTEMPTS) {
          this.otpStore.delete(email);
          return {
            success: false,
            message: 'Too many failed attempts. Please request a new OTP.'
          };
        }
        
        return {
          success: false,
          message: `Incorrect OTP. ${this.MAX_ATTEMPTS - otpData.attempts} attempts remaining.`
        };
      }

    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      return {
        success: false,
        message: 'Error verifying OTP. Please try again.'
      };
    }
  }

  /**
   * Check if an email has a valid OTP
   */
  hasValidOTP(email: string): boolean {
    const otpData = this.otpStore.get(email);
    if (!otpData) return false;
    
    // Check if expired
    if (Date.now() > otpData.expiresAt) {
      this.otpStore.delete(email);
      return false;
    }
    
    return true;
  }

  /**
   * Get remaining time for OTP expiry
   */
  getOTPExpiryTime(email: string): number | null {
    const otpData = this.otpStore.get(email);
    if (!otpData) return null;
    
    const remaining = otpData.expiresAt - Date.now();
    return remaining > 0 ? remaining : null;
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
  private checkRateLimit(email: string): boolean {
    const now = Date.now();
    const requestData = this.requestCounts.get(email);
    
    if (!requestData) {
      return true; // First request
    }
    
    // Reset counter if hour has passed
    if (now > requestData.resetTime) {
      this.requestCounts.set(email, { count: 1, resetTime: now + (60 * 60 * 1000) });
      return true;
    }
    
    // Check if limit exceeded
    if (requestData.count >= this.MAX_REQUESTS_PER_HOUR) {
      return false;
    }
    
    // Increment counter
    requestData.count++;
    return true;
  }

  /**
   * Update request count for rate limiting
   */
  private updateRequestCount(email: string): void {
    const now = Date.now();
    const requestData = this.requestCounts.get(email);
    
    if (!requestData) {
      this.requestCounts.set(email, { count: 1, resetTime: now + (60 * 60 * 1000) });
    } else {
      requestData.count++;
    }
  }

  /**
   * Start cleanup timer to remove expired OTPs
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredOTPs();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Clean up expired OTPs and old request counts
   */
  private cleanupExpiredOTPs(): void {
    const now = Date.now();
    let cleanedOTPs = 0;
    let cleanedRequests = 0;
    
    // Clean expired OTPs
    for (const [email, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(email);
        cleanedOTPs++;
      }
    }
    
    // Clean old request counts (older than 2 hours)
    for (const [email, requestData] of this.requestCounts.entries()) {
      if (now > requestData.resetTime + (60 * 60 * 1000)) {
        this.requestCounts.delete(email);
        cleanedRequests++;
      }
    }
    
    if (cleanedOTPs > 0 || cleanedRequests > 0) {
      console.log(`🧹 Cleanup: Removed ${cleanedOTPs} expired OTPs and ${cleanedRequests} old request counts`);
    }
  }

  /**
   * Get service statistics (for debugging)
   */
  getStats(): { activeOTPs: number; activeRequests: number } {
    return {
      activeOTPs: this.otpStore.size,
      activeRequests: this.requestCounts.size
    };
  }
}

// Export singleton instance
export const otpService = new OTPService();

// Export types for external use
export type { OTPData };
