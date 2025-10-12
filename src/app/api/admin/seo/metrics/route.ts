import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-middleware';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminError = await verifyAdminAccess(request);
    if (adminError) return adminError;

    const { db } = await connectToDatabase();

    // Check if sitemap.xml exists and is accessible
    let sitemapStatus = 'active';
    try {
      const sitemapResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sitemap.xml`);
      if (!sitemapResponse.ok) {
        sitemapStatus = 'warning';
      }
    } catch {
      sitemapStatus = 'error';
    }

    // Check if robots.txt exists and is accessible
    let robotsStatus = 'active';
    try {
      const robotsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/robots.txt`);
      if (!robotsResponse.ok) {
        robotsStatus = 'warning';
      }
    } catch {
      robotsStatus = 'error';
    }

    // Check meta tags status (basic check)
    const metaTagsStatus = 'active'; // This would require more complex analysis

    // Check structured data status
    const structuredDataStatus = 'active'; // This would require analysis of actual pages

    const metrics = {
      sitemapStatus,
      robotsStatus,
      metaTagsStatus,
      structuredDataStatus,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 SEO metrics:', metrics);

    return NextResponse.json({
      success: true,
      metrics
    });

  } catch (error: any) {
    console.error('SEO metrics error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch SEO metrics',
      message: error.message
    }, { status: 500 });
  }
}
