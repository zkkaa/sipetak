// File: src/app/api/umkm/submissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, masterLocations, submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

async function getUserIdFromCookie(request: NextRequest): Promise<number | null> {
    try {
        // ✅ Ambil token dari cookie, bukan dari Authorization header
        const token = request.cookies.get('sipetak_token')?.value;
        
        if (!token) {
            console.warn('⚠️ No token in cookie');
            return null;
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024');
        const { payload } = await jose.jwtVerify(token, secret);
        
        const jwtPayload = payload as unknown as JwtPayload;
        console.log('✅ User ID extracted from cookie:', jwtPayload.userId);
        return jwtPayload.userId;
    } catch (error) {
        console.error('❌ Error extracting userId from cookie:', error);
        return null;
    }
}

// ============================================
// GET: Fetch submissions untuk user yang login
// ============================================
export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/umkm/submissions dipanggil');

    try {
        // ✅ Extract userId dari cookie menggunakan helper function
        const userId = await getUserIdFromCookie(request);

        if (!userId) {
            console.error('❌ User tidak terautentikasi');
            return NextResponse.json(
                { success: false, message: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        console.log('✅ User ID:', userId);

        // Ambil submissions untuk user ini
        const userSubmissions = await db
            .select()
            .from(umkmLocations)
            .where(eq(umkmLocations.userId, userId));

        console.log(`✅ Ditemukan ${userSubmissions.length} submissions`);

        return NextResponse.json(
            {
                success: true,
                message: 'Data berhasil diambil',
                count: userSubmissions.length,
                submissions: userSubmissions
            },
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

// ============================================
// POST: Create new submission
// ============================================
export async function POST(request: NextRequest) {
    console.log('🚀 POST /api/umkm/submissions dipanggil');

    try {
        // 1. ✅ PERBAIKAN: Gunakan cookie helper yang konsisten
        const userId = await getUserIdFromCookie(request);
        
        if (!userId) {
            console.error('❌ Tidak ada user yang terautentikasi');
            return NextResponse.json(
                { success: false, message: 'User tidak terautentikasi' },
                { status: 401 }
            );
        }
        
        console.log('👤 User ID dari cookie:', userId);

        // 2. Parse FormData
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

        console.log('🔍 Parsed data:', { 
            lapakName, 
            businessType, 
            description, 
            masterLocationIdStr,
            userId 
        });

        // 3. Validasi input
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

        // 4. Cek apakah lokasi master tersedia
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

        // 5. ✅ PERBAIKAN: Gunakan URL Dummy (Tidak simpan file ke filesystem)
        // TODO: Nanti ganti dengan Supabase Storage upload
        const timestamp = Date.now();
        const ktpUrl = `https://dummy-cloud-storage.com/ktp/${userId}/${timestamp}_${ktpFile.name}`;
        console.log('💡 KTP URL Dummy:', ktpUrl);

        // 6. ✅ Surat Lainnya juga menggunakan URL Dummy
        let suratUrl: string | null = null;
        if (suratLainnyaFile) {
            suratUrl = `https://dummy-cloud-storage.com/surat/${userId}/${timestamp}_${suratLainnyaFile.name}`;
            console.log('💡 Surat URL Dummy:', suratUrl);
        }

        // 7. ✅ Insert ke database dengan userId dari cookie
        console.log('💾 Menyimpan ke database dengan userId:', userId);
        const [newLocation] = await db
            .insert(umkmLocations)
            .values({
                userId: userId, // ✅ Gunakan userId dari cookie
                masterLocationId: masterLocationId,
                namaLapak: lapakName,
                businessType: businessType,
                izinStatus: 'Diajukan',
            })
            .returning();

        console.log('✅ Location tersimpan dengan ID:', newLocation.id);

        await db
            .insert(submissions)
            .values({
                umkmLocationId: newLocation.id,
                ktpFileUrl: ktpUrl,
                suratLainnyaUrl: suratUrl,
                description: description,
            });

        console.log('✅ Submission tersimpan');

        // 8. Update status master location
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
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json(
            { 
                success: false, 
                message: 'Gagal memproses pengajuan: ' + (error instanceof Error ? error.message : String(error))
            },
            { status: 500 }
        );
    }
}