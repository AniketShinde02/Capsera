/**
 * FreeCaptionCard - Optimized for free models that return plain text
 * Handles non-JSON formatted responses from qwen/llama models
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FreeCaptionCardProps {
    rawText: string;
    index: number;
}

export function FreeCaptionCard({ rawText, index }: FreeCaptionCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(rawText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="bg-white dark:bg-card/50 backdrop-blur-sm border border-border/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            {/* Caption Number Badge */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                    Caption {index + 1}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    🆓 Free
                </span>
            </div>

            {/* Caption Text */}
            <p className="text-sm leading-relaxed text-foreground mb-4 min-h-[60px]">
                {rawText}
            </p>

            {/* Copy Button */}
            <div className="border-t border-border/50 pt-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="w-full text-xs hover:bg-primary/5 hover:text-primary transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 mr-2" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3 mr-2" />
                            Copy Caption
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
