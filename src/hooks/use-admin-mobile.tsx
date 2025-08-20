'use client';

import { useState, useEffect, useCallback } from 'react';

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarOpen: boolean;
  touchStartX: number | null;
  touchStartY: number | null;
  touchEndX: number | null;
  touchEndY: number | null;
}

interface MobileActions {
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  getResponsiveClass: (mobile: string, tablet: string, desktop: string) => string;
  getResponsiveSize: (mobile: number, tablet: number, desktop: number) => number;
}

export function useAdminMobile(): MobileState & MobileActions {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
      
      // Auto-close sidebar on desktop
      if (width >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchStartY || !touchEndX || !touchEndY) return;

    const distanceX = touchStartX - touchEndX;
    const distanceY = touchStartY - touchEndY;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const minSwipeDistance = 50;

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - close sidebar
        setSidebarOpen(false);
      } else {
        // Swipe right - open sidebar
        setSidebarOpen(true);
      }
    }

    // Reset touch coordinates
    setTouchStartX(null);
    setTouchStartY(null);
    setTouchEndX(null);
    setTouchEndY(null);
  }, [touchStartX, touchStartY, touchEndX, touchEndY]);

  // Sidebar controls
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  // Utility functions for responsive design
  const getResponsiveClass = useCallback((mobile: string, tablet: string, desktop: string) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  }, [isMobile, isTablet, isDesktop]);

  const getResponsiveSize = useCallback((mobile: number, tablet: number, desktop: number) => {
    if (isMobile) return mobile;
    if (isTablet) return tablet;
    return desktop;
  }, [isMobile, isTablet, isDesktop]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    sidebarOpen,
    touchStartX,
    touchStartY,
    touchEndX,
    touchEndY,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getResponsiveClass,
    getResponsiveSize,
  };
}
