// File: src/app/api/submissions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';

interface Params {
    params: {
        id: string;
    };
}

interface StatusUpdatePayload {
    newStatus: 'Diterima' | 'Ditolak';
}

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

// Helper: Check if user is Admin
async function isAdmin(request: NextRequest): Promise<boolean> {
    try {
        const token = request.cookies.get('sipetak_token')?.value;
        if (!token) return false;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetakkosong1');
        const { payload } = await jose.jwtVerify(token, secret);
        const jwtPayload = payload as unknown as JwtPayload;
        
        return jwtPayload.role === 'Admin';
    } catch (error) {
        console.error('❌ Error checking admin:', error);
        return false;
    }
}

// PUT: Update status pengajuan (Approve/Reject)
export async function PUT(request: NextRequest, { params }: Params) {
    const submissionId = parseInt(params.id);
    
    if (isNaN(submissionId)) {
        return NextResponse.json(
            { success: false, message: 'ID tidak valid' },
            { status: 400 }
        );
    }

    try {
        // Verifikasi Admin
        const admin = await isAdmin(request);
        if (!admin) {
            console.error('❌ User bukan Admin');
            return NextResponse.json(
                { success: false, message: 'Anda tidak memiliki akses' },
                { status: 403 }
            );
        }

        const body = await request.json() as StatusUpdatePayload;
        const { newStatus } = body;

        if (!newStatus || !['Diterima', 'Ditolak'].includes(newStatus)) {
            return NextResponse.json(
                { success: false, message: 'Status tidak valid' },
                { status: 400 }
            );
        }

        console.log(`🔄 Mengubah status submission ${submissionId} menjadi ${newStatus}`);

        // Ambil detail submission saat ini
        const [submission] = await db
            .select()
            .from(umkmLocations)
            .where(eq(umkmLocations.id, submissionId));

        if (!submission) {
            return NextResponse.json(
                { success: false, message: 'Pengajuan tidak ditemukan' },
                { status: 404 }
            );
        }

        // ✅ Update status dengan casting yang benar
        const [updatedSubmission] = await db
            .update(umkmLocations)
            .set({ izinStatus: newStatus as 'Diterima' | 'Ditolak' })
            .where(eq(umkmLocations.id, submissionId))
            .returning();

        // Update master location berdasarkan status
        if (newStatus === 'Diterima') {
            // Jika diterima, update status master location menjadi 'Terisi'
            await db
                .update(masterLocations)
                .set({ status: 'Terisi' })
                .where(eq(masterLocations.id, submission.masterLocationId));
            
            console.log('✅ Master location marked as Terisi');
        } else if (newStatus === 'Ditolak') {
            // Jika ditolak, kembalikan status master location menjadi 'Tersedia'
            await db
                .update(masterLocations)
                .set({ status: 'Tersedia' })
                .where(eq(masterLocations.id, submission.masterLocationId));
            
            console.log('✅ Master location marked as Tersedia');
        }

        console.log(`✅ Submission ${submissionId} status updated to ${newStatus}`);

        return NextResponse.json({
            success: true,
            message: `Status berhasil diubah menjadi ${newStatus}`,
            submission: updatedSubmission
        });

    } catch (error) {
        console.error(`❌ PUT /api/submissions/${params.id} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengupdate status' },
            { status: 500 }
        );
    }
}