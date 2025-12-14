"use client";
import React from 'react';
import { CheckCircle } from '@phosphor-icons/react'; 

const navLinks = [
    { title: "Mengapa kami?", href: "#LandingQuots" },
    { title: "Tentang", href: "#LandHome" },
    { title: "Fitur", href: "#LandFitur" },
    { title: "Layanan", href: "#Layanan" },
];

export default function LandFooter() {

    return (
        <footer className="bg-black text-white py-16 md:py-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                    <div className="md:col-span-2">
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white mb-6">
                            Wujudkan Kota Tertib, <br />
                            <span className="text-gray-400">dengan Penataan UMKM yang Terpadu</span>
                        </h2>
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
                    <div className="text-sm text-gray-400 mt-6 md:mt-0">
                        <p>
                            SI PETAK membantu warga dan pemerintah dalam menata lokasi usaha dengan lebih teratur dan transparan.
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="text-3xl font-extrabold mb-6 md:mb-0">
                        SIPETAK
                    </div>
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
                <hr className="border-gray-800 my-10" />
                <div className="text-center text-xs text-gray-500">
                    Copyright © 2025 Universitas Siliwangi. all rights reserved
                </div>
            </div>
        </footer>
    );
}