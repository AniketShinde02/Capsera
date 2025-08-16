const { connectToDatabase } = require('../src/lib/db.js');

async function clearUsedTokens() {
  try {
    console.log('🧹 Clearing used tokens...');
    
    const { db } = await connectToDatabase();
    const usedTokensCollection = db.collection('used_tokens');
    
    const result = await usedTokensCollection.deleteMany({});
    
    console.log(`✅ Cleared ${result.deletedCount} used tokens`);
    console.log('🔄 You can now use your setup token again');
    
  } catch (error) {
    console.error('❌ Error clearing tokens:', error);
  } finally {
    process.exit(0);
  }
}

clearUsedTokens();
