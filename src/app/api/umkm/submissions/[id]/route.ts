// File: src/app/api/umkm/submissions/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations } from '@/db/schema';
import { eq, SQL } from 'drizzle-orm';
// import { sql } from 'drizzle-orm'; // 💡 Diperlukan untuk log/query kompleks

// Interface untuk parameter dinamis
interface Params {
    params: {
        id: string;
    };
}

// Payload untuk update detail lapak oleh UMKM
interface LapakUpdatePayload {
    namaLapak?: string;
    // Tambahkan field lain yang boleh diubah oleh UMKM (misal deskripsi)
    // description?: string; 
}

// Payload untuk update status (hanya digunakan Admin)
// interface StatusUpdatePayload {
//     newStatus: 'Diterima' | 'Ditolak';
//     // Anggap AdminID tidak dikirim karena UMKM tidak bisa melakukan ini
// }


export async function PUT(req: Request, { params }: Params) {
    const lapakId = parseInt(params.id);
    const body = (await req.json()) as LapakUpdatePayload;
    
    // 1. TODO: Ambil userId dari token JWT (Header/Cookie)
    const dummyUserId = 2; // Ganti dengan ID user yang sedang login

    if (isNaN(lapakId)) {
        return NextResponse.json({ success: false, message: 'ID Lapak tidak valid.' }, { status: 400 });
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {}; // Objek update dinamis

        // Hanya izinkan update pada field tertentu
        if (body.namaLapak) updateData.namaLapak = body.namaLapak;
        // if (body.description) updateData.description = body.description; // Tambahkan ini jika deskripsi bisa diubah

        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ success: false, message: 'Tidak ada data untuk diperbarui.' }, { status: 400 });
        }

        // 2. Jalankan update di database (Penting: Filter berdasarkan ID UMKM untuk otorisasi)
        const [updatedLapak] = await db.update(umkmLocations)
            .set(updateData)
            .where(and(
                eq(umkmLocations.id, lapakId),
                eq(umkmLocations.userId, dummyUserId) // 💡 Otorisasi: Hanya pemilik yang bisa edit
            )) 
            .returning();

        if (!updatedLapak) {
            return NextResponse.json({ success: false, message: 'Lapak tidak ditemukan atau Anda tidak memiliki izin.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Lapak berhasil diperbarui.', lapak: updatedLapak });

    } catch (error) {
        console.error(`API PUT Lapak ${lapakId} Error:`, error);
        return NextResponse.json({ success: false, message: 'Gagal memperbarui lapak.' }, { status: 500 });
    }
}

// --- 1. GET: Ambil Detail Pengajuan UMKM ---
export async function GET(req: Request, { params }: Params) {
    const submissionId = parseInt(params.id);
    
    if (isNaN(submissionId)) {
        return NextResponse.json({ success: false, message: 'ID Pengajuan tidak valid.' }, { status: 400 });
    }

    try {
        // Ambil detail pengajuan (JOIN dengan masterLocations jika diperlukan)
        const [submission] = await db.select().from(umkmLocations).where(eq(umkmLocations.id, submissionId));

        if (!submission) {
            return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: submission });

    } catch (error) {
        console.error(`API GET Submission Detail ${submissionId} Error:`, error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil detail pengajuan.' }, { status: 500 });
    }
}


// --- 2. DELETE: Hapus Pengajuan UMKM ---
export async function DELETE(req: Request, { params }: Params) {
    const submissionId = parseInt(params.id);

    if (isNaN(submissionId)) {
        return NextResponse.json({ success: false, message: 'ID Pengajuan tidak valid.' }, { status: 400 });
    }

    // Catatan: Dalam logika real, Anda harus mengupdate status master_locations kembali ke 'Tersedia'
    // sebelum menghapus pengajuan ini.

    try {
        const result = await db.delete(umkmLocations).where(eq(umkmLocations.id, submissionId)).returning();

        if (result.length === 0) {
            return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Pengajuan berhasil dihapus.' }, { status: 200 });

    } catch (error) {
        console.error(`API DELETE Submission ${submissionId} Error:`, error);
        return NextResponse.json({ success: false, message: 'Gagal menghapus pengajuan.' }, { status: 500 });
    }
}

function and(arg0: SQL<unknown>, arg1: SQL<unknown>): import("drizzle-orm").SQL<unknown> | undefined {
    throw new Error('Function not implemented.');
}
