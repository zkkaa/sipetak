import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024';

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
    phone: string | null;

}

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 GET /api/auth/me - Membaca token dari cookie');
        const token = request.cookies.get('sipetak_token')?.value;

        if (!token) {
            console.log('⚠️ Token tidak ditemukan');
            return NextResponse.json(
                { success: false, message: 'Token tidak ditemukan' },
                { status: 401 }
            );
        }

        const secret = new TextEncoder().encode(JWT_SECRET);
        const verified = await jose.jwtVerify(token, secret);
        const payload = verified.payload as unknown as JwtPayload;

        console.log('✅ Token valid, user:', payload.email);

        return NextResponse.json({
            success: true,
            user: {
                id: payload.userId,
                email: payload.email,
                nama: payload.nama,
                role: payload.role,
                phone: payload.phone,
            }
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Error reading user:', error);
        return NextResponse.json(
            { success: false, message: 'Token invalid atau expired' },
            { status: 401 }
        );
    }
}