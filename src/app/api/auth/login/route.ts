// File: src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';

interface LoginPayload {
    email: string;
    password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024';

export async function POST(req: Request) {
    try {
        const { email, password } = (await req.json()) as LoginPayload;

        // 1. Validasi Input
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email dan password wajib diisi.' }, 
                { status: 400 }
            );
        }

        // 2. Cari User di Database
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Email atau password salah.' }, 
                { status: 401 }
            );
        }
        
        // 3. Verifikasi Status Akun
        if (!user.isActive) {
            return NextResponse.json(
                { success: false, message: 'Akun Anda dinonaktifkan. Hubungi Admin.' }, 
                { status: 403 }
            );
        }

        // 4. Verifikasi Password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash); // ✅ Sesuaikan dengan schema

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Email atau password salah.' }, 
                { status: 401 }
            );
        }

        // 5. Generate JWT Token dengan JOSE
        const secret = new TextEncoder().encode(JWT_SECRET);

        const token = await new jose.SignJWT({ 
            userId: user.id, 
            email: user.email,
            nama: user.nama, // ✅ PENTING: Include nama
            role: user.role 
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // ✅ 7 hari lebih baik dari 8 jam
        .sign(secret);

        // 6. Buat Response dengan Cookie
        const response = NextResponse.json({ 
            success: true, 
            message: 'Login berhasil!', 
            user: { 
                id: user.id, // ✅ Include id
                nama: user.nama, 
                email: user.email,
                role: user.role 
            } 
        }, { 
            status: 200
        });

        // 7. Set Cookie menggunakan NextResponse API (lebih modern)
        response.cookies.set('sipetak_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // ✅ Ubah dari 'strict' ke 'lax' agar cookie tetap ada saat navigate
            maxAge: 60 * 60 * 24 , // ✅ 1 hari
            path: '/',
        });

        console.log('✅ Login successful for:', user.email);

        return response;

    } catch (error) {
        console.error('❌ API Login Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server saat login.' }, 
            { status: 500 }
        );
    }
}