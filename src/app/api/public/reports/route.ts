
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { reports } from '@/db/schema';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const reportType = formData.get('reportType')?.toString() || '';
        const description = formData.get('description')?.toString() || '';
        const latitudeStr = formData.get('latitude')?.toString();
        const longitudeStr = formData.get('longitude')?.toString();
        const buktiFile = formData.get('photoFile') as File | null;

        if (!reportType || !buktiFile || !latitudeStr || !longitudeStr) {
            return NextResponse.json({ 
                success: false, 
                message: 'Data wajib (jenis laporan, foto bukti, lokasi) harus diisi.' 
            }, { status: 400 });
        }
        
        const latitude = parseFloat(latitudeStr);
        const longitude = parseFloat(longitudeStr);
        
        if (isNaN(latitude) || isNaN(longitude)) {
            return NextResponse.json({ 
                success: false, 
                message: 'Koordinat lokasi tidak valid.' 
            }, { status: 400 });
        }
        
        const timestamp = Date.now();
        const buktiUrl = `https://dummy-cloud-storage.com/reports/${timestamp}_${buktiFile.name}`;
        console.log('💡 Bukti URL Dummy:', buktiUrl);

        const [newReport] = await db.insert(reports).values({
            reportType,
            description,
            latitude,
            longitude,
            buktiFotoUrl: buktiUrl,
            status: 'Belum Diperiksa',
        }).returning();

        console.log('✅ Laporan tersimpan dengan ID:', newReport.id);

        return NextResponse.json({ 
            success: true, 
            message: 'Laporan Anda berhasil dikirim dan akan segera diproses.', 
            report: newReport 
        }, { status: 201 });

    } catch (error) {
        console.error('❌ API POST Citizen Report Error:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal memproses laporan.' 
        }, { status: 500 });
    }
}