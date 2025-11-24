// File: src/app/api/umkm/locations/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
    params: {
        id: string;
    };
}

interface LocationUpdatePayload {
    namaLapak?: string;
    businessType?: string;
}

// --- PUT: Update nama lapak atau jenis usaha ---
export async function PUT(req: Request, { params }: Params) {
    const locationId = parseInt(params.id);

    if (isNaN(locationId)) {
        return NextResponse.json(
            { success: false, message: 'ID Lokasi tidak valid.' }, 
            { status: 400 }
        );
    }

    try {
        const body = (await req.json()) as LocationUpdatePayload;
        const updateData: any = {};

        if (body.namaLapak) updateData.namaLapak = body.namaLapak;
        if (body.businessType) updateData.businessType = body.businessType;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Tidak ada data untuk diperbarui.' }, 
                { status: 400 }
            );
        }

        const [updatedLocation] = await db
            .update(umkmLocations)
            .set(updateData)
            .where(eq(umkmLocations.id, locationId))
            .returning();

        if (!updatedLocation) {
            return NextResponse.json(
                { success: false, message: 'Lokasi tidak ditemukan.' }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Lokasi berhasil diperbarui.', 
            location: updatedLocation 
        }, { status: 200 });

    } catch (error) {
        console.error(`API PUT Location ${locationId} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal memperbarui lokasi.' }, 
            { status: 500 }
        );
    }
}

// --- DELETE: Hapus lokasi UMKM ---
export async function DELETE(req: Request, { params }: Params) {
    const locationId = parseInt(params.id);

    if (isNaN(locationId)) {
        return NextResponse.json(
            { success: false, message: 'ID Lokasi tidak valid.' }, 
            { status: 400 }
        );
    }

    try {
        // 💡 STEP 1: Hapus submissions yang terikat pada lokasi ini
        await db.delete(submissions).where(eq(submissions.umkmLocationId, locationId));

        // 💡 STEP 2: Hapus lokasi UMKM
        const [deletedLocation] = await db
            .delete(umkmLocations)
            .where(eq(umkmLocations.id, locationId))
            .returning();

        if (!deletedLocation) {
            return NextResponse.json(
                { success: false, message: 'Lokasi tidak ditemukan.' }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Lokasi berhasil dihapus.' 
        }, { status: 200 });

    } catch (error) {
        console.error(`API DELETE Location ${locationId} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus lokasi.' }, 
            { status: 500 }
        );
    }
}