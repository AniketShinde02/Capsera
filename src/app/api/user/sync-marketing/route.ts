import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import emailOctopusService from '@/lib/email-providers/email-octopus';

/**
 * Syncs a user with EmailOctopus if marketing is enabled
 */
async function syncWithEmailOctopus(user: any) {
    if (!user) return;

    const marketingEnabled =
        user.userSettings?.marketingEmails ||
        user.notificationSettings?.email?.marketing;

    if (marketingEnabled) {
        const nameParts = (user.name || user.username || '').split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        emailOctopusService.addContact(user.email, firstName, lastName).catch(err =>
            console.error('Failed to sync with EmailOctopus:', err)
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get the user to sync with EmailOctopus on first login/signup
        const user = await (User as any).findById(session.user.id);
        if (user) {
            await syncWithEmailOctopus(user);
        }

        return NextResponse.json({ success: true, synced: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
