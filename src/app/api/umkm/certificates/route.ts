import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, users, masterLocations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import * as jose from 'jose';

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

async function getUserIdFromCookie(request: NextRequest): Promise<number | null> {
    try {
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

function calculateCertificateStatus(expiryDate: Date): 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan' {
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return 'Kedaluwarsa';
    } else if (daysUntilExpiry <= 30) {
        return 'Aktif';
    }
    
    return 'Aktif';
}

function generateCertificateNumber(locationId: number, approvalDate: Date): string {
    const year = approvalDate.getFullYear();
    const month = String(approvalDate.getMonth() + 1).padStart(2, '0');
    return `SIPETAK-${String(locationId).padStart(3, '0')}/${month}/${year}`;
}

export async function GET(request: NextRequest) {
    console.log('🔍 GET /api/umkm/certificates dipanggil');

    try {
        const userId = await getUserIdFromCookie(request);

        if (!userId) {
            console.error('❌ User tidak terautentikasi');
            return NextResponse.json(
                { success: false, message: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        console.log('✅ User ID:', userId);

        const [userData] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!userData) {
            return NextResponse.json(
                { success: false, message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        const approvedLocations = await db
            .select({
                id: umkmLocations.id,
                namaLapak: umkmLocations.namaLapak,
                businessType: umkmLocations.businessType,
                dateApplied: umkmLocations.dateApplied, 
                dateExpired: umkmLocations.dateExpired, 
                masterLocationId: umkmLocations.masterLocationId,
            })
            .from(umkmLocations)
            .where(
                and(
                    eq(umkmLocations.userId, userId),
                    eq(umkmLocations.izinStatus, 'Diterima') 
                )
            );

        console.log(`✅ Ditemukan ${approvedLocations.length} lokasi yang diterima`);

        if (approvedLocations.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Tidak ada sertifikat',
                    count: 0,
                    certificates: []
                },
                { status: 200 }
            );
        }

        const certificates = await Promise.all(
            approvedLocations.map(async (location) => {
                const [masterLoc] = await db
                    .select()
                    .from(masterLocations)
                    .where(eq(masterLocations.id, location.masterLocationId));
                const tanggalTerbit = location.dateApplied 
                    ? new Date(location.dateApplied) 
                    : new Date();
                const tanggalKedaluwarsa = location.dateExpired
                    ? new Date(location.dateExpired)
                    : (() => {
                        const expiry = new Date(tanggalTerbit);
                        expiry.setFullYear(expiry.getFullYear() + 1);
                        return expiry;
                    })();

                const nomorSertifikat = generateCertificateNumber(location.id, tanggalTerbit);
                const status = calculateCertificateStatus(tanggalKedaluwarsa);

                return {
                    id: location.id,
                    nomorSertifikat,
                    namaUsaha: location.namaLapak,
                    tanggalTerbit: tanggalTerbit.toISOString().split('T')[0],
                    tanggalKedaluwarsa: tanggalKedaluwarsa.toISOString().split('T')[0],
                    status,
                    unduhLink: `/api/umkm/certificates/${location.id}/download`,
                    namaPemilik: userData.nama,
                    lokasiLapak: masterLoc?.penandaName || `Lokasi ${location.masterLocationId}`,
                    namaPengelola: 'Administrator SIPETAK', 
                    namaPemerintah: 'Pemerintah Kota', 
                };
            })
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Data berhasil diambil',
                count: certificates.length,
                certificates
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('❌ GET Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal mengambil data sertifikat' },
            { status: 500 }
        );
    }
}