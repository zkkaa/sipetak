// File: src/components/sidebar.tsx

"use client";
import React, { Dispatch, SetStateAction, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    { name: "Dashboard Utama", href: "/admin/beranda", Icon: House },
    { name: "Data Lokasi Usaha", href: "/admin/lokasi", Icon: MapPin },
    { name: "Laporan", href: "/admin/laporan", Icon: FileText },
    { name: "Manajemen Akun", href: "/admin/manajemenakun", Icon: Users },
    { name: "Verifikasi", href: "/admin/verifikasi", Icon: CheckCircle },
    { name: "Pengaturan", href: "/admin/settings", Icon: Gear, isAccount: true },
];

const umkmNavLinks: NavItem[] = [
    { name: "Dashboard Utama", href: "/umkm/beranda", Icon: House },
    { name: "Lokasi", href: "/umkm/lokasi", Icon: MapPin },
    { name: "Pengajuan", href: "/umkm/pengajuan", Icon: Building },
    { name: "Sertifikat", href: "/umkm/sertifikat", Icon: Certificate },
    { name: "Pengaturan", href: "/umkm/settings", Icon: Gear, isAccount: true },
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
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-60';
    const navLinks = userRole === "Admin" ? adminNavLinks : umkmNavLinks;
    const mainLinks = navLinks.filter(item => !item.isAccount);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Di Sidebar.tsx dan TopNav.tsx, update handleLogout:

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // ✅ Set user ke null di context
                setUser(null);
                // ✅ Redirec
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
        setIsProfileOpen(false);
        const settingsPath = userRole === "Admin" ? "/admin/settings" : "/umkm/settings";
        router.push(settingsPath);
    };

    return (
        <aside className={`hidden md:flex flex-col fixed top-0 left-0 h-screen ${sidebarWidth} bg-white border-r border-gray-200 shadow-xl z-30 transition-all duration-300 ease-in-out`}>

            {/* Tombol Buka/Tutup Sidebar */}
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

            {/* 3. Profil Pengguna (Bawah) */}
            <div className="border-t border-gray-200 p-4">
                <div ref={profileRef} className="relative">
                    {/* Profile Button */}
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        onMouseEnter={() => isCollapsed && setShowTooltip('profile')}
                        onMouseLeave={() => isCollapsed && setShowTooltip(null)}
                        title={isCollapsed ? userName : undefined}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 ${isProfileOpen
                                ? "bg-blue-100 text-blue-600"
                                : "text-gray-700 hover:bg-gray-100"
                            } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                    >
                        <div className={`flex items-center gap-3 ${isCollapsed ? '' : 'flex-1'}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {getInitials(userName)}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                                    <p className="text-xs text-gray-500 truncate line-clamp-1">{userEmail}</p>
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Tooltip untuk collapsed sidebar */}
                    {isCollapsed && showTooltip === 'profile' && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50 pointer-events-none top-1/2 -translate-y-1/2">
                            {userName}
                            <div className="absolute right-full mr-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                        </div>
                    )}

                    {/* Dropdown Menu - Sidebar terbuka */}
                    {isProfileOpen && !isCollapsed && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                            <button
                                onClick={handleSettings}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-sm"
                            >
                                <Gear size={16} />
                                <span>Pengaturan</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 text-sm border-t border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SignOut size={16} />
                                <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
                            </button>
                        </div>
                    )}

                    {/* Popup Menu - Sidebar tertutup */}
                    {isProfileOpen && isCollapsed && (
                        <div className="absolute left-full ml-3 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-max">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-800">{userName}</p>
                                <p className="text-xs text-gray-500">{userEmail}</p>
                            </div>
                            <button
                                onClick={handleSettings}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-sm"
                            >
                                <Gear size={16} />
                                <span>Pengaturan</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 text-sm border-t border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SignOut size={16} />
                                <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}