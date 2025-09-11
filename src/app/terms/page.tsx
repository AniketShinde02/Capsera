
"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Last Updated */}
        <div className="text-center mb-8 pb-6 border-b border-border">
          <p className="text-sm text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            1. Welcome to Capsera
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              Welcome to Capsera! These terms explain how you can use our AI caption generation service. By using our service, you agree to follow these rules.
            </p>
            <p>
              We may update these terms from time to time. If we do, we'll post the new version here. If you keep using our service after we update the terms, it means you agree to the new version.
            </p>
          </div>
        </div>

        {/* Data Usage Rights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            2. How We Use Your Content
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              <strong>What you give us:</strong> When you upload images or use our caption service, you give us permission to use that content to improve our AI and provide better service to you and other users.
            </p>
            <p>
              <strong>Training our AI:</strong> We use your images and captions to train and improve our artificial intelligence. This helps us make better captions for everyone.
            </p>
            <p>
              <strong>Research and development:</strong> We may use your content for research, testing, and improving our service. This helps us make Capsera better.
            </p>
            <p>
              <strong>Data analysis:</strong> We analyze how people use our service to understand trends and improve the user experience.
            </p>
          </div>
        </div>

        {/* Image and Caption Usage */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            3. Images and Captions
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              <strong>Your images:</strong> We can process, analyze, and use your uploaded images to improve our image recognition and caption generation technology.
            </p>
            <p>
              <strong>Your captions:</strong> We can use any captions you create or approve to train our AI to write better captions in the future.
            </p>
            <p>
              <strong>Model training:</strong> Your content helps us train our AI models to be more accurate and helpful for all users.
            </p>
          </div>
        </div>

        {/* Data Retention */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            4. Data Storage
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              <strong>We keep your data:</strong> We store your images and captions to improve our service and for backup purposes. We may keep this data even after you delete your account.
            </p>
            <p>
              <strong>Multiple copies:</strong> We may store your content in different systems for safety and backup reasons.
            </p>
            <p>
              <strong>Data processing:</strong> We may change or process your content to make it work better with our systems.
            </p>
          </div>
        </div>

        {/* Third-Party Sharing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            5. Sharing with Others
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              <strong>We may share your content:</strong> We might share your images and captions with partners, researchers, or other companies to help improve our service or for research purposes.
            </p>
            <p>
              <strong>Commercial use:</strong> We may use your content for business purposes, including licensing it to other companies, without paying you.
            </p>
          </div>
        </div>

        {/* User Responsibilities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            6. Your Responsibilities
          </h2>
          <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
            <p>
              <strong>You agree not to sue us:</strong> By using our service, you agree not to take legal action against us for how we use your content as described in these terms.
            </p>
            <p>
              <strong>You protect us:</strong> If someone sues us because of content you uploaded, you agree to help defend us and pay any costs.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>If you have any questions about these Terms of Service, please contact us:</p>
            <p>Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@capsera.com'}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link href="/" className="text-primary hover:text-primary/80 text-sm font-medium">
              ← Back to Home
            </Link>
            <Link href="/privacy" className="text-primary hover:text-primary/80 text-sm font-medium">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
