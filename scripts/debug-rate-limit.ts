
import { consolidatedRateLimiter } from '../src/lib/consolidated-rate-limiter';
import { getFreemiumUsageInfo } from '../src/lib/freemium-rate-limiter';
import { connectToDatabase } from '../src/lib/db';

async function debugRateLimit() {
    try {
        console.log('🔌 Connecting to database...');
        await connectToDatabase();
        console.log('✅ Connected.');

        const testIp = '::1';
        const testUserId = undefined;

        console.log('\n📊 Initial Usage Info for ::1:');
        const initialInfo = await getFreemiumUsageInfo(testUserId, testIp);
        console.log(JSON.stringify(initialInfo, null, 2));

        console.log('\n🔄 Calling consolidatedRateLimiter.checkRateLimit...');
        const result = await consolidatedRateLimiter.checkRateLimit(testUserId, testIp);
        console.log('Result:', JSON.stringify(result, null, 2));

        console.log('\n📊 Final Usage Info for ::1:');
        const finalInfo = await getFreemiumUsageInfo(testUserId, testIp);
        console.log(JSON.stringify(finalInfo, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugRateLimit();
