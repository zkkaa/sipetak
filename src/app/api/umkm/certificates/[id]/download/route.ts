// ============================================
// File 4: src/app/api/umkm/certificates/[id]/download/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { umkmLocations, users, masterLocations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import * as jose from 'jose';

type RouteContext = {
    params: Promise<{ id: string }>;
};

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

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetakkosong1');
        const { payload } = await jose.jwtVerify(token, secret);
        
        const jwtPayload = payload as unknown as JwtPayload;
        return jwtPayload.userId;
    } catch (error) {
        console.error('❌ Error extracting userId from cookie:', error);
        return null;
    }
}

function generateCertificateHTML(data: {
    nomorSertifikat: string;
    namaPemilik: string;
    namaUsaha: string;
    lokasiLapak: string;
    tanggalTerbit: string;
    tanggalKedaluwarsa: string;
}): string {
    return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat ${data.nomorSertifikat}</title>
    <style>
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Times New Roman', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
        }
        .certificate {
            background: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 60px;
            border: 15px solid #4a5568;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            position: relative;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #d4af37;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: #4a5568;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 36px;
            font-weight: bold;
        }
        h1 {
            color: #2d3748;
            font-size: 36px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .subtitle {
            color: #4a5568;
            font-size: 18px;
            font-style: italic;
        }
        .content {
            text-align: center;
            margin: 40px 0;
            position: relative;
            z-index: 1;
        }
        .cert-number {
            color: #d4af37;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 30px;
            letter-spacing: 1px;
        }
        .intro-text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .recipient {
            font-size: 32px;
            font-weight: bold;
            color: #2d3748;
            margin: 20px 0;
            text-transform: uppercase;
            border-bottom: 3px solid #d4af37;
            display: inline-block;
            padding-bottom: 10px;
        }
        .business-name {
            font-size: 24px;
            color: #4a5568;
            margin: 20px 0;
            font-style: italic;
        }
        .details {
            margin: 40px 0;
            text-align: left;
            font-size: 14px;
            color: #4a5568;
        }
        .detail-item {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background: #f7fafc;
            border-left: 3px solid #d4af37;
        }
        .detail-label {
            font-weight: bold;
            color: #2d3748;
        }
        .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            position: relative;
            z-index: 1;
        }
        .signature-block {
            text-align: center;
            width: 200px;
        }
        .signature-line {
            border-top: 2px solid #2d3748;
            margin-top: 60px;
            padding-top: 10px;
            font-weight: bold;
            color: #2d3748;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(212, 175, 55, 0.05);
            font-weight: bold;
            pointer-events: none;
            z-index: 0;
        }
        @media print {
            body { background: white; padding: 0; }
            .certificate { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="watermark">SIPETAK</div>
        
        <div class="header">
            <div class="logo">SP</div>
            <h1>Sertifikat Izin Usaha</h1>
            <div class="subtitle">Sistem Pemanfaatan Petak Usaha</div>
        </div>

        <div class="content">
            <div class="cert-number">No. ${data.nomorSertifikat}</div>
            
            <p class="intro-text">
                Dengan ini menyatakan bahwa:
            </p>

            <div class="recipient">${data.namaPemilik}</div>
            
            <p class="intro-text">
                Telah terdaftar sebagai pemilik usaha sah dengan nama:
            </p>
            
            <div class="business-name">${data.namaUsaha}</div>

            <div class="details">
                <div class="detail-item">
                    <span class="detail-label">Lokasi Usaha:</span>
                    <span>${data.lokasiLapak}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tanggal Terbit:</span>
                    <span>${new Date(data.tanggalTerbit).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Berlaku Hingga:</span>
                    <span>${new Date(data.tanggalKedaluwarsa).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                    })}</span>
                </div>
            </div>

            <p class="intro-text" style="margin-top: 40px;">
                Sertifikat ini berlaku sebagai bukti legalitas usaha yang dikeluarkan oleh 
                Sistem Informasi Pemanfaatan Petak (SIPETAK) dan wajib diperpanjang sebelum masa berlaku habis.
            </p>
        </div>

        <div class="footer">
            <div class="signature-block">
                <div class="signature-line">
                    Administrator SIPETAK
                </div>
            </div>
            <div class="signature-block">
                <div class="signature-line">
                    Pemilik Usaha
                </div>
            </div>
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>`;
}

export async function GET(req: NextRequest, context: RouteContext) {
    // ✅ Await params
    const params = await context.params;
    const locationId = parseInt(params.id);
    
    if (isNaN(locationId)) {
        return NextResponse.json({ 
            success: false, 
            message: 'ID tidak valid.' 
        }, { status: 400 });
    }

    try {
        const userId = await getUserIdFromCookie(req);
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: 'User tidak terautentikasi.' 
            }, { status: 401 });
        }

        const [location] = await db
            .select()
            .from(umkmLocations)
            .where(
                and(
                    eq(umkmLocations.id, locationId),
                    eq(umkmLocations.userId, userId),
                    eq(umkmLocations.izinStatus, 'Diterima')
                )
            );

        if (!location) {
            return NextResponse.json({ 
                success: false, 
                message: 'Sertifikat tidak ditemukan atau belum disetujui.' 
            }, { status: 404 });
        }

        const [userData] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

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

        const nomorSertifikat = `SIPETAK-${String(locationId).padStart(3, '0')}/${String(tanggalTerbit.getMonth() + 1).padStart(2, '0')}/${tanggalTerbit.getFullYear()}`;

        const certificateData = {
            nomorSertifikat,
            namaPemilik: userData.nama,
            namaUsaha: location.namaLapak,
            lokasiLapak: masterLoc?.penandaName || `Lokasi ${location.masterLocationId}`,
            tanggalTerbit: tanggalTerbit.toISOString().split('T')[0],
            tanggalKedaluwarsa: tanggalKedaluwarsa.toISOString().split('T')[0],
        };

        const html = generateCertificateHTML(certificateData);

        return new NextResponse(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="Sertifikat_${nomorSertifikat.replace(/\//g, '-')}.html"`,
            },
        });

    } catch (error) {
        console.error(`❌ API GET Certificate Download ${locationId} Error:`, error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal mengunduh sertifikat.' 
        }, { status: 500 });
    }
}