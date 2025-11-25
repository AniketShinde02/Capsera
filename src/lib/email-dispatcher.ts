// src/lib/email-dispatcher.ts

import OutboundEmailModel, { OutboundEmail as OutboundEmailDoc } from '@/models/OutboundEmail';
import { getEmailProvider } from '@/lib/email-factory';

/**
 * Queue an email for sending. The email is persisted in the `outbound_emails`
 * collection and will be processed by the background worker.
 */
export async function queueEmail(
    to: string,
    subject: string,
    html: string,
    provider?: string
): Promise<void> {
    const chosenProvider = provider || process.env.EMAIL_PROVIDER || 'smtp';
    const email = new OutboundEmailModel({
        to,
        subject,
        html,
        provider: chosenProvider,
        status: 'queued',
        retryCount: 0,
    });
    await email.save();
}

/**
 * Helper used by legacy code that expected a direct `send` method.
 * It simply queues the email and returns a boolean indicating the queueing succeeded.
 */
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    provider?: string
): Promise<boolean> {
    try {
        await queueEmail(to, subject, html, provider);
        return true;
    } catch (err) {
        console.error('Failed to queue email', err);
        return false;
    }
}
