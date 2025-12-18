import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Suggestion from '@/models/Suggestion';

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

        const { reaction } = await req.json();
        const { id } = params;

        if (!reaction) {
            return NextResponse.json({ success: false, error: 'Reaction is required' }, { status: 400 });
        }

        const suggestion = await Suggestion.findById(id);

        if (!suggestion) {
            return NextResponse.json({ success: false, error: 'Suggestion not found' }, { status: 404 });
        }

        // Toggle reaction - if exists, remove it; if not, add it
        const reactions = suggestion.reactions || [];
        const reactionIndex = reactions.indexOf(reaction);

        if (reactionIndex > -1) {
            // Remove reaction
            reactions.splice(reactionIndex, 1);
        } else {
            // Add reaction
            reactions.push(reaction);
        }

        suggestion.reactions = reactions;
        await suggestion.save();

        return NextResponse.json({ success: true, data: { reactions } }, { status: 200 });
    } catch (error: any) {
        console.error('Reaction error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
