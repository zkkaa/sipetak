// File: src/app/api/admin/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as jose from 'jose';
import bcrypt from 'bcryptjs';

interface JwtPayload {
    userId: number;
    email: string;
    nama: string;
    role: 'Admin' | 'UMKM';
}

// Helper: Extract userId from Cookie
async function getUserFromCookie(request: NextRequest): Promise<{ userId: number; role: string } | null> {
    try {
        const token = request.cookies.get('sipetak_token')?.value;
        
        if (!token) {
            console.warn('⚠️ No token in cookie');
            return null;
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024');
        const { payload } = await jose.jwtVerify(token, secret);
        
        const jwtPayload = payload as unknown as JwtPayload;
        console.log('✅ User extracted from cookie:', jwtPayload.userId);
        
        return {
            userId: jwtPayload.userId,
            role: jwtPayload.role
        };
    } catch (error) {
        console.error('❌ Error extracting user from cookie:', error);
        return null;
    }
}

// PUT: Update Admin Profile
export async function PUT(request: NextRequest) {
    console.log('📝 PUT /api/admin/profile');

    try {
        // 1. Verify user and check if Admin
        const userInfo = await getUserFromCookie(request);
        
        if (!userInfo) {
            return NextResponse.json(
                { success: false, message: 'User tidak terautentikasi' },
                { status: 401 }
            );
        }

        if (userInfo.role !== 'Admin') {
            return NextResponse.json(
                { success: false, message: 'Akses ditolak. Hanya Admin yang dapat mengakses.' },
                { status: 403 }
            );
        }

        const userId = userInfo.userId;
        const body = await request.json();

        // 2. Ambil data user saat ini dari database
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: 'User tidak ditemukan' },
                { status: 404 }
            );
        }

        // 3. Handle Password Change
        if (body.oldPassword && body.newPassword) {
            console.log('🔐 Processing password change...');

            // ✅ PERBAIKAN: Gunakan passwordHash bukan password
            const isPasswordValid = await bcrypt.compare(
                body.oldPassword,
                currentUser.passwordHash  // ✅ Field yang benar
            );

            if (!isPasswordValid) {
                return NextResponse.json(
                    { success: false, message: 'Password lama tidak cocok' },
                    { status: 400 }
                );
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(body.newPassword, 10);

            // ✅ PERBAIKAN: Update passwordHash bukan password
            await db
                .update(users)
                .set({ passwordHash: hashedPassword })  // ✅ Field yang benar
                .where(eq(users.id, userId));

            console.log('✅ Password updated successfully');

            return NextResponse.json({
                success: true,
                message: 'Password berhasil diubah'
            });
        }

        // 4. Handle Profile Update (phone only)
        if (body.phone !== undefined) {
            console.log('📱 Updating phone number...');

            const [updatedUser] = await db
                .update(users)
                .set({ phone: body.phone })
                .where(eq(users.id, userId))
                .returning();

            console.log('✅ Phone number updated');

            return NextResponse.json({
                success: true,
                message: 'Profil berhasil diperbarui',
                user: {
                    id: updatedUser.id,
                    nama: updatedUser.nama,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role
                }
            });
        }

        // Jika tidak ada yang diupdate
        return NextResponse.json(
            { success: false, message: 'Tidak ada data untuk diperbarui' },
            { status: 400 }
        );

    } catch (error) {
        console.error('❌ PUT /api/admin/profile Error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal memperbarui profil' },
            { status: 500 }
        );
    }
}