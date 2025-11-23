// File: src/app/api/umkm/submissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations, submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    console.log('🚀 POST /api/umkm/submissions dipanggil'); // Debug log

    try {
        // 1. Parse FormData
        const formData = await request.formData();
        
        console.log('📝 FormData entries:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }
        
        const lapakName = formData.get('lapakName') as string;
        const businessType = formData.get('businessType') as string;
        const description = formData.get('description') as string;
        const masterLocationIdStr = formData.get('masterLocationId') as string;
        const ktpFile = formData.get('ktpFile') as File | null;
        const suratLainnyaFile = formData.get('suratLainnyaFile') as File | null;

        console.log('🔍 Parsed data:', { lapakName, businessType, description, masterLocationIdStr });

        // 2. Validasi input
        if (!lapakName || !businessType || !description || !masterLocationIdStr) {
            console.error('❌ Validasi gagal: data tidak lengkap');
            return NextResponse.json(
                { success: false, message: 'Data tidak lengkap' },
                { status: 400 }
            );
        }

        if (!ktpFile) {
            console.error('❌ Validasi gagal: KTP tidak ada');
            return NextResponse.json(
                { success: false, message: 'File KTP wajib diunggah' },
                { status: 400 }
            );
        }

        const masterLocationId = parseInt(masterLocationIdStr);
        if (isNaN(masterLocationId)) {
            console.error('❌ Validasi gagal: ID lokasi tidak valid');
            return NextResponse.json(
                { success: false, message: 'ID lokasi tidak valid' },
                { status: 400 }
            );
        }

        // 3. Cek apakah lokasi master tersedia
        console.log('🔍 Mengecek lokasi master ID:', masterLocationId);
        const [masterLocation] = await db
            .select()
            .from(masterLocations)
            .where(eq(masterLocations.id, masterLocationId));

        if (!masterLocation) {
            console.error('❌ Lokasi tidak ditemukan');
            return NextResponse.json(
                { success: false, message: 'Lokasi tidak ditemukan' },
                { status: 404 }
            );
        }

        if (masterLocation.status !== 'Tersedia') {
            console.error('❌ Lokasi tidak tersedia:', masterLocation.status);
            return NextResponse.json(
                { success: false, message: 'Lokasi sudah terisi atau tidak tersedia' },
                { status: 400 }
            );
        }

        // 4. TODO: Ambil userId dari JWT token
        const userId = 1; // Hardcode untuk testing
        console.log('👤 User ID:', userId);

        // 5. Buat folder upload jika belum ada
        const uploadKtpDir = join(process.cwd(), 'public', 'uploads', 'ktp');
        const uploadSuratDir = join(process.cwd(), 'public', 'uploads', 'surat');
        
        if (!existsSync(uploadKtpDir)) {
            await mkdir(uploadKtpDir, { recursive: true });
            console.log('📁 Folder KTP dibuat');
        }
        if (!existsSync(uploadSuratDir)) {
            await mkdir(uploadSuratDir, { recursive: true });
            console.log('📁 Folder Surat dibuat');
        }

        // 6. Simpan file KTP
        console.log('💾 Menyimpan file KTP...');
        const ktpBytes = await ktpFile.arrayBuffer();
        const ktpBuffer = Buffer.from(ktpBytes);
        const ktpFileName = `ktp_${Date.now()}_${ktpFile.name}`;
        const ktpPath = join(uploadKtpDir, ktpFileName);
        await writeFile(ktpPath, ktpBuffer);
        const ktpUrl = `/uploads/ktp/${ktpFileName}`;
        console.log('✅ KTP tersimpan:', ktpUrl);

        // 7. Simpan file surat (opsional)
        let suratUrl: string | null = null;
        if (suratLainnyaFile) {
            console.log('💾 Menyimpan file surat...');
            const suratBytes = await suratLainnyaFile.arrayBuffer();
            const suratBuffer = Buffer.from(suratBytes);
            const suratFileName = `surat_${Date.now()}_${suratLainnyaFile.name}`;
            const suratPath = join(uploadSuratDir, suratFileName);
            await writeFile(suratPath, suratBuffer);
            suratUrl = `/uploads/surat/${suratFileName}`;
            console.log('✅ Surat tersimpan:', suratUrl);
        }

        // 8. Insert ke database
        console.log('💾 Menyimpan ke database...');
        const [newLocation] = await db
            .insert(umkmLocations)
            .values({
                userId: userId,
                masterLocationId: masterLocationId,
                namaLapak: lapakName,
                businessType: businessType,
                izinStatus: 'Diajukan',
            })
            .returning();

        console.log('✅ Location tersimpan:', newLocation.id);

        await db
            .insert(submissions)
            .values({
                umkmLocationId: newLocation.id,
                ktpFileUrl: ktpUrl,
                suratLainnyaUrl: suratUrl,
                description: description,
            });

        console.log('✅ Submission tersimpan');

        // 9. Update status master location
        await db
            .update(masterLocations)
            .set({ status: 'Terisi' })
            .where(eq(masterLocations.id, masterLocationId));

        console.log('✅ Status master location diupdate');

        return NextResponse.json(
            { 
                success: true, 
                message: 'Pengajuan berhasil dikirim!',
                location: newLocation 
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('❌ API POST Submission Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal memproses pengajuan: ' + (error as Error).message },
            { status: 500 }
        );
    }
}

// GET: Test endpoint
export async function GET() {
    console.log('✅ GET /api/umkm/submissions dipanggil');
    
    try {
        const allSubmissions = await db
            .select()
            .from(umkmLocations);

        return NextResponse.json(
            { success: true, message: 'API berjalan!', count: allSubmissions.length },
            { status: 200 }
        );

    } catch (error) {
        console.error('❌ GET Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data' },
            { status: 500 }
        );
    }
}