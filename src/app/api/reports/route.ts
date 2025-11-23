// File: src/app/api/reports/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { reports, users } from '@/db/schema'; // Import users untuk JOIN
import { eq, asc, sql } from 'drizzle-orm';

// --- GET: Ambil Semua Laporan Warga (Antrian dan Riwayat) ---
export async function GET() {
    try {
        // Melakukan LEFT JOIN antara reports dan users untuk mendapatkan nama Admin Handler (jika ada)
        const reportsData = await db
            .select({
                id: reports.id,
                reportType: reports.reportType,
                description: reports.description,
                latitude: reports.latitude,
                longitude: reports.longitude,
                buktiFotoUrl: reports.buktiFotoUrl,
                status: reports.status,
                dateReported: reports.dateReported,
                // Nama Admin yang menangani (bisa null jika belum ditangani)
                adminHandlerName: users.nama,
            })
            .from(reports)
            .leftJoin(users, eq(reports.adminHandlerId, users.id))
            .orderBy(asc(reports.dateReported)); // Urutkan dari yang paling lama

        return NextResponse.json({ success: true, data: reportsData });
    } catch (error) {
        console.error('API GET Reports Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil data laporan warga.' }, { status: 500 });
    }
}