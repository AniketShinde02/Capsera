
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, UploadCloud, AlertTriangle, AlertCircle, ImageIcon, Zap, Brain, CheckCircle2, Camera, Palette, Wand2, Clock } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateCaptions } from "@/ai/flows/generate-caption";
import { CaptionCard } from "./caption-card";
import { Textarea } from "./ui/textarea";
import { trackCaptionGeneration, hasConsent, saveFavoriteMood } from "@/lib/cookie-utils";

const formSchema = z.object({
  mood: z.string({
    required_error: "Please select a mood",
  }).min(1, "Please select a mood"),
  description: z.string().optional(),
  image: z.any().optional(), // Handle validation manually
}).refine((data) => {
  // If custom mood is selected, description is required
  if (data.mood === "🎨 Custom / Your Style") {
    return data.description && data.description.trim().length > 0;
  }
  return true;
}, {
  message: "Please provide a description for your custom mood",
  path: ["description"]
});

const moods = [
  "😊 Happy / Cheerful", "😍 Romantic / Flirty", "😎 Cool / Confident",
  "😜 Fun / Playful", "🤔 Thoughtful / Deep", "😌 Calm / Peaceful",
  "😢 Sad / Emotional", "😏 Sassy / Savage", "😲 Surprised / Excited",
  "🌅 Aesthetic / Artsy", "👔 Formal / Professional", "📈 Business / Corporate",
  "📝 Informative / Educational", "🎩 Elegant / Sophisticated", "🏖 Casual / Chill",
  "🔥 Motivational / Inspirational", "🎉 Celebratory / Festive", "⚡ Bold / Daring",
  "🌍 Travel / Adventure", "🍔 Foodie / Culinary", "🐾 Pet / Cute",
  "🎵 Musical / Rhythmic", "🎨 Custom / Your Style", "🕰️ Vintage / Retro",
  "✨ New / Fresh", "👾 Gen Z / Trendy", "🎭 Dramatic / Theatrical",
  "🧘 Zen / Minimalist", "🎪 Whimsical / Magical", "🏆 Champion / Winner",
  "🌙 Mysterious / Enigmatic", "🎨 Creative / Artistic", "🚀 Futuristic / Tech",
  "🌿 Natural / Organic", "💎 Luxury / Premium", "🎯 Focused / Determined",
  "🌈 Colorful / Vibrant", "🕶️ Mysterious / Intriguing", "🎪 Circus / Entertainment",
  "🏰 Fantasy / Dreamy", "⚡ Energetic / Dynamic"
];

