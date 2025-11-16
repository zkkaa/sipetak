// File: src/app/beranda/layout.tsx
"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
// Asumsi path yang benar
import Sidebar from '../../components/sidebar'; 
import MobileBottomNav from '../../components/mobilenav';
import DesktopTopNav from '../../components/common/DesktopTopNav'; 

// Asumsi Data User
const USER_DATA = {
    name: "CV. Sejahtera Abadi",
    role: "UMKM Terdaftar",
    sidebarCollapsedWidth: '80px', 
    sidebarExpandedWidth: '240px',
};

interface BerandaPageLayoutProps { // Mengubah nama interface
    children: React.ReactNode;
}

// 💡 Mengubah nama fungsi menjadi BerandaPageLayout
export default function BerandaPageLayout({ children }: BerandaPageLayoutProps) {
    const currentPath = usePathname() || '/beranda'; 
    
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const activeSidebarWidth = isSidebarCollapsed 
        ? USER_DATA.sidebarCollapsedWidth 
        : USER_DATA.sidebarExpandedWidth;

    return (
        <div className="bg-gray-50 min-h-screen">
            
            {/* 1. SIDEBAR (Desktop Left) */}
            <Sidebar 
                currentPath={currentPath}
                userName={USER_DATA.name}
                userRole={USER_DATA.role}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed} 
            />
            
            {/* 2. TOP NAVIGATION (Desktop Top) */}
            <DesktopTopNav 
                userName={USER_DATA.name}
                sidebarWidth={activeSidebarWidth}
            />

            {/* 3. KONTEN UTAMA */}
            <main 
                className={`transition-all duration-300 ease-in-out p-4 md:p-6 lg:p-8 pt-20 md:pt-24`} 
                style={{ marginLeft: activeSidebarWidth }} 
            >
                {children}
            </main>

            {/* 4. BOTTOM NAVIGATION (Mobile Bottom) */}
            <MobileBottomNav currentPath={currentPath} />

            {/* Tambahan padding bawah untuk mobile */}
            <div className="h-16 md:hidden"></div> 
        </div>
    );
}