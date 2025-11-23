import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema'; // Import skema users
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { serialize } from 'cookie';
import * as jose from 'jose'; // Library untuk signing JWT

// --- INTERFACES ---
interface LoginPayload {
    email: string;
    password: string;
}

// Interface untuk data yang disimpan di DB (diambil dari skema)
interface UserAccount {
    id: number;
    email: string;
    passwordHash: string;
    role: 'Admin' | 'UMKM';
    isActive: boolean;
    nama: string;
    nik: string | null;
    phone: string | null;
    // ... properti lainnya dari skema users
}

const JWT_SECRET = process.env.JWT_SECRET || 'sipetakkosong1';

export async function POST(req: Request) {
    try {
        const { email, password } = (await req.json()) as LoginPayload;

        // 1. Validasi Input Dasar
        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Email dan password wajib diisi.' }, { status: 400 });
        }

        // 2. Cari Pengguna di Database
        // Menggunakan array destructuring dan type assertion untuk hasil query
        const [user]: UserAccount[] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            return NextResponse.json({ success: false, message: 'Email atau password salah.' }, { status: 401 });
        }
        
        // 3. Verifikasi Status Akun
        if (!user.isActive) {
            return NextResponse.json({ success: false, message: 'Akun Anda dinonaktifkan. Hubungi Admin.' }, { status: 403 });
        }

        // 4. Verifikasi Password (Bcrypt)
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        
        if (!isPasswordValid) {
            return NextResponse.json({ success: false, message: 'Email atau password salah.' }, { status: 401 });
        }

        // 5. Hasilkan Token JWT menggunakan JOSE
        const secret = new TextEncoder().encode(JWT_SECRET);
        const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 8; // Sekarang + 8 jam

        const token = await new jose.SignJWT({ 
            userId: user.id, 
            email: user.email, 
            role: user.role 
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(secret);
        
        // 6. Siapkan Cookie
        const serializedCookie = serialize('sipetak_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 8, // 8 jam
            path: '/',
        });

        // 7. Kirim Respons dengan Cookie
        return NextResponse.json({ 
            success: true, 
            message: 'Login berhasil!', 
            user: { nama: user.nama, role: user.role } 
        }, { 
            status: 200,
            headers: {
                'Set-Cookie': serializedCookie,
            }
        });

    } catch (error) {
        // Log error server
        console.error('API Login Error:', error);
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan server saat login.' }, { status: 500 });
    }
}