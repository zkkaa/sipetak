// src/app/api/umkm/profile/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Payload untuk update profil
interface ProfileUpdatePayload {
    phone?: string; // Hanya phone yang bisa diupdate dari profil
    oldPassword?: string; // Untuk verifikasi ganti password
    newPassword?: string; // Password baru
}

type UserUpdateData = Partial<{
    phone: string;
    passwordHash: string;
}>;

// 🔐 Simulasi: Ambil User ID dari Token/Session
// TODO: Ganti dengan sistem auth yang sebenarnya (NextAuth, JWT, dll)
const getUserIdFromToken = (request: Request): number | null => {
    // Sementara return user ID 2 untuk testing
    // Dalam production, decode dari Authorization header atau session cookie
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    // Untuk testing, ambil dari header custom
    const testUserId = request.headers.get('X-User-Id');
    if (testUserId) return parseInt(testUserId);
    
    // Default untuk development
    return 7; // Asumsi: UMKM user dengan ID 2
};

// --- GET: Ambil Detail Profil UMKM ---
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

// --- PUT: Update Profil & Password ---
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

        // 1. Validasi & Update Password (Jika ada)
        if (body.newPassword) {
            // Validasi password lama wajib diisi
            if (!body.oldPassword) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password lama wajib diisi untuk mengubah password.' 
                }, { status: 400 });
            }
            
            // Validasi panjang password baru
            if (body.newPassword.length < 6) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password baru minimal 6 karakter.' 
                }, { status: 400 });
            }

            // Validasi password lama tidak sama dengan password baru
            if (body.oldPassword === body.newPassword) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password baru tidak boleh sama dengan password lama.' 
                }, { status: 400 });
            }
            
            // Ambil hash password dari DB untuk verifikasi
            const [user] = await db.select({ 
                passwordHash: users.passwordHash 
            }).from(users).where(eq(users.id, userId));
            
            if (!user) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ User tidak ditemukan.' 
                }, { status: 404 });
            }

            // Cek apakah password lama cocok
            const isPasswordMatch = await bcrypt.compare(body.oldPassword, user.passwordHash);
            if (!isPasswordMatch) {
                return NextResponse.json({ 
                    success: false, 
                    message: '❌ Password lama tidak cocok.' 
                }, { status: 401 });
            }
            
            // Hash password baru
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(body.newPassword, salt);
            
            console.log('🔐 Password akan diupdate untuk user:', userId);
        }

        // 2. Update Phone Number (Jika ada)
        if (body.phone !== undefined) {
            // Validasi format phone (basic)
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

        // 3. Validasi: Pastikan ada data yang akan diupdate
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: '⚠️ Tidak ada perubahan data.' 
            }, { status: 400 });
        }

        // 4. Jalankan Update ke Database
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

// 💡 CATATAN UNTUK PRODUCTION:
// 1. Ganti getUserIdFromToken dengan decode JWT/NextAuth
// 2. Tambahkan rate limiting untuk prevent brute force password
// 3. Tambahkan logging untuk security audit
// 4. Implementasi email verification jika user ganti email (opsional)
// 5. Tambahkan validasi phone number dengan library seperti libphonenumber-js