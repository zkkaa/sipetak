// File: src/app/api/umkm/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';
import * as jose from 'jose';

// ============================================
// Type definitions
// ============================================
interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

// ============================================
// HELPER: Extract userId from Cookie
// ============================================
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

// ============================================
// GET: Ambil Semua Metrik Dashboard UMKM
// ============================================
export async function GET(req: NextRequest) {
    console.log('🔍 GET /api/umkm/dashboard dipanggil');

    try {
        // Extract userId dari cookie
        const userId = await getUserIdFromCookie(req);

        if (!userId) {
            console.error('❌ User tidak terautentikasi');
            return NextResponse.json(
                { success: false, message: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        console.log('✅ Fetching dashboard data for user ID:', userId);

        // 1. Hitung Total Lokasi Milik UMKM (Semua status)
        const [totalLocationsResult] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(eq(umkmLocations.userId, userId));

        console.log('📊 Total locations:', totalLocationsResult.count);

        // 2. Hitung Sertifikat Aktif (Status Izin = Diterima)
        const [activeCertificatesResult] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(and(
                eq(umkmLocations.userId, userId),
                eq(umkmLocations.izinStatus, 'Diterima')
            ));

        console.log('📊 Active certificates:', activeCertificatesResult.count);

        // 3. Hitung Pengajuan Berjalan (Status Izin = Diajukan)
        const [pendingSubmissionsResult] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(and(
                eq(umkmLocations.userId, userId),
                eq(umkmLocations.izinStatus, 'Diajukan')
            ));

        console.log('📊 Pending submissions:', pendingSubmissionsResult.count);

        const dashboardData = {
            totalLocations: totalLocationsResult.count,
            activeCertificates: activeCertificatesResult.count,
            pendingSubmissions: pendingSubmissionsResult.count,
        };

        console.log('✅ Dashboard data prepared:', dashboardData);

        return NextResponse.json({ 
            success: true, 
            data: dashboardData 
        }, { status: 200 });

    } catch (error) {
        console.error('❌ API GET Dashboard UMKM Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal mengambil metrik dashboard.' 
        }, { status: 500 });
    }
}