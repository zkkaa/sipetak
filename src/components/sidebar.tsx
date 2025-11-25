// File: src/components/sidebar.tsx

"use client";
import React, { Dispatch, SetStateAction, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    House,
    MapPin,
    CheckCircle,
    FileText,
    Users,
    Gear,
    SignOut,
    Building,
    Certificate,
    Warning,
} from '@phosphor-icons/react';
import ToggleSidebarButton from './common/ToggleSidebarButton';
import { useUser } from '@/app/context/UserContext';

interface NavItem {
    name: string;
    href: string;
    Icon: React.ElementType;
    isAccount?: boolean;
}

const adminNavLinks: NavItem[] = [
    { name: "Dashboard", href: "/admin/beranda", Icon: House },
    { name: "Data Lokasi Usaha", href: "/admin/datamaster", Icon: MapPin },
    { name: "Laporan", href: "/admin/laporan", Icon: FileText },
    { name: "Manajemen Akun", href: "/admin/manajemenakun", Icon: Users },
    { name: "Verifikasi", href: "/admin/verifikasi", Icon: CheckCircle },
    { name: "Pengaturan", href: "/admin/settings", Icon: Gear, isAccount: true },
];

const umkmNavLinks: NavItem[] = [
    { name: "Dashboard", href: "/umkm/beranda", Icon: House },
    { name: "Lokasi", href: "/umkm/lokasi", Icon: MapPin },
    { name: "Pengajuan", href: "/umkm/pengajuan", Icon: Building },
    { name: "Sertifikat", href: "/umkm/sertifikat", Icon: Certificate },
];

interface SidebarProps {
    currentPath: string;
    userName: string;
    userEmail: string;
    userRole: "Admin" | "UMKM";
    isCollapsed: boolean;
    setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({
    currentPath,
    userName,
    userEmail,
    userRole,
    isCollapsed,
    setIsCollapsed
}: SidebarProps) {
    const router = useRouter();
    const { setUser } = useUser();
    const [showTooltip, setShowTooltip] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-60';
    const navLinks = userRole === "Admin" ? adminNavLinks : umkmNavLinks;
    const mainLinks = navLinks.filter(item => !item.isAccount);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                router.replace('/masuk');
            } else {
                alert('Gagal logout. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Terjadi kesalahan saat logout.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleSettings = () => {
        const settingsPath = userRole === "Admin" ? "/admin/settings" : "/umkm/settings";
        router.push(settingsPath);
    };

    const handleReport = () => {
        router.push('/laporan');
    };

    return (
        <aside className={`hidden md:flex flex-col fixed top-0 left-0 h-screen ${sidebarWidth} bg-white border-r border-gray-200 shadow-xl z-30 transition-all duration-300 ease-in-out`}>

            {/* Tombol Buka/Tutup Sidebar */}
            <ToggleSidebarButton
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            {/* 1. Header (Logo SIPETAK) */}
            <div className="h-16 flex items-center justify-center border-b border-gray-200 overflow-hidden px-4">
                {isCollapsed ? (
                    <Image 
                        src='/logo.png' 
                        alt='SIPETAK Logo' 
                        width={32} 
                        height={32} 
                        className='w-8 h-8 object-contain'
                    />
                ) : (
                    <div className="flex items-center gap-3">
                        <Image 
                            src='/logo.png' 
                            alt='SIPETAK Logo' 
                            width={32} 
                            height={32} 
                            className='w-8 h-8 object-contain'
                        />
                        <span className="text-2xl font-bold text-gray-800">
                            SIPETAK
                        </span>
                    </div>
                )}
            </div>

            {/* 2. Menu Navigasi Utama */}
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {mainLinks.map((item) => {
                    const isActive = currentPath === item.href || (item.href !== mainLinks[0].href && currentPath.startsWith(item.href));
                    const IconComponent = item.Icon;

                    return (
                        <div key={item.name} className="relative group">
                            <Link
                                href={item.href}
                                title={isCollapsed ? item.name : undefined}
                                onMouseEnter={() => isCollapsed && setShowTooltip(item.name)}
                                onMouseLeave={() => setShowTooltip(null)}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ${isActive
                                    ? "bg-blue-100 text-blue-600 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                                    } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                            >
                                <IconComponent size={20} weight={isActive ? "fill" : "regular"} />
                                {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
                            </Link>

                            {/* Tooltip untuk collapsed sidebar */}
                            {isCollapsed && showTooltip === item.name && (
                                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none top-1/2 -translate-y-1/2">
                                    {item.name}
                                    <div className="absolute right-full mr-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* 3. Menu Bawah (Settings, Laporan, Logout) */}
            <div className="border-t border-gray-200">
                <nav className="p-4 space-y-1">
                    <div className="relative group">
                        <button
                            onClick={handleSettings}
                            onMouseEnter={() => isCollapsed && setShowTooltip('settings')}
                            onMouseLeave={() => setShowTooltip(null)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                        >
                            <Gear size={20} />
                            {!isCollapsed && <span className="text-sm whitespace-nowrap cursor-po">Pengaturan</span>}
                        </button>

                        {isCollapsed && showTooltip === 'settings' && (
                            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none top-1/2 -translate-y-1/2">
                                Pengaturan
                                <div className="absolute right-full mr-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                            </div>
                        )}
                    </div>

                    {/* Laporan Button (hanya untuk UMKM) */}
                    {userRole === "UMKM" && (
                        <div className="relative group">
                            <button
                                onClick={handleReport}
                                onMouseEnter={() => isCollapsed && setShowTooltip('laporan')}
                                onMouseLeave={() => setShowTooltip(null)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                            >
                                <Warning size={20} />
                                {!isCollapsed && <span className="text-sm whitespace-nowrap">Laporan</span>}
                            </button>

                            {/* Tooltip untuk Laporan */}
                            {isCollapsed && showTooltip === 'laporan' && (
                                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none top-1/2 -translate-y-1/2">
                                    Laporan
                                    <div className="absolute right-full mr-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Logout Button */}
                    <div className="relative group">
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            onMouseEnter={() => isCollapsed && setShowTooltip('logout')}
                            onMouseLeave={() => setShowTooltip(null)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                        >
                            <SignOut size={20} />
                            {!isCollapsed && <span className="text-sm whitespace-nowrap">{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>}
                        </button>

                        {/* Tooltip untuk Logout */}
                        {isCollapsed && showTooltip === 'logout' && (
                            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none top-1/2 -translate-y-1/2">
                                {isLoggingOut ? 'Keluar...' : 'Keluar'}
                                <div className="absolute right-full mr-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    );
}