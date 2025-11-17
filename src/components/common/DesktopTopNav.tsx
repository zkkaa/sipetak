// File: components/common/DesktopTopNav.tsx

import React from 'react';
import { Bell, UserCircle } from '@phosphor-icons/react';
import SearchField from './searchfile';

interface DesktopTopNavProps {
    userName: string;
    sidebarWidth: string; 
}

export default function DesktopTopNav({ userName, sidebarWidth }: DesktopTopNavProps) {
    return (
        <header 
            className={`fixes w-full top-0 h-16 bg-white border-b border-gray-200 z-20 transition-all duration-300 ease-in-out`}
            style={{ 
                left: sidebarWidth, 
                width: `calc(100% - ${sidebarWidth})` 
            }} 
        >
            <div className="flex justify-between items-center h-full px-6 w-full"> 
                
                {/* Item 1: Search Bar (DIREVISI: Tambahkan flex-grow, hapus w-96) */}
                {/* flex-grow akan memastikan elemen ini mengambil ruang kosong di tengah, 
                    mendorong elemen di sebelah kanan ke tepi. */}
                <div className="relative hidden lg:block mr-4 lg:w-96"> 
                    <SearchField /> 
                </div>

                {/* Item 2: Notifikasi & Profil */}
                <div className="flex items-center gap-4 flex-shrink-0">
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