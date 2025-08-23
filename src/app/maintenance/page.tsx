'use client';

import { useState, useEffect } from 'react';
import { Wrench, Clock, Zap, Star, Twitter, Instagram, Facebook, RefreshCw, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimatedTime: string;
  allowedIPs: string[];
  allowedEmails: string[];
  updatedAt: Date;
}

export default function MaintenancePage() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenanceStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      } else {
        setError('Failed to fetch maintenance status');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceStatus();
    const interval = setInterval(fetchMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCompletionTime = () => {
    if (!status?.estimatedTime) return 'We\'ll be back online soon';
    const now = new Date();
    const completion = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const hours = String(completion.getHours()).padStart(2, '0');
    const minutes = String(completion.getMinutes()).padStart(2, '0');
    return `We'll be back online around ${hours}:${minutes} today`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading maintenance status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Wrench className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Status</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchMaintenanceStatus} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block bg-yellow-500 p-3 rounded-full mb-4 shadow-lg">
            <Wrench className="w-8 h-8 text-gray-900" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">
            {status?.message || "We're Making Things Better!"}
          </h1>
          <p className="text-md sm:text-lg text-gray-400">
            Our site is currently under maintenance.
          </p>
        </div>

        {/* Animated Scene Container */}
        <div className="relative w-full max-w-3xl mx-auto mb-12 h-48 sm:h-64 md:h-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-indigo-900 rounded-full opacity-40 blur-3xl animate-pulse"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center scale-75 sm:scale-90 md:scale-100">
            <div className="w-80 h-52 sm:w-96 sm:h-64 bg-gray-800 rounded-xl shadow-2xl border-4 border-gray-700 overflow-hidden">
              <div className="bg-gray-900 p-2 text-left text-xs sm:text-sm text-green-400 h-full overflow-hidden">
                <div className="animate-pulse">
                  <p>&gt; Running system diagnostics...</p>
                  <p className="text-yellow-400">[WARN] Found critical bug</p>
                  <p>&gt; Initializing repair protocol...</p>
                  <p>Squashing bugs and optimizing performance...</p>
                  <p>Applying security patches...</p>
                  <p className="text-cyan-400">// System restarting...</p>
                  <p>&gt; Deploying updates...</p>
                  <p className="text-green-400">[SUCCESS] System stabilized</p>
                  <p>&gt; Running diagnostics...</p>
                  <p className="text-yellow-400">[WARN] Found critical bug</p>
                  <p>&gt; Initializing repair protocol...</p>
                </div>
              </div>
            </div>
            <div className="absolute w-32 sm:w-40 bottom-0 -left-8 sm:-left-10 animate-bounce">
              <div className="w-full h-full bg-gray-700 rounded-full opacity-80"></div>
            </div>
            <div className="absolute w-36 sm:w-48 bottom-0 -right-8 sm:-right-10 animate-bounce" style={{ animationDelay: '1s' }}>
              <div className="w-full h-full bg-gray-600 rounded-full opacity-80"></div>
            </div>
          </div>
        </div>

        {/* Info Section - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="text-center md:text-left">
            <h3 className="font-bold text-white text-lg flex items-center justify-center md:justify-start mb-2">
              <Zap className="w-5 h-5 text-blue-400 mr-2" />
              Performance Boost
            </h3>
            <p className="text-gray-400 text-sm">Optimizing for faster load times.</p>
          </div>
          <div className="text-center order-first md:order-none">
            <h3 className="font-semibold text-white flex items-center justify-center text-lg mb-2">
              <Clock className="w-5 h-5 mr-2" />
              Estimated Completion
            </h3>
            <p className="text-lg text-yellow-400 font-bold">
              {getCompletionTime()}
            </p>
          </div>
          <div className="text-center md:text-right">
            <h3 className="font-bold text-white text-lg flex items-center justify-center md:justify-end mb-2">
              <Star className="w-5 h-5 text-purple-400 mr-2" />
              New Features
            </h3>
            <p className="text-gray-400 text-sm">Adding new tools for you.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={() => window.location.reload()} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/emergency-access">
            <Button variant="outline" size="lg" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900">
              <Shield className="w-4 h-4 mr-2" />
              Emergency Access
            </Button>
          </Link>
        </div>

        {/* Social Links */}
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Stay Updated</p>
          <div className="flex justify-center space-x-4 text-xl sm:text-2xl">
            <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200">
              <Twitter />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200">
              <Instagram />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200">
              <Facebook />
            </a>
          </div>
        </div>

  {/* Debug Info removed per request */}
      </div>
    </div>
  );
}