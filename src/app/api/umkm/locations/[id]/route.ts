// File: src/app/api/master/locations/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { masterLocations, umkmLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
    params: {
        id: string;
    };
}

export async function DELETE(req: Request, { params }: Params) {
    const locationId = parseInt(params.id);

    // Validasi ID
    if (isNaN(locationId)) {
        return NextResponse.json(
            { success: false, message: 'ID Lokasi tidak valid.' },
            { status: 400 }
        );
    }

    try {
        console.log(`🗑️ Attempting to delete location ID: ${locationId}`);

        // 1. Check if location exists
        const [existingLocation] = await db
            .select()
            .from(masterLocations)
            .where(eq(masterLocations.id, locationId));

        if (!existingLocation) {
            console.warn(`⚠️ Location ID ${locationId} not found`);
            return NextResponse.json(
                { success: false, message: 'Titik lokasi tidak ditemukan.' },
                { status: 404 }
            );
        }

        console.log(`📍 Found location: ${existingLocation.id}, status: ${existingLocation.status}`);

        // 2. Check for foreign key references
        const [referencingUmkm] = await db
            .select()
            .from(umkmLocations)
            .where(eq(umkmLocations.masterLocationId, locationId));

        if (referencingUmkm) {
            console.warn(
                `⚠️ Cannot delete: Location is referenced by UMKM submission #${referencingUmkm.id}`
            );
            return NextResponse.json(
                {
                    success: false,
                    message: 'Tidak dapat menghapus lokasi karena sudah ada pengajuan UMKM yang terikat. Silakan batalkan pengajuan terlebih dahulu.',
                },
                { status: 409 } // 409 Conflict
            );
        }

        console.log(`✅ No foreign key references found, safe to delete`);

        // 3. Delete the location
        const result = await db
            .delete(masterLocations)
            .where(eq(masterLocations.id, locationId))
            .returning();

        console.log(`✅ Location ${locationId} deleted successfully`);

        return NextResponse.json(
            {
                success: true,
                message: 'Titik lokasi berhasil dihapus.',
                deletedLocation: result[0],
            },
            { status: 200 }
        );

    } catch (error) {
        console.error(`❌ API DELETE Location ${locationId} Error:`, error);

        if (error instanceof Error) {
            console.error(`Error name: ${error.name}`);
            console.error(`Error message: ${error.message}`);
            console.error(`Error stack: ${error.stack}`);
        }

        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check for specific database errors
        let userMessage = 'Gagal menghapus titik lokasi.';
        
        if (errorMessage.includes('FOREIGN KEY')) {
            userMessage = 'Lokasi tidak dapat dihapus karena masih direferensi oleh data lain.';
        } else if (errorMessage.includes('constraint')) {
            userMessage = 'Terjadi konflik constraint database.';
        }

        return NextResponse.json(
            {
                success: false,
                message: userMessage,
                error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
                code: 'DELETE_ERROR',
            },
            { status: 500 }
        );
    }
}