// File: src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose'; // Library untuk memverifikasi JWT

// Tentukan route mana saja yang dilindungi (hanya user terotentikasi)
const protectedRoutes = ['/umkm', '/admin'];

// Tentukan peran pengguna
type UserRole = 'Admin' | 'UMKM';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const pathname = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Lewati jika rute tidak dilindungi
    if (!isProtectedRoute) {
        return response;
    }

    // 1. Ambil Token dari Cookies
    const token = request.cookies.get('sipetak_token')?.value;

    // 2. Jika tidak ada token, arahkan ke halaman masuk
    if (!token) {
        // Arahkan ke halaman masuk dan simpan rute tujuan
        return NextResponse.redirect(new URL(`/masuk?redirect=${pathname}`, request.url));
    }

    // 3. Verifikasi dan Dekode Token
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        
        // Memverifikasi dan mendekode token JWT menggunakan JOSE
        const { payload } = await jose.jwtVerify(token, secret);
        
        const userRole = payload.role as UserRole;
        const userId = payload.userId as number;

        if (pathname.startsWith('/api/public/report')) {
        return NextResponse.next();
    }
    
    // Tentukan route mana saja yang dilindungi (hanya user terotentikasi)
    const protectedRoutes = ['/umkm', '/admin'];
        
        // 4. Periksa Otorisasi (Apakah peran sesuai dengan rute)
        if (pathname.startsWith('/admin') && userRole !== 'Admin') {
            // Jika UMKM mencoba mengakses /admin
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }

        // 5. Token valid, izinkan akses dan teruskan data role (optional)
        // Kita bisa mengupdate headers jika diperlukan, tapi untuk saat ini, kita biarkan saja next().
        return response;

    } catch (error) {
        // Jika token tidak valid (expired, corrupted), hapus token dan redirect ke login
        const redirectUrl = new URL(`/masuk?redirect=${pathname}`, request.url);
        
        const expiredResponse = NextResponse.redirect(redirectUrl);
        // Hapus cookie token yang rusak
        expiredResponse.cookies.delete('sipetak_token'); 
        
        return expiredResponse;
    }
}

// Konfigurasi agar middleware hanya berjalan pada rute yang dilindungi
export const config = {
    // Jalankan pada semua permintaan di /umkm dan /admin (kecuali file statis)
    matcher: ['/umkm/:path*', '/admin/:path*'], 
};