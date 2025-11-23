// File: src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: 'Logout berhasil.' },
            { status: 200 }
        );

        // ✅ Hapus cookie menggunakan NextResponse API
        response.cookies.delete('sipetak_token');

        console.log('✅ Logout successful, cookie deleted');

        return response;

    } catch (error) {
        console.error('❌ Logout error:', error);
        return NextResponse.json(
            { success: false, message: 'Gagal logout.' },
            { status: 500 }
        );
    }
}