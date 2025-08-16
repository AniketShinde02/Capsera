
"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
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
            1. Introduction and Scope of Privacy Policy
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              This comprehensive Privacy Policy (hereinafter referred to as "Policy," "Privacy Policy," or "this Policy") constitutes a detailed and exhaustive explanation of the manner in which Capsera (hereinafter referred to as "we," "us," "our," "Company," or "Capsera"), as the data controller and data processor, collects, processes, stores, utilizes, shares, discloses, transfers, archives, retains, and otherwise handles all forms of personal information, personal data, user-generated content, metadata, usage data, behavioral data, and any other information or data (hereinafter collectively referred to as "User Data" or "Data") that is provided by, collected from, or generated through the utilization of our artificial intelligence-powered caption generation platform and associated services (hereinafter referred to as "Service," "Platform," or "Website").
            </p>
            <p>
              This Privacy Policy is designed to provide you, the user (hereinafter referred to as "you," "your," "user," "data subject," or "individual"), with comprehensive information regarding our data collection practices, data processing activities, data utilization methodologies, data sharing protocols, data retention policies, data security measures, data protection mechanisms, and your rights as a data subject under applicable data protection laws, regulations, and legal frameworks, including but not limited to the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), California Privacy Rights Act (CPRA), Virginia Consumer Data Protection Act (VCDPA), Colorado Privacy Act (CPA), Utah Consumer Privacy Act (UCPA), Connecticut Data Privacy Act (CTDPA), and any other applicable privacy, data protection, or consumer protection laws that may be enacted, amended, or modified in the future.
            </p>
            <p>
              By accessing, using, or otherwise interacting with our Service, you acknowledge that you have read, understood, and agree to be bound by the terms and conditions set forth in this Privacy Policy, and you expressly consent to the collection, processing, storage, utilization, sharing, disclosure, transfer, archiving, retention, and any other handling of your User Data as described herein, without limitation, reservation, or exception, and you further acknowledge that this Privacy Policy constitutes a legally binding agreement between you and Capsera regarding the handling of your personal information and data.
            </p>
          </div>
        </div>

        {/* Data Collection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            2. Comprehensive Data Collection and Information Gathering
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>2.1. User-Provided Information:</strong> We collect, process, and store comprehensive information that you voluntarily provide to us when you create an account, register for our Service, submit content, upload images, generate captions, interact with our platform, communicate with us, provide feedback, submit support requests, participate in surveys, engage in promotional activities, or otherwise interact with our Service, including but not limited to your full name, email address, username, password, profile information, biographical data, demographic information, contact details, communication preferences, marketing preferences, account settings, user preferences, customization options, and any other information that you choose to provide to us in connection with your use of our Service or your interaction with our platform.
            </p>
            <p>
              <strong>2.2. Image and Content Data:</strong> We collect, process, and store all images, photographs, graphics, visual content, text content, captions, descriptions, metadata, tags, labels, annotations, comments, feedback, ratings, reviews, and any other content that you submit, upload, transmit, or otherwise provide to our Service, including but not limited to the actual image files, image metadata, EXIF data, geolocation information, timestamp information, device information, camera settings, image processing parameters, compression settings, quality settings, format information, size information, and any other data or information that may be embedded within, associated with, or derived from your submitted content, regardless of whether such information is explicitly provided by you or automatically generated by our systems or third-party services.
            </p>
            <p>
              <strong>2.3. Usage and Behavioral Data:</strong> We automatically collect, process, and store comprehensive information regarding your usage patterns, behavior patterns, interaction patterns, navigation patterns, click patterns, scroll patterns, time spent on various features, feature utilization frequency, service usage patterns, platform engagement metrics, user experience metrics, performance metrics, error logs, crash reports, system logs, application logs, network logs, access logs, authentication logs, session logs, and any other data or information that may be generated, collected, or derived from your interaction with our Service, including but not limited to the frequency, duration, timing, context, and nature of your interactions with various features, functionalities, and components of our platform.
            </p>
            <p>
              <strong>2.4. Technical and Device Information:</strong> We automatically collect, process, and store comprehensive technical information regarding your device, system, network, and environment, including but not limited to your device type, device model, device manufacturer, operating system, operating system version, browser type, browser version, browser settings, browser plugins, browser extensions, screen resolution, color depth, display settings, network type, network provider, IP address, geolocation information, timezone information, language settings, regional settings, accessibility settings, security settings, privacy settings, and any other technical, system, network, or environmental information that may be relevant to the provision, optimization, or improvement of our Service.
            </p>
          </div>
        </div>

        {/* Data Usage and Processing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            3. Comprehensive Data Usage and Processing Purposes
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>3.1. Service Provision and Operation:</strong> We utilize your User Data for the primary purpose of providing, operating, maintaining, optimizing, and improving our artificial intelligence caption generation service, including but not limited to processing your image uploads, generating captions based on your images, analyzing image content, recognizing image features, identifying image patterns, understanding image context, interpreting image semantics, generating appropriate captions, providing caption suggestions, offering caption alternatives, enabling caption customization, facilitating caption editing, supporting caption management, enabling caption sharing, facilitating caption export, and any other functionality that is directly related to the core purpose and operation of our caption generation service, as well as any ancillary or supporting services that may enhance your user experience or improve the quality of our service delivery.
            </p>
            <p>
              <strong>3.2. Artificial Intelligence Model Training and Development:</strong> We utilize your User Data, including but not limited to your submitted images, generated captions, user feedback, usage patterns, interaction data, and any other relevant information, for the comprehensive training, development, improvement, enhancement, optimization, and advancement of our artificial intelligence models, machine learning algorithms, neural networks, deep learning systems, natural language processing models, computer vision models, image recognition systems, caption generation models, and any other artificial intelligence or machine learning technologies that are employed in the provision of our services, including but not limited to supervised learning processes, unsupervised learning methodologies, reinforcement learning algorithms, transfer learning techniques, fine-tuning procedures, hyperparameter optimization, model selection, ensemble methods, cross-validation, and any other machine learning or artificial intelligence development methodologies that may be employed in the advancement of our technological capabilities.
            </p>
            <p>
              <strong>3.3. Research, Development, and Innovation:</strong> We utilize your User Data for comprehensive research, development, and innovation purposes, including but not limited to conducting research studies, performing data analysis, conducting statistical analysis, performing trend analysis, conducting pattern recognition, performing user behavior analysis, conducting market research, performing competitive analysis, conducting product research, performing service research, conducting technology research, performing innovation research, conducting academic research, conducting commercial research, conducting applied research, conducting basic research, and any other research, development, or innovation activities that may advance our understanding of user needs, improve our service offerings, enhance our technological capabilities, or contribute to the advancement of artificial intelligence, machine learning, computer vision, natural language processing, or any other relevant technological fields.
            </p>
            <p>
              <strong>3.4. Business Intelligence and Analytics:</strong> We utilize your User Data for comprehensive business intelligence and analytics purposes, including but not limited to analyzing user behavior patterns, analyzing usage patterns, analyzing feature utilization, analyzing service performance, analyzing user satisfaction, analyzing user engagement, analyzing user retention, analyzing user acquisition, analyzing user conversion, analyzing revenue generation, analyzing cost optimization, analyzing operational efficiency, analyzing market trends, analyzing competitive landscape, analyzing industry developments, analyzing technological advancements, analyzing regulatory changes, analyzing legal developments, and any other business intelligence or analytics activities that may inform our business strategy, guide our product development, optimize our operations, improve our financial performance, or enhance our competitive position in the market.
            </p>
          </div>
        </div>

        {/* Data Sharing and Disclosure */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            4. Comprehensive Data Sharing, Disclosure, and Third-Party Access
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>4.1. Service Providers and Technology Partners:</strong> We may share, disclose, transfer, or otherwise provide access to your User Data with various third-party service providers, technology partners, business partners, and other entities that assist us in the provision, operation, maintenance, optimization, and improvement of our services, including but not limited to cloud service providers, hosting providers, data center operators, network operators, content delivery networks, edge computing providers, artificial intelligence service providers, machine learning service providers, computer vision service providers, natural language processing service providers, image processing service providers, data analytics service providers, business intelligence service providers, customer relationship management service providers, marketing service providers, advertising service providers, payment processing service providers, security service providers, monitoring service providers, logging service providers, backup service providers, disaster recovery service providers, and any other third-party service providers that may be necessary or beneficial for the provision of our services.
            </p>
            <p>
              <strong>4.2. Research and Academic Institutions:</strong> We may share, disclose, transfer, or otherwise provide access to your User Data with various research institutions, academic institutions, universities, colleges, research organizations, think tanks, policy institutes, government research agencies, private research organizations, non-profit research organizations, commercial research organizations, and any other entities that are engaged in research, development, or innovation activities that may be relevant to our business objectives, technological capabilities, or service offerings, including but not limited to artificial intelligence research, machine learning research, computer vision research, natural language processing research, image processing research, caption generation research, user experience research, human-computer interaction research, and any other research activities that may advance our understanding of relevant technologies, methodologies, or applications.
            </p>
            <p>
              <strong>4.3. Commercial Partners and Business Development:</strong> We may share, disclose, transfer, or otherwise provide access to your User Data with various commercial partners, business partners, strategic partners, joint venture partners, licensing partners, franchising partners, distribution partners, marketing partners, advertising partners, promotional partners, event partners, conference partners, trade show partners, exhibition partners, publication partners, media partners, content partners, technology partners, innovation partners, research partners, development partners, and any other entities that may be involved in commercial, business, or strategic activities that are related to our business objectives, market expansion, product development, service innovation, technology advancement, or any other legitimate business purposes that may benefit our company, our shareholders, our stakeholders, or our business interests.
            </p>
          </div>
        </div>

        {/* Data Retention and Storage */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            5. Comprehensive Data Retention, Storage, and Archival Policies
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>5.1. Indefinite Data Retention:</strong> Notwithstanding any representations, statements, or implications to the contrary, we reserve the absolute and unrestricted right to retain, store, archive, backup, replicate, and maintain copies of your User Data, including but not limited to your submitted images, generated captions, user information, usage data, behavioral data, technical data, and any other information or data that we may collect, process, or generate in connection with your use of our Service, for an indefinite period of time, without any obligation to delete, remove, destroy, or otherwise dispose of such data upon your request, account deletion, service termination, or for any other reason whatsoever, and such retention may continue indefinitely, even after the termination of your account, the discontinuation of our services, or any other event that may affect your relationship with our company.
            </p>
            <p>
              <strong>5.2. Comprehensive Data Archival and Backup Systems:</strong> We maintain comprehensive and redundant data archival and backup systems that are designed to ensure the long-term preservation, protection, and accessibility of your User Data, including but not limited to primary storage systems, secondary storage systems, tertiary storage systems, backup storage systems, disaster recovery systems, business continuity systems, cloud storage systems, distributed storage systems, redundant storage systems, mirrored storage systems, replicated storage systems, and any other storage or archival systems that may be implemented for the purposes of data protection, data preservation, business continuity, disaster recovery, regulatory compliance, legal compliance, audit requirements, research purposes, development purposes, innovation purposes, or any other legitimate business or operational purposes that we may deem necessary or appropriate.
            </p>
            <p>
              <strong>5.3. Data Processing and Transformation Retention:</strong> We reserve the right to process, transform, convert, encode, decode, compress, encrypt, decrypt, hash, tokenize, anonymize, pseudonymize, aggregate, summarize, analyze, and otherwise manipulate your User Data in any manner whatsoever, and such processed, transformed, or manipulated versions of your User Data may be retained, stored, archived, or utilized independently of the original User Data, without any obligation to maintain the original format, structure, or characteristics of such data, and such processed versions may be utilized for any purpose whatsoever, including but not limited to training, development, research, analysis, business intelligence, analytics, or any other legitimate business or operational purposes, and such processed versions may be retained indefinitely, even after the original data has been deleted, removed, or destroyed.
            </p>
          </div>
        </div>

        {/* User Rights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            6. Limited User Rights and Data Subject Protections
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
            <p>
              <strong>6.1. Limited Right to Access:</strong> Subject to certain limitations, restrictions, and conditions as set forth in this Privacy Policy and applicable laws, you may have a limited right to request access to certain categories of your User Data that we may maintain in our systems, databases, or archives, provided that such requests are made in writing, submitted through our designated channels, include sufficient information to identify your account and the specific data you are requesting, are submitted within reasonable timeframes, comply with our verification procedures, and are not excessive, unfounded, or repetitive in nature, and we reserve the right to deny, limit, or condition such access requests based on various factors, including but not limited to the nature of the requested data, the purpose of the request, the impact on our operations, the cost of compliance, the technical feasibility of the request, and any other factors that we may deem relevant or appropriate.
            </p>
            <p>
              <strong>6.2. Limited Right to Correction:</strong> Subject to certain limitations, restrictions, and conditions as set forth in this Privacy Policy and applicable laws, you may have a limited right to request the correction, rectification, or updating of certain categories of your User Data that may be inaccurate, incomplete, outdated, or otherwise incorrect, provided that such requests are made in writing, submitted through our designated channels, include sufficient information to identify your account and the specific data you are requesting to be corrected, provide evidence of the inaccuracy or incorrectness of the data, are submitted within reasonable timeframes, comply with our verification procedures, and are not excessive, unfounded, or repetitive in nature, and we reserve the right to deny, limit, or condition such correction requests based on various factors, including but not limited to the nature of the requested correction, the evidence provided, the impact on our operations, the cost of compliance, the technical feasibility of the request, and any other factors that we may deem relevant or appropriate.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h2>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
            <p>If you have any questions regarding this Privacy Policy, please contact us at:</p>
            <p>Email: privacy@capsera.com</p>
            <p>Address: [Your Business Address]</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              ← Terms of Service
            </Link>
            <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Back to Home →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
