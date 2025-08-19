// Maintenance Mode Utility
// This allows easy toggling of maintenance mode for the entire application

interface MaintenanceConfig {
  enabled: boolean;
  message?: string;
  estimatedTime?: string;
  allowedIPs?: string[];
  allowedEmails?: string[];
}

class MaintenanceManager {
  private config: MaintenanceConfig = {
    enabled: false,
    message: "We're making things better! Capsera is currently under maintenance.",
    estimatedTime: "2-3 hours",
    allowedIPs: [],
    allowedEmails: []
  };

  // Enable maintenance mode
  enable(config?: Partial<MaintenanceConfig>) {
    this.config = {
      ...this.config,
      enabled: true,
      ...config
    };
    
    console.log('🔧 Maintenance mode enabled:', this.config);
    
    // You can also set this in localStorage or database for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('capsera_maintenance', JSON.stringify(this.config));
    }
  }

  // Disable maintenance mode
  disable() {
    this.config.enabled = false;
    console.log('✅ Maintenance mode disabled');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('capsera_maintenance');
    }
  }

  // Check if maintenance mode is enabled
  isEnabled(): boolean {
    return this.config.enabled;
  }

  // Get maintenance configuration
  getConfig(): MaintenanceConfig {
    return { ...this.config };
  }

  // Check if current user/IP is allowed during maintenance
  isAllowed(ip?: string, email?: string): boolean {
    if (!this.config.enabled) return true;
    
    // Check allowed IPs
    if (ip && this.config.allowedIPs?.includes(ip)) {
      return true;
    }
    
    // Check allowed emails
    if (email && this.config.allowedEmails?.includes(email)) {
      return true;
    }
    
    return false;
  }

  // Load maintenance config from storage
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('capsera_maintenance');
        if (stored) {
          this.config = JSON.parse(stored);
          console.log('🔧 Maintenance config loaded from storage:', this.config);
        }
      } catch (error) {
        console.error('Failed to load maintenance config:', error);
      }
    }
  }

  // Set allowed IPs (for admin access during maintenance)
  setAllowedIPs(ips: string[]) {
    this.config.allowedIPs = ips;
    console.log('🔧 Allowed IPs updated:', ips);
  }

  // Set allowed emails (for admin access during maintenance)
  setAllowedEmails(emails: string[]) {
    this.config.allowedEmails = emails;
    console.log('🔧 Allowed emails updated:', emails);
  }
}

// Create singleton instance
const maintenanceManager = new MaintenanceManager();

// Load config on initialization
if (typeof window !== 'undefined') {
  maintenanceManager.loadFromStorage();
}

export default maintenanceManager;

// Export individual functions for easy use
export const enableMaintenance = (config?: Partial<MaintenanceConfig>) => maintenanceManager.enable(config);
export const disableMaintenance = () => maintenanceManager.disable();
export const isMaintenanceEnabled = () => maintenanceManager.isEnabled();
export const getMaintenanceConfig = () => maintenanceManager.getConfig();
export const isMaintenanceAllowed = (ip?: string, email?: string) => maintenanceManager.isAllowed(ip, email);
export const setMaintenanceAllowedIPs = (ips: string[]) => maintenanceManager.setAllowedIPs(ips);
export const setMaintenanceAllowedEmails = (emails: string[]) => maintenanceManager.setAllowedEmails(emails);
