// File: src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Catatan: Next.js App Router menggunakan POST/GET/PUT/DELETE functions

export async function POST(req: Request) {
    try {
        const { nama, email, nik, password, phone } = await req.json();

        // 1. Validasi Input Dasar
        if (!email || !password || !nama || !nik) {
            return NextResponse.json({ success: false, message: 'Data wajib (email, password, nama, NIK) harus diisi.' }, { status: 400 });
        }

        // 2. Cek apakah email sudah terdaftar
        const existingUsers = await db.select().from(users).where(eq(users.email, email));
        if (existingUsers.length > 0) {
            return NextResponse.json({ success: false, message: 'Email sudah terdaftar.' }, { status: 409 });
        }

        // 3. Hashing Password (Keamanan)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Masukkan Pengguna Baru ke Database (Role: UMKM)
        const [newUser] = await db.insert(users).values({
            email,
            passwordHash,
            role: 'UMKM',
            nama,
            nik,
            phone: phone || null,
        }).returning({ id: users.id, email: users.email });

        return NextResponse.json({ success: true, message: 'Pendaftaran berhasil!', user: newUser }, { status: 201 });

    } catch (error) {
        console.error('API Register Error:', error);
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan server saat mendaftar.' }, { status: 500 });
    }
}