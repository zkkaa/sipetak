// File: src/app/api/master/locations/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { masterLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Interface untuk parameter dinamis
interface Params {
    params: {
        id: string;
    };
}

// --- DELETE: Hapus Titik Master berdasarkan ID ---
export async function DELETE(req: Request, { params }: Params) {
    const locationId = parseInt(params.id);

    // Validasi ID
    if (isNaN(locationId)) {
        return NextResponse.json({ success: false, message: 'ID Lokasi tidak valid.' }, { status: 400 });
    }

    try {
        // Hapus entri dari database
        const result = await db.delete(masterLocations).where(eq(masterLocations.id, locationId)).returning();

        if (result.length === 0) {
            return NextResponse.json({ success: false, message: 'Titik lokasi tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Titik lokasi berhasil dihapus.' }, { status: 200 });

    } catch (error) {
        console.error(`API DELETE Location ${locationId} Error:`, error);
        return NextResponse.json({ success: false, message: 'Gagal menghapus titik lokasi.' }, { status: 500 });
    }
}