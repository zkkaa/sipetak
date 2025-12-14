// File: src/app/api/deletion-requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { deletionRequests, umkmLocations, masterLocations, submissions, notifications } from '@/db/schema';
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('🔄 PUT /api/deletion-requests/[id]');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (user.role !== 'Admin') {
            return NextResponse.json(
                { success: false, message: 'Access denied. Admin only' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const requestId = parseInt(id);

        if (isNaN(requestId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid request ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { action, rejectionReason } = body;

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, message: 'Invalid action. Must be "approve" or "reject"' },
                { status: 400 }
            );
        }

        const [deletionRequest] = await db
            .select()
            .from(deletionRequests)
            .where(eq(deletionRequests.id, requestId));

        if (!deletionRequest) {
            return NextResponse.json(
                { success: false, message: 'Pengajuan penghapusan tidak ditemukan' },
                { status: 404 }
            );
        }

        if (deletionRequest.status !== 'Pending') {
            return NextResponse.json(
                { success: false, message: 'Pengajuan sudah diproses sebelumnya' },
                { status: 400 }
            );
        }

        const [location] = await db
            .select()
            .from(umkmLocations)
            .where(eq(umkmLocations.id, deletionRequest.umkmLocationId));

        if (!location) {
            return NextResponse.json(
                { success: false, message: 'Lokasi tidak ditemukan' },
                { status: 404 }
            );
        }

        if (action === 'approve') {
            console.log('✅ Admin menyetujui penghapusan lokasi:', location.id);
            await db
                .update(deletionRequests)
                .set({
                    status: 'Approved',
                    reviewedBy: user.userId,
                    reviewedAt: new Date(),
                })
                .where(eq(deletionRequests.id, requestId));
            await db
                .delete(submissions)
                .where(eq(submissions.umkmLocationId, location.id));
            await db
                .delete(umkmLocations)
                .where(eq(umkmLocations.id, location.id));
            await db
                .update(masterLocations)
                .set({ status: 'Tersedia' })
                .where(eq(masterLocations.id, location.masterLocationId));
            await db.insert(notifications).values({
                userId: deletionRequest.userId,
                type: 'deletion_approved',
                title: 'Pengajuan Penghapusan Disetujui',
                message: `Pengajuan penghapusan lokasi "${location.namaLapak}" telah disetujui. Lokasi telah dihapus dari sistem.`,
                link: '/umkm/lokasi',
                relatedId: requestId,
            });

            console.log('✅ Lokasi berhasil dihapus dari database');

            return NextResponse.json({
                success: true,
                message: 'Pengajuan penghapusan disetujui dan lokasi telah dihapus',
            });

        } else {
            console.log('❌ Admin menolak penghapusan lokasi:', location.id);
            await db
                .update(deletionRequests)
                .set({
                    status: 'Rejected',
                    reviewedBy: user.userId,
                    reviewedAt: new Date(),
                    rejectionReason: rejectionReason || null,
                })
                .where(eq(deletionRequests.id, requestId));
            await db
                .update(umkmLocations)
                .set({ izinStatus: 'Diterima' })
                .where(eq(umkmLocations.id, location.id));
            const notifMessage = rejectionReason
                ? `Pengajuan penghapusan lokasi "${location.namaLapak}" ditolak. Alasan: ${rejectionReason}`
                : `Pengajuan penghapusan lokasi "${location.namaLapak}" ditolak oleh admin.`;

            await db.insert(notifications).values({
                userId: deletionRequest.userId,
                type: 'deletion_rejected',
                title: 'Pengajuan Penghapusan Ditolak',
                message: notifMessage,
                link: '/umkm/lokasi',
                relatedId: requestId,
            });

            console.log('✅ Status dikembalikan ke "Diterima"');

            return NextResponse.json({
                success: true,
                message: 'Pengajuan penghapusan ditolak. Status lokasi dikembalikan ke "Diterima"',
            });
        }

    } catch (error) {
        console.error('❌ PUT /api/deletion-requests/[id] error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal memproses pengajuan penghapusan' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('🗑️ DELETE /api/deletion-requests/[id] - Cancel request');

    try {
        const user = await getUserFromCookie(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const requestId = parseInt(id);

        if (isNaN(requestId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid request ID' },
                { status: 400 }
            );
        }

        const [deletionRequest] = await db
            .select()
            .from(deletionRequests)
            .where(
                and(
                    eq(deletionRequests.id, requestId),
                    eq(deletionRequests.userId, user.userId)
                )
            );

        if (!deletionRequest) {
            return NextResponse.json(
                { success: false, message: 'Pengajuan tidak ditemukan atau bukan milik Anda' },
                { status: 404 }
            );
        }

        if (deletionRequest.status !== 'Pending') {
            return NextResponse.json(
                { success: false, message: 'Hanya pengajuan yang masih pending yang bisa dibatalkan' },
                { status: 400 }
            );
        }

        await db
            .delete(deletionRequests)
            .where(eq(deletionRequests.id, requestId));

        await db
            .update(umkmLocations)
            .set({ izinStatus: 'Diterima' })
            .where(eq(umkmLocations.id, deletionRequest.umkmLocationId));

        console.log('✅ Deletion request cancelled:', requestId);

        return NextResponse.json({
            success: true,
            message: 'Pengajuan penghapusan berhasil dibatalkan',
        });

    } catch (error) {
        console.error('❌ DELETE /api/deletion-requests/[id] error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal membatalkan pengajuan' },
            { status: 500 }
        );
    }
}