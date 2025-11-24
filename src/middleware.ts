// File: src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'sipetakkosong1';
const SECRET = new TextEncoder().encode(JWT_SECRET);

// Routes yang membutuhkan autentikasi
const PROTECTED_ROUTES = [
    '/admin',
    '/umkm',
];

// Routes publik
const PUBLIC_ROUTES = [
    '/masuk',
    '/daftar',
    '/api/auth',
];

async function verifyToken(token: string) {
    try {
        const verified = await jose.jwtVerify(token, SECRET);
        return verified.payload;
    } catch (error) {
        console.error('❌ Token verification failed:', error);
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    console.log('🔍 Middleware:', pathname);

    // 1. Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    // 2. Jika route publik, lewati middleware
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // 3. Jika route terlindungi, verifikasi token
    if (isProtectedRoute) {
        const token = request.cookies.get('sipetak_token')?.value;

        if (!token) {
            console.log('⚠️ No token found, redirecting to login');
            return NextResponse.redirect(new URL('/masuk', request.url));
        }

        // Verifikasi token
        const payload = await verifyToken(token);

        if (!payload) {
            console.log('⚠️ Token invalid, clearing cookie and redirecting to login');
            // Hapus cookie yang invalid
            const response = NextResponse.redirect(new URL('/masuk', request.url));
            response.cookies.delete('sipetak_token');
            return response;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log('✅ Token valid for user:', (payload as any).userId);

        // Lanjutkan ke route
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};