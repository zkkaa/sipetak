// File: src/app/api/public/report/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { reports } from '@/db/schema';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Interface untuk payload data laporan
interface ReportPayload {
    reportType: string;
    description: string;
    latitude: string;
    longitude: string;
}

// --- POST: Kirim Laporan Warga ---
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        // 1. Ekstrak Data Teks
        const reportType = formData.get('reportType')?.toString() || '';
        const description = formData.get('description')?.toString() || '';
        const latitudeStr = formData.get('latitude')?.toString();
        const longitudeStr = formData.get('longitude')?.toString();
        
        // 2. Ekstrak File Bukti
        const buktiFile = formData.get('photoFile') as File | null;
        
        // 3. Validasi Dasar
        if (!reportType || !buktiFile || !latitudeStr || !longitudeStr) {
            return NextResponse.json({ success: false, message: 'Data wajib (jenis laporan, foto bukti, lokasi) harus diisi.' }, { status: 400 });
        }
        
        const latitude = parseFloat(latitudeStr);
        const longitude = parseFloat(longitudeStr);
        
        if (isNaN(latitude) || isNaN(longitude)) {
            return NextResponse.json({ success: false, message: 'Koordinat lokasi tidak valid.' }, { status: 400 });
        }
        
        // 4. Penyimpanan File (Simulasi Lokal - Ingat masalah Serverless)
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'reports');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const fileBytes = await buktiFile.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);
        const fileName = `report_${Date.now()}_${buktiFile.name}`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, fileBuffer);
        const buktiUrl = `/uploads/reports/${fileName}`;

        // 5. Simpan ke Database (Status awal: Belum Diperiksa)
        const [newReport] = await db.insert(reports).values({
            reportType,
            description,
            latitude,
            longitude,
            buktiFotoUrl: buktiUrl,
            status: 'Belum Diperiksa', // Default status untuk laporan baru
            // adminHandlerId akan null
        }).returning();

        return NextResponse.json({ 
            success: true, 
            message: 'Laporan Anda berhasil dikirim dan akan segera diproses.', 
            report: newReport 
        }, { status: 201 });

    } catch (error) {
        console.error('API POST Citizen Report Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal memproses laporan.' }, { status: 500 });
    }
}