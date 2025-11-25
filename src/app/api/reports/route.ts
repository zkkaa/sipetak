// File: src/app/api/reports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { reports, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
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

// GET: Ambil Semua Laporan Warga (hanya untuk Admin)
export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/reports');

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

        console.log('✅ Admin verified, fetching reports...');

        // LEFT JOIN dengan users untuk mendapatkan nama Admin Handler
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
                adminHandlerName: users.nama,
            })
            .from(reports)
            .leftJoin(users, eq(reports.adminHandlerId, users.id))
            .orderBy(desc(reports.dateReported)); // Terbaru dulu

        console.log(`✅ Retrieved ${reportsData.length} reports`);

        return NextResponse.json({ 
            success: true, 
            data: reportsData,
            count: reportsData.length 
        }, { status: 200 });

    } catch (error) {
        console.error('❌ API GET Reports Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal mengambil data laporan warga.' 
        }, { status: 500 });
    }
}