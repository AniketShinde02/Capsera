'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Facebook, Instagram, Mail, MapPin, Twitter, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent } from '@/components/ui/card';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters long';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear submit error and success when user starts fixing the form
    if (submitError) {
      setSubmitError('');
    }
    if (submitSuccess) {
      setSubmitSuccess('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitError("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send form data to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      // Success - show confirmation
      setIsSubmitted(true);
      setSubmitError('');
      setSubmitSuccess(result.message || "Thanks for reaching out! We'll get back to you within 24 hours.");
      
      // Reset form after successful submission
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      
      console.log('✅ Contact form submitted successfully:', {
        submissionId: result.data?.id,
        submittedAt: result.data?.submittedAt
      });
      
    } catch (error: any) {
      console.error('❌ Contact form submission failed:', error);
      setSubmitError(error.message || "Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    // The root container uses flexbox to structure the page vertically.
    // - `min-h-screen`: Ensures the page is at least as tall as the viewport.
    // - `flex flex-col`: Stacks the children (<main> and <footer>) vertically.
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground bg-grid-gray-700/[0.2]">
      
      {/* The main content area.
        - `flex-grow`: This is the key. It tells this element to expand and fill all
          available vertical space, which pushes the footer to the very bottom.
        - `flex items-center`: This centers the content grid vertically within the main area.
        - `py-16`: Increased vertical padding for better spacing above and below the content.
      */}
      <main className="container mx-auto flex flex-grow items-center px-4 py-8 sm:py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 sm:gap-12 md:gap-16 md:grid-cols-2">
          
          {/* Left Column: Information */}
          <div className="space-y-4 sm:space-y-6 text-center md:text-left">
            <h2 className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent">
              Let's Connect
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground px-2">
              Have a question, feedback, or a partnership idea? We're all ears. Reach out and our team will get back to you as soon as possible.
            </p>
            <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:justify-start">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-base sm:text-lg">AiCaptionCraft@outlook.com</span>
              </div>
              <div className="flex items-center justify-center gap-3 sm:gap-4 md:justify-start">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                <span className="text-base sm:text-lg">Nashik, Maharashtra, India</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 md:justify-start">
              <Link href="/twitter" className="text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary">
                <Twitter className="h-6 w-6 sm:h-7 sm:w-7" />
              </Link>
              <Link href="/instagram" className="text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary">
                <Instagram className="h-6 w-6 sm:h-7 sm:w-7" />
              </Link>
              <Link href="/facebook" className="text-muted-foreground transition-transform duration-300 hover:scale-110 hover:text-primary">
                <Facebook className="h-6 w-6 sm:h-7 sm:w-7" />
              </Link>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 sm:p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="h-11"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Subject *
                </label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="What's this about?"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message *
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  className="resize-none"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-medium">
                Send Message
              </Button>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}