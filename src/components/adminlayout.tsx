// "use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
// Asumsi path yang benar
import Sidebar from './sidebar'; 
import MobileBottomNav from './mobilenav';
import DesktopTopNav from './common/DesktopTopNav'; 
import { Bell, UserCircle } from '@phosphor-icons/react'; // Untuk Mobile Header

// Asumsi Data User
const USER_DATA = {
    name: "CV. Sejahtera Abadi",
    role: "UMKM Terdaftar",
    sidebarCollapsedWidth: '80px', 
    sidebarExpandedWidth: '240px',
};

interface BerandaPageLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: BerandaPageLayoutProps) {
    const currentPath = usePathname() || '/beranda'; 
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Tentukan class margin untuk desktop
    const desktopMarginClass = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60';

    return (
        <div className="bg-gray-50 min-h-screen">
            
            {/* 1. SIDEBAR (Desktop Left) - Disembunyikan di mobile */}
            <Sidebar 
                currentPath={currentPath}
                userName={USER_DATA.name}
                userRole={USER_DATA.role}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed} 
                // Asumsi Sidebar memiliki class 'fixed md:block'
            />
            
            {/* 2a. Desktop Top Nav (Hanya untuk Desktop) */}
            <div className={`hidden md:block transition-all duration-300 ease-in-out ${desktopMarginClass}`}>
                {/* 💡 Perbaikan: Tambahkan margin dinamis di sini juga */}
                <DesktopTopNav 
                    userName={USER_DATA.name}
                    // sidebarWidth={isSidebarCollapsed ? USER_DATA.sidebarCollapsedWidth : USER_DATA.sidebarExpandedWidth}

                    isSidebarCollapsed={isSidebarCollapsed}
                />
            </div>
            
            {/* 2b. Mobile Header (Hanya untuk Mobile) */}
            <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-20 flex items-center justify-between px-4 md:hidden">
                <span className="text-xl font-bold text-gray-800">SIPETAK</span>
                <div className="flex items-center gap-3">
                    <button aria-label="Notifikasi" className="text-gray-600 hover:text-gray-800">
                        <Bell size={24} />
                    </button>
                    <UserCircle size={32} weight="fill" className="text-blue-500" />
                </div>
            </header>


            {/* 3. KONTEN UTAMA */}
            <main 
                // 💡 PENTING: Gunakan variabel desktopMarginClass yang sama untuk DRY (Don't Repeat Yourself)
                className={`transition-all duration-300 ease-in-out p-4 md:p-6 lg:p-8 pt-20 md:pt-24 ${desktopMarginClass}`}
            >
                
                {children}
            </main>

            {/* 4. BOTTOM NAVIGATION (Mobile Bottom) */}
            <MobileBottomNav currentPath={currentPath} />

            {/* Tambahan padding bawah untuk mobile agar tidak tertutup bottom nav */}
            <div className="h-16 md:hidden"></div> 
        </div>
    );
}