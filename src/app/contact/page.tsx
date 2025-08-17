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
  category: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    category: 'General Inquiry',
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

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setFormData({ name: '', email: '', category: 'General Inquiry', message: '' });
      setErrors({});
      
      // Contact form submitted successfully
      
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
                         <h2 className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent" style={{ fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
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
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name *
                  </label>
                                     <Input
                     id="name"
                     type="text"
                     placeholder="Your full name"
                     className="h-11 !bg-gray-50 dark:!bg-gray-800 border-gray-200 dark:border-gray-700 !text-gray-900 dark:!text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                     style={{ fontFamily: 'var(--font-poppins)' }}
                     value={formData.name}
                     onChange={handleInputChange('name')}
                     required
                   />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email *
                  </label>
                                     <Input
                     id="email"
                     type="email"
                                           placeholder="Your Email"
                     className="h-11 !bg-gray-50 dark:!bg-gray-800 border-gray-200 dark:border-gray-700 !text-gray-900 dark:!text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                     style={{ fontFamily: 'var(--font-poppins)' }}
                     value={formData.email}
                     onChange={handleInputChange('email')}
                     required
                   />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                                 <select
                   id="category"
                   value={formData.category}
                   onChange={handleInputChange('category')}
                   className="w-full h-11 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 !text-gray-900 dark:!text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                   style={{ fontFamily: 'var(--font-poppins)' }}
                   required
                 >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Partnership & Business">Partnership & Business</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm">{errors.category}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message *
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  className="resize-none !bg-gray-50 dark:!bg-gray-800 border-gray-200 dark:border-gray-700 !text-gray-900 dark:!text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                  value={formData.message}
                  onChange={handleInputChange('message')}
                  required
                />
                {errors.message && (
                  <p className="text-red-500 text-sm">{errors.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
              
              {/* Error and Success Messages */}
              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{submitError}</p>
                </div>
              )}
              
              {submitSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-700 dark:text-green-300 text-sm">{submitSuccess}</p>
                </div>
              )}
            </div>
          </form>

        </div>
      </main>

    </div>
  );
}