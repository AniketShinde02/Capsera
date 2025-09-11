// Test data generator for TestSprite testing
export class TestDataGenerator {
  
  /**
   * Generate test user credentials
   */
  static getTestUserCredentials() {
    return {
      email: 'test@capsera.com',
      password: 'TestPassword123!',
      username: 'testuser'
    };
  }

  /**
   * Generate test admin credentials
   */
  static getTestAdminCredentials() {
    return {
      email: 'admin@capsera.com',
      password: 'AdminPassword123!',
      username: 'admin'
    };
  }

  /**
   * Generate test image data for caption generation
   */
  static getTestImageData() {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      publicId: 'test_image_nature',
      mood: 'inspiring',
      description: 'A beautiful nature scene perfect for social media'
    };
  }

  /**
   * Generate test caption generation request
   */
  static getTestCaptionRequest() {
    return {
      mood: 'professional',
      description: 'A professional business setting',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      publicId: 'test_image_professional'
    };
  }

  /**
   * Generate test upload request data
   */
  static getTestUploadData() {
    return {
      fileName: 'test_image.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024000, // 1MB
      description: 'Test image for upload testing'
    };
  }

  /**
   * Generate test rate limit data
   */
  static getTestRateLimitData() {
    return {
      userId: 'test_user_123',
      ipAddress: '192.168.1.100',
      requestCount: 5,
      remainingQuota: 95,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Generate test analytics data
   */
  static getTestAnalyticsData() {
    return {
      totalUsers: 150,
      activeUsers: 45,
      totalCaptions: 320,
      totalImages: 280,
      conversionRate: 75,
      avgSessionDuration: 8.5,
      userGrowth: 12.5,
      captionGrowth: 18.3
    };
  }

  /**
   * Generate test user data
   */
  static getTestUserData() {
    return {
      id: 'test_user_123',
      email: 'test@capsera.com',
      username: 'testuser',
      role: 'user',
      isAdmin: false,
      isVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
  }

  /**
   * Generate test admin user data
   */
  static getTestAdminData() {
    return {
      id: 'admin_user_456',
      email: 'admin@capsera.com',
      username: 'admin',
      role: 'admin',
      isAdmin: true,
      isSuperAdmin: false,
      isVerified: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
  }

  /**
   * Generate test image deletion data
   */
  static getTestImageDeletionData() {
    return {
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      publicId: 'test_image_to_delete',
      userId: 'test_user_123'
    };
  }

  /**
   * Generate test error responses
   */
  static getTestErrorResponses() {
    return {
      authenticationError: {
        success: false,
        error: 'Authentication required',
        message: 'Please sign in to access this resource',
        status: 401
      },
      authorizationError: {
        success: false,
        error: 'Access denied',
        message: 'Insufficient permissions',
        status: 403
      },
      validationError: {
        success: false,
        error: 'Validation failed',
        message: 'Invalid input data',
        status: 400
      },
      serverError: {
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong',
        status: 500
      }
    };
  }

  /**
   * Generate test success responses
   */
  static getTestSuccessResponses() {
    return {
      uploadSuccess: {
        success: true,
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        public_id: 'test_upload_success',
        publicId: 'test_upload_success',
        secure_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      },
      captionSuccess: {
        success: true,
        captions: [
          'A beautiful moment captured in time ✨',
          'Nature\'s beauty never fails to inspire 🌿',
          'Perfect shot for your social media feed 📸'
        ],
        mood: 'inspiring',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
      },
      authSuccess: {
        success: true,
        user: this.getTestUserData(),
        token: 'test_jwt_token_123',
        expiresIn: 86400
      }
    };
  }

  /**
   * Generate test environment configuration
   */
  static getTestEnvironmentConfig() {
    return {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://localhost:27017/capsera_test',
      NEXTAUTH_SECRET: 'test_secret_key',
      NEXTAUTH_URL: 'http://localhost:3000',
      CLOUDINARY_CLOUD_NAME: 'test_cloud',
      CLOUDINARY_API_KEY: 'test_api_key',
      CLOUDINARY_API_SECRET: 'test_api_secret',
      UNSPLASH_ACCESS_KEY: 'test_unsplash_key'
    };
  }
}

// Export test data constants
export const TEST_DATA = {
  USER_CREDENTIALS: TestDataGenerator.getTestUserCredentials(),
  ADMIN_CREDENTIALS: TestDataGenerator.getTestAdminCredentials(),
  IMAGE_DATA: TestDataGenerator.getTestImageData(),
  CAPTION_REQUEST: TestDataGenerator.getTestCaptionRequest(),
  UPLOAD_DATA: TestDataGenerator.getTestUploadData(),
  RATE_LIMIT_DATA: TestDataGenerator.getTestRateLimitData(),
  ANALYTICS_DATA: TestDataGenerator.getTestAnalyticsData(),
  USER_DATA: TestDataGenerator.getTestUserData(),
  ADMIN_DATA: TestDataGenerator.getTestAdminData(),
  IMAGE_DELETION_DATA: TestDataGenerator.getTestImageDeletionData(),
  ERROR_RESPONSES: TestDataGenerator.getTestErrorResponses(),
  SUCCESS_RESPONSES: TestDataGenerator.getTestSuccessResponses(),
  ENVIRONMENT_CONFIG: TestDataGenerator.getTestEnvironmentConfig()
};
