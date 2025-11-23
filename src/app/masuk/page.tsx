// File: src/app/masuk/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useUser } from '@/app/context/UserContext';
// Asumsikan komponen ini sudah benar
import InputPw from "@/components/common/inputpw"; 
import InputEmail from "@/components/common/inputemail"; 
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    // Gunakan loading dari context untuk menghindari flash jika sudah login
    const { user, setUser, loading } = useUser(); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- LOGIKA REDIRECT PENGGUNA YANG SUDAH LOGIN ---
    // Logika ini akan berjalan setelah login berhasil (user di-set) DAN saat refresh
    useEffect(() => {
        // Hanya jalankan logika redirect setelah loading context selesai
        if (!loading && user) {
            const redirectPath = user.role === 'Admin' ? '/admin/beranda' : '/umkm/beranda';
            console.log('✅ User status change/Loaded. Redirecting to:', redirectPath);
            router.replace(redirectPath);
        }
    }, [user, loading, router]); // Dependency array: hanya akan berjalan jika user/loading berubah

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Cek jika sudah ada user untuk mencegah double submit
        if (user) return; 

        setError('');
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        try {
            console.log('🔐 Attempting login...');
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Login successful. Setting user in context:', result.user);
                
                // ✅ SET USER DI CONTEXT SEGERA. 
                // Redirect akan ditangani oleh useEffect di atas.
                setUser(result.user); 
                
                // HAPUS LOGIKA REDIRECT MANUAL DAN DELAY DI SINI.
                // Biarkan useEffect yang menangani redirect setelah 'user' di-set.
                
            } else {
                console.error('❌ Login failed:', result.message);
                setError(result.message || 'Login gagal. Silakan coba lagi.');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError('Terjadi kesalahan jaringan atau server.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOADING/REDIRECT SCREEN ---
    // Tampilkan loading screen jika sedang memuat (saat refresh) ATAU jika user sudah ada (saat sukses login)
    if (loading || user) {
        return (
            <div className="fixed w-screen h-screen flex justify-center items-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">
                        {loading ? 'Memuat sesi...' : 'Otentikasi berhasil, mengalihkan...'}
                    </p>
                </div>
            </div>
        );
    }

    // Tampilkan formulir login jika loading selesai dan tidak ada user
    return (
        <div className="fixed w-screen h-screen flex justify-center items-center gap-7">
            {/* Background Decor */}
            <div className="absolute w-[480px] h-[480px] bg-blue-500 opacity-30 rounded-full -top-44 -left-44"></div>
            <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-30 rounded-full -bottom-48 -right-48"></div>

            <div className="w-fit bg-white shadow-lg z-10 rounded-3xl py-8 px-14">
                <h1 className="text-4xl font-bold mb-2">Masuk</h1>
                <span className="text-base">Silahkan masukkan akun anda!</span>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-4">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col justify-between gap-5 mt-10">
                        <InputEmail />
                        <InputPw />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-80 h-11 bg-cyan-500 text-white border border-cyan-400 border-b-4 font-[600] text-[17px] overflow-hidden relative px-4 py-2 rounded-md hover:brightness-100 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group active:scale-95 mt-14 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="w-full h-full bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        {isLoading ? 'Memuat...' : 'Masuk'}
                    </button>

                    <div className="text-center mt-6 text-sm text-gray-600">
                        Belum punya akun?{' '}
                        <Link href="/daftar" className="text-blue-600 hover:text-blue-700 font-medium">
                            Daftar sekarang
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}