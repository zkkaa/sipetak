import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

type RouteContext = {
    params: Promise<{ id: string }>;
};

interface StatusUpdatePayload {
    newStatus: 'Sedang Diproses' | 'Selesai';
    adminId: number;
}

export async function PUT(req: NextRequest, context: RouteContext) {
    const params = await context.params;
    const reportId = parseInt(params.id);
    const { newStatus, adminId } = await req.json() as StatusUpdatePayload;

    if (isNaN(reportId) || !newStatus || !adminId) {
        return NextResponse.json({ 
            success: false, 
            message: 'ID Laporan, status baru, dan ID Admin wajib diisi.' 
        }, { status: 400 });
    }

    const updateData: { status: 'Sedang Diproses' | 'Selesai', adminHandlerId?: number } = {
        status: newStatus,
    };

    if (newStatus === 'Sedang Diproses') {
        updateData.adminHandlerId = adminId;
    }

    try {
        const [updatedReport] = await db.update(reports)
            .set(updateData)
            .where(eq(reports.id, reportId))
            .returning();

        if (!updatedReport) {
            return NextResponse.json({ 
                success: false, 
                message: 'Laporan tidak ditemukan.' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Status berhasil diubah menjadi ${newStatus}.`, 
            report: updatedReport 
        });
        
    } catch (error) {
        console.error(`API PUT Report ${reportId} Error:`, error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal memperbarui status laporan.' 
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
    const params = await context.params;
    const reportId = parseInt(params.id);

    if (isNaN(reportId)) {
        return NextResponse.json({ 
            success: false, 
            message: 'ID Laporan tidak valid.' 
        }, { status: 400 });
    }

    try {
        console.log(`🗑️ Attempting to delete report #${reportId}...`);

        const [reportToDelete] = await db
            .select()
            .from(reports)
            .where(eq(reports.id, reportId))
            .limit(1);

        if (!reportToDelete) {
            return NextResponse.json({ 
                success: false, 
                message: 'Laporan tidak ditemukan.' 
            }, { status: 404 });
        }

        if (reportToDelete.status !== 'Selesai') {
            return NextResponse.json({ 
                success: false, 
                message: 'Hanya laporan dengan status "Selesai" yang dapat dihapus.' 
            }, { status: 403 });
        }

        if (reportToDelete.buktiFotoUrl) {
            const filePath = join(process.cwd(), 'public', reportToDelete.buktiFotoUrl);
            
            if (existsSync(filePath)) {
                try {
                    await unlink(filePath);
                    console.log('✅ File deleted:', filePath);
                } catch (fileError) {
                    console.warn('⚠️ Failed to delete file:', fileError);
                }
            } else {
                console.warn('⚠️ File not found:', filePath);
            }
        }

        await db.delete(reports).where(eq(reports.id, reportId));
        console.log('✅ Report deleted from database');

        return NextResponse.json({ 
            success: true, 
            message: 'Laporan berhasil dihapus.' 
        }, { status: 200 });

    } catch (error) {
        console.error(`❌ API DELETE Report ${reportId} Error:`, error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal menghapus laporan.' 
        }, { status: 500 });
    }
}