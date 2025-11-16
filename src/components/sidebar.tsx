// File: components/sidebar/Sidebar.tsx

"use client";
import React, { useState, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { House, MapPin, PlusCircle, Certificate, ListChecks, UserCircle } from '@phosphor-icons/react';
// Asumsi path ini benar
import ToggleSidebarButton from './common/ToggleSidebarButton'; 

interface NavItem {
    name: string;
    href: string;
    Icon: React.ElementType;
    isAccount?: boolean;
}

const desktopNavLinks: NavItem[] = [
    { name: "Dashboard Utama", href: "/beranda", Icon: House }, // Menggunakan /beranda
    { name: "Data Lokasi Usaha", href: "/beranda/lokasi", Icon: MapPin },
    { name: "Pengajuan Baru", href: "/beranda/pengajuan", Icon: PlusCircle },
    { name: "Sertifikat Usaha", href: "/beranda/sertifikat", Icon: Certificate },
    { name: "Riwayat Laporan", href: "/beranda/riwayat", Icon: ListChecks },
    { name: "Settings Akun", href: "/beranda/settings", Icon: UserCircle, isAccount: true }, 
];

// 💡 PERBAIKAN: Tambahkan tipe untuk state collapse
interface SidebarProps {
    currentPath: string;
    userName: string;
    userRole: string;
    isCollapsed: boolean; 
    setIsCollapsed: Dispatch<SetStateAction<boolean>>; 
}

export default function Sidebar({ currentPath, userName, userRole, isCollapsed, setIsCollapsed }: SidebarProps) {
    // 💡 Hapus: const [isCollapsed, setIsCollapsed] = useState(false);

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-60';

    const accountLink = desktopNavLinks.find(item => item.isAccount);
    const mainLinks = desktopNavLinks.filter(item => !item.isAccount);

    // ... (handleLogout dihapus atau dipindahkan ke Settings Page)

    return (
        <aside className={`hidden md:flex flex-col fixed top-0 left-0 h-screen ${sidebarWidth} bg-white border-r border-gray-200 shadow-xl z-30 transition-all duration-300 ease-in-out`}>
            
            {/* 💡 Tombol Buka/Tutup Sidebar (menggunakan prop setIsCollapsed) */}
            <ToggleSidebarButton 
                isCollapsed={isCollapsed} 
                toggleCollapse={() => setIsCollapsed(!isCollapsed)} 
            />

            {/* 1. Header (Logo SIPETAK / S) */}
            <div className="h-16 flex items-center justify-center border-b border-gray-200 overflow-hidden">
                <span className="text-2xl font-bold text-gray-800 transition-opacity duration-300">
                    {isCollapsed ? "S" : "SIPETAK"}
                </span>
            </div>

            {/* 2. Menu Navigasi Utama */}
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                {mainLinks.map((item) => {
                    const isActive = currentPath === item.href || (item.href !== "/beranda" && currentPath.startsWith(item.href));
                    const IconComponent = item.Icon;
                    
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ${
                                isActive 
                                    ? "bg-blue-100 text-blue-600 font-semibold" 
                                    : "text-gray-700 hover:bg-gray-100"
                            } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                        >
                            <IconComponent size={20} weight={isActive ? "fill" : "regular"} />
                            {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* 3. Profil Pengguna (Bawah) - Settings Akun */}
            {accountLink && (
                <div className="p-4 border-t border-gray-200">
                    <Link 
                        href={accountLink.href}
                        title={isCollapsed ? accountLink.name : undefined}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ${
                            currentPath.startsWith(accountLink.href) 
                                ? "bg-blue-100 text-blue-600 font-semibold" 
                                : "text-gray-700 hover:bg-gray-100"
                        } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                    >
                        <accountLink.Icon size={20} weight={currentPath.startsWith(accountLink.href) ? "fill" : "regular"} />
                        {!isCollapsed && <span className="text-sm whitespace-nowrap">{accountLink.name}</span>}
                    </Link>
                    
                    {!isCollapsed && (
                        <div className="mt-3 p-2 text-center border-t border-gray-100 pt-3">
                            <p className="text-sm font-semibold text-gray-800 truncate" title={userName}>{userName}</p>
                            <p className="text-xs text-gray-500">{userRole}</p>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}