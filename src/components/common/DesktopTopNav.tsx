// File: components/common/DesktopTopNav.tsx

import React from 'react';
import { Bell, MagnifyingGlass, UserCircle } from '@phosphor-icons/react';

interface DesktopTopNavProps {
    userName: string;
    // Menggunakan string untuk lebar (misal: '80px' atau '240px')
    sidebarWidth: string; 
}

export default function DesktopTopNav({ userName, sidebarWidth }: DesktopTopNavProps) {
    return (
        // 💡 SOLUSI: Menggunakan LEFT untuk mengatur posisi awal agar Top Nav mengikuti Sidebar
        <header 
            className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-20 transition-all duration-300 ease-in-out`}
            // style={{ width: `calc(100% - ${sidebarWidth})` }} -- Hapus ini
            style={{ left: sidebarWidth }} // Mengatur posisi awal Top Nav
        >
            <div className="flex justify-between items-center h-full px-6">
                
                {/* Bagian Kiri: Search Bar */}
                <div className="relative hidden lg:block w-96">
                    <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input  
                        type="text" 
                        placeholder="Cari lokasi, sertifikat, atau panduan..." 
                        className="border p-2 pl-10 rounded-full w-full bg-gray-100 outline-none focus:border-blue-400 focus:bg-white transition" 
                    />
                </div>

                {/* Bagian Kanan: Notifikasi & Profil */}
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition">
                        <Bell size={24} />
                    </button>
                    <div className="flex items-center gap-2 border-l pl-4">
                        <UserCircle size={32} weight="fill" className="text-blue-500" />
                        <span className="font-semibold text-sm text-gray-700 hidden sm:block truncate max-w-[120px]">
                            {userName}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}