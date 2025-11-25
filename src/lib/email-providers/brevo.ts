// src/lib/email-providers/brevo.ts

import { EmailProvider } from './email-provider';
import Brevo from '@getbrevo/brevo'; // Assuming brevo SDK is installed

/**
 * Brevo (formerly Sendinblue) email provider implementation.
 * Uses the Brevo SDK with built‑in exponential back‑off.
 */
export class BrevoProvider implements EmailProvider {
    private client: Brevo.TransactionalEmailsApi;

    constructor() {
        const apiKey = process.env.BREVO_API_KEY;
        if (!apiKey) {
            throw new Error('BREVO_API_KEY environment variable is required for BrevoProvider');
        }
        this.client = new Brevo.TransactionalEmailsApi();
        this.client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
    }

    async send(to: string, subject: string, html: string, tags: string[] = []): Promise<void> {
        const email = {
            sender: { email: process.env.EMAIL_SENDER_ADDRESS, name: process.env.EMAIL_SENDER_NAME },
            to: [{ email: to }],
            subject,
            htmlContent: html,
            tags,
        };

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.client.sendTransacEmail(email);
                return; // success
            } catch (err) {
                if (attempt === maxRetries) {
                    console.error('BrevoProvider: failed after retries', { err, to, subject });
                    throw err;
                }
                const backoff = Math.pow(2, attempt) * 1000; // exponential back‑off
                await new Promise((res) => setTimeout(res, backoff));
            }
        }
    }
}
