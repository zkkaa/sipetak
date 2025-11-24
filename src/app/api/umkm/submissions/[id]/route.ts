// File: src/app/api/umkm/submissions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations } from '@/db/schema';
import { eq, and } from 'drizzle-orm'; // ✅ Import and dari drizzle-orm
import * as jose from 'jose';

// Interface untuk parameter dinamis
interface Params {
    params: {
        id: string;
    };
}

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

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetakkosong1');
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
export async function PUT(req: NextRequest, { params }: Params) {
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
export async function GET(req: NextRequest, { params }: Params) {
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
export async function DELETE(req: NextRequest, { params }: Params) {
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

        // 2. ✅ Hapus submission
        await db
            .delete(umkmLocations)
            .where(eq(umkmLocations.id, submissionId));

        // 3. ✅ Kembalikan status master location ke 'Tersedia'
        await db
            .update(masterLocations)
            .set({ status: 'Tersedia' })
            .where(eq(masterLocations.id, submission.masterLocationId));

        console.log('✅ Submission deleted and location freed:', submissionId);

        return NextResponse.json({ 
            success: true, 
            message: 'Pengajuan berhasil dihapus.' 
        }, { status: 200 });

    } catch (error) {
        console.error(`❌ API DELETE Submission ${submissionId} Error:`, error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal menghapus pengajuan.' 
        }, { status: 500 });
    }
}