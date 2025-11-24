import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users, reports, submissions, umkmLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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

interface AccountUpdatePayload {
    nama?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    newPassword?: string;
}

interface UserUpdateData {
    nama?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    passwordHash?: string;
}

// --- 1. PUT: Update Detail Akun ---
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
        const updateData: UserUpdateData = {};

        if (body.nama) updateData.nama = body.nama;
        if (body.email) updateData.email = body.email;
        if (body.phone) updateData.phone = body.phone;
        if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;

        if (body.newPassword) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(body.newPassword, salt);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Tidak ada data untuk diperbarui.' }, 
                { status: 400 }
            );
        }

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning() as [UserAccount];

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'Akun tidak ditemukan.' }, 
                { status: 404 }
            );
        }

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

// --- 2. DELETE: Hapus Akun dengan Foreign Key Handling ---
export async function DELETE(req: Request, { params }: Params) {
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
        return NextResponse.json(
            { success: false, message: 'ID Akun tidak valid.' }, 
            { status: 400 }
        );
    }

    try {
        // 💡 STEP 1: Cek user exists
        const userExists = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (userExists.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Akun tidak ditemukan.' }, 
                { status: 404 }
            );
        }

        // 💡 STEP 2: Hapus referensi di tabel lain
        // Update reports yang mereferensi user ini sebagai admin handler
        await db
            .update(reports)
            .set({ adminHandlerId: null })
            .where(eq(reports.adminHandlerId, userId));

            
        const umkmLocIds = await db
            .select({ id: umkmLocations.id })
            .from(umkmLocations)
            .where(eq(umkmLocations.userId, userId));

        // Hapus submissions yang mereferensi umkmLocations
        if (umkmLocIds.length > 0) {
            const umkmLocIdArray = umkmLocIds.map(u => u.id);
            await db
                .delete(submissions)
                .where(eq(submissions.umkmLocationId, umkmLocIdArray[0])); // Jika multiple, gunakan .inArray()
        }

        // Hapus umkmLocations
        await db
            .delete(umkmLocations)
            .where(eq(umkmLocations.userId, userId));

        // 💡 STEP 4: Hapus user
        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning();

        if (!deletedUser) {
            return NextResponse.json(
                { success: false, message: 'Gagal menghapus akun.' }, 
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Akun berhasil dihapus.' 
        }, { status: 200 });

    } catch (error) {
        console.error(`API DELETE Account ${userId} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus akun: ' + (error as Error).message }, 
            { status: 500 }
        );
    }
}