import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';

type RouteContext = {
    params: Promise<{ id: string }>;
};

type IzinStatus = "Diajukan" | "Diterima" | "Ditolak";

export async function DELETE(_req: Request, context: RouteContext) {
    const params = await context.params;
    const locationId = parseInt(params.id);

    if (isNaN(locationId)) {
        return NextResponse.json(
            { success: false, message: 'ID Lokasi tidak valid.' },
            { status: 400 }
        );
    }

    try {
        const [deletedLocation] = await db
            .delete(umkmLocations)
            .where(eq(umkmLocations.id, locationId))
            .returning();

        if (!deletedLocation) {
            return NextResponse.json(
                { success: false, message: 'Lokasi UMKM tidak ditemukan.' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                message: 'Lokasi UMKM berhasil dihapus.',
                location: deletedLocation 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ API DELETE UMKM Location Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus lokasi UMKM.' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, context: RouteContext) {
    const params = await context.params;
    const locationId = parseInt(params.id);

    if (isNaN(locationId)) {
        return NextResponse.json(
            { success: false, message: 'ID Lokasi tidak valid.' },
            { status: 400 }
        );
    }

    try {
        const body = await req.json();

        const updateData: Partial<{
            namaLapak: string;
            businessType: string;
            izinStatus: IzinStatus;
            dateApplied: Date;
            dateExpired: Date;
        }> = {};

        if (body.namaLapak) updateData.namaLapak = body.namaLapak;
        if (body.businessType) updateData.businessType = body.businessType;
        if (body.izinStatus) {
            const validStatuses: IzinStatus[] = ["Diajukan", "Diterima", "Ditolak"];
            if (validStatuses.includes(body.izinStatus)) {
                updateData.izinStatus = body.izinStatus as IzinStatus;
            } else {
                return NextResponse.json(
                    { success: false, message: 'Status izin tidak valid. Harus: Diajukan, Diterima, atau Ditolak.' },
                    { status: 400 }
                );
            }
        }
        
        if (body.dateApplied) updateData.dateApplied = new Date(body.dateApplied);
        if (body.dateExpired) updateData.dateExpired = new Date(body.dateExpired);

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
                { success: false, message: 'Lokasi UMKM tidak ditemukan.' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                message: 'Lokasi UMKM berhasil diperbarui.',
                location: updatedLocation 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('❌ API PUT UMKM Location Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal memperbarui lokasi UMKM.' },
            { status: 500 }
        );
    }
}