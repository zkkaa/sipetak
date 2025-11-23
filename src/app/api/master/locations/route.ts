// File: src/app/api/master/locations/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { masterLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Interface untuk data yang diharapkan dari frontend saat POST
interface NewLocationPayload {
    latitude: number;
    longitude: number;
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    penandaName?: string;
    reasonRestriction?: string;
}

// --- 1. GET: Ambil Semua Titik Lokasi Master ---
export async function GET() {
    try {
        // Ambil semua data master locations
        const locations = await db.select().from(masterLocations);

        return NextResponse.json({ success: true, data: locations });
    } catch (error) {
        console.error('API GET Master Locations Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil data master lokasi.' }, { status: 500 });
    }
}

// --- 2. POST: Tambah Titik Lokasi Master Baru ---
export async function POST(req: Request) {
    try {
        const { latitude, longitude, status, penandaName, reasonRestriction } = await req.json() as NewLocationPayload;

        // Validasi dasar
        if (!latitude || !longitude || !status) {
            return NextResponse.json({ success: false, message: 'Koordinat dan status wajib diisi.' }, { status: 400 });
        }
        
        // Logika tambahan: Pastikan status Tersedia/Terlarang saja
        if (status === 'Terisi') {
             return NextResponse.json({ success: false, message: 'Titik tidak dapat disetel langsung ke "Terisi".' }, { status: 400 });
        }

        // Masukkan data baru ke database
        const [newLocation] = await db.insert(masterLocations).values({
            latitude,
            longitude,
            status,
            penandaName: penandaName || null,
            reasonRestriction: status === 'Terlarang' ? reasonRestriction : null,
        }).returning();

        return NextResponse.json({ success: true, message: 'Titik lokasi berhasil ditambahkan.', location: newLocation }, { status: 201 });
    } catch (error) {
        console.error('API POST Master Locations Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal menambahkan titik lokasi baru.' }, { status: 500 });
    }
}

// Catatan: Logika DELETE akan dibuat di file route dinamis ([id]/route.ts)