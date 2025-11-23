// File: src/app/api/accounts/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// --- GET: Ambil Semua Akun UMKM ---
export async function GET() {
    try {
        // Ambil hanya akun dengan role 'UMKM'
        const accounts = await db
            .select({
                id: users.id,
                nama: users.nama,
                email: users.email,
                role: users.role,
                isActive: users.isActive,
                phone: users.phone,
                nik: users.nik,
            })
            .from(users)
            .where(eq(users.role, 'UMKM')) // Filter HANYA UMKM
            .orderBy(asc(users.nama)); 

        return NextResponse.json({ success: true, data: accounts });
    } catch (error) {
        console.error('API GET Accounts Error:', error);
        return NextResponse.json({ success: false, message: 'Gagal mengambil data akun UMKM.' }, { status: 500 });
    }
}