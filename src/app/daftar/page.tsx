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
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function RegisterPage() {
    const router = useRouter();
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
                nama,      
                email, 
                nik, 
                password, 
                phone,
                role: 'UMKM' 
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

    if (user) {
        return (
            <div className="fixed w-screen h-screen flex justify-center items-center bg-white">
                <motion.div 
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="relative w-20 h-20">
                        <motion.div
                            className="absolute inset-0 border-4 border-gray-200 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute inset-2 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <p className="text-gray-700 font-medium">Mengalihkan...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed w-screen h-screen flex flex-col lg:flex-row">
            {/* Left Side - Hero Section */}
            <motion.div 
                className="hidden relative lg:block w-full lg:w-1/2 h-48 lg:h-full bg-blue-400 overflow-hidden"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Background Image Overlay */}
                <div className="absolute inset-0 opacity-20">
                    <Image src="/laporan.png" alt="Hero Background" fill className="object-cover" />
                </div>

                {/* Logo */}
                <div className="absolute top-10 left-12 z-20 flex items-center gap-3">
                    <motion.div 
                        className="p-1 bg-white rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Image src="/logo.png" alt="Logo" width={32} height={32} />
                    </motion.div>
                    <span className="text-white font-bold text-xl hidden lg:block">Sipetak</span>
                </div>

                {/* Content Slider */}
                <div className="absolute inset-0 flex items-end px-12 pb-20 z-10">
                    <div className="max-w-xl">
                        <motion.h2
                            className="text-4xl font-bold text-white mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >   
                            Bergabunglah Bersama Kami
                        </motion.h2>
                        <motion.p
                            className="text-white"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >   
                            Daftarkan usaha Anda dan jadilah bagian dari ekosistem UMKM yang terintegrasi dan legal.
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Register Form */}
            <div className="flex-1 bg-white flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <motion.div 
                    className="w-full max-w-md"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Header */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            Buat Akun Baru
                        </h1>
                        <p className="text-gray-600">
                            Daftarkan usaha Anda sekarang
                        </p>
                    </motion.div>

                    {/* Error Alert */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                        >
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                        >
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-green-700">✅ Pendaftaran berhasil! Mengalihkan ke halaman login...</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Input Fields */}
                        <motion.div 
                            className="space-y-4 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <InputNama />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.55, duration: 0.5 }}
                            >
                                <InputNik />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <InputTelp />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.65, duration: 0.5 }}
                            >
                                <InputEmail />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                            >
                                <InputPw />
                            </motion.div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading || success}
                            className="w-full h-14 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mb-6 mt-6"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            whileHover={{ scale: (isLoading || success) ? 1 : 1.02 }}
                            whileTap={{ scale: (isLoading || success) ? 1 : 0.98 }}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mendaftarkan...
                                </>
                            ) : success ? (
                                <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Berhasil!
                                </>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </motion.button>

                        {/* Login Link */}
                        <motion.div 
                            className="text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1, duration: 0.5 }}
                        >
                            <p className="text-gray-600">
                                Sudah punya akun?{' '}
                                <Link 
                                    href="/masuk" 
                                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                >
                                    Masuk
                                </Link>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}