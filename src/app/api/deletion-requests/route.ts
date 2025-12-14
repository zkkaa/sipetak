// File: src/app/api/deletion-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { deletionRequests, umkmLocations, users, masterLocations, notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
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
async function checkCooldown(userId: number, umkmLocationId: number): Promise<{ allowed: boolean; cooldownUntil?: Date }> {
    const [lastRejection] = await db
        .select()
        .from(deletionRequests)
        .where(
            and(
                eq(deletionRequests.umkmLocationId, umkmLocationId),
                eq(deletionRequests.userId, userId),
                eq(deletionRequests.status, 'Rejected')
            )
        )
        .orderBy(desc(deletionRequests.reviewedAt))
        .limit(1);

    if (!lastRejection || !lastRejection.reviewedAt) {
        return { allowed: true };
    }

    const reviewedDate = new Date(lastRejection.reviewedAt);
    const cooldownEnd = new Date(reviewedDate);
    cooldownEnd.setDate(cooldownEnd.getDate() + 3); 

    const now = new Date();
    if (now < cooldownEnd) {
        return { allowed: false, cooldownUntil: cooldownEnd };
    }

    return { allowed: true };
}

export async function POST(request: NextRequest) {
    console.log('📝 POST /api/deletion-requests');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { umkmLocationId, reason } = body;

        if (!umkmLocationId || !reason) {
            return NextResponse.json(
                { success: false, message: 'Data tidak lengkap' },
                { status: 400 }
            );
        }

        if (reason.trim().length < 30) {
            return NextResponse.json(
                { success: false, message: 'Alasan minimal 30 karakter' },
                { status: 400 }
            );
        }

        const [location] = await db
            .select()
            .from(umkmLocations)
            .where(
                and(
                    eq(umkmLocations.id, umkmLocationId),
                    eq(umkmLocations.userId, user.userId)
                )
            );

        if (!location) {
            return NextResponse.json(
                { success: false, message: 'Lokasi tidak ditemukan atau bukan milik Anda' },
                { status: 404 }
            );
        }

        if (location.izinStatus !== 'Diterima') {
            return NextResponse.json(
                { success: false, message: 'Hanya lokasi dengan status "Diterima" yang bisa diajukan penghapusan' },
                { status: 400 }
            );
        }

        const cooldownCheck = await checkCooldown(user.userId, umkmLocationId);
        if (!cooldownCheck.allowed && cooldownCheck.cooldownUntil) {
            const formattedDate = cooldownCheck.cooldownUntil.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            return NextResponse.json(
                { 
                    success: false, 
                    message: `Anda masih dalam masa cooldown. Silakan ajukan kembali setelah ${formattedDate}`,
                    cooldownUntil: cooldownCheck.cooldownUntil
                },
                { status: 429 }
            );
        }

        const [existingRequest] = await db
            .select()
            .from(deletionRequests)
            .where(
                and(
                    eq(deletionRequests.umkmLocationId, umkmLocationId),
                    eq(deletionRequests.status, 'Pending')
                )
            );

        if (existingRequest) {
            return NextResponse.json(
                { success: false, message: 'Sudah ada pengajuan penghapusan yang sedang diproses' },
                { status: 400 }
            );
        }

        const [newRequest] = await db
            .insert(deletionRequests)
            .values({
                umkmLocationId,
                userId: user.userId,
                reason: reason.trim(),
                status: 'Pending',
            })
            .returning();

        await db
            .update(umkmLocations)
            .set({ izinStatus: 'Pengajuan Penghapusan' })
            .where(eq(umkmLocations.id, umkmLocationId));

        const admins = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.role, 'Admin'));

        for (const admin of admins) {
            await db.insert(notifications).values({
                userId: admin.id,
                type: 'deletion_requested',
                title: 'Pengajuan Penghapusan Baru',
                message: `Ada pengajuan penghapusan lokasi dari ${user.nama} untuk lapak "${location.namaLapak}"`,
                link: '/admin/verifikasi#deletion-requests',
                relatedId: newRequest.id,
            });
        }

        console.log('✅ Deletion request created:', newRequest.id);

        return NextResponse.json({
            success: true,
            message: 'Pengajuan penghapusan berhasil dikirim',
            request: newRequest,
        }, { status: 201 });

    } catch (error) {
        console.error('❌ POST /api/deletion-requests error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal membuat pengajuan penghapusan' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/deletion-requests');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        let requests;

        if (user.role === 'Admin') {
            requests = await db
                .select({
                    id: deletionRequests.id,
                    umkmLocationId: deletionRequests.umkmLocationId,
                    userId: deletionRequests.userId,
                    reason: deletionRequests.reason,
                    status: deletionRequests.status,
                    requestedAt: deletionRequests.requestedAt,
                    reviewedBy: deletionRequests.reviewedBy,
                    reviewedAt: deletionRequests.reviewedAt,
                    rejectionReason: deletionRequests.rejectionReason,
                    // Joined data
                    namaLapak: umkmLocations.namaLapak,
                    businessType: umkmLocations.businessType,
                    dateApplied: umkmLocations.dateApplied,
                    namaPemilik: users.nama,
                    emailPemohon: users.email,
                    latitude: masterLocations.latitude,
                    longitude: masterLocations.longitude,
                })
                .from(deletionRequests)
                .leftJoin(umkmLocations, eq(deletionRequests.umkmLocationId, umkmLocations.id))
                .leftJoin(users, eq(deletionRequests.userId, users.id))
                .leftJoin(masterLocations, eq(umkmLocations.masterLocationId, masterLocations.id))
                .orderBy(deletionRequests.requestedAt); // ✅ Oldest first

        } else {
            requests = await db
                .select({
                    id: deletionRequests.id,
                    umkmLocationId: deletionRequests.umkmLocationId,
                    userId: deletionRequests.userId,
                    reason: deletionRequests.reason,
                    status: deletionRequests.status,
                    requestedAt: deletionRequests.requestedAt,
                    reviewedBy: deletionRequests.reviewedBy,
                    reviewedAt: deletionRequests.reviewedAt,
                    rejectionReason: deletionRequests.rejectionReason,
                    namaLapak: umkmLocations.namaLapak,
                    businessType: umkmLocations.businessType,
                    dateApplied: umkmLocations.dateApplied,
                })
                .from(deletionRequests)
                .leftJoin(umkmLocations, eq(deletionRequests.umkmLocationId, umkmLocations.id))
                .where(eq(deletionRequests.userId, user.userId))
                .orderBy(desc(deletionRequests.requestedAt));
        }

        console.log(`✅ Found ${requests.length} deletion requests`);

        return NextResponse.json({
            success: true,
            requests,
            count: requests.length,
        });

    } catch (error) {
        console.error('❌ GET /api/deletion-requests error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data pengajuan penghapusan' },
            { status: 500 }
        );
    }
}