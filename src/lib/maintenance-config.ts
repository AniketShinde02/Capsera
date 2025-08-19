/**
 * Maintenance Mode and Emergency Access Configuration
 * Centralized configuration management from environment variables
 */

export interface MaintenanceConfig {
  // Maintenance Mode Settings
  maintenanceMode: {
    enabled: boolean;
    allowedIPs: string[];
    allowedEmails: string[];
  };
  
  // Emergency Access Settings
  emergencyAccess: {
    tokenExpiryHours: number;
    maxTokensPerEmail: number;
    tokenLength: number;
    rateLimitPerIP: number;
  };
}

/**
 * Get maintenance configuration from environment variables
 */
export function getMaintenanceConfig(): MaintenanceConfig {
  return {
    maintenanceMode: {
      enabled: process.env.MAINTENANCE_MODE === 'true',
      allowedIPs: process.env.MAINTENANCE_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || ['127.0.0.1', '::1', 'localhost'],
      allowedEmails: process.env.MAINTENANCE_ALLOWED_EMAILS?.split(',').map(email => email.trim()) || [],
    },
    
    emergencyAccess: {
      tokenExpiryHours: parseInt(process.env.EMERGENCY_TOKEN_EXPIRY_HOURS || '24', 10),
      maxTokensPerEmail: parseInt(process.env.EMERGENCY_MAX_TOKENS_PER_EMAIL || '5', 10),
      tokenLength: parseInt(process.env.EMERGENCY_TOKEN_LENGTH || '32', 10),
      rateLimitPerIP: parseInt(process.env.EMERGENCY_RATE_LIMIT_PER_IP || '10', 10),
    },
  };
}

/**
 * Generate secure random token with specified length
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.randomBytes if available (Node.js), fallback to Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
}

/**
 * Calculate token expiration date
 */
export function calculateTokenExpiry(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  // Localhost and special addresses
  const localhostRegex = /^(localhost|127\.0\.0\.1|::1)$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || localhostRegex.test(ip);
}

/**
 * Get configuration summary for debugging
 */
export function getConfigSummary(): string {
  const config = getMaintenanceConfig();
  
  return `
🔧 Maintenance Mode Configuration:
   Enabled: ${config.maintenanceMode.enabled}
   Allowed IPs: ${config.maintenanceMode.allowedIPs.join(', ')}
   Allowed Emails: ${config.maintenanceMode.allowedEmails.join(', ')}

🚨 Emergency Access Configuration:
   Token Expiry: ${config.emergencyAccess.tokenExpiryHours} hours
   Max Tokens per Email: ${config.emergencyAccess.maxTokensPerEmail}
   Token Length: ${config.emergencyAccess.tokenLength} characters
   Rate Limit per IP: ${config.emergencyAccess.rateLimitPerIP} tokens/hour
  `.trim();
}
