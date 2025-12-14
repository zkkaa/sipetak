import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('🗑️ DELETE /api/notifications/[id]');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const notifId = parseInt(id);

        if (isNaN(notifId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid notification ID' },
                { status: 400 }
            );
        }

        const [deleted] = await db
            .delete(notifications)
            .where(
                and(
                    eq(notifications.id, notifId),
                    eq(notifications.userId, user.userId)
                )
            )
            .returning();

        if (!deleted) {
            return NextResponse.json(
                { success: false, message: 'Notification not found or access denied' },
                { status: 404 }
            );
        }

        console.log('✅ Notification deleted:', notifId);

        return NextResponse.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        console.error('❌ DELETE /api/notifications/[id] error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}