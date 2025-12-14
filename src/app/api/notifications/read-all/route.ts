import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

async function getUserFromCookie(request: NextRequest): Promise<JwtPayload | null> {
    try {
        const token = request.cookies.get('sipetak_token')?.value;
        if (!token) return null;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024');
        const { payload } = await jose.jwtVerify(token, secret);
        return payload as unknown as JwtPayload;
    } catch (error) {
        console.error('❌ Error verifying token:', error);
        return null;
    }
}

export async function PATCH(request: NextRequest) {
    console.log('🔄 PATCH /api/notifications/read-all');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, user.userId));

        console.log('✅ All notifications marked as read for user:', user.userId);

        return NextResponse.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('❌ PATCH /api/notifications/read-all error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to mark all as read' },
            { status: 500 }
        );
    }
}