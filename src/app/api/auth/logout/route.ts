// File: src/app/api/auth/logout/route.ts

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
    // 1. Siapkan Cookie Kosong
    // Kita membuat cookie baru dengan nama yang sama, tetapi dengan maxAge=0
    // yang akan memberi tahu browser untuk segera menghapus cookie tersebut.
    const serializedCookie = serialize('sipetak_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0, // Kedaluwarsa segera
        path: '/',
    });

    // 2. Kirim Respons dengan header Set-Cookie yang telah dihapus
    return NextResponse.json({ success: true, message: 'Logout berhasil.' }, {
        status: 200,
        headers: {
            'Set-Cookie': serializedCookie,
        }
    });
}