// File: src/app/api/notifications/route.ts
// ✅ FILE BARU - Buat folder: src/app/api/notifications/

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { notifications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
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

// ========== GET: Fetch all notifications for current user ==========
export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/notifications');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userNotifications = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, user.userId))
            .orderBy(desc(notifications.createdAt))
            .limit(50); // Limit to last 50 notifications

        console.log(`✅ Found ${userNotifications.length} notifications for user ${user.userId}`);

        return NextResponse.json({
            success: true,
            notifications: userNotifications,
            count: userNotifications.length,
        });
    } catch (error) {
        console.error('❌ GET /api/notifications error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// ========== POST: Create new notification (for testing or manual creation) ==========
export async function POST(request: NextRequest) {
    console.log('📝 POST /api/notifications');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { targetUserId, type, title, message, link, relatedId } = body;

        // Validation
        if (!targetUserId || !type || !title || !message) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const [newNotification] = await db
            .insert(notifications)
            .values({
                userId: targetUserId,
                type,
                title,
                message,
                link: link || null,
                relatedId: relatedId || null,
                isRead: false,
            })
            .returning();

        console.log('✅ Notification created:', newNotification.id);

        return NextResponse.json({
            success: true,
            notification: newNotification,
        }, { status: 201 });
    } catch (error) {
        console.error('❌ POST /api/notifications error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create notification' },
            { status: 500 }
        );
    }
}