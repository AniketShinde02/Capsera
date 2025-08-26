import { track } from '@vercel/analytics/react';

/**
 * A wrapper for Vercel Analytics to ensure all custom events use a safe,
 * flat payload structure, preventing circular JSON errors.
 */

/**
 * Tracks the 'ImageGenerated' event.
 * @param user - The user object. Should contain at least id and email.
 * @param imageData - The image data object. Should contain at least id and source.
 */
export function trackImageGenerated(user: any, imageData: any) {
  // Create a new, flat, and safe object to prevent circular references.
  const eventPayload = {
    userId: user?.id,
    email: user?.email, // Be mindful of sending PII
    imageId: imageData?.id,
    source: imageData?.source,
  };

  track('ImageGenerated', eventPayload);
}

// Add other tracking functions here following the same pattern.
