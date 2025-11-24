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
        console.log(`🗑️ Attempting to delete location ID: ${locationId}`);

        // Hapus entri dari database
        const result = await db.delete(masterLocations).where(eq(masterLocations.id, locationId)).returning();

        console.log(`📊 Delete result:`, result);

        if (result.length === 0) {
            console.warn(`⚠️ Location ID ${locationId} not found`);
            return NextResponse.json({ success: false, message: 'Titik lokasi tidak ditemukan.' }, { status: 404 });
        }

        console.log(`✅ Location ${locationId} deleted successfully`);
        return NextResponse.json({ success: true, message: 'Titik lokasi berhasil dihapus.' }, { status: 200 });

    } catch (error) {
        // Log the ACTUAL error details
        console.error(`❌ API DELETE Location ${locationId} Error:`, error);
        
        // Get more details about the error
        if (error instanceof Error) {
            console.error(`Error name: ${error.name}`);
            console.error(`Error message: ${error.message}`);
            console.error(`Error stack: ${error.stack}`);
        }

        // Return the actual error message instead of generic one
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ 
            success: false, 
            message: `Gagal menghapus titik lokasi: ${errorMessage}`,
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}