// File: src/app/api/umkm/dashboard/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';

// Simulasikan fungsi untuk mendapatkan User ID dari JWT Token
// Dalam implementasi nyata, ini akan diambil dari token setelah middleware
const getUserIdFromToken = (request: Request): number => {
    // Ganti dengan logika dekode token yang sebenarnya
    return 2; // ID Dummy UMKM
};

// --- GET: Ambil Semua Metrik Dashboard UMKM ---
export async function GET(req: Request) {
    const userId = getUserIdFromToken(req);

    try {
        // 1. Hitung Total Lokasi Milik UMKM (Aktif/Diajukan/Ditolak)
        const [totalLocationsResult] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(eq(umkmLocations.userId, userId));

        // 2. Hitung Sertifikat Aktif (Status Izin = Diterima)
        const [activeCertificatesResult] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(and(
                eq(umkmLocations.userId, userId),
                eq(umkmLocations.izinStatus, 'Diterima')
            ));

        // 3. Hitung Pengajuan Berjalan (Status Izin = Diajukan)
        const [pendingSubmissionsResult] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(and(
                eq(umkmLocations.userId, userId),
                eq(umkmLocations.izinStatus, 'Diajukan')
            ));

        const dashboardData = {
            totalLocations: totalLocationsResult.count,
            activeCertificates: activeCertificatesResult.count,
            pendingSubmissions: pendingSubmissionsResult.count,
        };

        return NextResponse.json({ success: true, data: dashboardData });

    } catch (error) {
        console.error('API GET Dashboard UMKM Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil metrik dashboard.' }, { status: 500 });
    }
}