// File: src/app/api/admin/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { masterLocations, umkmLocations, reports } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import * as jose from 'jose';

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

// GET: Ambil semua metrics dashboard admin
export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/admin/dashboard');

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

        console.log('✅ Admin verified, fetching dashboard data...');

        // 1. Hitung Titik Lokasi Tersedia
        const [availableLocations] = await db
            .select({ count: count() })
            .from(masterLocations)
            .where(eq(masterLocations.status, 'Tersedia'));

        console.log('📊 Available locations:', availableLocations.count);

        // 2. Hitung Sertifikat Aktif (Lokasi yang Diterima)
        const [activeCertificates] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(eq(umkmLocations.izinStatus, 'Diterima'));

        console.log('📊 Active certificates:', activeCertificates.count);

        // 3. Hitung Pengajuan Baru (Status Diajukan)
        const [newSubmissions] = await db
            .select({ count: count() })
            .from(umkmLocations)
            .where(eq(umkmLocations.izinStatus, 'Diajukan'));

        console.log('📊 New submissions:', newSubmissions.count);

        const dashboardData = {
            availableLocations: availableLocations.count,
            activeCertificates: activeCertificates.count,
            newSubmissions: newSubmissions.count,
        };

        console.log('✅ Dashboard data prepared:', dashboardData);

        return NextResponse.json({ 
            success: true, 
            data: dashboardData 
        }, { status: 200 });

    } catch (error) {
        console.error('❌ API GET Admin Dashboard Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal mengambil data dashboard.' 
        }, { status: 500 });
    }
}   