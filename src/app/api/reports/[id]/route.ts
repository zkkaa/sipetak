// File: src/app/api/reports/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
    params: {
        id: string;
    };
}

interface StatusUpdatePayload {
    newStatus: 'Sedang Diproses' | 'Selesai';
    adminId: number; // ID Admin yang sedang login
}

// --- PUT: Update Status Laporan Warga ---
export async function PUT(req: Request, { params }: Params) {
    const reportId = parseInt(params.id);
    const { newStatus, adminId } = await req.json() as StatusUpdatePayload;

    if (isNaN(reportId) || !newStatus || !adminId) {
        return NextResponse.json({ success: false, message: 'ID Laporan, status baru, dan ID Admin wajib diisi.' }, { status: 400 });
    }

    // Tentukan kolom mana yang perlu diupdate (adminHandlerId hanya diisi saat Sedang Diproses)
    const updateData: { status: 'Sedang Diproses' | 'Selesai', adminHandlerId?: number } = {
        status: newStatus,
    };

    if (newStatus === 'Sedang Diproses') {
        // Jika sedang diproses, catat Admin ID yang menangani
        updateData.adminHandlerId = adminId;
    }

    try {
        // Update Status Laporan
        const [updatedReport] = await db.update(reports)
            .set(updateData)
            .where(eq(reports.id, reportId))
            .returning();

        if (!updatedReport) {
            return NextResponse.json({ success: false, message: 'Laporan tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `Status berhasil diubah menjadi ${newStatus}.`, report: updatedReport });
        
    } catch (error) {
        console.error(`API PUT Report ${reportId} Error:`, error);
        return NextResponse.json({ success: false, message: 'Gagal memperbarui status laporan.' }, { status: 500 });
    }
}