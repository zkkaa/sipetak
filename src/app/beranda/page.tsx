"use client";
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/sidebar';
import MobileBottomNav from '../../components/mobilenav';
import DesktopTopNav from '../../components/common/DesktopTopNav';

// Asumsi Data User (Nanti bisa diganti dengan data otentikasi)
const USER_DATA = {
    name: "CV. Sejahtera Abadi",
    role: "UMKM Terdaftar",
    // Gunakan lebar sidebar yang sama dengan yang didefinisikan di Sidebar.tsx
    sidebarCollapsedWidth: '80px', // w-20
    sidebarExpandedWidth: '240px', // w-60
};

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function BerandaLayout({ children }: DashboardLayoutProps) {
    const currentPath = usePathname() || '/beranda';
    
    // State yang mengontrol sidebar (Harus sama dengan state di Sidebar.tsx)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Hitung lebar sidebar yang sedang aktif
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
                // Catatan: Anda perlu menambahkan prop isCollapsed dan setIsCollapsed ke Sidebar.tsx
            />
            
            {/* 2. TOP NAVIGATION (Desktop Top) */}
            <DesktopTopNav 
                userName={USER_DATA.name}
                sidebarWidth={activeSidebarWidth}
            />

            {/* 3. KONTEN UTAMA */}
            <main 
                // Konten dimulai setelah Sidebar dan Top Nav
                className={`transition-all duration-300 ease-in-out p-4 md:p-6 lg:p-8 pt-20 md:pt-24`} 
                // Padding kiri di desktop harus mengimbangi lebar sidebar
                style={{ marginLeft: activeSidebarWidth }} 
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