// File: src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { nama, email, nik, password, phone } = await req.json();

        // 1. Validasi Input
        if (!email || !password || !nama || !nik) {
            return NextResponse.json(
                { success: false, message: 'Data wajib (email, password, nama, NIK) harus diisi.' }, 
                { status: 400 }
            );
        }

        // 2. Validasi NIK
        if (nik.length !== 16) {
            return NextResponse.json(
                { success: false, message: 'NIK harus 16 digit.' }, 
                { status: 400 }
            );
        }

        // 3. Validasi Password
        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password minimal 6 karakter.' }, 
                { status: 400 }
            );
        }

        // 4. Cek Email Sudah Terdaftar
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Email sudah terdaftar.' }, 
                { status: 409 }
            );
        }

        // 5. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10); // ✅ Gunakan 10 rounds (standar)

        // 6. Insert User Baru
        const [newUser] = await db
            .insert(users)
            .values({
                email,
                passwordHash: hashedPassword, // ✅ Sesuaikan dengan schema (passwordHash, bukan password)
                role: 'UMKM',
                nama,
                nik,
                phone: phone || null,
                isActive: true, // ✅ Set default active
            })
            .returning({ 
                id: users.id, 
                email: users.email,
                nama: users.nama
            });

        console.log('✅ Registration successful for:', newUser.email);

        return NextResponse.json(
            { 
                success: true, 
                message: 'Pendaftaran berhasil!', 
                user: newUser 
            }, 
            { status: 201 }
        );

    } catch (error) {
        console.error('❌ API Register Error:', error);
        return NextResponse.json(
            { success: false, message: 'Terjadi kesalahan server saat mendaftar.' }, 
            { status: 500 }
        );
    }
}