export function CaptionGenerator() {
  const [captions, setCaptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number, total: number, isAuthenticated: boolean } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'processing' | 'generating' | 'loading'>('idle');
  const [buttonMessage, setButtonMessage] = useState('Generate Captions');
  const [buttonIcon, setButtonIcon] = useState(<Sparkles className="mr-2 h-4 w-4" />);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLimitShake, setShowLimitShake] = useState(false);
  const [errorTimer, setErrorTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAutoDeleteMessage, setShowAutoDeleteMessage] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<{ url: string, publicId: string } | null>(null);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);
  const { data: session } = useSession();

  // Function to compress image while maintaining quality
  const compressImage = (file: File, maxSizeBytes: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const maxDimension = 2048; // Max dimension to prevent excessive memory usage
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to get under 10MB
        let quality = 0.9;
        let compressedBlob: Blob | null = null;
        
        const tryCompression = () => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (blob.size <= maxSizeBytes) {
                  // Success! Create new file
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else if (quality > 0.3) {
                  // Reduce quality and try again
                  quality -= 0.1;
                  tryCompression();
                } else {
                  // If still too large, reduce dimensions further
                  if (width > 1024 || height > 1024) {
                    width = Math.floor(width * 0.8);
                    height = Math.floor(height * 0.8);
                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);
                    quality = 0.9; // Reset quality
                    tryCompression();
                  } else {
                    reject(new Error('Unable to compress image to required size'));
                  }
                }
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        tryCompression();
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Function to update button states and messages
  const updateButtonState = (stage: 'idle' | 'uploading' | 'processing' | 'generating' | 'loading') => {
    setUploadStage(stage);
    switch (stage) {
      case 'idle':
        setButtonMessage('Generate Captions');
        setButtonIcon(<Sparkles className="mr-2 h-4 w-4" />);
        break;
      case 'uploading':
        setButtonMessage('Uploading Image...');
        setButtonIcon(<UploadCloud className="mr-2 h-4 w-4" />);
        break;
      case 'processing':
        setButtonMessage('Processing Image...');
        setButtonIcon(<ImageIcon className="mr-2 h-4 w-4" />);
        break;
      case 'generating':
        setButtonMessage('Generating Amazing Captions...');
        setButtonIcon(<Brain className="mr-2 h-4 w-4" />);
        break;
      case 'loading':
        setButtonMessage('Analyzing Your Image...');
        setButtonIcon(<ImageIcon className="mr-2 h-4 w-4" />);
        break;
    }
  };

  // Function to set error with auto-hide timer
  const setErrorWithTimer = (errorMessage: string, duration: number = 10000) => {
    // Clear any existing timer
    if (errorTimer) {
      clearTimeout(errorTimer);
    }

    setError(errorMessage);

    // Set new timer to auto-hide error (10 seconds)
    const timer = setTimeout(() => {
      setError('');
      setErrorTimer(null);
    }, duration);

    setErrorTimer(timer);
  };

  // Function to handle caption regeneration
  const handleRegenerateCaption = async (index: number) => {
    // Regeneration feature removed - not working properly
    setError('Regeneration feature is temporarily disabled');
  };

  // Function to clear error when user has used all free tokens
  const clearRateLimitError = () => {
    if (error && (error.includes('free images this month') ||
      error.includes('monthly limit') ||
      error.includes('free tokens') ||
      error.includes('hit your monthly limit') ||
      error.includes('quota will reset next month') ||
      error.includes('used all your free requests') ||
      error.includes('used all 5 free images this month') ||
      error.includes('You\'ve used all') ||
      error.includes('You\'ve reached your monthly limit'))) {
      // Don't clear error immediately - let the timer handle it
      // setError(''); // Commented out to respect the 10-second timer

      // Show success message briefly
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [errorTimer]);

  // Update the deleteImage function to handle archiving
  const deleteImage = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          userId: session?.user?.id
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message about archiving
        setError('');
        setShowSuccessMessage(true);
        setSuccessMessage(data.message || 'Image moved to archive successfully');

        // Clear success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 5000);

        console.log('✅ Image archived successfully:', data.archivedId);
      } else {
        setError(data.message || 'Failed to archive image');
      }
    } catch (error) {
      console.error('Error archiving image:', error);
      setError('Failed to archive image. Please try again.');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: "",
      description: "",
    },
    mode: "onChange", // Add this to enable real-time validation
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📸 Image upload triggered:', e.target.files);
    const file = e.target.files?.[0];

    // Clear previous errors, but preserve monthly limit errors
    if (!error.includes('monthly limit') && !error.includes('used all') && !error.includes('quota will reset')) {
      setError('');
    }
    // Don't clear rate limit errors - let them stay visible for 10 seconds
    // clearRateLimitError();

    if (file) {
      console.log('✅ File selected:', file.name, file.size, file.type);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Invalid file type. Please upload an image (PNG, JPG, or GIF).');
        return;
      }

      // Validate specific image formats
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Unsupported image format. Please upload PNG, JPG, or GIF files only.');
        return;
      }

      try {
        let processedFile = file;
        const maxSize = 10 * 1024 * 1024; // 10MB limit for Cloudinary compatibility
        
        // If file is larger than 10MB, compress it
        if (file.size > maxSize) {
          console.log('🔄 Compressing high-resolution image...');
          setError('🔄 Compressing your high-resolution image to meet upload requirements...');
          
          processedFile = await compressImage(file, maxSize);
          
          const originalSize = (file.size / (1024 * 1024)).toFixed(1);
          const compressedSize = (processedFile.size / (1024 * 1024)).toFixed(1);
          console.log(`✅ Image compressed: ${originalSize}MB → ${compressedSize}MB`);
          
          setError(''); // Clear compression message
        }

        setUploadedFile(processedFile);

        // Clear image-related error when user uploads a valid image
        if (error === "Please upload an image to generate captions.") {
          setError('');
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          console.log('🖼️ Image preview generated');
          setImagePreview(result);
        };

        reader.onerror = () => {
          console.error('❌ FileReader error:', reader.error);
          setError('Failed to read image file. Please try again.');
        };

        reader.readAsDataURL(processedFile);
        
      } catch (compressionError) {
        console.error('❌ Image compression failed:', compressionError);
        setError('Failed to process your high-resolution image. Please try with a smaller image or different format.');
      }
    } else {
      console.log('❌ No file selected');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const startTime = Date.now(); // Track processing time for analytics
    console.log('🎯 Form submission started:', values);
    console.log('📸 Uploaded file:', uploadedFile);
    console.log('🎭 Selected mood:', values.mood);

    // Validate that an image is uploaded
    if (!uploadedFile) {
      setError("Please upload an image to generate captions.");
      console.log('❌ No image uploaded');
      return;
    }

    // Validate that mood is selected
    if (!values.mood || values.mood.trim() === '') {
      setError("Please select a mood for your caption.");
      console.log('❌ No mood selected');
      return;
    }

    console.log('✅ Validation passed, checking rate limit first...');
    setIsLoading(true);
    setCaptions([]);
    // Don't clear monthly limit errors - let them stay visible
    if (!error.includes('monthly limit') && !error.includes('used all') && !error.includes('quota will reset')) {
      setError('');
    }
    updateButtonState('processing');

    try {
      // 🔍 CORRECT FLOW: Check quota FIRST, then upload if allowed
      console.log('🔍 Checking quota before proceeding...');

      // Step 1: Check quota first (with reasonable timeout)
      updateButtonState('loading');
      console.log('🔍 Checking rate limits...');

      // ⚡ SPEED OPTIMIZATION: Quick network check
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      let quotaResponse;
      try {
        // ⚡ SPEED OPTIMIZATION: Add reasonable timeout for quota check
        const quotaController = new AbortController();
        const quotaTimeout = setTimeout(() => quotaController.abort(), 15000); // 15 second timeout - reasonable for quota check

        quotaResponse = await fetch('/api/rate-limit-info', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
          },
          signal: quotaController.signal,
        });

        clearTimeout(quotaTimeout);
      } catch (fetchError: any) {
        console.error('❌ Fetch error during quota check:', fetchError);
        if (fetchError.name === 'AbortError') {
          throw new Error('Quota check is taking too long. Please try again.');
        }
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
        throw new Error('Failed to check quota. Please try again.');
      }

      if (!quotaResponse.ok) {
        throw new Error('Failed to check quota. Please try again.');
      }

      let quotaData;
      try {
        quotaData = await quotaResponse.json();
      } catch (parseError) {
        throw new Error('Failed to check quota. Please try again.');
      }

      if (quotaData.remaining <= 0) {
        // User has no quota left - don't upload image
        const errorMessage = quotaData.isAuthenticated
          ? "You've hit your monthly limit! Your quota will reset next month. Upgrade your plan for unlimited captions!"
          : "You've used all your free images this month! Sign up for a free account to get 25 monthly images (75 captions). Your free quota resets next month.";

        setErrorWithTimer(errorMessage, 10000);
        setShowLimitShake(true);
        setTimeout(() => setShowLimitShake(false), 600);
        setIsLoading(false);
        updateButtonState('idle');
        return;
      }

      console.log('✅ Rate limit check passed. Remaining:', quotaData.remaining, '/', quotaData.maxGenerations);

      // Update quota info in UI
      setQuotaInfo({
        remaining: quotaData.remaining,
        total: quotaData.maxGenerations,
        isAuthenticated: quotaData.isAuthenticated
      });

      // Store current data for regeneration
      setCurrentMood(values.mood);
      setCurrentDescription(values.description || '');

      // Step 2: Now upload image (only if quota check passed)
      updateButtonState('uploading');
      console.log('📤 Starting image upload...');

      // Show upload progress for better user experience
      setButtonMessage('Uploading image...');
      setButtonIcon(<UploadCloud className="mr-2 h-4 w-4 animate-pulse" />);

      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Add timeout protection for upload with realistic timing
      const uploadController = new AbortController();
      const uploadTimeout = setTimeout(() => {
        console.log('⏰ Upload timeout triggered - aborting upload');
        uploadController.abort();
      }, 60000); // 60 second timeout - realistic for large images and slow connections

      // ⚡ USER EXPERIENCE: Show timeout warning at 45 seconds
      const uploadWarningTimeout = setTimeout(() => {
        setButtonMessage('Upload taking longer than usual...');
        setButtonIcon(<Clock className="mr-2 h-4 w-4 animate-pulse text-yellow-500" />);
      }, 45000);

      let uploadResponse;
      try {
        uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: uploadController.signal,
        });
      } catch (fetchError: any) {
        console.error('❌ Fetch error during upload:', fetchError);

        // Handle different error types properly
        if (fetchError.name === 'AbortError') {
          clearTimeout(uploadTimeout);
          throw new Error('Upload is taking too long. Please try with a smaller image or check your connection.');
        }

        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          clearTimeout(uploadTimeout);
          throw new Error('Network error during upload. Please check your internet connection and try again.');
        }

        clearTimeout(uploadTimeout);
        throw new Error('Upload failed. Please try again.');
      }

      clearTimeout(uploadTimeout);
      clearTimeout(uploadWarningTimeout); // Clear the warning timeout

      // Check if upload response is valid
      if (!uploadResponse.ok) {
        let uploadErrorMessage = 'Image upload failed.';

        try {
          const uploadErrorData = await uploadResponse.json();
          uploadErrorMessage = uploadErrorData.message || uploadErrorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse upload error response:', parseError);
          // Handle different HTTP status codes
          switch (uploadResponse.status) {
            case 413:
              uploadErrorMessage = 'Image is too big in size. Please upload an image smaller than 10MB.';
              break;
            case 400:
              uploadErrorMessage = 'Invalid image file. Please check the file format and try again.';
              break;
            case 500:
              uploadErrorMessage = 'Server error during upload. Please try again later.';
              break;
            default:
              uploadErrorMessage = `Upload failed (${uploadResponse.status}). Please try again.`;
          }
        }

        throw new Error(uploadErrorMessage);
      }

      let uploadData;
      try {
        uploadData = await uploadResponse.json();
      } catch (parseError) {
        console.error('❌ Failed to parse upload response:', parseError);
        throw new Error('Failed to process upload response. Please try again.');
      }

      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Image upload failed. Please try again.');
      }

      console.log('✅ Image uploaded successfully:', uploadData.url);

      // Store image data for regeneration
      setCurrentImageData({
        url: uploadData.url,
        publicId: uploadData.public_id
      });

      // Send to AI for analysis
      console.log('📸 Sending to AI for analysis:', {
        mood: values.mood,
        description: values.description || '',
        imageUrl: uploadData.url,
        userId: session?.user?.id || undefined
      });

      updateButtonState('processing');

      // Step 3: Generate captions (with realistic timeout for AI processing)
      updateButtonState('generating');
      console.log('🧠 Starting AI caption generation...');

      // ⚡ SPEED OPTIMIZATION: Show immediate feedback
      setButtonMessage('AI is analyzing your image...');
      setButtonIcon(<Brain className="mr-2 h-4 w-4 animate-pulse" />);

      // ⚡ SPEED OPTIMIZATION: Realistic timeout for AI processing
      const captionController = new AbortController();
      const captionTimeout = setTimeout(() => {
        console.log('⏰ Caption generation timeout triggered - aborting AI request');
        captionController.abort();
      }, 90000); // 90 second timeout - realistic for AI processing, large images, and complex prompts

      // ⚡ USER EXPERIENCE: Show timeout warning at 60 seconds
      const captionWarningTimeout = setTimeout(() => {
        setButtonMessage('AI is taking longer than usual...');
        setButtonIcon(<Clock className="mr-2 h-4 w-4 animate-pulse text-yellow-500" />);
      }, 60000);

      let captionResponse;
      try {
        captionResponse = await fetch('/api/generate-captions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mood: values.mood,
            description: values.description,
            imageUrl: uploadData.url,
            publicId: uploadData.public_id, // Store Cloudinary public ID for deletion
          }),
          signal: captionController.signal,
        });
      } catch (fetchError: any) {
        console.error('❌ Fetch error during caption generation:', fetchError);

        // Handle different error types properly
        if (fetchError.name === 'AbortError') {
          clearTimeout(captionTimeout);
          throw new Error('AI is taking too long to generate captions. Please try with a simpler image or try again later.');
        }

        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          clearTimeout(captionTimeout);
          throw new Error('Network error during caption generation. Please check your internet connection and try again.');
        }

        clearTimeout(captionTimeout);
        throw new Error('Caption generation failed. Please try again.');
      }

      clearTimeout(captionTimeout);
      clearTimeout(captionWarningTimeout); // Clear the warning timeout

      // Check if caption response is valid
      if (!captionResponse.ok) {
        let captionErrorMessage = 'Failed to generate captions.';

        try {
          const captionErrorData = await captionResponse.json();
          captionErrorMessage = captionErrorData.message || captionErrorMessage;

          // Handle specific error types - IMPORTANT: Throw error immediately to preserve server message
          if (captionResponse.status === 429) {
            // Always preserve the server message for 429 errors
            throw new Error(captionErrorData.message || 'You have used all your free requests. Please try again later or upgrade your plan.');
          }

          if (captionResponse.status === 503) {
            if (captionErrorData.type === 'ai_config_error') {
              throw new Error('AI service is not configured. Please contact support.');
            } else if (captionErrorData.type === 'ai_service_error') {
              throw new Error('AI service is temporarily unavailable. Please try again later.');
            }
          }

          // If we reach here, throw the error with the server message
          throw new Error(captionErrorMessage);
        } catch (parseError) {
          console.error('❌ Failed to parse caption error response:', parseError);

          // Only use fallback messages if we couldn't parse the server response
          if (parseError instanceof Error && parseError.message !== captionErrorMessage) {
            // This means the server message was successfully parsed and thrown
            throw parseError; // Re-throw the server message
          }

          // Fallback to generic messages only if parsing failed
          switch (captionResponse.status) {
            case 400:
              captionErrorMessage = 'Invalid request. Please check your input and try again.';
              break;
            case 429:
              captionErrorMessage = 'You have used all your free requests. Please try again later or upgrade your plan.';
              break;
            case 500:
              captionErrorMessage = 'Server error during caption generation. Please try again later.';
              break;
            case 503:
              captionErrorMessage = 'AI service is temporarily unavailable. Please try again later.';
              break;
            default:
              captionErrorMessage = `Caption generation failed (${captionResponse.status}). Please try again.`;
          }

          throw new Error(captionErrorMessage);
        }
      }

      let captionData;
      try {
        captionData = await captionResponse.json();
        console.log('🔍 Caption response data:', captionData);
        console.log('🔍 Response structure:', {
          success: captionData.success,
          hasCaptions: !!captionData.captions,
          captionsType: typeof captionData.captions,
          isArray: Array.isArray(captionData.captions),
          captionsLength: captionData.captions?.length || 0
        });
      } catch (parseError) {
        console.error('❌ Failed to parse caption response:', parseError);
        throw new Error('Failed to process caption response. Please try again.');
      }

      console.log('🔍 Processing caption data:', {
        success: captionData.success,
        captions: captionData.captions,
        captionsType: typeof captionData.captions,
        isArray: Array.isArray(captionData.captions),
        length: captionData.captions?.length || 0
      });

      if (captionData.success && captionData.captions && Array.isArray(captionData.captions) && captionData.captions.length > 0) {
        // Validate that captions are actually strings and not empty
        const validCaptions = captionData.captions.filter((caption: any) =>
          typeof caption === 'string' && caption.trim().length > 0
        );

        console.log('🔍 Valid captions found:', validCaptions.length);

        if (validCaptions.length === 0) {
          throw new Error('Generated captions are invalid. Please try again.');
        }

        setCaptions(validCaptions);

        // Track analytics if consent given
        if (hasConsent('analytics')) {
          // Ensure startTime is defined and accessible in this scope
          const processingTime = typeof startTime === 'number' ? Date.now() - startTime : 0;
          trackCaptionGeneration({
            mood: currentMood,
            imageSize: uploadedFile?.size || 0,
            processingTime,
            success: true
          });
        }

        // Save mood preference if personalization consent given
        if (hasConsent('personalization')) {
          saveFavoriteMood(currentMood);
        }

        // Refresh quota info after successful generation
        setRefreshTrigger(prev => prev + 1);
        console.log('✅ Captions set successfully');

        // 🗑️ AUTO-DELETE IMAGE FOR ANONYMOUS USERS
        if (!quotaData.isAuthenticated && uploadData.public_id) {
          console.log('🗑️ Anonymous user - auto-deleting image after caption generation');

          // Show auto-deletion message to user
          setShowAutoDeleteMessage(true);
          setTimeout(() => setShowAutoDeleteMessage(false), 5000); // Hide after 5 seconds

          // Auto-delete image in background (don't wait for response)
          fetch('/api/delete-image', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: uploadData.url,
              publicId: uploadData.public_id,
            }),
          }).then(response => {
            if (response.ok) {
              console.log('✅ Anonymous user image auto-deleted successfully');
            } else {
              console.warn('⚠️ Failed to auto-delete anonymous user image');
            }
          }).catch(error => {
            console.warn('⚠️ Error during auto-deletion of anonymous user image:', error);
          });
        } else if (quotaData.isAuthenticated) {
          console.log('✅ Authenticated user - image saved permanently in Cloudinary');
        }
      } else {
        console.error('❌ Invalid caption data structure:', captionData);
        throw new Error("Couldn't generate captions. Please try again.");
      }

    } catch (error: any) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        if (error.message.includes('upload')) {
          setError('Image upload timed out. Please check your internet connection and try again.');
        } else {
          setError('Caption generation timed out. Please try again with a smaller image or better connection.');
        }
        return;
      }

      // Enhanced error logging for debugging
      console.error("Caption Generation Error:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause
      });

      // Track failed generation analytics if consent given
      if (hasConsent('analytics')) {
        const processingTime = Date.now() - startTime;
        trackCaptionGeneration({
          mood: currentMood,
          imageSize: uploadedFile?.size || 0,
          processingTime,
          success: false,
          error: error.message
        });
      }

      // Only log non-rate-limit errors to avoid console spam
      if (!error.message?.includes('free images this month') &&
        !error.message?.includes('monthly limit') &&
        !error.message?.includes('quota will reset') &&
        !error.message?.includes('hit your monthly limit') &&
        !error.message?.includes('used all your free requests') &&
        !error.message?.includes('used all 5 free images this month') &&
        !error.message?.includes('You\'ve used all') &&
        !error.message?.includes('You\'ve reached your monthly limit')) {
        console.error("Caption Generation Error:", error);
      }

      // If it's a rate limit error, trigger quota refresh and shake animation
      if (error.message?.includes('free images this month') ||
        error.message?.includes('monthly limit') ||
        error.message?.includes('quota will reset') ||
        error.message?.includes('hit your monthly limit') ||
        error.message?.includes('used all your free requests') ||
        error.message?.includes('used all 5 free images this month') ||
        error.message?.includes('You\'ve used all') ||
        error.message?.includes('You\'ve reached your monthly limit')) {
        console.log('🎯 Monthly limit detected, triggering shake animation and quota refresh');
        setRefreshTrigger(prev => prev + 1);
        setShowLimitShake(true);
        // Force immediate quota refresh
        setTimeout(() => {
          fetch('/api/rate-limit-info')
            .then(response => response.json())
            .then(data => {
              setQuotaInfo({
                remaining: data.remaining,
                total: data.maxGenerations,
                isAuthenticated: data.isAuthenticated
              });
              console.log('🔄 Forced quota refresh after monthly limit:', data.remaining, '/', data.maxGenerations);
            })
            .catch(err => console.error('Failed to force refresh quota:', err));
        }, 100);
        // Reset shake animation after animation completes
        setTimeout(() => setShowLimitShake(false), 600);

        // Set error with timer for monthly limit errors
        setErrorWithTimer(error.message, 10000);
      } else {
        // Set error with timer for other errors
        setErrorWithTimer(error.message, 10000);
      }
    } finally {
      setIsLoading(false);
      updateButtonState('idle');
    }
  }


  // Fetch quota info on component mount, session changes, and refresh triggers
  useEffect(() => {
    const fetchQuotaInfo = async () => {
      try {
        const response = await fetch('/api/rate-limit-info');
        if (response.ok) {
          const data = await response.json();
          setQuotaInfo({
            remaining: data.remaining,
            total: data.maxGenerations,
            isAuthenticated: data.isAuthenticated
          });
          console.log('�� Quota info updated:', data.remaining, '/', data.maxGenerations);
        }
      } catch (error) {
        console.error('Failed to fetch quota info:', error);
      }
    };
    fetchQuotaInfo();
  }, [session, refreshTrigger]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex justify-center items-start py-6">
      {/* Main Centered Card - Optimized for 1920x1080 */}
      <div className="w-full max-w-5xl mx-auto px-4">
        <div className="bg-[#F2EFE5]/50 dark:bg-card/50 backdrop-blur-sm border border-[#C7C8CC]/80 dark:border-border rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8">

          {/* Card Header - Mobile Responsive */}
          <div className="text-center mb-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">
              AI Caption Generator
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
              Upload an image, choose your mood, and get 3 unique captions instantly
            </p>



            {/* Network Status Indicator */}
            {!isOnline && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>No internet connection. Please check your network.</span>
                </div>
              </div>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Responsive Grid Layout - Mobile First */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 items-start">

                {/* Left Column: Compact Input Section - Mobile Optimized */}
                <div className="lg:col-span-1 space-y-3">

                  {/* Image Upload - Compact */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Image Upload
                    </h3>
                    <label
                      htmlFor="file-upload"
                      // Don't clear rate limit errors on click - let them stay visible for 10 seconds
                      // onClick={clearRateLimitError}
                      className={`flex flex-col items-center justify-center w-full h-32 rounded-xl transition-all duration-500 cursor-pointer shadow-sm overflow-hidden active:scale-95 upload-area-dotted ${uploadStage === 'uploading'
                          ? 'border-primary/80 bg-primary/5 animate-upload-pulse'
                          : uploadStage === 'processing'
                            ? 'border-secondary/80 bg-secondary/5 animate-processing-glow'
                            : uploadStage === 'generating'
                              ? 'border-accent/80 bg-accent/5 animate-generating-sparkle'
                              : uploadStage === 'loading'
                                ? 'border-accent/80 bg-accent/5 animate-processing-glow'
                                : 'bg-[#F2EFE5]/50 dark:bg-background/50 hover:bg-[#E3E1D9]/60 dark:hover:bg-muted/40 hover:shadow-md'
                        }`}
                    >
                      {imagePreview && uploadStage === 'idle' ? (
                        <div className="relative w-full h-full bg-muted/20">
                          <Image
                            src={imagePreview}
                            alt="Uploaded preview"
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      ) : uploadStage !== 'idle' ? (
                        <div className="flex flex-col items-center justify-center px-3 text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${uploadStage === 'uploading'
                              ? 'bg-primary/20 animate-upload-pulse'
                              : uploadStage === 'processing'
                                ? 'bg-secondary/20 animate-processing-glow'
                                : uploadStage === 'generating'
                                  ? 'bg-accent/20 animate-generating-sparkle'
                                  : uploadStage === 'loading'
                                    ? 'bg-accent/20 animate-processing-glow'
                                    : 'bg-primary/20'
                            }`}>
                            {uploadStage === 'uploading' && (
                              <UploadCloud className="w-6 h-6 text-primary" />
                            )}
                            {uploadStage === 'processing' && (
                              <ImageIcon className="w-6 h-6 text-secondary" />
                            )}
                            {uploadStage === 'generating' && (
                              <Brain className="w-6 h-6 text-accent" />
                            )}
                            {uploadStage === 'loading' && (
                              <ImageIcon className="w-6 h-6 text-accent" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {uploadStage === 'uploading' && 'Uploading Image...'}
                            {uploadStage === 'processing' && 'Processing Image...'}
                            {uploadStage === 'generating' && 'Generating Captions...'}
                            {uploadStage === 'loading' && 'Processing Your Image...'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {uploadStage === 'uploading' && 'Please wait while we upload your image'}
                            {uploadStage === 'processing' && 'Analyzing your image for caption generation'}
                            {uploadStage === 'generating' && 'Creating amazing captions for you'}
                            {uploadStage === 'loading' && 'Please wait while we process your image'}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-3 text-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <UploadCloud className="w-5 h-5 text-primary" />
                          </div>
                                                      <p className="text-xs text-muted-foreground font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF - Auto-compression for high-res images</p>
                        </div>
                      )}
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleImageChange}
                      />
                    </label>

                    {/* Compact Error Display for Non-Monthly Limit Errors - Mobile Responsive */}
                    {error && !error.includes('monthly limit') && !error.includes('used all') && !error.includes('quota will reset') && (
                      <div className="px-2 sm:px-3">
                        <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 text-center leading-relaxed break-words">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Compact Success Message */}
                    {showSuccessMessage && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-all duration-300">
                        <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                          Ready to continue! 🚀
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mood Selection - Compact */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all duration-300 ${uploadStage === 'generating'
                          ? 'bg-accent animate-pulse'
                          : 'bg-secondary'
                        }`}></span>
                      Mood Style
                    </h3>
                    <FormField
                      control={form.control}
                      name="mood"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Clear error when user selects a mood
                              if (error && error.includes('Please select a mood')) {
                                setError('');
                              }
                              // Don't clear rate limit errors - let them stay visible for 10 seconds
                              // clearRateLimitError();
                            }}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger className={`bg-[#F2EFE5]/50 dark:bg-background/50 border-[#C7C8CC]/80 dark:border-border h-10 rounded-xl text-sm transition-all duration-300 ${uploadStage === 'generating'
                                  ? 'border-accent/60 bg-accent/5 animate-pulse'
                                  : 'border-[#C7C8CC]/80'
                                }`}>
                                <SelectValue placeholder="Choose your vibe..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl max-h-60">
                              {moods.map((mood) => (
                                <SelectItem key={mood} value={mood} className="text-sm rounded-lg">
                                  {mood}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${uploadStage === 'generating'
                                ? 'bg-accent animate-pulse'
                                : 'bg-accent'
                              }`}></span>
                            Each mood generates 3 unique styles
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description - Compact */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full transition-all duration-300 ${uploadStage === 'generating'
                          ? 'bg-accent animate-pulse'
                          : 'bg-accent'
                        }`}></span>
                      Description {form.watch("mood") === "🎨 Custom / Your Style" ? "(Required)" : "(Optional)"}
                    </h3>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder={form.watch("mood") === "🎨 Custom / Your Style"
                                ? "Describe your custom mood style (e.g., Cyberpunk aesthetic with neon colors, 80s retro vibes, etc.)..."
                                : "e.g., A golden retriever puppy playing in a field of flowers..."}
                              className={`min-h-[70px] bg-[#F2EFE5]/50 dark:bg-background/50 border-[#C7C8CC]/80 dark:border-border text-sm resize-none rounded-xl transition-all duration-300 ${uploadStage === 'generating'
                                  ? 'border-accent/60 bg-accent/5 animate-pulse'
                                  : 'border-[#C7C8CC]/80'
                                }`}
                              // Don't clear rate limit errors on focus - let them stay visible for 10 seconds
                              // onFocus={clearRateLimitError}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Progress Indicator */}
                  {isLoading && (
                    <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ease-out ${uploadStage === 'uploading'
                          ? 'bg-primary w-1/3'
                          : uploadStage === 'processing'
                            ? 'bg-secondary w-2/3'
                            : uploadStage === 'generating'
                              ? 'bg-accent w-full'
                              : uploadStage === 'loading'
                                ? 'bg-accent w-3/4'
                                : 'bg-primary w-0'
                        }`}></div>
                    </div>
                  )}

                  {/* Generate Button - Compact */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    size="lg"
                    className="w-full h-11 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-100 shadow-lg shadow-primary/20 hover:shadow-primary/40 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    {isLoading ? (
                      <>
                        {buttonIcon}
                        {buttonMessage}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Captions
                      </>
                    )}
                  </Button>

                  {/* Clean Quota Info - Single Card Only */}
                  {quotaInfo && (
                    <div className={`p-2 sm:p-3 border rounded-xl text-center transition-all duration-300 ${quotaInfo.remaining === 0
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                        : 'bg-[#E3E1D9]/30 dark:bg-muted/30 border-[#C7C8CC]/60 dark:border-border'
                      } ${showLimitShake ? 'animate-shake-limit' : ''}`}>
                      <div className={`text-xs mb-1 flex items-center justify-center gap-1 ${quotaInfo.remaining === 0
                          ? 'text-red-700 dark:text-red-300 font-medium'
                          : 'text-muted-foreground'
                        }`}>
                        {quotaInfo.remaining === 0 && <AlertTriangle className="w-3 h-3" />}
                        {quotaInfo.isAuthenticated ? (
                          <span className="text-xs sm:text-sm">Monthly: {quotaInfo.remaining}/{quotaInfo.total} images</span>
                        ) : (
                          <span className="text-xs sm:text-sm">Free trial: {quotaInfo.remaining}/{quotaInfo.total} images</span>
                        )}
                      </div>

                      <p className={`text-xs mt-2 ${quotaInfo.remaining === 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                        }`}>
                        💡 Each image = 3 captions
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Results - Mobile Responsive */}
                <div className="lg:col-span-1 xl:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base lg:text-lg font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Generated Captions
                    </h3>
                    {captions.length > 0 && (
                      <div className="text-xs text-muted-foreground bg-[#E3E1D9]/50 dark:bg-muted/50 px-3 py-1 rounded-full">
                        {captions.length} captions ready
                      </div>
                    )}
                  </div>

                  {/* Results Grid - Mobile Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-h-[280px] sm:min-h-[320px]">
                    {isLoading ? (
                      // Loading State - Compact with enhanced animations
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`bg-muted/20 p-4 space-y-3 border border-border rounded-xl shadow-sm transition-all duration-500 ${uploadStage === 'uploading'
                            ? 'bg-primary/5'
                            : uploadStage === 'processing'
                              ? 'bg-secondary/5'
                              : uploadStage === 'generating'
                                ? 'bg-accent/5'
                                : uploadStage === 'loading'
                                  ? 'bg-accent/5'
                                  : ''
                          }`}>
                          <div className={`h-4 rounded transition-all duration-700 ${uploadStage === 'uploading'
                              ? 'bg-primary/30 w-3/4'
                              : uploadStage === 'processing'
                                ? 'bg-secondary/30 w-full'
                                : uploadStage === 'generating'
                                  ? 'bg-accent/30 w-3/4'
                                  : uploadStage === 'loading'
                                    ? 'bg-accent/30 w-3/4'
                                    : 'bg-muted w-3/4'
                            }`}></div>
                          <div className={`h-4 rounded transition-all duration-700 delay-100 ${uploadStage === 'uploading'
                              ? 'bg-primary/30 w-full'
                              : uploadStage === 'processing'
                                ? 'bg-secondary/30 w-1/2'
                                : uploadStage === 'generating'
                                  ? 'bg-accent/30 w-full'
                                  : uploadStage === 'loading'
                                    ? 'bg-accent/30 w-full'
                                    : 'bg-muted w-full'
                            }`}></div>
                          <div className={`h-4 rounded transition-all duration-700 delay-200 ${uploadStage === 'uploading'
                              ? 'bg-primary/30 w-1/2'
                              : uploadStage === 'processing'
                                ? 'bg-secondary/30 w-3/4'
                                : uploadStage === 'generating'
                                  ? 'bg-accent/30 w-1/2'
                                  : 'bg-muted w-1/2'
                            }`}></div>
                          <div className="pt-3 border-t border-border/50">
                            <div className={`h-8 rounded-lg transition-all duration-700 delay-300 ${uploadStage === 'uploading'
                                ? 'bg-primary/30 w-full'
                                : uploadStage === 'processing'
                                  ? 'bg-secondary/30 w-2/3'
                                  : uploadStage === 'generating'
                                    ? 'bg-accent/30 w-full'
                                    : 'bg-muted w-full'
                              }`}></div>
                          </div>
                        </div>
                      ))
                    ) : captions.length > 0 ? (
                      // Generated Captions - Compact
                      captions.map((caption, index) => (
                        <CaptionCard
                          key={index}
                          caption={caption}
                          index={index}
                          onRegenerate={handleRegenerateCaption}
                          isRegenerating={false} // Regeneration removed
                        />
                      ))
                    ) : (
                      // Empty State - Compact
                      <div className="col-span-full flex flex-col items-center justify-center h-80 text-center p-6 bg-[#E3E1D9]/10 dark:bg-muted/10 border border-[#C7C8CC]/60 dark:border-border rounded-xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-3 animate-pulse">
                          <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Ready to Generate</h4>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                          Upload an image, select a mood, and click generate to create your first captions.
                          Each generation creates 3 unique styles for maximum variety.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Auto-deletion message for anonymous users */}
                  {showAutoDeleteMessage && (
                    <div className="col-span-full mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm font-medium">
                          🗑️ Your image has been automatically deleted for privacy
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                        Anonymous users' images are deleted after caption generation. Sign up to save images permanently!
                      </p>
                    </div>
                  )}

                  {/* Disclaimer - Compact */}
                  {!session && (
                    <div className="text-muted-foreground flex items-start justify-start text-left max-w-md mx-auto p-3  ">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-amber-500" />
                      <div className="text-xs space-y-1">
                      <p>Sign up for unlimited generation & save your favorites!</p>
                      </div>
                    </div>
                  )}


                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Detailed Error Message Outside Main Container Card - Responsive & Mobile Optimized */}
        {error && (error.includes('monthly limit') || error.includes('used all') || error.includes('quota will reset')) && (
          <div className="mt-4 px-2 sm:px-4 max-w-2xl mx-auto">
            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 text-center leading-relaxed break-words">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
