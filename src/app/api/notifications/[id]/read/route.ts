// File: src/app/api/notifications/[id]/read/route.ts
// ✅ FILE BARU - Buat folder: src/app/api/notifications/[id]/read/
// ========================================

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

// PATCH: Mark notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('🔄 PATCH /api/notifications/[id]/read');

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

        // Update only if notification belongs to current user
        const [updated] = await db
            .update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.id, notifId),
                    eq(notifications.userId, user.userId)
                )
            )
            .returning();

        if (!updated) {
            return NextResponse.json(
                { success: false, message: 'Notification not found or access denied' },
                { status: 404 }
            );
        }

        console.log('✅ Notification marked as read:', notifId);

        return NextResponse.json({
            success: true,
            notification: updated,
        });
    } catch (error) {
        console.error('❌ PATCH /api/notifications/[id]/read error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to mark as read' },
            { status: 500 }
        );
    }
}