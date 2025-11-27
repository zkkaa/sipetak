// File: src/app/daftar/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useUser } from '@/app/context/UserContext';
import InputPw from "@/components/common/inputpw";
import InputEmail from "@/components/common/inputemail";
import InputNama from "@/components/common/inputname";
import InputNik from "@/components/common/inputnik";
import InputTelp from "@/components/common/inputtelp";
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Redirect jika sudah login
    useEffect(() => {
        if (user) {
            const redirectPath = user.role === 'Admin' ? '/admin/beranda' : '/umkm/beranda';
            router.replace(redirectPath);
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        
        const nama = (form.elements.namedItem('nama') as HTMLInputElement).value;
        const nik = (form.elements.namedItem('nik') as HTMLInputElement).value;
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        // Validasi dasar
        if (nik.length !== 16) {
            setError('NIK harus 16 digit.');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password harus minimal 6 karakter.');
            setIsLoading(false);
            return;
        }

        try {
            const payload = { 
                nama,      // Sesuaikan dengan schema DB
                email, 
                nik, 
                password, 
                phone,
                role: 'UMKM' // Default role untuk registrasi
            };
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Registrasi berhasil');
                setSuccess(true);
                
                // Redirect ke login setelah 2 detik
                setTimeout(() => {
                    router.push('/masuk');
                }, 2000);
            } else {
                setError(result.message || 'Pendaftaran gagal. Silakan coba lagi.');
            }
        } catch (err) {
            console.error('❌ Register error:', err);
            setError('Terjadi kesalahan jaringan atau server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Jika sudah ada user, tampilkan loading
    if (user) {
        return (
            <div className="fixed w-screen h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="fixed w-screen h-screen flex justify-center items-center gap-7 py-8">
            {/* Background Decor */}
            <div className="absolute w-[480px] h-[480px] bg-blue-500 opacity-30 rounded-full -top-44 -left-44"></div>
            <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-30 rounded-full -bottom-48 -right-48"></div>

            <div className="w-fit bg-white shadow-lg z-10 rounded-3xl py-8 px-14 my-8">
                <h1 className="text-4xl font-bold mb-2">Daftar</h1>
                <span className="text-base">Silahkan masukkan data anda!</span>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mt-4">
                            ✅ Pendaftaran berhasil! Mengalihkan ke halaman login...
                        </div>
                    )}

                    <div className="flex flex-col justify-between gap-5 mt-10">
                        <InputNama />
                        <InputNik />
                        <InputTelp />
                        <InputEmail />
                        <InputPw />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-80 h-11 bg-cyan-500 text-white border border-cyan-400 border-b-4 font-[600] text-[17px] overflow-hidden relative px-4 py-2 rounded-md hover:brightness-100 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group active:scale-95 mt-14 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="w-full h-full bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        {isLoading ? 'Mendaftarkan...' : success ? 'Berhasil!' : 'Daftar'}
                    </button>

                    <div className="text-center mt-6 text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link href="/masuk" className="text-blue-600 hover:text-blue-700 font-medium">
                            Masuk sekarang
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}