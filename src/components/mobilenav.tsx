// File: src/components/MobileBottomNav.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { 
    House, 
    MapPin, 
    CheckCircle, 
    FileText, 
    Users, 
    Building, 
    Certificate, 
    IdentificationCard 
} from '@phosphor-icons/react';
import { useUser } from '@/app/context/UserContext';

interface MobileBottomNavProps {
    currentPath: string;
}

interface NavItem {
    name: string;
    href: string;
    Icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
    { name: "Beranda", href: "/admin/beranda", Icon: House },
    { name: "Lokasi", href: "/admin/lokasi", Icon: MapPin },
    { name: "Verifikasi", href: "/admin/verifikasi", Icon: CheckCircle },
    { name: "Laporan", href: "/admin/laporan", Icon: FileText },
    { name: "Akun", href: "/admin/manajemenakun", Icon: Users },
];

const umkmNavItems: NavItem[] = [
    { name: "Beranda", href: "/umkm/beranda", Icon: House },
    { name: "Lokasi", href: "/umkm/lokasi", Icon: MapPin },
    { name: "Pengajuan", href: "/umkm/pengajuan", Icon: Building },
    { name: "Sertifikat", href: "/umkm/sertifikat", Icon: Certificate },
    { name: "Identitas", href: "/umkm/identitas", Icon: IdentificationCard },
];

export default function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
    const { user } = useUser();
    
    // Pilih nav items berdasarkan role
    const navItems = user?.role === 'Admin' ? adminNavItems : umkmNavItems;

    return (
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-200 flex items-center justify-around z-40 md:hidden">
            {navItems.map((item) => {
                // Cek apakah route aktif
                const isActive = currentPath === item.href || currentPath.startsWith(item.href);
                const IconComponent = item.Icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
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
    );
}