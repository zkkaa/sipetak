"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    House, 
    MapPin, 
    CheckCircle, 
    FileText, 
    Users, 
    Building, 
    Certificate,
    Trash,
    X,
} from '@phosphor-icons/react';
import { useUser } from '@/app/context/UserContext';

interface MobileBottomNavProps {
    currentPath: string;
}

interface NavItem {
    name: string;
    href: string;
    Icon: React.ElementType;
    submenu?: SubMenuItem[];
}

interface SubMenuItem {
    name: string;
    href: string;
    Icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
    { name: "Beranda", href: "/admin/beranda", Icon: House },
    { name: "Lokasi", href: "/admin/datamaster", Icon: MapPin },
    { 
        name: "Verifikasi", 
        href: "/admin/verifikasi", 
        Icon: CheckCircle,
        submenu: [
            { name: "Lokasi Baru", href: "/admin/verifikasi/lokasi-baru", Icon: Building },
            { name: "Penghapusan", href: "/admin/verifikasi/penghapusan", Icon: Trash },
        ]
    },
    { name: "Laporan", href: "/admin/laporan", Icon: FileText },
    { name: "Akun", href: "/admin/manajemenakun", Icon: Users },
];

const umkmNavItems: NavItem[] = [
    { name: "Beranda", href: "/umkm/beranda", Icon: House },
    { name: "Lokasi", href: "/umkm/lokasi", Icon: MapPin },
    { name: "Pengajuan", href: "/umkm/pengajuan", Icon: Building },
    { name: "Sertifikat", href: "/umkm/sertifikat", Icon: Certificate },
];

export default function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
    const { user } = useUser();
    const [showSubmenu, setShowSubmenu] = useState(false);
    
    const navItems = user?.role === 'Admin' ? adminNavItems : umkmNavItems;

    const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
        if (item.submenu && item.submenu.length > 0) {
            e.preventDefault();
            setShowSubmenu(true);
        }
    };

    const verificationItem = navItems.find(item => item.submenu);

    return (
        <>
            <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex items-center justify-around z-40 md:hidden">
                {navItems.map((item) => {
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isActive = hasSubmenu && item.submenu
                        ? item.submenu.some(sub => currentPath === sub.href)
                        : currentPath === item.href || currentPath.startsWith(item.href);
                    const IconComponent = item.Icon;

                    return (
                        <Link
                            key={item.name}
                            href={hasSubmenu ? "#" : item.href}
                            onClick={(e) => handleNavClick(item, e)}
                            title={item.name}
                            className={`flex items-center justify-center p-3 transition-colors duration-200 ${
                                isActive
                                    ? "text-blue-600"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            <IconComponent 
                                size={24} 
                                weight={isActive ? "fill" : "regular"}
                            />
                        </Link>
                    );
                })}
            </nav>

            {showSubmenu && verificationItem && verificationItem.submenu && (
                <div className="fixed inset-0 bg-black/40 bg-opacity-50 z-50 md:hidden" onClick={() => setShowSubmenu(false)}>
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl pb-safe"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Verifikasi</h3>
                            <button 
                                onClick={() => setShowSubmenu(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {verificationItem.submenu.map((subItem) => {
                                const isSubActive = currentPath === subItem.href;
                                const SubIcon = subItem.Icon;
                                
                                return (
                                    <Link
                                        key={subItem.href}
                                        href={subItem.href}
                                        onClick={() => setShowSubmenu(false)}
                                        className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                                            isSubActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <SubIcon size={24} weight={isSubActive ? "fill" : "regular"} />
                                        <span className="font-medium">{subItem.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}