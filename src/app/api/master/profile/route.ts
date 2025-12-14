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

export async function PUT(request: NextRequest) {
    console.log('📝 PUT /api/admin/profile');

    try {
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

        if (body.oldPassword && body.newPassword) {
            console.log('🔐 Processing password change...');

            const isPasswordValid = await bcrypt.compare(
                body.oldPassword,
                currentUser.passwordHash  
            );

            if (!isPasswordValid) {
                return NextResponse.json(
                    { success: false, message: 'Password lama tidak cocok' },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(body.newPassword, 10);
            await db
                .update(users)
                .set({ passwordHash: hashedPassword })  
                .where(eq(users.id, userId));

            console.log('✅ Password updated successfully');

            return NextResponse.json({
                success: true,
                message: 'Password berhasil diubah'
            });
        }
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