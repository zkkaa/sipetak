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

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email dan password wajib diisi.' }, 
                { status: 400 }
            );
        }

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
        
        if (!user.isActive) {
            return NextResponse.json(
                { success: false, message: 'Akun Anda dinonaktifkan. Hubungi Admin.' }, 
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash); 

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Email atau password salah.' }, 
                { status: 401 }
            );
        }

        const secret = new TextEncoder().encode(JWT_SECRET);

        const token = await new jose.SignJWT({ 
            userId: user.id, 
            email: user.email,
            nama: user.nama, 
            role: user.role 
        })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') 
        .sign(secret);

        const response = NextResponse.json({ 
            success: true, 
            message: 'Login berhasil!', 
            user: { 
                id: user.id, 
                nama: user.nama, 
                email: user.email,
                role: user.role 
            } 
        }, { 
            status: 200
        });

        response.cookies.set('sipetak_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', 
            maxAge: 60 * 60 * 24 , 
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