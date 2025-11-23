// File: src/app/api/submissions/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
    params: {
        id: string;
    };
}

interface StatusUpdatePayload {
    newStatus: 'Diterima' | 'Ditolak';
}

// --- PUT: Update Status Pengajuan ---
export async function PUT(req: Request, { params }: Params) {
    const submissionId = parseInt(params.id);
    const { newStatus } = await req.json() as StatusUpdatePayload;

    if (isNaN(submissionId) || !newStatus) {
        return NextResponse.json({ success: false, message: 'ID atau status baru tidak valid.' }, { status: 400 });
    }

    // 1. Ambil detail pengajuan saat ini untuk mendapatkan masterLocationId
    const [submissionToUpdate] = await db.select().from(umkmLocations).where(eq(umkmLocations.id, submissionId));

    if (!submissionToUpdate) {
        return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 });
    }

    // --- LOGIKA UPDATE GANDA (TRANSAKSI DATABASE) ---
    
    // Drizzle tidak memiliki transaksi eksplisit di sini, jadi kita menggunakan async/await.
    
    try {
        // 2. Update Status Pengajuan di tabel umkmLocations
        const [updatedSubmission] = await db.update(umkmLocations)
            .set({ izinStatus: newStatus as 'Diterima' | 'Ditolak' })
            .where(eq(umkmLocations.id, submissionId))
            .returning();

        // 3. Jika status DITERIMA, update status titik master lokasi
        if (newStatus === 'Diterima') {
            const masterId = submissionToUpdate.masterLocationId;
            
            // Update status master_locations menjadi 'Terisi'
            await db.update(masterLocations)
                .set({ status: 'Terisi' }) // Status baru: Terisi
                .where(eq(masterLocations.id, masterId));
        }
        
        // 4. Jika status DITOLAK, pastikan status master lokasi diubah kembali ke 'Tersedia'
        if (newStatus === 'Ditolak') {
             const masterId = submissionToUpdate.masterLocationId;
            
             // Update status master_locations menjadi 'Tersedia' (hanya jika masterId ada)
             await db.update(masterLocations)
                 .set({ status: 'Tersedia' }) // Status baru: Tersedia
                 .where(eq(masterLocations.id, masterId));
        }


        return NextResponse.json({ success: true, message: `Status berhasil diubah menjadi ${newStatus}.`, submission: updatedSubmission });
        
    } catch (error) {
        console.error(`API PUT Submission ${submissionId} Error:`, error);
        return NextResponse.json({ success: false, message: 'Gagal memperbarui status pengajuan.' }, { status: 500 });
    }
}