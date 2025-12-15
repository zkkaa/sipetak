import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { reports } from '@/db/schema';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    console.log('📤 POST /api/public/reports - Processing upload...');

    try {
        const formData = await request.formData();
        
        const reportType = formData.get('reportType') as string;
        const description = formData.get('description') as string;
        const latitude = formData.get('latitude') as string;
        const longitude = formData.get('longitude') as string;
        const photoFile = formData.get('photoFile') as File;

        // Validasi input
        if (!reportType || !description || !latitude || !longitude) {
            return NextResponse.json(
                { success: false, message: 'Semua field wajib diisi' },
                { status: 400 }
            );
        }

        if (!photoFile || photoFile.size === 0) {
            return NextResponse.json(
                { success: false, message: 'File foto wajib diunggah' },
                { status: 400 }
            );
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(photoFile.type)) {
            return NextResponse.json(
                { success: false, message: 'Format file harus JPG, PNG, atau WebP' },
                { status: 400 }
            );
        }

        const maxSize = 5 * 1024 * 1024;
        if (photoFile.size > maxSize) {
            return NextResponse.json(
                { success: false, message: 'Ukuran file maksimal 5MB' },
                { status: 400 }
            );
        }

        console.log('✅ Validation passed');

        const timestamp = Date.now();
        const fileExtension = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `report_${timestamp}.${fileExtension}`;

        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reports');
        const filePath = join(uploadsDir, fileName);

        if (!existsSync(uploadsDir)) {
            console.log('📁 Creating uploads directory...');
            await mkdir(uploadsDir, { recursive: true });
        }

        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        await writeFile(filePath, buffer);
        console.log('✅ File saved:', filePath);

        const fileUrl = `/uploads/reports/${fileName}`;

        const [newReport] = await db.insert(reports).values({
            reportType,
            description,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            buktiFotoUrl: fileUrl, 
            status: 'Belum Diperiksa',
        }).returning();

        console.log('✅ Report saved to DB:', newReport.id);

        return NextResponse.json({
            success: true,
            message: 'Laporan berhasil dikirim',
            report: newReport,
        }, { status: 201 });

    } catch (error) {
        console.error('❌ POST Reports Error:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Gagal menyimpan laporan',
        }, { status: 500 });
    }
}