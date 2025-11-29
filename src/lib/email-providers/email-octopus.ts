import axios from 'axios';

interface EmailOctopusConfig {
    apiKey: string;
    listId: string;
}

class EmailOctopusService {
    private config: EmailOctopusConfig;
    private baseUrl = 'https://emailoctopus.com/api/1.6';

    constructor() {
        this.config = {
            apiKey: process.env.EMAIL_OCTOPUS_API_KEY || '',
            listId: process.env.EMAIL_OCTOPUS_LIST_ID || ''
        };
    }

    /**
     * Add a contact to the marketing list
     */
    async addContact(email: string, firstName?: string, lastName?: string): Promise<boolean> {
        if (!this.config.apiKey || !this.config.listId) {
            console.warn('⚠️ EmailOctopus API Key or List ID not set. Marketing email subscription skipped.');
            return false;
        }

        try {
            const response = await axios.post(`${this.baseUrl}/lists/${this.config.listId}/contacts`, {
                api_key: this.config.apiKey,
                email_address: email,
                fields: {
                    FirstName: firstName,
                    LastName: lastName
                },
                status: 'SUBSCRIBED' // Or 'PENDING' if you want double opt-in, but usually SUBSCRIBED for app users
            });

            if (response.status === 200 || response.status === 201) {
                console.log(`✅ Added ${email} to EmailOctopus list.`);
                return true;
            }
            return false;
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.error && error.response.data.error.code === 'MEMBER_EXISTS_WITH_EMAIL_ADDRESS') {
                console.log(`ℹ️ Contact ${email} already exists in EmailOctopus list.`);
                return true; // Treat as success
            }
            console.error('❌ Failed to add contact to EmailOctopus:', error.response?.data || error.message);
            return false;
        }
    }
}

export default new EmailOctopusService();
