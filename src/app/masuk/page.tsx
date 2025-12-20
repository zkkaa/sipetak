"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useUser } from '@/app/context/UserContext';
import InputPw from "@/components/common/inputpw"; 
import InputEmail from "@/components/common/inputemail"; 
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const { user, setUser, loading } = useUser(); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && user) {
            const redirectPath = user.role === 'Admin' ? '/admin/beranda' : '/umkm/beranda';
            console.log('✅ User status change/Loaded. Redirecting to:', redirectPath);
            router.replace(redirectPath);
        }
    }, [user, loading, router]); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                
                setUser(result.user); 
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

    if (loading || user) {
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
                    <p className="text-gray-700 font-medium">
                        {loading ? 'Memuat sesi...' : 'Otentikasi berhasil, mengalihkan...'}
                    </p>
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
                            Sistem Penataan Tempat Usaha Kita
                        </motion.h2>
                        <motion.p
                            className="text-white"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >   
                            Mewujudkan ekosistem usaha mikro yang terintegrasi, legal, dan harmonis dengan ketertiban kota.
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
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
                            Selamat Datang Kembali!
                        </h1>
                        <p className="text-gray-600">
                            Masuk ke akun Anda
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

                    {/* PERBAIKAN: Gunakan <form> bukan <div> */}
                    <form onSubmit={handleSubmit}>
                        {/* Input Fields */}
                        <motion.div 
                            className="space-y-5 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <InputEmail />
                            </motion.div>
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <InputPw />
                            </motion.div>
                        </motion.div>

                        {/* Remember Me */}
                        <motion.div 
                            className="flex items-center mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            <input 
                                type="checkbox" 
                                id="remember" 
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                Remember Me
                            </label>
                        </motion.div>

                        {/* Submit Button - PERBAIKAN: type="submit" dan hapus onClick */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 mb-6"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memuat...
                                </>
                            ) : (
                                'Login'
                            )}
                        </motion.button>

                        {/* Sign Up Link */}
                        <motion.div 
                            className="text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.1, duration: 0.5 }}
                        >
                            <p className="text-gray-600">
                                Belum punya akun?{' '}
                                <Link 
                                    href="/daftar" 
                                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                >
                                    Segera Daftar
                                </Link>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}