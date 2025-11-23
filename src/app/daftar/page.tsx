"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
// Import semua komponen input
import InputPw from "@/components/common/inputpw";
import InputEmail from "@/components/common/inputemail";
import InputNama from "@/components/common/inputname";
import InputNik from "@/components/common/inputnik";
import InputTelp from "@/components/common/inputtelp";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        
        // 💡 1. MENGAMBIL DATA DARI SEMUA INPUT BERDASARKAN ATRIBUT NAME
        const namaPemilik = (form.elements.namedItem('nama') as HTMLInputElement).value;
        const nik = (form.elements.namedItem('nik') as HTMLInputElement).value;
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;

        // 💡 2. VALIDASI DASAR
        if (nik.length !== 16) {
            setError('NIK harus 16 digit.');
            setIsLoading(false);
            return;
        }

        try {
            const payload = { namaPemilik, email, nik, password, phone };
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('Pendaftaran berhasil! Silakan Masuk.');
                router.push('/masuk'); // Arahkan ke halaman masuk
            } else {
                setError(result.message || 'Pendaftaran gagal. Silakan coba lagi.');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan atau server.');
            console.error('Register error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed w-screen h-screen flex justify-center items-center gap-7">
            {/* Background Decor */}
            <div className="absolute w-[480px] h-[480px] bg-blue-500 opacity-30 rounded-full -top-44 -left-44"></div>
            <div className="absolute w-[500px] h-[500px] bg-blue-500 opacity-30 rounded-full -bottom-48 -right-48"></div>

            <div className="w-fit bg-white shadow-lg z-10 rounded-3xl py-8 px-14">
                <h1 className="text-4xl font-bold mb-2">Daftar</h1>
                <span className="text-base">Silahkan masukkan data anda!</span>

                {/* 💡 FORM LOGIC */}
                <form onSubmit={handleSubmit}>
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mt-4">{error}</div>}

                    <div className="flex flex-col justify-between gap-5 mt-10">
                        {/* PASTIKAN SETIAP KOMPONEN INPUT MEMILIKI NAME ATTRIBUTE YANG BENAR */}
                        <InputNama />
                        <InputNik />
                        <InputTelp />
                        <InputEmail />
                        <InputPw />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-80 h-11 bg-cyan-500 text-white border border-cyan-400 border-b-4 font-[600] text-[17px] overflow-hidden relative px-4 py-2 rounded-md hover:brightness-100 hover:border-t-4 hover:border-b active:opacity-75 outline-none duration-300 group active:scale-95 mt-14 disabled:opacity-50 disabled:cursor-wait"
                    >
                        <span className="w-full h-full bg-cyan-400 shadow-cyan-400 absolute -top-[150%] left-0 inline-flex rounded-md opacity-50 group-hover:top-[150%] duration-500 shadow-[0_0_10px_10px_rgba(0,0,0,0.3)]"></span>
                        {isLoading ? 'Mendaftarkan...' : 'Daftar'}
                    </button>
                </form>
            </div>
        </div>
    );
}