import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const maintenanceDoc = await db.collection('system_settings').findOne({ key: 'maintenance_mode' });
    const enabled = !!(maintenanceDoc && maintenanceDoc.value && maintenanceDoc.value.enabled);
    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Error reading maintenance status:', error);
    // Fail-open: if we cannot determine status, report disabled
    return NextResponse.json({ enabled: false }, { status: 200 });
  }
}
