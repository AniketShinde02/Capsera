// src/lib/email-providers/email-provider.ts

export interface EmailProvider {
    /**
     * Send an email.
     * @param to Recipient email address
     * @param subject Email subject line
     * @param html HTML body of the email
     * @param tags Optional tags for analytics / provider specific metadata
     */
    send(to: string, subject: string, html: string, tags?: string[]): Promise<void>;
}
