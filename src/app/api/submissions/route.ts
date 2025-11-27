// File: src/app/api/submissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, users } from '@/db/schema';
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

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024');
        const { payload } = await jose.jwtVerify(token, secret);
        const jwtPayload = payload as unknown as JwtPayload;
        
        return jwtPayload.role === 'Admin';
    } catch (error) {
        console.error('❌ Error checking admin:', error);
        return false;
    }
}

// GET: Ambil semua pengajuan (hanya untuk Admin)
export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/submissions');

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

        console.log('✅ Admin verified, fetching submissions...');

        // SELECT fields yang sesuai dengan schema + JOIN dengan users
        const submissions = await db
            .select({
                id: umkmLocations.id,
                namaLapak: umkmLocations.namaLapak,
                businessType: umkmLocations.businessType,
                izinStatus: umkmLocations.izinStatus,
                dateApplied: umkmLocations.dateApplied,
                masterLocationId: umkmLocations.masterLocationId,
                userId: umkmLocations.userId,
                namaPemilik: users.nama,
                emailPemohon: users.email,
            })
            .from(umkmLocations)
            .innerJoin(users, eq(umkmLocations.userId, users.id))
            .orderBy(desc(umkmLocations.dateApplied)); // ✅ Terbaru dulu

        console.log(`✅ Retrieved ${submissions.length} submissions`);

        return NextResponse.json({
            success: true,
            data: submissions,
            count: submissions.length
        }, { status: 200 });

    } catch (error) {
        console.error('❌ GET /api/submissions Error:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data pengajuan' },
            { status: 500 }
        );
    }
}