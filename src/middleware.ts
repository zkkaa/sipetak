import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'sipetak-jwt-secret-key-2024';
const SECRET = new TextEncoder().encode(JWT_SECRET);
const PROTECTED_ROUTES = [
    '/admin',
    '/umkm',
];

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
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        return NextResponse.next();
    }

    if (isProtectedRoute) {
        const token = request.cookies.get('sipetak_token')?.value;

        if (!token) {
            console.log('⚠️ No token found, redirecting to login');
            return NextResponse.redirect(new URL('/masuk', request.url));
        }

        const payload = await verifyToken(token);

        if (!payload) {
            console.log('⚠️ Token invalid, clearing cookie and redirecting to login');
            const response = NextResponse.redirect(new URL('/masuk', request.url));
            response.cookies.delete('sipetak_token');
            return response;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log('✅ Token valid for user:', (payload as any).userId);
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};