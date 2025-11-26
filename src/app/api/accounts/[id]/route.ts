import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/db';
import { users, reports, submissions, umkmLocations } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm'; // 💡 Tambahkan inArray untuk query array
import bcrypt from 'bcryptjs';

// --- INTERFACES ---

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

// Tipe payload untuk Drizzle (hanya field yang bisa di-update)
type UserUpdateData = Partial<{
    nama: string;
    email: string;
    phone: string;
    isActive: boolean;
    passwordHash: string;
}>;


// --- 1. PUT: Update Detail Akun ---
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    const userId = parseInt(context.params.id);
    
    if (isNaN(userId)) {
        return NextResponse.json(
            { success: false, message: 'ID Akun tidak valid.' }, 
            { status: 400 }
        );
    }

    try {
        const body = (await req.json()) as AccountUpdatePayload;
        const updateData: UserUpdateData = {};

        // Prepare update data
        if (body.nama) updateData.nama = body.nama;
        if (body.email) updateData.email = body.email;
        if (body.phone) updateData.phone = body.phone;
        if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;

        // Reset Password Logic
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

        // Jalankan update di database
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

        // Hapus passwordHash sebelum mengirim response
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({ 
            success: true, 
            message: 'Akun berhasil diperbarui.', 
            user: userWithoutPassword 
        }, { status: 200 });

    } catch (error) {
        console.error(`❌ API PUT Account ${userId} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal memperbarui akun.' }, 
            { status: 500 }
        );
    }
}

// --- 2. DELETE: Hapus Akun dengan Foreign Key Handling ---
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const userId = parseInt(context.params.id);

    if (isNaN(userId)) {
        return NextResponse.json(
            { success: false, message: 'ID Akun tidak valid.' }, 
            { status: 400 }
        );
    }

    try {
        // 1. Cek user exists (Opsional, tapi untuk 404 response yang lebih baik)
        const userExists = await db
            .select({ id: users.id, role: users.role })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (userExists.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Akun tidak ditemukan.' }, 
                { status: 404 }
            );
        }
        
        // --- START REFERENTIAL INTEGRITY CLEANUP ---

        // A. Kumpulkan ID Lapak yang dimiliki user ini
        const umkmLocs = await db
            .select({ id: umkmLocations.id })
            .from(umkmLocations)
            .where(eq(umkmLocations.userId, userId));

        const umkmLocIdArray = umkmLocs.map(u => u.id);

        // B. Hapus submissions yang mereferensi Lapak UMKM ini
        if (umkmLocIdArray.length > 0) {
            await db
                .delete(submissions)
                .where(inArray(submissions.umkmLocationId, umkmLocIdArray));
            
            console.log(`✅ Deleted ${umkmLocIdArray.length} related submissions.`);
        }

        // C. Update reports yang mereferensi user ini sebagai admin handler (Set NULL)
        await db
            .update(reports)
            .set({ adminHandlerId: null })
            .where(eq(reports.adminHandlerId, userId));

        // D. Hapus umkmLocations (Lapak)
        await db
            .delete(umkmLocations)
            .where(eq(umkmLocations.userId, userId));
        
        // --- END REFERENTIAL INTEGRITY CLEANUP ---

        // E. Hapus user
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
        console.error(`❌ API DELETE Account ${userId} Error:`, error);
        return NextResponse.json(
            { success: false, message: 'Gagal menghapus akun: ' + (error as Error).message }, 
            { status: 500 }
        );
    }
}