// File: src/app/api/umkm/submissions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations, submissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import * as jose from 'jose';

// ✅ PERBAIKAN: Next.js 15 - params is now a Promise
type RouteContext = {
    params: Promise<{ id: string }>;
};

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

// Payload untuk update detail lapak oleh UMKM
interface LapakUpdatePayload {
    namaLapak?: string;
}

// ✅ Helper function untuk extract userId dari cookie
async function getUserIdFromCookie(request: NextRequest): Promise<number | null> {
    try {
        const token = request.cookies.get('sipetak_token')?.value;
        
        if (!token) {
            console.warn('⚠️ No token in cookie');
            return null;
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024');
        const { payload } = await jose.jwtVerify(token, secret);
        
        const jwtPayload = payload as unknown as JwtPayload;
        console.log('✅ User ID extracted from cookie:', jwtPayload.userId);
        return jwtPayload.userId;
    } catch (error) {
        console.error('❌ Error extracting userId from cookie:', error);
        return null;
    }
}

// --- PUT: Update Lapak ---
export async function PUT(req: NextRequest, context: RouteContext) {
    // ✅ Await params
    const params = await context.params;
    const lapakId = parseInt(params.id);
    
    if (isNaN(lapakId)) {
        return NextResponse.json({ 
            success: false, 
            message: 'ID Lapak tidak valid.' 
        }, { status: 400 });
    }

    try {
        // 1. ✅ Ambil userId dari cookie
        const userId = await getUserIdFromCookie(req);
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'User tidak terautentikasi.' 
            }, { status: 401 });
        }

        // 2. Parse body
        const body = (await req.json()) as LapakUpdatePayload;
        
        const updateData: Partial<typeof umkmLocations.$inferInsert> = {};

        // Hanya izinkan update pada field tertentu
        if (body.namaLapak) updateData.namaLapak = body.namaLapak;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'Tidak ada data untuk diperbarui.' 
            }, { status: 400 });
        }

        // 3. ✅ Update dengan otorisasi (hanya pemilik yang bisa edit)
        const [updatedLapak] = await db
            .update(umkmLocations)
            .set(updateData)
            .where(
                and(
                    eq(umkmLocations.id, lapakId),
                    eq(umkmLocations.userId, userId)
                )
            )
            .returning();

        if (!updatedLapak) {
            return NextResponse.json({ 
                success: false, 
                message: 'Lapak tidak ditemukan atau Anda tidak memiliki izin.' 
            }, { status: 404 });
        }

        console.log('✅ Lapak updated:', updatedLapak.id);

        return NextResponse.json({ 
            success: true, 
            message: 'Lapak berhasil diperbarui.', 
            lapak: updatedLapak 
        });

    } catch (error) {
        console.error(`❌ API PUT Lapak ${lapakId} Error:`, error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal memperbarui lapak.' 
        }, { status: 500 });
    }
}

// --- GET: Ambil Detail Pengajuan ---
export async function GET(req: NextRequest, context: RouteContext) {
    // ✅ Await params
    const params = await context.params;
    const submissionId = parseInt(params.id);
    
    if (isNaN(submissionId)) {
        return NextResponse.json({ 
            success: false, 
            message: 'ID Pengajuan tidak valid.' 
        }, { status: 400 });
    }

    try {
        // ✅ Verifikasi user
        const userId = await getUserIdFromCookie(req);
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'User tidak terautentikasi.' 
            }, { status: 401 });
        }

        // Ambil detail pengajuan
        const [submission] = await db
            .select()
            .from(umkmLocations)
            .where(
                and(
                    eq(umkmLocations.id, submissionId),
                    eq(umkmLocations.userId, userId) // ✅ Hanya bisa lihat milik sendiri
                )
            );

        if (!submission) {
            return NextResponse.json({ 
                success: false, 
                message: 'Pengajuan tidak ditemukan.' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            data: submission 
        });

    } catch (error) {
        console.error(`❌ API GET Submission Detail ${submissionId} Error:`, error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal mengambil detail pengajuan.' 
        }, { status: 500 });
    }
}

// --- DELETE: Hapus Pengajuan ---
export async function DELETE(req: NextRequest, context: RouteContext) {
    // ✅ Await params
    const params = await context.params;
    const submissionId = parseInt(params.id);

    if (isNaN(submissionId)) {
        return NextResponse.json({ 
            success: false, 
            message: 'ID Pengajuan tidak valid.' 
        }, { status: 400 });
    }

    try {
        // ✅ Verifikasi user
        const userId = await getUserIdFromCookie(req);
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'User tidak terautentikasi.' 
            }, { status: 401 });
        }

        // 1. ✅ Ambil data submission untuk mendapatkan masterLocationId
        const [submission] = await db
            .select()
            .from(umkmLocations)
            .where(
                and(
                    eq(umkmLocations.id, submissionId),
                    eq(umkmLocations.userId, userId)
                )
            );

        if (!submission) {
            return NextResponse.json({ 
                success: false, 
                message: 'Pengajuan tidak ditemukan atau Anda tidak memiliki izin.' 
            }, { status: 404 });
        }

        console.log('🔍 Found submission to delete:', submission);

        // 2. ✅ PERBAIKAN: Hapus dari table submissions DULU (child table)
        const deletedSubmissionRecords = await db
            .delete(submissions)
            .where(eq(submissions.umkmLocationId, submissionId))
            .returning();

        console.log('✅ Deleted from submissions table:', deletedSubmissionRecords.length, 'records');

        // 3. ✅ Kemudian hapus dari umkmLocations (parent table)
        await db
            .delete(umkmLocations)
            .where(eq(umkmLocations.id, submissionId));

        console.log('✅ Deleted from umkmLocations:', submissionId);

        // 4. ✅ Kembalikan status master location ke 'Tersedia'
        await db
            .update(masterLocations)
            .set({ status: 'Tersedia' })
            .where(eq(masterLocations.id, submission.masterLocationId));

        console.log('✅ Master location freed:', submission.masterLocationId);

        return NextResponse.json({ 
            success: true, 
            message: 'Pengajuan berhasil dihapus dan lokasi dikembalikan ke pool tersedia.' 
        }, { status: 200 });

    } catch (error) {
        console.error(`❌ API DELETE Submission ${submissionId} Error:`, error);
        
        // ✅ Tambahkan error detail untuk debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal menghapus pengajuan: ' + errorMessage 
        }, { status: 500 });
    }
}