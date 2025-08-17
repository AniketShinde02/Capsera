
"use client";

import { useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InlineMessage } from '@/components/ui/inline-message';

interface CaptionCardProps {
  caption: string;
  index: number;
}

export function CaptionCard({ caption, index }: CaptionCardProps) {
  const [copied, setCopied] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent) => {
    // Prevent any event bubbling that might trigger form submission
    e.preventDefault();
    e.stopPropagation();
    
    // console.log('🔄 Copy button clicked for caption:', caption.substring(0, 50) + '...');
    
    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(caption)
        .then(() => {
          setCopied(true);
          setInlineMessage("Copied to clipboard! ✨");
          // console.log('✅ Caption copied successfully to clipboard');
        })
        .catch((err) => {
          console.error('❌ Failed to copy to clipboard:', err);
          // Fallback: try to copy using document.execCommand
          fallbackCopyTextToClipboard(caption);
        });
    } else {
      // Fallback for browsers without clipboard API
      fallbackCopyTextToClipboard(caption);
    }
    
    // Clear message after 2 seconds
    setTimeout(() => {
      setInlineMessage(null);
    }, 2000);
  };

  // Fallback copy function for older browsers
  const fallbackCopyTextToClipboard = (text: string) => {
    // console.log('🔄 Using fallback copy method');
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setInlineMessage("Copied to clipboard! ✨");
        // console.log('✅ Fallback copy successful');
      } else {
        setInlineMessage("Copy failed. Please select and copy manually.");
        // console.log('❌ Fallback copy failed');
      }
    } catch (err) {
      console.error('❌ Fallback copy failed:', err);
      setInlineMessage("Copy failed. Please select and copy manually.");
    }
    
    document.body.removeChild(textArea);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="group bg-[#F2EFE5]/20 dark:bg-muted/20 transition-all duration-300 flex flex-col justify-between min-h-[160px] border border-[#C7C8CC]/80 dark:border-border hover:border-[#B4B4B8]/90 dark:hover:border-border/70 rounded-xl shadow-sm hover:shadow-md overflow-hidden">
      {/* Caption Content - Compact */}
      <div className="p-4 flex-grow">
        <p className="text-foreground/90 text-sm leading-relaxed line-clamp-4">{caption}</p>
      </div>
      
      {/* Action Buttons - Compact */}
      <div className="p-3 border-t border-[#C7C8CC]/50 dark:border-border/50 bg-[#E3E1D9]/10 dark:bg-muted/10 space-y-2">
        {/* Copy Button */}
        <Button
          type="button"
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="w-full h-9 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors rounded-lg"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Caption
            </>
          )}
        </Button>
        


      </div>
    </div>
  );
}
