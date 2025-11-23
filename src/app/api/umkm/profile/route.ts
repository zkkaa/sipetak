// File: src/app/api/umkm/profile/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
// import * as jose from 'jose'; 

import bcrypt from 'bcryptjs';

// Payload untuk update profil
interface ProfileUpdatePayload {
    nama?: string;
    phone?: string;
    oldPassword?: string; // Untuk verifikasi
    newPassword?: string; // Untuk reset
}

type UserUpdateData = Partial<{
    nama: string;
    phone: string;
    passwordHash: string;
}>;

// Simulasikan fungsi untuk mendapatkan User ID dari JWT Token
// Dalam implementasi nyata, ini akan dilakukan di Middleware atau helper.
const getUserIdFromToken = (request: Request): number | null => {
    // --- SIMULASI: Ambil User ID 2 ---
    // Ganti dengan logika dekode token JWT yang sebenarnya di Header/Cookie.
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    // Karena kita belum memiliki logic dekode token di sini, kita gunakan ID dummy
    // Asumsi: UMKM yang login memiliki ID 2
    return 2; 
};

// --- GET: Ambil Detail Profil UMKM ---
export async function GET(req: Request) {
    const userId = getUserIdFromToken(req);

    if (!userId) {
        return NextResponse.json({ success: false, message: 'Tidak terotentikasi.' }, { status: 401 });
    }

    try {
        const [user] = await db.select({
            id: users.id,
            nama: users.nama,
            email: users.email,
            phone: users.phone,
            nik: users.nik,
        })
        .from(users)
        .where(eq(users.id, userId));

        if (!user) {
            return NextResponse.json({ success: false, message: 'Pengguna tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('API GET Profile Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil data profil.' }, { status: 500 });
    }
}

// --- PUT/PATCH: Update Profil & Password ---
export async function PUT(req: Request) {
    const userId = getUserIdFromToken(req);

    if (!userId) {
        return NextResponse.json({ success: false, message: 'Tidak terotentikasi.' }, { status: 401 });
    }

    try {
        const body = await req.json() as ProfileUpdatePayload;
            
        const updateData: UserUpdateData = {}; // Object payload Drizzle

        // 1. Verifikasi Password Lama (Jika Password Baru diisi)
        if (body.newPassword) {
            if (!body.oldPassword) {
                return NextResponse.json({ success: false, message: 'Password lama wajib diisi untuk mengubah password baru.' }, { status: 400 });
            }
            
            // Ambil hash password dari DB
            const [user] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId));
            
            if (!user || !(await bcrypt.compare(body.oldPassword, user.passwordHash))) {
                return NextResponse.json({ success: false, message: 'Password lama tidak cocok.' }, { status: 401 });
            }
            
            // Hashing password baru
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(body.newPassword, salt);
        }

        // 2. Siapkan Data Profil yang Akan Diupdate
        if (body.nama) updateData.nama = body.nama;
        if (body.phone) updateData.phone = body.phone;
        
        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ success: false, message: 'Tidak ada data untuk diperbarui.' }, { status: 400 });
        }

        // 3. Jalankan Update
        const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning();
            
        return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui.', user: updatedUser });

    } catch (error) {
        console.error('API PUT Profile Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal memperbarui profil.' }, { status: 500 });
    }
}