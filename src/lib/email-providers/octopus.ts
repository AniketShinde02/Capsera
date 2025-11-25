// src/lib/email-providers/octopus.ts

import { EmailProvider } from './email-provider';
import fetch from 'node-fetch';

/**
 * EmailOctopus provider implementation.
 * Uses the EmailOctopus REST API (https://emailoctopus.com/api). 
 */
export class OctopusProvider implements EmailProvider {
    private apiKey: string;
    private apiUrl: string;

    constructor() {
        const key = process.env.EMAIL_OCTOPUS_API_KEY;
        if (!key) {
            throw new Error('EMAIL_OCTOPUS_API_KEY environment variable is required for OctopusProvider');
        }
        this.apiKey = key;
        this.apiUrl = 'https://emailoctopus.com/api/1.6';
    }

    async send(to: string, subject: string, html: string, tags: string[] = []): Promise<void> {
        const payload = {
            api_key: this.apiKey,
            to_address: to,
            subject,
            html_body: html,
            // EmailOctopus supports custom fields; we use tags as a custom field if needed
            // Note: tags are not a native field, but can be stored in metadata for analytics.
        };

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(`${this.apiUrl}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) {
                    const errBody = await response.text();
                    throw new Error(`OctopusProvider: HTTP ${response.status} - ${errBody}`);
                }
                return; // success
            } catch (err) {
                if (attempt === maxRetries) {
                    console.error('OctopusProvider: failed after retries', { err, to, subject });
                    throw err;
                }
                const backoff = Math.pow(2, attempt) * 1000;
                await new Promise((res) => setTimeout(res, backoff));
            }
        }
    }
}
