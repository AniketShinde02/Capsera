
"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Last Updated */}
        <div className="text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            1. Introduction and Acceptance of Terms
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              By accessing and utilizing the Capsera artificial intelligence-powered caption generation platform (hereinafter referred to as "the Service," "we," "us," or "our"), you, the user (hereinafter referred to as "you," "your," or "user"), hereby acknowledge, understand, and expressly consent to be bound by these comprehensive Terms of Service (hereinafter referred to as "Terms," "Agreement," or "Terms of Service") in their entirety, without modification, alteration, or exception, and further acknowledge that these Terms constitute a legally binding contractual agreement between you and Capsera, governing your access to, and use of, the Service, including but not limited to all associated features, functionalities, content, and services provided through our platform, website, application programming interfaces (APIs), and any other technological means of access, whether currently existing or developed in the future.
            </p>
            <p>
              These Terms of Service are designed to establish a comprehensive framework for the provision and utilization of our artificial intelligence caption generation services, ensuring clarity regarding the rights, obligations, responsibilities, and expectations of all parties involved in the utilization of the Service, while simultaneously protecting the legitimate business interests, intellectual property rights, and operational requirements of Capsera, and establishing clear guidelines for the acceptable use of our platform, including but not limited to content submission, data processing, intellectual property considerations, privacy protection, and compliance with applicable laws and regulations.
            </p>
            <p>
              Your continued use of the Service following the posting of any modifications, amendments, or updates to these Terms shall constitute your acceptance of such changes, and you acknowledge that it is your sole responsibility to regularly review these Terms for any updates or modifications, as we reserve the right to modify, amend, or update these Terms at any time, with or without prior notice, and such modifications shall become effective immediately upon posting to our platform, and your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </div>
        </div>

        {/* Data Usage Rights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            2. Comprehensive Data Usage Rights and Intellectual Property License
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>2.1. Irrevocable and Perpetual License Grant:</strong> By submitting, uploading, transmitting, or otherwise providing any content, including but not limited to images, photographs, graphics, text, captions, descriptions, metadata, or any other form of digital content (hereinafter collectively referred to as "User Content") to the Service, you hereby grant to Capsera, its subsidiaries, affiliates, successors, assigns, and any other entities under common control or ownership (hereinafter collectively referred to as "Capsera Entities"), an irrevocable, perpetual, worldwide, non-exclusive, royalty-free, fully paid-up, transferable, sublicensable, and assignable license to use, reproduce, distribute, display, perform, modify, adapt, translate, create derivative works from, incorporate into other works, and otherwise exploit such User Content in any manner, form, or medium, whether now known or hereafter developed, for any purpose whatsoever, including but not limited to commercial, research, development, training, testing, improvement, enhancement, and optimization purposes, without any obligation to provide attribution, compensation, or notification to you.
            </p>
            <p>
              <strong>2.2. Artificial Intelligence Model Training and Development:</strong> You expressly acknowledge and agree that Capsera shall have the absolute and unrestricted right to utilize, process, analyze, and incorporate your User Content, including but not limited to images and captions, for the purpose of training, developing, improving, enhancing, and optimizing our artificial intelligence models, machine learning algorithms, neural networks, and related technologies (hereinafter collectively referred to as "AI Models"). This includes, but is not limited to, the utilization of your User Content for supervised learning, unsupervised learning, reinforcement learning, transfer learning, fine-tuning, validation, testing, benchmarking, performance evaluation, accuracy improvement, bias reduction, fairness enhancement, robustness testing, adversarial training, and any other machine learning or artificial intelligence development methodologies, techniques, or processes that may be employed in the advancement of our technological capabilities.
            </p>
            <p>
              <strong>2.3. Research, Development, and Commercial Exploitation:</strong> You further acknowledge and agree that Capsera reserves the right to utilize your User Content for any research, development, testing, validation, quality assurance, performance optimization, feature development, product enhancement, service improvement, market analysis, competitive intelligence, business intelligence, strategic planning, product development, service innovation, technology advancement, intellectual property development, patent applications, trade secret protection, and any other commercial, research, or development purposes that Capsera, in its sole and absolute discretion, deems appropriate, beneficial, or necessary for the advancement of its business objectives, technological capabilities, market position, competitive advantage, or any other legitimate business interest.
            </p>
            <p>
              <strong>2.4. Data Processing and Analytics:</strong> Capsera shall have the unrestricted right to process, analyze, aggregate, anonymize, pseudonymize, de-identify, and otherwise manipulate your User Content for the purposes of data analytics, statistical analysis, trend identification, pattern recognition, user behavior analysis, service optimization, performance monitoring, quality improvement, error detection, bug fixing, system optimization, capacity planning, resource allocation, cost optimization, revenue optimization, customer satisfaction improvement, user experience enhancement, feature prioritization, product roadmap development, and any other analytical, statistical, or business intelligence purposes that may be beneficial to Capsera's operations, decision-making processes, strategic planning, or business development initiatives.
            </p>
          </div>
        </div>

        {/* Image and Caption Usage */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            3. Specific Rights Regarding Images and Captions
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>3.1. Image Processing and Utilization:</strong> With respect to any images, photographs, graphics, or visual content that you submit to the Service (hereinafter referred to as "User Images"), you hereby grant Capsera the comprehensive and unrestricted right to process, analyze, manipulate, transform, enhance, modify, crop, resize, compress, optimize, store, archive, backup, replicate, distribute, display, perform, reproduce, and otherwise utilize such User Images in any manner whatsoever, including but not limited to the training of computer vision models, image recognition algorithms, object detection systems, facial recognition technologies, image classification systems, image segmentation algorithms, image generation models, style transfer models, image enhancement algorithms, image restoration models, and any other image processing, analysis, or manipulation technologies that may be developed, improved, or enhanced through the utilization of your User Images.
            </p>
            <p>
              <strong>3.2. Caption Generation and Training:</strong> Regarding any captions, descriptions, text content, or linguistic data that you provide or that are generated in response to your User Images (hereinafter referred to as "User Captions"), you acknowledge and agree that Capsera shall have the absolute and unrestricted right to utilize such User Captions for the training, development, improvement, and optimization of natural language processing models, language generation algorithms, text analysis systems, sentiment analysis models, content classification systems, language understanding models, translation models, summarization algorithms, question-answering systems, and any other natural language processing, understanding, generation, or manipulation technologies that may benefit from the incorporation of your User Captions into their training datasets, validation sets, or testing protocols.
            </p>
            <p>
              <strong>3.3. Model Training and Validation:</strong> You expressly consent to the utilization of your User Images and User Captions for the comprehensive training, validation, testing, and evaluation of our artificial intelligence models, including but not limited to supervised learning processes, unsupervised learning methodologies, reinforcement learning algorithms, transfer learning techniques, fine-tuning procedures, hyperparameter optimization, model selection, ensemble methods, cross-validation, holdout validation, k-fold cross-validation, leave-one-out validation, bootstrap validation, and any other machine learning or artificial intelligence training, validation, or testing methodologies that may be employed in the development and improvement of our technological capabilities.
            </p>
          </div>
        </div>

        {/* Data Retention and Archiving */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            4. Data Retention, Archiving, and Storage Policies
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>4.1. Comprehensive Data Retention:</strong> Notwithstanding any representations, statements, or implications to the contrary, you acknowledge and agree that Capsera shall have the absolute and unrestricted right to retain, store, archive, backup, replicate, and maintain copies of your User Content, including but not limited to User Images and User Captions, for an indefinite period of time, without any obligation to delete, remove, or destroy such content upon your request, account deletion, service termination, or for any other reason whatsoever. This retention policy applies to all forms of your User Content, whether stored in active databases, archival systems, backup systems, cloud storage, distributed storage systems, or any other storage medium or system that may be utilized by Capsera for the preservation and maintenance of your User Content.
            </p>
            <p>
              <strong>4.2. Archival and Backup Systems:</strong> You expressly acknowledge and agree that Capsera may maintain multiple copies of your User Content in various archival, backup, and storage systems, including but not limited to primary databases, secondary databases, tertiary databases, backup databases, disaster recovery systems, business continuity systems, cloud storage systems, distributed storage networks, content delivery networks, edge computing systems, and any other storage or archival systems that may be implemented for the purposes of data protection, business continuity, disaster recovery, regulatory compliance, legal compliance, audit requirements, or any other legitimate business or operational purposes that Capsera may deem necessary or appropriate.
            </p>
            <p>
              <strong>4.3. Data Processing and Transformation:</strong> Capsera reserves the right to process, transform, convert, encode, decode, compress, encrypt, decrypt, hash, tokenize, anonymize, pseudonymize, aggregate, summarize, analyze, and otherwise manipulate your User Content in any manner whatsoever, and such processed, transformed, or manipulated versions of your User Content may be retained, stored, archived, or utilized independently of the original User Content, without any obligation to maintain the original format, structure, or characteristics of such content, and such processed versions may be utilized for any purpose whatsoever, including but not limited to training, development, research, analysis, or any other legitimate business or operational purposes.
            </p>
          </div>
        </div>

        {/* Third-Party Sharing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            5. Third-Party Sharing and Data Distribution
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>5.1. Unrestricted Third-Party Sharing:</strong> You acknowledge and agree that Capsera shall have the absolute and unrestricted right to share, distribute, transfer, license, sublicense, assign, or otherwise provide access to your User Content, including but not limited to User Images and User Captions, to any third parties, including but not limited to business partners, technology partners, research institutions, academic institutions, government agencies, regulatory bodies, law enforcement agencies, legal counsel, auditors, consultants, contractors, subcontractors, service providers, cloud service providers, data center operators, network operators, content delivery networks, edge computing providers, artificial intelligence service providers, machine learning service providers, and any other third parties that Capsera may deem appropriate, beneficial, or necessary for the advancement of its business objectives, technological capabilities, research initiatives, or any other legitimate business purposes.
            </p>
            <p>
              <strong>5.2. Commercial Licensing and Monetization:</strong> Capsera reserves the right to license, sublicense, assign, transfer, or otherwise commercialize your User Content to third parties for any commercial purposes whatsoever, including but not limited to the development of commercial products, services, applications, or technologies, the provision of commercial services to third parties, the licensing of technologies or intellectual property to third parties, the sale or transfer of technologies or intellectual property to third parties, and any other commercial exploitation or monetization of your User Content that may generate revenue, create business opportunities, or advance Capsera's commercial interests, without any obligation to provide you with compensation, attribution, or notification of such commercial activities.
            </p>
          </div>
        </div>

        {/* Waiver of Rights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            6. Comprehensive Waiver of Rights and Claims
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>6.1. Complete Waiver of Claims:</strong> By accepting these Terms of Service and utilizing the Service, you hereby irrevocably and unconditionally waive, release, discharge, and relinquish any and all claims, demands, actions, causes of action, suits, proceedings, complaints, charges, grievances, disputes, controversies, disagreements, conflicts, objections, protests, challenges, contests, appeals, reviews, reconsiderations, modifications, amendments, or any other form of legal, equitable, or administrative recourse, remedy, or relief that you may have, or may have had, or may in the future have, against Capsera, its subsidiaries, affiliates, successors, assigns, officers, directors, employees, agents, representatives, contractors, subcontractors, service providers, or any other persons or entities acting on behalf of, or in connection with, Capsera, arising out of, relating to, or in connection with the utilization, processing, storage, retention, archiving, sharing, distribution, licensing, commercialization, or any other use of your User Content as contemplated by these Terms of Service.
            </p>
            <p>
              <strong>6.2. Indemnification and Hold Harmless:</strong> You agree to indemnify, defend, and hold harmless Capsera, its subsidiaries, affiliates, successors, assigns, officers, directors, employees, agents, representatives, contractors, subcontractors, service providers, and any other persons or entities acting on behalf of, or in connection with, Capsera, from and against any and all claims, demands, actions, causes of action, suits, proceedings, complaints, charges, grievances, disputes, controversies, disagreements, conflicts, objections, protests, challenges, contests, appeals, reviews, reconsiderations, modifications, amendments, damages, losses, costs, expenses, fees, charges, penalties, fines, judgments, awards, settlements, or any other form of liability, obligation, or responsibility that may arise out of, relate to, or be connected with your use of the Service, your submission of User Content, your violation of these Terms of Service, or your violation of any applicable laws, regulations, or third-party rights.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h2>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>If you have any questions regarding these Terms of Service, please contact us at:</p>
            <p>Email: legal@capsera.com</p>
            <p>Address: [Your Business Address]</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              ← Back to Home
            </Link>
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
