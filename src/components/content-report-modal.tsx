'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Flag, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentReportModalProps {
  contentType: 'image' | 'caption' | 'comment' | 'profile';
  contentId: string;
  trigger?: React.ReactNode;
  onReportSubmitted?: () => void;
}

export function ContentReportModal({ 
  contentType, 
  contentId, 
  trigger,
  onReportSubmitted 
}: ContentReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const reasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'sexual', label: 'Sexual Content' },
    { value: 'violent', label: 'Violent Content' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!reason || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a reason and provide a description.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/report-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          description: description.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        toast({
          title: "Report Submitted",
          description: "Thank you for helping keep our community safe. Our moderation team will review this content.",
        });
        
        // Close modal after a delay
        setTimeout(() => {
          setIsOpen(false);
          setIsSubmitted(false);
          setReason('');
          setDescription('');
          onReportSubmitted?.();
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit report');
      }
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast({
        title: "Report Failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitted) {
      // Reset form if closing without submission
      setReason('');
      setDescription('');
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Report Inappropriate Content
              </DialogTitle>
              <DialogDescription>
                Help us maintain a safe community by reporting content that violates our guidelines.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Content Type Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">Content Type</Label>
                <p className="text-sm text-gray-600 capitalize">{contentType}</p>
              </div>

              {/* Reason Selection */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Report *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide details about why this content should be reviewed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 text-right">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Important:</p>
                    <p>False reports may result in account restrictions. Only report content that genuinely violates our guidelines.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!reason || !description.trim() || isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Report Submitted Successfully
            </h3>
            <p className="text-gray-600 mb-4">
              Thank you for helping keep our community safe. Our moderation team will review this content and take appropriate action.
            </p>
            <div className="text-sm text-gray-500">
              <p>You will be notified when the review is complete.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ContentReportModal;
