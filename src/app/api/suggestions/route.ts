import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Suggestion from '@/models/Suggestion';
import BrevoEmailService from '@/lib/brevo-email';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { title, description, category } = body;

        if (!title || !description) {
            return NextResponse.json({ success: false, error: 'Please provide title and description' }, { status: 400 });
        }

        const suggestion = await Suggestion.create({
            userId: (session.user as any).id,
            title,
            description,
            category: category || 'feature',
        });

        // Send notification email to admin
        try {
            const emailService = new BrevoEmailService(true); // Use secondary SMTP credentials (SMTP_PASS_1)
            const userEmail = session.user.email || 'unknown@example.com';
            const userName = session.user.name || (session.user as any).username || 'Anonymous User';

            // Fire and forget - don't block response
            emailService.sendSuggestionEmail({
                userEmail,
                userName,
                title,
                description,
                category: category || 'feature'
            }).catch(err => console.error('Failed to send suggestion email (async):', err));

        } catch (emailError) {
            console.error('Error initiating suggestion email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({ success: true, data: suggestion }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch suggestions for the current user, sorted by newest first
        const suggestions = await Suggestion.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: suggestions }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
