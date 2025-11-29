import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Suggestion from '@/models/Suggestion';
import BrevoEmailService from '@/lib/brevo-email';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = (session.user as any).role?.name === 'admin' || (session.user as any).isAdmin;
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const { reply, status } = await req.json();
        const { id } = params;

        if (!reply) {
            return NextResponse.json({ success: false, error: 'Reply content is required' }, { status: 400 });
        }

        const suggestion = await Suggestion.findById(id).populate('userId', 'name email username');

        if (!suggestion) {
            return NextResponse.json({ success: false, error: 'Suggestion not found' }, { status: 404 });
        }

        // Update suggestion
        suggestion.adminReply = reply;
        suggestion.repliedAt = new Date();
        if (status) {
            suggestion.status = status;
        } else {
            suggestion.status = 'reviewed'; // Default to reviewed if not specified
        }

        await suggestion.save();

        // Send email to user
        try {
            const emailService = new BrevoEmailService(true); // Use secondary SMTP credentials (SMTP_PASS_1)
            const user = suggestion.userId as any;

            if (user && user.email) {
                await emailService.sendSuggestionReplyEmail({
                    userEmail: user.email,
                    userName: user.name || user.username || 'User',
                    suggestionTitle: suggestion.title,
                    adminReply: reply
                });
            }
        } catch (emailError) {
            console.error('Failed to send reply email:', emailError);
            // Don't fail the request
        }

        return NextResponse.json({ success: true, data: suggestion }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
