// File: src/app/api/umkm/locations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations } from '@/db/schema';
// ✅ FIXED: Removed unused 'users' import
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/umkm/locations dipanggil');
    
    try {
        // TODO: Ambil userId dari JWT token
        const userId = 7; // Hardcode untuk testing
        console.log('👤 User ID:', userId);
        
        // Query lokasi UMKM dengan JOIN ke master_locations
        const locations = await db
            .select({
                id: umkmLocations.id,
                namaLapak: umkmLocations.namaLapak,
                businessType: umkmLocations.businessType,
                izinStatus: umkmLocations.izinStatus,
                dateApplied: umkmLocations.dateApplied,
                dateExpired: umkmLocations.dateExpired,
                latitude: masterLocations.latitude,
                longitude: masterLocations.longitude,
                masterLocationId: masterLocations.id,
            })
            .from(umkmLocations)
            .leftJoin(
                masterLocations,
                eq(umkmLocations.masterLocationId, masterLocations.id)
            )
            .where(eq(umkmLocations.userId, userId));
        
        console.log('✅ Ditemukan lokasi:', locations.length);
        
        // Transform data untuk frontend
        const transformedData = locations.map(loc => ({
            id: loc.id,
            namaLapak: loc.namaLapak,
            koordinat: `${loc.latitude}, ${loc.longitude}`,
            izinStatus: loc.izinStatus,
            tanggalDaftar: loc.dateApplied 
                ? new Date(loc.dateApplied).toISOString().split('T')[0] 
                : 'N/A',
            tanggalKedaluwarsa: loc.dateExpired 
                ? new Date(loc.dateExpired).toISOString().split('T')[0] 
                : 'N/A',
            businessType: loc.businessType,
            masterLocationId: loc.masterLocationId,
            latitude: loc.latitude,
            longitude: loc.longitude,
        }));
        
        return NextResponse.json(
            { 
                success: true, 
                data: transformedData,
                count: transformedData.length 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ GET Locations Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Gagal mengambil data lokasi: ' + (error as Error).message 
            },
            { status: 500 }
        );
    }
}