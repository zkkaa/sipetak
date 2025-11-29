// File: src/app/api/master/locations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { masterLocations } from '@/db/schema';
import * as jose from 'jose';

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

// Interface untuk data yang diharapkan dari frontend saat POST
interface NewLocationPayload {
    latitude: number;
    longitude: number;
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    penandaName?: string;
    reasonRestriction?: string;
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

// GET: Ambil Semua Titik Lokasi Master
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/master/locations');

    try {
        // ✅ Untuk GET, kita tidak perlu auth check karena UMKM juga perlu akses
        // Tapi jika ingin restrict hanya ke authenticated users, bisa tambahkan check token
        
        const locations = await db.select().from(masterLocations);

        console.log(`✅ Retrieved ${locations.length} master locations`);

        return NextResponse.json({ 
            success: true, 
            data: locations,
            count: locations.length
        }, { status: 200 });

    } catch (error) {
        console.error('❌ API GET Master Locations Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal mengambil data master lokasi.' 
        }, { status: 500 });
    }
}

// POST: Tambah Titik Lokasi Master Baru (hanya Admin)
export async function POST(request: NextRequest) {
    console.log('📝 POST /api/master/locations');

    try {
        // ✅ Verifikasi Admin untuk POST
        const admin = await isAdmin(request);
        if (!admin) {
            console.error('❌ User bukan Admin');
            return NextResponse.json(
                { success: false, message: 'Anda tidak memiliki akses' },
                { status: 403 }
            );
        }

        const body = await request.json() as NewLocationPayload;
        const { latitude, longitude, status, penandaName, reasonRestriction } = body;

        // Validasi dasar
        if (!latitude || !longitude || !status) {
            return NextResponse.json({ 
                success: false, 
                message: 'Koordinat dan status wajib diisi.' 
            }, { status: 400 });
        }
        
        // Logika tambahan: Pastikan status Tersedia/Terlarang saja
        if (status === 'Terisi') {
            return NextResponse.json({ 
                success: false, 
                message: 'Titik tidak dapat disetel langsung ke "Terisi".' 
            }, { status: 400 });
        }

        // Masukkan data baru ke database
        const [newLocation] = await db.insert(masterLocations).values({
            latitude,
            longitude,
            status,
            penandaName: penandaName || null,
            reasonRestriction: status === 'Terlarang' ? reasonRestriction : null,
        }).returning();

        console.log('✅ New location added:', newLocation.id);

        return NextResponse.json({ 
            success: true, 
            message: 'Titik lokasi berhasil ditambahkan.', 
            location: newLocation 
        }, { status: 201 });

    } catch (error) {
        console.error('❌ API POST Master Locations Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal menambahkan titik lokasi baru.' 
        }, { status: 500 });
    }
}