"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Sparkles, UploadCloud, AlertTriangle, AlertCircle, ImageIcon, Zap, Brain, CheckCircle2, Camera, Palette, Wand2, Clock, CheckSquare, Square, Trash2, UserPlus, Crown, Star, Upload } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/context/AuthModalContext";

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
import { compressWithWorker } from '@/lib/worker-client';
import { FloatingFeedbackWidget } from "./feedback/FloatingFeedbackWidget";

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

// ImageRenderer component for simplified image rendering logic
interface ImageRendererProps {
  imageSrc: string | null | undefined;
  onLoadStart: () => void;
  onLoad: () => void;
  onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  imageLoading: boolean;
}

const ImageRenderer = ({ imageSrc, onLoadStart, onLoad, onError, imageLoading }: ImageRendererProps) => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3; // Increased retries for better reliability
  
  const isObjectUrl = imageSrc?.startsWith('blob:');
  const isCloudinaryUrl = imageSrc?.includes('cloudinary.com');
  
  // Ensure Cloudinary URLs have proper format
  const getOptimizedUrl = (url: string) => {
    if (isCloudinaryUrl && !url.includes('f_auto') && !url.includes('q_auto')) {
      // Add Cloudinary optimization parameters if missing
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}f_auto,q_auto`;
    }
    return url;
  };
  
  const optimizedSrc = imageSrc ? getOptimizedUrl(imageSrc) : imageSrc;
  
  // Use useEffect to trigger onLoadStart when component mounts or src changes
  useEffect(() => {
    if (optimizedSrc) {
      onLoadStart?.();
    }
  }, [optimizedSrc, onLoadStart]);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ Image failed to load:', imageSrc?.substring(0, 50) + '...');
    
    if (retryCount < maxRetries && isCloudinaryUrl) {
      // Retry Cloudinary images with cache-busting
      setRetryCount(prev => prev + 1);
      const target = e.target as HTMLImageElement;
      target.src = `${optimizedSrc}?retry=${retryCount + 1}&t=${Date.now()}`;
      return;
    }
    
    setHasError(true);
    onError?.(e);
  };
  
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('✅ Image loaded successfully in ImageRenderer component');
    setHasError(false);
    setRetryCount(0);
    onLoad?.();
  };
  
  const commonProps = {
    src: optimizedSrc,
    alt: "Uploaded preview",
    className: "w-full h-full object-contain",
    loading: "lazy" as const,
    decoding: "async" as const,
    onLoad: handleLoad,
    onError: handleError,
    // Remove onLoadStart from img element as it's not a standard event
    // It's now handled by the useEffect
  };
  
  // Show error state if image failed to load after retries
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">Image failed to load</p>
          <p className="text-xs text-muted-foreground">The image may have been moved or deleted</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Always show the image if we have a source, even during loading */}
      {optimizedSrc && <img {...commonProps} style={{ opacity: imageLoading ? 0.5 : 1 }} />}
      
      {/* Removed spinner overlay so image preview is not visually blocked while loading */}
    </>
  );
};

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
  // Configurable file size limit
  const MAX_UPLOAD_BYTES = process.env.NEXT_PUBLIC_MAX_FILE_SIZE 
    ? parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) 
    : 4 * 1024 * 1024; // 4MB default for Vercel compatibility

  // Auth modal context
  const { setOpen: setAuthModalOpen } = useAuthModal();

  const [captions, setCaptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number, total: number, isAuthenticated: boolean, isAdmin?: boolean } | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'processing' | 'generating' | 'loading'>('idle');
  const [buttonMessage, setButtonMessage] = useState('Generate Captions');
  const [buttonState, setButtonState] = useState<'generate' | 'generate-another'>('generate');
  const [buttonIcon, setButtonIcon] = useState(<Wand2 className="mr-2 h-4 w-4" />);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLimitShake, setShowLimitShake] = useState(false);
  const [errorTimer, setErrorTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAutoDeleteMessage, setShowAutoDeleteMessage] = useState(false);
  const [currentImageData, setCurrentImageData] = useState<{ url: string, publicId: string } | null>(null);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  const [showTrashAnimation, setShowTrashAnimation] = useState(false);
  const [hasExplicitlyReset, setHasExplicitlyReset] = useState(false);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [freemiumUsage, setFreemiumUsage] = useState<any>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { data: session } = useSession();

  // Helper function to get dynamic color based on quota usage
  const getQuotaColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage >= 60) return 'text-green-600 dark:text-green-400'; // Green: 60-100%
    if (percentage >= 30) return 'text-yellow-600 dark:text-yellow-400'; // Yellow: 30-59%
    return 'text-red-600 dark:text-red-400'; // Red: 0-29%
  };

  // Helper function to get quota display text with X/Y format (remaining/total)
  const getQuotaDisplayText = (remaining: number, total: number, planType: string) => {
    console.log(`📊 Quota display: ${planType} - remaining: ${remaining}, total: ${total}`);
    // Show remaining images out of total (e.g., 19/20 means 19 remaining out of 20 total)
    return `${planType} • ${remaining}/${total} images today`;
  };

  // Helper function to get cached image from localStorage
  const getCachedImage = (publicId: string): string | null => {
    try {
      const cacheKey = `image_${publicId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is not too old (24 hours)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data.url;
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve cached image:', error);
    }
    return null;
  };

  // Helper function to clean up old cached images
  const cleanupImageCache = () => {
    try {
      const keys = Object.keys(localStorage);
      const imageKeys = keys.filter(key => key.startsWith('image_'));
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      imageKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data = JSON.parse(cached);
            if (now - data.timestamp > maxAge) {
              localStorage.removeItem(key);
              console.log('🧹 Cleaned up old cached image:', key);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup image cache:', error);
    }
  };

  // Fetch freemium usage information
  const fetchFreemiumUsage = async () => {
    try {
      const response = await fetch('/api/freemium-usage', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📊 Freemium usage data received:', data.usage);
          console.log('📊 Freemium remainingDaily:', data.usage.remainingDaily, 'dailyLimit:', data.usage.dailyLimit);
          setFreemiumUsage(data.usage);
          setShowUpgradePrompt(data.usage.upgradePrompt);
        }
      }
    } catch (error) {
      console.error('Error fetching freemium usage:', error);
    }
  };

  // Fetch usage info on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchFreemiumUsage();
  }, [session, refreshTrigger]);

  // Cleanup old cached images on component mount
  useEffect(() => {
    cleanupImageCache();
  }, []);

  // Force refresh quota info (can be called manually)
  const forceRefreshQuota = () => {
    console.log('🔄 Force refreshing quota info...');
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => {
      fetchFreemiumUsage();
      // Also fetch regular quota info for anonymous users
      fetch('/api/rate-limit-info')
        .then(response => response.json())
        .then(data => {
          setQuotaInfo({
            remaining: data.remaining,
            total: data.maxGenerations,
            isAuthenticated: data.isAuthenticated,
            isAdmin: data.isAdmin
          });
        })
        .catch(err => console.error('Error refreshing quota info:', err));
    }, 100);
  };

  // Enhanced image compression function for large files
  const compressImageForUpload = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Only compress if file is larger than 5MB
      const maxSizeMB = 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      if (file.size <= maxSizeBytes) {
        resolve(file);
        return;
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      let objectUrl: string | null = null;
      
      img.onload = () => {
        try {
          // Calculate new dimensions (maintain aspect ratio)
          const maxDimension = 1920; // Max width/height
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress with quality based on original size
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Adjust quality based on file size
          let quality = 0.8;
          if (file.size > 10 * 1024 * 1024) { // > 10MB
            quality = 0.6;
          } else if (file.size > 7 * 1024 * 1024) { // > 7MB
            quality = 0.7;
          }
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Convert data URL back to File
          const arr = compressedDataUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          
          const compressedFile = new File([u8arr], file.name, { type: mime });
          resolve(compressedFile);
        } catch (error) {
          console.error('❌ Compression failed:', error);
          reject(new Error('Failed to compress image'));
        } finally {
          // Cleanup
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          canvas.width = 0;
          canvas.height = 0;
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
      
      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  // Image preloading utility for better performance
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to preload image'));
      img.src = src;
    });
  };

  // Function to update button states and messages
  const updateButtonState = (stage: 'idle' | 'uploading' | 'processing' | 'generating' | 'loading') => {
    setUploadStage(stage);
    switch (stage) {
      case 'idle':
        setButtonMessage('Generate Captions');
        setButtonIcon(<Wand2 className="mr-2 h-4 w-4" />);
        break;
      case 'uploading':
        setButtonMessage('Uploading Image...');
        setButtonIcon(<UploadCloud className="mr-2 h-4 w-4 animate-pulse" />);
        break;
      case 'processing':
        setButtonMessage('Analyzing Image...');
        setButtonIcon(<ImageIcon className="mr-2 h-4 w-4 animate-pulse" />);
        break;
      case 'generating':
        setButtonMessage('Generating Amazing Captions...');
        setButtonIcon(<Brain className="mr-2 h-4 w-4 animate-pulse" />);
        break;
      case 'loading':
        setButtonMessage('AI is analyzing your image...');
        setButtonIcon(<Brain className="mr-2 h-4 w-4 animate-pulse" />);
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

  // Function to clear error when user has used all free tokens
  const clearRateLimitError = () => {
    if (error && (error.includes('free images today') ||
      error.includes('daily limit') ||
      error.includes('free tokens') ||
      error.includes('hit your daily limit') ||
      error.includes('quota will reset tomorrow') ||
      error.includes('used all your free requests') ||
      error.includes('used all 5 free images today') ||
      error.includes('You\'ve used all') ||
      error.includes('You\'ve reached your daily limit'))) {
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

        // Image archived successfully
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

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Set loading state immediately when a file is selected
    setImageLoading(true);

  // Enhanced file validation - Updated for Vercel limits
  const maxSize = MAX_UPLOAD_BYTES;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    // Use a local fileToUpload (compressed or original) to avoid relying on state updates that are async
    let fileToUpload: File = file;
    if (file.size > maxSize) {
      // Attempt client-side compression to fit within MAX_UPLOAD_BYTES
      try {
        // Prefer Web Worker compression when available to avoid blocking the main thread
        let compressedFile: File;
        try {
          compressedFile = await compressWithWorker(file, MAX_UPLOAD_BYTES);
        } catch (workerErr) {
          // Worker not available or failed - fallback to main-thread compressor
          compressedFile = await compressImageForUpload(file); // Use the new compression function
        }

        // If compression succeeded and is smaller, use it
        if (compressedFile.size <= MAX_UPLOAD_BYTES) {
          fileToUpload = compressedFile;
        } else {
          const maxSizeMB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
          setError(`File too large. Please upload an image smaller than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
          setImageLoading(false);
          return;
        }
      } catch (err) {
        setError(`File too large and could not be compressed. Please upload a smaller image.`);
        setImageLoading(false);
        return;
      }
    }

    // Validate type against the file we will upload
    if (!allowedTypes.includes(fileToUpload.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      setImageLoading(false);
      return;
    }

    // Set state immediately so onSubmit will see uploadedFile
    setUploadedFile(fileToUpload);

    // Create object URL for immediate preview (more reliable than base64)
    try {
      // Clean up previous object URL if exists
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      
      // Create new object URL for the file
      const newObjectUrl = URL.createObjectURL(fileToUpload);
      setObjectUrl(newObjectUrl);
      setImagePreview(newObjectUrl);
      
      // Reset the explicit reset flag since user is uploading a new image
      setHasExplicitlyReset(false);
      
      // Clear any previous image data to ensure fresh state
      setCurrentImageData(null);
      
      console.log('✅ Image preview set successfully:', newObjectUrl.substring(0, 30) + '...');
    } catch (error) {
      console.error('❌ Object URL creation error:', error);
      setError('Failed to create image preview. Please try again.');
      setImageLoading(false);
    }

    // Clear any previous errors (except rate limit errors)
    if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && !error.includes('free images')) {
    setError('');
    }
    setUploadStage('idle');
    
    // Note: setImageLoading(false) will be called by the ImageRenderer component's onLoad handler
    // when the image is successfully loaded
  };

  // Handle URL upload
  const handleUrlUpload = async (url: string) => {
    if (!url.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setUploadStage('uploading');
    setError('');
    setImageLoading(true);
    
    try {
      // Create preview URL immediately
      setImagePreview(url);
      setImageUrl(url);
      setUploadStage('processing');
      
      // Upload URL to our backend
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'URL upload failed');
      }
      
      const uploadData = await response.json();
      console.log('✅ URL upload successful:', uploadData);
      
      setCurrentImageData({
        url: uploadData.secure_url,
        publicId: uploadData.public_id
      });
      
      setUploadStage('idle');
      setButtonState('generate');
      setButtonMessage('Generate Captions');
      setButtonIcon(<Wand2 className="mr-2 h-4 w-4" />);
      setImageLoading(false);
      
    } catch (error) {
      console.error('❌ URL upload error:', error);
      setError(error instanceof Error ? error.message : 'URL upload failed. Please try again.');
      setUploadStage('idle');
      setImagePreview(null);
      setImageUrl('');
      setImageLoading(false);
    }
  };

  // Handle paste image
  const handlePasteImage = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        setIsPasting(true);
        
        const file = item.getAsFile();
        if (file) {
          // Use the existing file upload logic
          const input = document.createElement('input');
          input.type = 'file';
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          
          // Trigger the file upload
          await handleImageChange({ target: { files: input.files } } as any);
          setIsPasting(false);
        }
        break;
      }
    }
  };

  // Image compression function for preview
  const compressImageForPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      let objectUrl: string | null = null;
      
      img.onload = () => {
        try {
          // Calculate new dimensions (max 800x800 for preview)
          const maxSize = 800;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(new Error('Failed to compress image for preview'));
        } finally {
          // Cleanup
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
          canvas.width = 0;
          canvas.height = 0;
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for preview'));
        // Cleanup
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
      
      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  // Track last submission time to implement slow mode
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const SLOW_MODE_COOLDOWN_MS = 3000; // 3 seconds cooldown between submissions

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // If button is in "generate-another" state, reset and start fresh
    if (buttonState === 'generate-another') {
      handleGenerateAnother();
      return;
    }

    const startTime = Date.now(); // Track processing time for analytics
    
    // Implement slow mode to prevent rapid API calls
    const timeSinceLastSubmission = startTime - lastSubmissionTime;
    if (timeSinceLastSubmission < SLOW_MODE_COOLDOWN_MS) {
      const remainingCooldown = Math.ceil((SLOW_MODE_COOLDOWN_MS - timeSinceLastSubmission) / 1000);
      setError(`Please wait ${remainingCooldown} seconds before generating more captions (slow mode active).`);
      return;
    }

    // Validate that an image is uploaded
    if (!uploadedFile) {
      setError("Please upload an image to generate captions.");
      return;
    }

    // Validate that mood is selected
    if (!values.mood || values.mood.trim() === '') {
      setError("Please select a mood for your caption.");
      return;
    }

    // Validation passed, checking rate limit first
    setIsLoading(true);
    setCaptions([]);
    // Don't clear daily limit errors - let them stay visible
    if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset')) {
      setError('');
    }
    updateButtonState('processing');
    
    // Update last submission time
    setLastSubmissionTime(startTime);

    try {
      // 🔍 CORRECT FLOW: Check quota FIRST, then upload if allowed
              // Checking quota before proceeding

      // Step 1: Check quota first (with reasonable timeout)
      updateButtonState('loading');
              // Checking rate limits

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

      if (quotaData.remaining <= 0 && !quotaData.isAdmin) {
        // User has no quota left - don't upload image (unless admin)
        const errorMessage = quotaData.isAuthenticated
          ? "You've hit your daily limit! Your quota will reset tomorrow. Upgrade your plan for unlimited captions!"
          : "You've used all your free images today! Sign up for a free account to get 20 daily images (60 captions). Your free quota resets tomorrow.";

        setErrorWithTimer(errorMessage, 10000);
        setShowLimitShake(true);
        setTimeout(() => setShowLimitShake(false), 600);
        setIsLoading(false);
        updateButtonState('idle');
        return;
      }

              // Rate limit check passed

      // Update quota info in UI
      setQuotaInfo({
        remaining: quotaData.remaining,
        total: quotaData.maxGenerations,
        isAuthenticated: quotaData.isAuthenticated,
        isAdmin: quotaData.isAdmin
      });

      // Store current data for regeneration
      setCurrentMood(values.mood);
      setCurrentDescription(values.description || '');

      // Step 2: Ensure image is uploaded (only if not already uploaded during file-select)
      let uploadData: any = null;

      if (currentImageData && currentImageData.url) {
        // Image was already uploaded during handleImageChange; reuse it and avoid re-uploading
        uploadData = {
          url: currentImageData.url,
          public_id: currentImageData.publicId,
        };
        // Move UI to processing without showing the upload animation again
        updateButtonState('processing');
        
        // Ensure image preview shows the uploaded image URL
        setImagePreview(currentImageData.url);
      } else {
        // No existing uploaded image - perform the upload now
        updateButtonState('uploading');

        // Show upload progress for better user experience
        setButtonMessage('Uploading image...');
        setButtonIcon(<UploadCloud className="mr-2 h-4 w-4 animate-pulse" />);

        // Upload the file
        const formData = new FormData();
        formData.append('file', uploadedFile as File);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          let uploadErrorMessage = 'Image upload failed.';
          try {
            const uploadErrorData = await uploadResponse.json();
            uploadErrorMessage = uploadErrorData.message || uploadErrorMessage;
          } catch (parseError) {
            console.error('❌ Failed to parse upload error response:', parseError);
            switch (uploadResponse.status) {
              case 413:
                const maxSizeMB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
                uploadErrorMessage = `Image is too big. Please upload an image smaller than ${maxSizeMB}MB.`;
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

        try {
          uploadData = await uploadResponse.json();
        } catch (parseError) {
          console.error('❌ Failed to parse upload response:', parseError);
          throw new Error('Failed to process upload response. Please try again.');
        }

        if (!uploadData.success) {
          throw new Error(uploadData.message || 'Image upload failed. Please try again.');
        }

        // Store the uploaded image data for future use
        setCurrentImageData(uploadData);
        
        // Update image preview to show the uploaded image URL
        setImagePreview(uploadData.url);

      }

      // Send to AI for analysis

      updateButtonState('processing');

      // Step 3: Generate captions (with realistic timeout for AI processing)
      updateButtonState('generating');
      // Starting AI caption generation

      // ⚡ SPEED OPTIMIZATION: Show immediate feedback
      setButtonMessage('AI is analyzing your image...');
      setButtonIcon(<Brain className="mr-2 h-4 w-4 animate-pulse" />);

      // ⚡ SPEED OPTIMIZATION: Realistic timeout for AI processing
      const captionController = new AbortController();
      const captionTimeout = setTimeout(() => {
        // Caption generation timeout triggered - aborting AI request
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
        // Caption response data received
      } catch (parseError) {
        console.error('❌ Failed to parse caption response:', parseError);
        throw new Error('Failed to process caption response. Please try again.');
      }

      // Processing caption data

      if (captionData.success && captionData.captions && Array.isArray(captionData.captions) && captionData.captions.length > 0) {
        // Validate that captions are actually strings and not empty
        const validCaptions = captionData.captions.filter((caption: any) =>
          typeof caption === 'string' && caption.trim().length > 0
        );

        // Valid captions found

        if (validCaptions.length === 0) {
          throw new Error('Generated captions are invalid. Please try again.');
        }

        setCaptions(validCaptions);

        // Dispatch event for floating feedback widget
        const event = new CustomEvent('captionGenerated');
        window.dispatchEvent(event);

        // Update freemium usage information from response
        if (captionData.freemium) {
          setFreemiumUsage(captionData.freemium);
          setShowUpgradePrompt(captionData.freemium.upgradePrompt);
        }

        // Force refresh quota info to update the counter
        setTimeout(() => {
          forceRefreshQuota();
        }, 500);

        // Immediately change button state after successful generation
        setButtonState('generate-another');
        setButtonMessage('Upload New Image');
        setButtonIcon(<Upload className="mr-2 h-4 w-4" />);
        setUploadStage('idle');

        // Ensure image remains visible after successful generation for all users
        if (uploadData.url) {
          console.log('🖼️ Setting image display after successful generation:', uploadData.url.substring(0, 50) + '...');
          
          // Store Cloudinary URL in local storage for instant access
          if (uploadedFile) {
            const cacheKey = `image_${uploadData.public_id}`;
            localStorage.setItem(cacheKey, JSON.stringify({
              url: uploadData.url,
              publicId: uploadData.public_id,
              timestamp: Date.now()
            }));
            console.log('💾 Image cached in localStorage:', cacheKey);
          }
          
          // Keep the local blob URL for instant display, but store Cloudinary data
          setCurrentImageData({
            url: uploadData.url,
            publicId: uploadData.public_id
          });
          setHasExplicitlyReset(false);
          
          // Don't clean up the object URL - keep it for instant display
          // The image will show instantly from blob URL while Cloudinary loads in background
          
          // Preload the Cloudinary image for better performance (background)
          preloadImage(uploadData.url).catch(err => {
            console.warn('Failed to preload image:', err);
          });
          
          console.log('✅ Image display state updated successfully - keeping local blob for instant display');
        } else {
          console.warn('⚠️ No upload data URL available for image display');
        }

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
        if (hasConsent('functional')) {
          saveFavoriteMood(currentMood);
        }

        // Refresh quota info after successful generation
        setRefreshTrigger(prev => prev + 1);
        
        // Also manually refresh freemium usage to ensure it updates
        setTimeout(() => {
          fetchFreemiumUsage();
        }, 500);
        // Captions set successfully

        // 🗑️ AUTO-ARCHIVE IMAGE FOR ANONYMOUS USERS (Privacy Protection)
        if (!quotaData.isAuthenticated && uploadData.public_id) {
          // Anonymous user - auto-archiving image after caption generation for privacy

          // Show auto-archiving message to user
          setShowAutoDeleteMessage(true);
          setTimeout(() => setShowAutoDeleteMessage(false), 5000); // Hide after 5 seconds

          // Start animated archiving process
          setTimeout(() => {
            handleAnimatedImageDeletion();
          }, 1000); // Start animation after 1 second

          // Auto-archive image in background (don't wait for response)
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
            } else {
            }
          }).catch(error => {
          });
        } else if (quotaData.isAuthenticated) {
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
      if (!error.message?.includes('free images today') &&
        !error.message?.includes('daily limit') &&
        !error.message?.includes('quota will reset') &&
        !error.message?.includes('hit your daily limit') &&
        !error.message?.includes('used all your free requests') &&
        !error.message?.includes('used all 5 free images today') &&
        !error.message?.includes('You\'ve used all') &&
        !error.message?.includes('You\'ve reached your daily limit')) {
        // console.error("Caption Generation Error:", error);
      }

      // If it's a rate limit error, trigger quota refresh and shake animation
      if (error.message?.includes('free images today') ||
        error.message?.includes('daily limit') ||
        error.message?.includes('quota will reset') ||
        error.message?.includes('hit your daily limit') ||
        error.message?.includes('used all your free requests') ||
        error.message?.includes('used all 5 free images today') ||
        error.message?.includes('You\'ve used all') ||
        error.message?.includes('You\'ve reached your daily limit')) {
        // Daily limit detected, triggering shake animation and quota refresh
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
                isAuthenticated: data.isAuthenticated,
                isAdmin: data.isAdmin
              });
              // Forced quota refresh after daily limit
            })
            .catch(err => {
              // Failed to force refresh quota
            });
        }, 100);
        // Reset shake animation after animation completes
        setTimeout(() => setShowLimitShake(false), 600);

        // Set error with timer for daily limit errors
        setErrorWithTimer(error.message, 10000);
      } else {
        // Set error with timer for other errors
        setErrorWithTimer(error.message, 10000);
      }
    } finally {
      setIsLoading(false);
      // Button state already changed immediately after successful generation
    }
  }

  // Enhanced debug logging for image state
  useEffect(() => {
    console.log('🔍 Image State Debug:', {
      imagePreview: imagePreview ? imagePreview.substring(0, 50) + '...' : null,
      currentImageData: currentImageData ? {
        url: currentImageData.url.substring(0, 50) + '...',
        publicId: currentImageData.publicId
      } : null,
      hasExplicitlyReset,
      uploadStage,
      buttonState,
      uploadedFile: uploadedFile ? `${uploadedFile.name} (${Math.round(uploadedFile.size / 1024)}KB)` : null,
      objectUrl: objectUrl ? objectUrl.substring(0, 30) + '...' : null,
      imageLoading,
      showAutoDeleteMessage,
      showTrashAnimation,
      isDeletingImage
    });
  }, [imagePreview, currentImageData, hasExplicitlyReset, uploadStage, buttonState, uploadedFile, objectUrl, imageLoading, showAutoDeleteMessage, showTrashAnimation, isDeletingImage]);

  // Fetch quota info on component mount, session changes, and refresh triggers
  // FIXED: Added debouncing to prevent flash bug
  useEffect(() => {
    const fetchQuotaInfo = async () => {
      try {
        setQuotaLoading(true);
        const response = await fetch('/api/rate-limit-info');
        if (response.ok) {
          const data = await response.json();
          
          // FIXED: Only update if data has actually changed to prevent flashing
          setQuotaInfo(prevInfo => {
            const newInfo = {
            remaining: data.remaining,
            total: data.maxGenerations,
            isAuthenticated: data.isAuthenticated,
            isAdmin: data.isAdmin
            };
            
                // Only update if the values have actually changed
                if (!prevInfo ||
                    prevInfo.remaining !== newInfo.remaining ||
                    prevInfo.total !== newInfo.total ||
                    prevInfo.isAuthenticated !== newInfo.isAuthenticated ||
                    prevInfo.isAdmin !== newInfo.isAdmin) {
                  console.log('📊 Quota info updated:', data.remaining, '/', data.maxGenerations);
                  console.log('📊 Full quota data:', data);
                  return newInfo;
                }
            
            return prevInfo; // No change, keep existing state
          });
        }
      } catch (error) {
        console.error('Failed to fetch quota info:', error);
      } finally {
        setQuotaLoading(false);
      }
    };
    
    // FIXED: Add small delay to prevent rapid successive calls
    const timeoutId = setTimeout(fetchQuotaInfo, 100);
    return () => clearTimeout(timeoutId);
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

  // Paste event listener for image paste functionality
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      handlePasteImage(event);
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  // Cleanup function to prevent memory leaks
  const cleanup = () => {
    // Clear any existing timers
    if (errorTimer) {
      clearTimeout(errorTimer);
    }
    
    // Clean up object URL if exists
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    
    // Clear image preview to free memory
    if (imagePreview && (imagePreview.startsWith('data:') || imagePreview.startsWith('blob:'))) {
      setImagePreview(null);
    }
    
    // Clear current image data
    setCurrentImageData(null);
    
    // Reset states
    setUploadStage('idle');
    setIsLoading(false);
    // Only clear non-rate-limit errors
    if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && !error.includes('free images')) {
    setError('');
    }
  };

  // Enhanced reset function for image upload area
  const resetImageUploadArea = () => {
    // Clean up object URL if exists
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    
    // Clear all image-related state
    setImagePreview(null);
    setUploadedFile(null);
    setCurrentImageData(null);
    setObjectUrl(null);
    setUploadStage('idle');
    
    // Reset form field
    form.resetField('image');
    
    // Clear any file input references
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Clear any error states (except rate limit errors)
    if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && !error.includes('free images')) {
    setError('');
    }
    
    // Reset button state
    setButtonMessage('Generate Captions');
    setButtonIcon(<Sparkles className="mr-2 h-4 w-4" />);
  };

  // Function to reset for generating another set of captions
  const handleGenerateAnother = () => {
    console.log('🔄 Generating another set of captions...');
    
    // Clear captions
    setCaptions([]);
    
    // Dispatch event for floating feedback widget (generate another)
    const event = new CustomEvent('captionGenerated');
    window.dispatchEvent(event);
    
    // Force refresh quota info to update the counter
    setTimeout(() => {
      forceRefreshQuota();
    }, 500);
    
    // For both authenticated and anonymous users, keep the image visible
    // since they want to generate more captions for the same image
    setHasExplicitlyReset(false);
    
    // Reset form fields but keep the image
    form.resetField('mood');
    form.resetField('description');
    
    // Clear any file input references
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Reset states
    setUploadStage('idle');
    setIsLoading(false);
    // Only clear non-rate-limit errors
    if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && !error.includes('free images')) {
    setError('');
    }
    setShowSuccessMessage(false);
    
    // Update button state to "Generate Captions"
    setButtonState('generate');
    setButtonMessage('Generate Captions');
    setButtonIcon(<Wand2 className="mr-2 h-4 w-4" />);
    
    console.log('✅ Generate another state reset complete');
    console.log('🖼️ Image should remain visible:', {
      imagePreview: imagePreview ? 'Present' : 'Missing',
      currentImageData: currentImageData ? 'Present' : 'Missing'
    });
  };

  // Streamlined animated deletion function with longer duration
  const handleAnimatedImageDeletion = () => {
    setIsDeletingImage(true);
    
    // Skip checkbox overlay, go directly to trash animation
    setShowTrashAnimation(true);
    
    // After trash animation, reset everything (increased to 2 seconds)
    setTimeout(() => {
      setIsImageDeleted(true);
      setShowAutoDeleteMessage(false);
      setShowTrashAnimation(false);
      // Don't reset image upload area - keep image visible until user clicks "Generate Another"
      // resetImageUploadArea();
      setIsDeletingImage(false);
      setIsImageDeleted(false);
    }, 2000); // 2 seconds for better visibility
  };

  // Cleanup on unmount and when objectUrl changes
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
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
                    
                      <div
                        onClick={() => document.getElementById('file-upload')?.click()}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          const url = prompt('Enter image URL:');
                          if (url && url.trim()) {
                            handleUrlUpload(url.trim());
                          }
                        }}
                        className={`flex flex-col items-center justify-center w-full h-32 rounded-xl transition-all duration-500 cursor-pointer shadow-sm overflow-hidden upload-area-dotted ${uploadStage === 'uploading'
                          ? 'border-primary/80 bg-primary/5 animate-upload-pulse'
                          : uploadStage === 'processing'
                            ? 'border-secondary/80 bg-secondary/5 animate-processing-glow'
                            : uploadStage === 'generating'
                              ? 'border-accent/80 bg-accent/5 animate-generating-sparkle'
                              : uploadStage === 'loading'
                                ? 'border-accent/80 bg-accent/5 animate-processing-glow'
                                : 'bg-[#F2EFE5]/50 dark:bg-background/50 border-border hover:bg-[#E3E1D9]/60 dark:hover:bg-muted/40 hover:shadow-md'
                        }`}
                      >
                      {uploadStage !== 'idle' ? (
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
                            {uploadStage === 'processing' && 'Analyzing Image...'}
                            {uploadStage === 'generating' && 'Generating Captions...'}
                            {uploadStage === 'loading' && 'AI is analyzing your image...'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {uploadStage === 'uploading' && 'Please wait while we upload your image'}
                            {uploadStage === 'processing' && 'Analyzing your image content'}
                            {uploadStage === 'generating' && 'Creating amazing captions for you'}
                            {uploadStage === 'loading' && 'Please wait while we process'}
                          </p>
                        </div>
                      ) : (imagePreview || currentImageData?.url) ? (
                        // Show the uploaded image if it exists
                        <div className="relative w-full h-full bg-muted/20 min-h-[120px]">
                          {/* Enhanced image rendering with better error handling */}
                          <ImageRenderer 
                            imageSrc={imagePreview || (currentImageData?.publicId ? getCachedImage(currentImageData.publicId) : null) || currentImageData?.url}
                            onLoadStart={() => {
                              setImageLoading(true);
                              console.log('🔄 Image loading started:', (currentImageData?.url || imagePreview)?.substring(0, 50) + '...');
                            }}
                            onLoad={() => {
                              setImageLoading(false);
                              // Only clear non-rate-limit errors
                              if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && !error.includes('free images')) {
                              setError('');
                              }
                              console.log('✅ Image loaded successfully:', (currentImageData?.url || imagePreview)?.substring(0, 50) + '...');
                            }}
                            onError={(e) => {
                              setImageLoading(false);
                              console.error('❌ Image failed to load:', (currentImageData?.url || imagePreview)?.substring(0, 50) + '...');
                              
                              // Only clear image data if it's a blob URL (local preview)
                              // Keep Cloudinary URLs even if they fail to load initially
                              const imageSrc = currentImageData?.url || imagePreview;
                              if (imageSrc && imageSrc.startsWith('blob:')) {
                                console.log('🧹 Clearing failed blob URL');
                                setTimeout(() => {
                                  setImagePreview(null);
                                  setCurrentImageData(null);
                                  setError('Image failed to load. Please try uploading again.');
                                }, 2000);
                              } else {
                                console.log('🔄 Keeping Cloudinary URL for retry');
                                setError('Image temporarily unavailable. Please wait...');
                                // Clear error after a short delay
                                setTimeout(() => setError(''), 3000);
                              }
                            }}
                            imageLoading={imageLoading}
                          />
                          
                          {/* Enhanced fallback with better state management */}
                          {!imagePreview && !currentImageData?.url && !imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                              <div className="text-center p-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">No image to display</p>
                                <p className="text-xs text-muted-foreground mb-3">This shouldn't happen - image should be visible</p>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    console.log('🔄 Manual reset triggered');
                                    setImagePreview(null);
                                    setCurrentImageData(null);
                                    // Only clear non-rate-limit errors
                                    if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && !error.includes('free images')) {
                                    setError('');
                                    }
                                    setUploadStage('idle');
                                  }}
                                >
                                  Reset Upload Area
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Error fallback */}
                          {error && error.includes('failed to load') && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                              <div className="text-center p-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">Image failed to load</p>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setImagePreview(null);
                                    setCurrentImageData(null);
                                    // Only clear non-rate-limit errors
                                    if (!error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && !error.includes('free images')) {
                                    setError('');
                                    }
                                  }}
                                >
                                  Try Again
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-3 text-center relative">
                          {/* More Prominent Delete Animation */}
                          {showTrashAnimation && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-900/80 dark:to-red-800/80 rounded-lg animate-fade-in backdrop-blur-sm">
                              <div className="flex flex-col items-center space-y-4">
                                {/* Larger, more prominent trash icon */}
                                <div className="relative">
                                  <div className="w-12 h-12 bg-red-200 dark:bg-red-700 rounded-lg flex items-center justify-center animate-pulse shadow-lg">
                                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-300" />
                                  </div>
                                  {/* Larger checkmark overlay */}
                                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                                    <CheckSquare className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                                {/* More prominent text */}
                                <span className="text-sm text-red-700 dark:text-red-300 font-semibold">Archiving image...</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Normal Upload Area */}
                          {!showTrashAnimation && !showAutoDeleteMessage && (
                            <>
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                <UploadCloud className="w-5 h-5 text-primary" />
                              </div>
            <p className="text-sm text-muted-foreground font-medium">Click to upload, drag & drop, paste image, or add URL</p>
                            </>
                          )}
                          
                          {/* Auto-delete Message */}
                          {showAutoDeleteMessage && !showTrashAnimation && (
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              </div>
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Image archived for privacy</p>
                              <p className="text-xs text-muted-foreground">Upload area reset - captions preserved below</p>
                            </div>
                          )}
                        </div>
                      )}
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleImageChange}
                        />
                      </div>

                    {/* Compact Error Display for Non-Monthly Limit Errors - Mobile Responsive */}
                    {error && !error.includes('daily limit') && !error.includes('used all') && !error.includes('quota will reset') && (
                      <div className="px-2 sm:px-3">
                        <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 text-center leading-relaxed break-words">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Subtle Checkbox Form for Image Deletion */}
                    {showSuccessMessage && (
                      <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="delete-image-checkbox"
                            className="w-3 h-3 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-400 dark:focus:ring-gray-500 dark:ring-offset-gray-800 focus:ring-1 dark:bg-gray-700 dark:border-gray-600"
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleAnimatedImageDeletion();
                              }
                            }}
                          />
                          <label htmlFor="delete-image-checkbox" className="text-xs text-gray-600 dark:text-gray-400 font-normal cursor-pointer">
                            Delete image
                          </label>
                        </div>
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
                        <Wand2 className="mr-2 h-4 w-4" />
                        {buttonState === 'generate-another' ? 'Generate Another Set' : 'Generate Captions'}
                      </>
                    )}
                  </Button>

                  {/* Quota Display - Positioned below Generate Captions button */}
                  {(freemiumUsage || quotaInfo || quotaLoading) && (
                    <div className={`${showUpgradePrompt ? 'mt-4 p-4' : 'mt-3 p-3'} ${showUpgradePrompt 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl' 
                      : quotaInfo?.isAdmin || freemiumUsage?.tier === 'pro'
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200'
                        : quotaInfo?.remaining === 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'bg-[#E3E1D9]/30 dark:bg-muted/30 border border-[#C7C8CC]/60 dark:border-border rounded-lg'} ${showLimitShake ? 'animate-shake-limit' : ''}`}>
                      {showUpgradePrompt ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                {freemiumUsage?.gracePeriod ? 'Weekly Grace Period' : 'Upgrade for More!'}
                              </h3>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                {freemiumUsage?.gracePeriod 
                                  ? `You've used your daily limit. ${freemiumUsage.remainingWeekly} images left this week.`
                                  : `Free Plan • ${freemiumUsage?.remainingDaily || quotaInfo?.remaining || 5}/5 images today. Upgrade for unlimited access!`
                                }
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                            onClick={() => window.open('/pricing', '_blank')}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Upgrade
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          {quotaLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                              <span>Loading quota...</span>
                            </div>
                          ) : (
                            <>
                              {(quotaInfo?.isAdmin || freemiumUsage?.tier === 'pro') && <span className="text-purple-600">👑</span>}
                              {quotaInfo?.remaining === 0 && !quotaInfo?.isAdmin && <AlertTriangle className="w-3 h-3" />}
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${quotaInfo?.isAdmin ? 'bg-purple-500' : freemiumUsage?.tier === 'pro' || quotaInfo?.isAuthenticated ? 'bg-green-500' : freemiumUsage?.tier === 'basic' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                                <button 
                                  onClick={forceRefreshQuota}
                                  className="ml-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  title="Refresh quota"
                                >
                                  🔄
                                </button>
                                <span className={quotaInfo?.isAdmin || freemiumUsage?.tier === 'pro' 
                                  ? 'text-purple-600 dark:text-purple-400' 
                                  : quotaInfo?.isAuthenticated 
                                    ? getQuotaColor(quotaInfo.remaining, quotaInfo.total)
                                    : freemiumUsage 
                                      ? getQuotaColor(freemiumUsage.remainingDaily || 5, freemiumUsage.dailyLimit || 5)
                                      : getQuotaColor(quotaInfo?.remaining || 5, 5)
                                }>
                                  {quotaInfo?.isAdmin || freemiumUsage?.tier === 'pro' ? (
                                    "Admin: Unlimited images"
                                  ) : quotaInfo?.isAuthenticated ? (
                                    getQuotaDisplayText(quotaInfo.remaining, quotaInfo.total, "Daily")
                                  ) : freemiumUsage ? (
                                    getQuotaDisplayText(freemiumUsage.remainingDaily || 5, freemiumUsage.dailyLimit || 5, `${freemiumUsage.tier.charAt(0).toUpperCase() + freemiumUsage.tier.slice(1)} Plan`)
                                  ) : (
                                    getQuotaDisplayText(quotaInfo?.remaining || 5, 5, "Free Plan")
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
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
                        />
                      ))
                    ) : (
                      // Empty State - Compact
                      <div className="col-span-full flex flex-col items-center justify-center h-80 text-center p-6 bg-[#E3E1D9]/10 dark:bg-muted/10 border border-[#C7C8CC]/60 dark:border-border rounded-xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-3 animate-pulse">
                          <Wand2 className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Ready to Generate</h4>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                          Upload an image, select a mood, and click generate to create your first captions.
                          Each generation creates 3 unique styles for maximum variety.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Sign-up Call-to-Action */}
                  {!session && (
                    <div 
                      onClick={() => setAuthModalOpen(true)}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-md mx-auto cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Prominent Crown Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <UserPlus className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        {/* Enhanced Text */}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Unlock Premium Features! ✨
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Sign up for unlimited generation & save your favorites
                          </p>
                        </div>
                        {/* Star Accent */}
                        <div className="flex-shrink-0">
                          <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* Floating Feedback Widget */}
        <FloatingFeedbackWidget />

        {/* Detailed Error Message Outside Main Container Card - Responsive & Mobile Optimized */}
          {error && (error.includes('daily limit') || error.includes('used all') || error.includes('quota will reset')) && (
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