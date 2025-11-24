// File: src/app/api/umkm/locations/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// --- GET: Ambil semua lokasi UMKM milik user ---
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        let query = db
            .select({
                id: umkmLocations.id,
                namaLapak: umkmLocations.namaLapak,
                businessType: umkmLocations.businessType,
                izinStatus: umkmLocations.izinStatus,
                dateApplied: umkmLocations.dateApplied,
                dateExpired: umkmLocations.dateExpired,
                masterLocation: {
                    latitude: masterLocations.latitude,
                    longitude: masterLocations.longitude,
                }
            })
            .from(umkmLocations)
            .innerJoin(masterLocations, eq(umkmLocations.masterLocationId, masterLocations.id));

        if (userId) {
            query = query.where(eq(umkmLocations.userId, parseInt(userId))) as any;
        }

        const locations = await query;

        return NextResponse.json({ success: true, data: locations });
    } catch (error) {
        console.error('API GET UMKM Locations Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data lokasi.' }, 
            { status: 500 }
        );
    }
}