import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await db.execute(sql`SELECT notify_unhandled_reports()`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}