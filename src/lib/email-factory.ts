// src/lib/email-factory.ts

import { EmailProvider } from './email-providers/email-provider';
import { BrevoProvider } from './email-providers/brevo';
import { OctopusProvider } from './email-providers/octopus';
import { SmtpProvider } from './email-providers/smtp';

/**
 * Factory that returns the appropriate EmailProvider based on the
 * EMAIL_PROVIDER environment variable. Defaults to 'smtp'.
 */
export function getEmailProvider(): EmailProvider {
    const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();
    switch (provider) {
        case 'brevo':
            return new BrevoProvider();
        case 'octopus':
            return new OctopusProvider();
        case 'smtp':
        default:
            return new SmtpProvider();
    }
}
