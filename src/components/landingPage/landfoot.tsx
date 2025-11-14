"use client";
import React from 'react';
import { CheckCircle } from '@phosphor-icons/react'; // Ikon centang dari Phosphor

// Data Tautan Navigasi
const navLinks = [
    { title: "Mengapa kami?", href: "#about" },
    { title: "Tentang", href: "#about" },
    { title: "Fitur", href: "#features" },
    { title: "Layanan", href: "#complaint-cta" },
];

export default function LandFooter() {

    return (
        <footer className="bg-black text-white py-16 md:py-20">
            <div className="container mx-auto">
                
                {/* 1. HEADER FOOTER & DESKRIPSI (Grid 2 Kolom) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                    
                    {/* Kolom Kiri: Judul dan Poin */}
                    <div className="md:col-span-2">
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white mb-6">
                            Wujudkan Kota Tertib, <br />
                            <span className="text-gray-400">dengan Penataan UMKM yang Terpadu</span>
                        </h2>
                        
                        {/* Poin-poin Fitur */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-10 text-sm text-gray-400">
                            <div className="flex items-center">
                                <CheckCircle size={18} weight="fill" className="text-green-500 mr-2" />
                                <span>Terintegrasi dengan peta</span>
                            </div>
                            <div className="flex items-center">
                                <CheckCircle size={18} weight="fill" className="text-green-500 mr-2" />
                                <span>Mendukung pelaporan aspirasi warga</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Kolom Kanan: Deskripsi Singkat */}
                    <div className="text-sm text-gray-400 mt-6 md:mt-0">
                        <p>
                            SI PETAK membantu warga dan pemerintah dalam menata lokasi usaha dengan lebih teratur dan transparan.
                        </p>
                    </div>
                </div>
                

                {/* 2. NAVIGASI (Flexbox) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    
                    {/* Logo/Nama Proyek */}
                    <div className="text-3xl font-extrabold mb-6 md:mb-0">
                        SIPETAK
                    </div>
                    
                    {/* Tautan Navigasi */}
                    <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400 font-medium">
                        {navLinks.map((link, index) => (
                            <a 
                                key={index} 
                                href={link.href} 
                                className="hover:text-white transition duration-200"
                            >
                                {link.title}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Garis Pemisah untuk Hak Cipta */}
                <hr className="border-gray-800 my-10" />

                {/* 3. HAK CIPTA */}
                <div className="text-center text-xs text-gray-500">
                    Copyright © 2025 Universitas Siliwangi. all rights reserved
                </div>
            </div>
        </footer>
    );
}