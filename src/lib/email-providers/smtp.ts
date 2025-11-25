// src/lib/email-providers/smtp.ts

import { EmailProvider } from './email-provider';
import nodemailer from 'nodemailer';

/**
 * SMTP provider using nodemailer with connection pooling.
 */
export class SmtpProvider implements EmailProvider {
    private transporter: nodemailer.Transporter;

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            throw new Error('SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS)');
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: { user, pass },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
        });
    }

    async send(to: string, subject: string, html: string, tags: string[] = []): Promise<void> {
        const mailOptions = {
            from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
            to,
            subject,
            html,
            // tags are not natively supported by SMTP, but we keep the param for interface compatibility
        };

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.transporter.sendMail(mailOptions);
                return; // success
            } catch (err) {
                if (attempt === maxRetries) {
                    console.error('SmtpProvider: failed after retries', { err, to, subject });
                    throw err;
                }
                const backoff = Math.pow(2, attempt) * 1000;
                await new Promise((res) => setTimeout(res, backoff));
            }
        }
    }
}
