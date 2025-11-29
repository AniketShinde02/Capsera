import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Suggestion from '@/models/Suggestion';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        // Note: Adjust this check based on your actual admin check logic
        // Assuming session.user.role.name === 'admin' or similar
        const isAdmin = (session.user as any).role?.name === 'admin' || (session.user as any).isAdmin;
        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Fetch all suggestions, populated with user details if needed
        // For now, just fetching suggestions. You might want to populate 'userId' to get email/name
        const suggestions = await Suggestion.find({})
            .populate('userId', 'name email image username')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: suggestions }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
