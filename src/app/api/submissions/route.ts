// File: src/app/api/submissions/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, users } from '@/db/schema'; // Import users untuk JOIN
import { eq, asc, sql } from 'drizzle-orm';

// --- GET: Ambil Semua Pengajuan (Antrian Kerja dan Riwayat) ---
export async function GET() {
    try {
        // Melakukan JOIN antara umkmLocations dan users untuk mendapatkan detail pemilik
        const submissions = await db
            .select({
                id: umkmLocations.id,
                namaLapak: umkmLocations.namaLapak,
                izinStatus: umkmLocations.izinStatus,
                dateApplied: umkmLocations.dateApplied,
                userId: umkmLocations.userId,
                // Detail Pemilik dari tabel users
                namaPemilik: users.nama,
                emailPemohon: users.email,
            })
            .from(umkmLocations)
            .innerJoin(users, eq(umkmLocations.userId, users.id))
            .orderBy(asc(umkmLocations.dateApplied)); // Urutkan dari yang paling lama diajukan

        return NextResponse.json({ success: true, data: submissions });
    } catch (error) {
        console.error('API GET Submissions Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil data pengajuan.' }, { status: 500 });
    }
}