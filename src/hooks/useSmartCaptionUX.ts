/**
 * SMART UX HOOKS - For Caption Generator
 * 
 * This file contains smart UX logic that can be gradually integrated
 * into the caption-generator.tsx Component without breaking existing functionality.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to track if the uploaded image has changed after caption generation
 */
export function useImageChangeDetection() {
    const [imageHasChanged, setImageHasChanged] = useState(false);
    const [lastGeneratedImageId, setLastGeneratedImageId] = useState<string | null>(null);

    const markImageAsChanged = () => setImageHasChanged(true);
    const markImageAsGenerated = (imageId: string) => {
        setLastGeneratedImageId(imageId);
        setImageHasChanged(false);
    };
    const resetTracking = () => {
        setImageHasChanged(false);
        setLastGeneratedImageId(null);
    };

    return {
        imageHasChanged,
        lastGeneratedImageId,
        markImageAsChanged,
        markImageAsGenerated,
        resetTracking,
    };
}

/**
 * Smart button configuration based on current state
 */
export function getSmartButtonConfig(params: {
    hasCaptions: boolean;
    imageHasChanged: boolean;
    isLoading: boolean;
}) {
    const { hasCaptions, imageHasChanged, isLoading } = params;

    if (isLoading) {
        return {
            text: 'Generating...',
            action: 'loading',
            shouldPreserveMood: true,
        };
    }

    // Scenario A: Same image, captions already generated → Regenerate
    if (hasCaptions && !imageHasChanged) {
        return {
            text: '✨ Generate Another Set',
            action: 'regenerate',
            shouldPreserveMood: true, // KEY: Keep mood and description
        };
    }

    // Scenario B: New image after generation → Generate new
    if (hasCaptions && imageHasChanged) {
        return {
            text: '🎨 Generate Captions',
            action: 'generate-new',
            shouldPreserveMood: true, // Still preserve for convenience
        };
    }

    // Scenario C: Initial state
    return {
        text: '🎨 Generate Captions',
        action: 'generate',
        shouldPreserveMood: false,
    };
}

/**
 * Hook to preserve form values across regenerations
 */
export function usePreservedFormValues(initialMood?: string, initialDescription?: string) {
    const [preservedMood, setPreservedMood] = useState(initialMood || '');
    const [preservedDescription, setPreservedDescription] = useState(initialDescription || '');

    const updatePreservedValues = (mood: string, description?: string) => {
        setPreservedMood(mood);
        setPreservedDescription(description || '');
    };

    const clearPreservedValues = () => {
        setPreservedMood('');
        setPreservedDescription('');
    };

    return {
        preservedMood,
        preservedDescription,
        updatePreservedValues,
        clearPreservedValues,
    };
}
