// File: src/app/api/admin/create-first-admin/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        console.log('🔵 Create Admin API Called');
        const body = await request.json();
        console.log('📦 Request body:', body);
        const { email, password, nama } = body;
        if (!email || !password || !nama) {
            return NextResponse.json(
                { success: false, message: 'Email, password, dan nama wajib diisi' },
                { status: 400 }
            );
        }
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser) {
            console.log('⚠️ Email sudah ada:', email);
            return NextResponse.json(
                { success: false, message: 'Email sudah terdaftar' },
                { status: 409 }
            );
        }
        console.log('🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('💾 Inserting admin to database...');
        const [newAdmin] = await db
            .insert(users)
            .values({
                email: email,
                passwordHash: hashedPassword,
                role: 'Admin',
                nama: nama,
                nik: '0000000000000000',
                phone: null,
                isActive: true,
            })
            .returning({
                id: users.id,
                email: users.email,
                nama: users.nama,
                role: users.role,
            });

        console.log('✅ Admin created:', newAdmin);

        return NextResponse.json(
            {
                success: true,
                message: 'Admin berhasil dibuat!',
                admin: newAdmin
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('❌ Create Admin Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Gagal membuat admin: ' + (error as Error).message 
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Create Admin API is working!',
        instruction: 'Send POST request with { email, password, nama }'
    });
}