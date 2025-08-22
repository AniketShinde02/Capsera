import { NextRequest } from 'next/server';

export interface ContentSafetyResult {
  isAppropriate: boolean;
  confidence: number;
  categories: {
    adult: number;
    violence: number;
    racy: number;
    medical: number;
    spoof: number;
  };
  flagged: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ContentReport {
  imageUrl: string;
  userId?: string;
  ipAddress: string;
  reason: 'inappropriate' | 'sexual' | 'violent' | 'spam' | 'other';
  description: string;
  timestamp: Date;
}

/**
 * Content Safety Check using Google SafeSearch API
 * This function analyzes images for inappropriate content
 */
export async function checkImageContentSafety(
  imageUrl: string,
  apiKey?: string
): Promise<ContentSafetyResult> {
  try {
    // If no API key provided, use environment variable
    const geminiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      console.warn('⚠️ No Gemini API key available for content safety check');
      // Fallback to basic checks
      return performBasicContentCheck(imageUrl);
    }

    // Use Gemini Vision API for content safety analysis
    const safetyPrompt = `
      Analyze this image for content safety. Rate the following categories from 0-10 (0 = safe, 10 = highly inappropriate):
      
      - Adult content (nudity, sexual content)
      - Violence (gore, weapons, fighting)
      - Racy content (suggestive, provocative)
      - Medical content (medical procedures, injuries)
      - Spoof content (fake, misleading)
      
      Respond with ONLY a JSON object in this exact format:
      {
        "adult": 0-10,
        "violence": 0-10,
        "racy": 0-10,
        "medical": 0-10,
        "spoof": 0-10
      }
      
      Be strict but fair. Rate conservatively for safety.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: safetyPrompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: await getImageBase64(imageUrl)
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content analysis received from Gemini');
    }

    // Parse the JSON response
    let categories;
    try {
      categories = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content);
      return performBasicContentCheck(imageUrl);
    }

    // Calculate risk levels
    const maxScore = Math.max(
      categories.adult || 0,
      categories.violence || 0,
      categories.racy || 0,
      categories.medical || 0,
      categories.spoof || 0
    );

    const isAppropriate = maxScore < 7; // Threshold for inappropriate content
    const confidence = Math.max(0.8, 1 - (maxScore / 10)); // Higher score = lower confidence
    
    const flagged = [];
    if ((categories.adult || 0) >= 7) flagged.push('adult');
    if ((categories.violence || 0) >= 7) flagged.push('violence');
    if ((categories.racy || 0) >= 7) flagged.push('racy');
    if ((categories.medical || 0) >= 7) flagged.push('medical');
    if ((categories.spoof || 0) >= 7) flagged.push('spoof');

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (maxScore >= 8) riskLevel = 'high';
    else if (maxScore >= 5) riskLevel = 'medium';

    return {
      isAppropriate,
      confidence,
      categories,
      flagged,
      riskLevel
    };

  } catch (error) {
    console.error('❌ Content safety check failed:', error);
    // Fallback to basic checks
    return performBasicContentCheck(imageUrl);
  }
}

/**
 * Fallback content safety check when AI analysis fails
 */
async function performBasicContentCheck(imageUrl: string): Promise<ContentSafetyResult> {
  // Basic heuristic checks
  const url = imageUrl.toLowerCase();
  const suspiciousPatterns = [
    'nsfw', 'adult', 'porn', 'sex', 'nude', 'naked',
    'violence', 'gore', 'blood', 'weapon', 'fight',
    'racy', 'provocative', 'suggestive'
  ];

  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => url.includes(pattern));
  
  return {
    isAppropriate: !hasSuspiciousPattern,
    confidence: 0.6, // Lower confidence for basic checks
    categories: {
      adult: hasSuspiciousPattern ? 5 : 0,
      violence: hasSuspiciousPattern ? 5 : 0,
      racy: hasSuspiciousPattern ? 5 : 0,
      medical: 0,
      spoof: 0
    },
    flagged: hasSuspiciousPattern ? ['suspicious_url'] : [],
    riskLevel: hasSuspiciousPattern ? 'medium' : 'low'
  };
}

/**
 * Convert image URL to base64 for API calls
 */
async function getImageBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    throw new Error('Failed to process image for content safety check');
  }
}

/**
 * Report inappropriate content for admin review
 */
export async function reportInappropriateContent(
  report: ContentReport
): Promise<void> {
  try {
    // Save report to database for admin review
    const response = await fetch('/api/admin/moderation/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'image',
        contentId: report.imageUrl,
        reportedBy: report.userId || 'anonymous',
        reportedUser: 'system',
        reason: report.reason,
        description: report.description,
        severity: 'high',
        status: 'pending'
      })
    });

    if (!response.ok) {
      console.error('Failed to save content report:', response.status);
    }
  } catch (error) {
    console.error('Error reporting inappropriate content:', error);
  }
}

/**
 * Get content safety guidelines for users
 */
export function getContentSafetyGuidelines(): string[] {
  return [
    "🚫 No nudity, sexual content, or adult material",
    "🚫 No violence, gore, or graphic content",
    "🚫 No hate speech or discriminatory content",
    "🚫 No spam, scams, or misleading content",
    "🚫 No illegal activities or harmful content",
    "✅ Keep content family-friendly and appropriate",
    "✅ Report any violations you encounter",
    "✅ Help maintain a safe community environment"
  ];
}

/**
 * Validate image before processing
 */
export function validateImageForProcessing(
  file: File,
  imageUrl: string
): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File too large. Maximum size is 10MB.' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Invalid file type. Please upload an image.' };
  }

  // Check for suspicious file names
  const fileName = file.name.toLowerCase();
  const suspiciousNames = ['nsfw', 'adult', 'porn', 'sex', 'nude', 'naked'];
  if (suspiciousNames.some(name => fileName.includes(name))) {
    return { isValid: false, error: 'File name contains inappropriate content.' };
  }

  // Check URL for suspicious patterns
  const url = imageUrl.toLowerCase();
  if (suspiciousNames.some(name => url.includes(name))) {
    return { isValid: false, error: 'Image URL contains inappropriate content.' };
  }

  return { isValid: true };
}

