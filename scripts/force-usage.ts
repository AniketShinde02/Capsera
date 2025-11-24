
import { connectToDatabase } from '../src/lib/db';

async function forceSetUsage() {
    try {
        console.log('🔌 Connecting to database...');
        const { db } = await connectToDatabase();
        console.log('✅ Connected.');

        const key = 'ip:::1';
        console.log(`🔧 Setting usage for key: ${key} to 4 (Remaining: 1)`);

        const result = await db.collection('freemium_usage').updateOne(
            { key },
            {
                $set: {
                    dailyUsage: 4,
                    updatedAt: new Date(),
                    // Ensure reset date is in the future
                    dailyResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
                },
                $setOnInsert: {
                    tier: 'free',
                    weeklyUsage: 0,
                    weeklyResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log('✅ Update result:', result.modifiedCount || result.upsertedCount ? 'Success' : 'No change');

        const record = await db.collection('freemium_usage').findOne({ key });
        console.log('📊 Current Record:', JSON.stringify(record, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

forceSetUsage();
