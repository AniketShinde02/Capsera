import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify email configuration
 * GET /api/test-email-config
 */
export async function GET(request: NextRequest) {
    try {
        const config = {
            environment: process.env.NODE_ENV,
            smtp: {
                host: process.env.SMTP_HOST ? '✅ SET' : '❌ NOT SET',
                port: process.env.SMTP_PORT ? '✅ SET' : '❌ NOT SET',
                user: process.env.SMTP_USER ? `✅ SET (${process.env.SMTP_USER})` : '❌ NOT SET',
                pass: process.env.SMTP_PASS ? '✅ SET (hidden)' : '❌ NOT SET',
                from: process.env.SMTP_FROM ? `✅ SET (${process.env.SMTP_FROM})` : '❌ NOT SET',
            },
            admin: {
                email: process.env.ADMIN_EMAIL_RECEIVER
                    ? `✅ SET (${process.env.ADMIN_EMAIL_RECEIVER})`
                    : '❌ NOT SET',
            },
            app: {
                nextAuthUrl: process.env.NEXTAUTH_URL ? `✅ SET (${process.env.NEXTAUTH_URL})` : '❌ NOT SET',
                publicUrl: process.env.NEXT_PUBLIC_APP_URL ? `✅ SET (${process.env.NEXT_PUBLIC_APP_URL})` : '❌ NOT SET',
            },
            timestamp: new Date().toISOString(),
        };

        // Check if all required variables are set
        const allSet =
            process.env.SMTP_HOST &&
            process.env.SMTP_PORT &&
            process.env.SMTP_USER &&
            process.env.SMTP_PASS &&
            process.env.ADMIN_EMAIL_RECEIVER;

        return NextResponse.json({
            success: true,
            message: allSet
                ? '✅ All email configuration variables are set!'
                : '⚠️ Some email configuration variables are missing',
            config,
            ready: allSet,
        });

    } catch (error) {
        console.error('❌ Error checking email config:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to check email configuration',
                error: String(error)
            },
            { status: 500 }
        );
    }
}
