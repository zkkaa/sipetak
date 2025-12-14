import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

interface ProfileUpdatePayload {
    phone?: string; 
    oldPassword?: string; 
    newPassword?: string; 
}

type UserUpdateData = Partial<{
    phone: string;
    passwordHash: string;
}>;

const getUserIdFromToken = (request: Request): number | null => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const testUserId = request.headers.get('X-User-Id');
    if (testUserId) return parseInt(testUserId);

    return 7; 
};

export async function GET(req: Request) {
    const userId = getUserIdFromToken(req);

    if (!userId) {
        return NextResponse.json({ 
            success: false, 
            message: 'Anda belum login. Silakan login terlebih dahulu.' 
        }, { status: 401 });
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
            return NextResponse.json({ 
                success: false, 
                message: 'Pengguna tidak ditemukan.' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            user 
        });

    } catch (error) {
        console.error('❌ API GET Profile Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal mengambil data profil.' 
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const userId = getUserIdFromToken(req);

    if (!userId) {
        return NextResponse.json({ 
            success: false, 
            message: 'Anda belum login. Silakan login terlebih dahulu.' 
        }, { status: 401 });
    }

    try {
        const body = await req.json() as ProfileUpdatePayload;
        const updateData: UserUpdateData = {};

        if (body.newPassword) {
            if (!body.oldPassword) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password lama wajib diisi untuk mengubah password.' 
                }, { status: 400 });
            }
            
            if (body.newPassword.length < 6) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password baru minimal 6 karakter.' 
                }, { status: 400 });
            }

            if (body.oldPassword === body.newPassword) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password baru tidak boleh sama dengan password lama.' 
                }, { status: 400 });
            }
            
            const [user] = await db.select({ 
                passwordHash: users.passwordHash 
            }).from(users).where(eq(users.id, userId));
            
            if (!user) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ User tidak ditemukan.' 
                }, { status: 404 });
            }

            const isPasswordMatch = await bcrypt.compare(body.oldPassword, user.passwordHash);
            if (!isPasswordMatch) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password lama tidak cocok.' 
                }, { status: 401 });
            }
            
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(body.newPassword, salt);
            
            console.log('🔐 Password akan diupdate untuk user:', userId);
        }

        if (body.phone !== undefined) {
            const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
            if (!phoneRegex.test(body.phone)) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Format nomor telepon tidak valid.' 
                }, { status: 400 });
            }
            
            updateData.phone = body.phone;
            console.log('📱 Phone akan diupdate untuk user:', userId);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: '⚠️ Tidak ada perubahan data.' 
            }, { status: 400 });
        }

        const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                nama: users.nama,
                email: users.email,
                phone: users.phone,
                nik: users.nik,
            });

        if (!updatedUser) {
            return NextResponse.json({ 
                success: false, 
                message: '❌ Gagal memperbarui profil.' 
            }, { status: 500 });
        }

        console.log('✅ Profil berhasil diupdate untuk user:', userId);

        return NextResponse.json({ 
            success: true, 
            message: '✅ Profil berhasil diperbarui.', 
            user: updatedUser 
        });

    } catch (error) {
        console.error('❌ API PUT Profile Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Gagal memperbarui profil. Silakan coba lagi.' 
        }, { status: 500 });
    }
}