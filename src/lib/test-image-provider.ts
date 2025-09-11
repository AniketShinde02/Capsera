// Test image utility using Unsplash API
export class UnsplashTestImageProvider {
  private accessKey: string;
  private baseUrl = 'https://api.unsplash.com';

  constructor(accessKey?: string) {
    this.accessKey = accessKey || process.env.UNSPLASH_ACCESS_KEY || '';
  }

  /**
   * Get a random test image from Unsplash
   */
  async getRandomTestImage(): Promise<{ url: string; publicId: string; attribution: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/photos/random?client_id=${this.accessKey}`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        url: data.urls.regular,
        publicId: `test_${data.id}`,
        attribution: `Photo by ${data.user.name} on Unsplash`
      };
    } catch (error) {
      console.error('Error fetching Unsplash image:', error);
      // Fallback to a default test image
      return {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        publicId: 'test_default_image',
        attribution: 'Photo by Unsplash on Unsplash'
      };
    }
  }

  /**
   * Get a test image by keyword
   */
  async getTestImageByKeyword(keyword: string): Promise<{ url: string; publicId: string; attribution: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&client_id=${this.accessKey}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const photo = data.results[0];
        return {
          url: photo.urls.regular,
          publicId: `test_${photo.id}`,
          attribution: `Photo by ${photo.user.name} on Unsplash`
        };
      } else {
        // Fallback to random image
        return await this.getRandomTestImage();
      }
    } catch (error) {
      console.error('Error fetching Unsplash image by keyword:', error);
      // Fallback to random image
      return await this.getRandomTestImage();
    }
  }

  /**
   * Get multiple test images for batch testing
   */
  async getMultipleTestImages(count: number = 3): Promise<Array<{ url: string; publicId: string; attribution: string }>> {
    const images = [];
    const keywords = ['nature', 'city', 'food', 'technology', 'art', 'travel'];
    
    for (let i = 0; i < count; i++) {
      const keyword = keywords[i % keywords.length];
      const image = await this.getTestImageByKeyword(keyword);
      images.push(image);
      
      // Add small delay to respect rate limits
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return images;
  }

  /**
   * Create a test image file object for upload testing
   */
  async createTestImageFile(keyword: string = 'nature'): Promise<File> {
    const imageData = await this.getTestImageByKeyword(keyword);
    
    // Fetch the image data
    const response = await fetch(imageData.url);
    const blob = await response.blob();
    
    // Create a File object
    return new File([blob], `test_image_${keyword}.jpg`, { type: 'image/jpeg' });
  }

  /**
   * Get test image data for caption generation testing
   */
  async getTestImageForCaptionGeneration(): Promise<{
    imageUrl: string;
    publicId: string;
    mood: string;
    description: string;
    attribution: string;
  }> {
    const imageData = await this.getRandomTestImage();
    
    // Generate test data
    const moods = ['happy', 'professional', 'creative', 'inspiring', 'calm'];
    const descriptions = [
      'A beautiful landscape perfect for social media',
      'An inspiring moment captured in time',
      'A professional setting for business content',
      'A creative composition for artistic expression',
      'A peaceful scene for relaxation content'
    ];
    
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    return {
      imageUrl: imageData.url,
      publicId: imageData.publicId,
      mood: randomMood,
      description: randomDescription,
      attribution: imageData.attribution
    };
  }
}

// Export singleton instance
export const unsplashTestProvider = new UnsplashTestImageProvider();

// Helper function to get test image data
export async function getTestImageData(keyword?: string) {
  if (keyword) {
    return await unsplashTestProvider.getTestImageByKeyword(keyword);
  } else {
    return await unsplashTestProvider.getRandomTestImage();
  }
}

// Helper function to create test image file
export async function createTestImageFile(keyword?: string) {
  return await unsplashTestProvider.createTestImageFile(keyword);
}
