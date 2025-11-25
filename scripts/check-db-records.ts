import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function checkDatabase() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('Caption_Generator');
        const collection = db.collection('freemium_usage');

        // Find all records for this user
        const userId = '68b1879087417086673c644f';

        console.log('\n🔍 Searching for records with userId:', userId);

        const records = await collection.find({
            $or: [
                { key: `user:${userId}` },
                { key: new RegExp(userId) }
            ]
        }).toArray();

        console.log(`\n📊 Found ${records.length} records:\n`);
        records.forEach((record, index) => {
            console.log(`Record ${index + 1}:`);
            console.log(JSON.stringify(record, null, 2));
            console.log('\n---\n');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

checkDatabase();
