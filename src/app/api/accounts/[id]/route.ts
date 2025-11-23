import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Tipe data yang dikembalikan Drizzle dari tabel users
interface UserAccount {
    id: number;
    email: string;
    passwordHash: string;
    role: 'Admin' | 'UMKM';
    isActive: boolean;
    nama: string;
    nik: string | null;
    phone: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

interface Params {
    params: {
        id: string;
    };
}

// Payload yang dikirim dari frontend saat edit
interface AccountUpdatePayload {
    nama?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    newPassword?: string; // Jika Admin mereset password
}

// 💡 Tipe yang akan di-set pada Drizzle (hanya field yang bisa di-update)
interface UserUpdateData {
    nama?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    passwordHash?: string; // 💡 Nama field database yang benar
}

// --- 1. PUT: Update Detail Akun (Nama, Phone, Password, Status) ---
export async function PUT(req: Request, { params }: Params) {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
        return NextResponse.json(
            { success: false, message: 'ID Akun tidak valid.' }, 
            { status: 400 }
        );
    }

    try {
        const body = (await req.json()) as AccountUpdatePayload;
        const updateData: UserUpdateData = {}; // Objek payload Drizzle yang type-safe

        // Siapkan data yang akan diupdate
        if (body.nama) updateData.nama = body.nama;
        if (body.email) updateData.email = body.email;
        if (body.phone) updateData.phone = body.phone;
        if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;

        // Logika Reset Password
        if (body.newPassword) {
            const salt = await bcrypt.genSalt(10);
            // 💡 Hashing dan set ke passwordHash
            updateData.passwordHash = await bcrypt.hash(body.newPassword, salt);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Tidak ada data untuk diperbarui.' }, 
                { status: 400 }
            );
        }

        // Jalankan update di database
        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning() as [UserAccount]; // Assert return type

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'Akun tidak ditemukan.' }, 
                { status: 404 }
            );
        }

        // 💡 Hapus passwordHash sebelum mengirim response ke frontend
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({ 
            success: true, 
            message: 'Akun berhasil diperbarui.', 
            user: userWithoutPassword 
        }, { status: 200 });

    } catch (error) {
        console.error(`API PUT Account ${userId} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal memperbarui akun.' }, 
            { status: 500 }
        );
    }
}

// --- 2. DELETE: Hapus Akun ---
export async function DELETE(req: Request, { params }: Params) {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
        return NextResponse.json(
            { success: false, message: 'ID Akun tidak valid.' }, 
            { status: 400 }
        );
    }

    try {
        // Hapus entri dari database
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning();

        if (!deletedUser) {
            return NextResponse.json(
                { success: false, message: 'Akun tidak ditemukan.' }, 
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Akun berhasil dihapus.' 
        }, { status: 200 });

    } catch (error) {
        console.error(`API DELETE Account ${userId} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus akun.' }, 
            { status: 500 }
        );
    }
}