"use client";
import React from 'react';
import { House, MapPin, Certificate, ListChecks, UserCircle } from '@phosphor-icons/react';
import Link from 'next/link';

interface NavItem {
    name: string;
    href: string;
    Icon: React.ElementType;
}

// 💡 Data Link Mobile Nav harus sesuai dengan Href dari Sidebar!
const mobileNavLinks: NavItem[] = [
    { name: "Dashboard", href: "/admin/beranda", Icon: House },
    { name: "Lokasi", href: "/admin/datamaster", Icon: MapPin }, // Menggunakan datalokasi
    { name: "Sertifikat", href: "/admin/sertifikat", Icon: Certificate },
    { name: "Laporan", href: "/admin/riwayat", Icon: ListChecks },
    { name: "Akun", href: "/admin/settings", Icon: UserCircle }, // Menggunakan settings
];

interface MobileBottomNavProps {
    currentPath: string; 
}

export default function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
            <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {mobileNavLinks.map((item) => {
                    
                    const isHome = item.href === '/beranda';
                    const isActive = isHome 
                        ? currentPath === '/beranda' 
                        : currentPath.startsWith(item.href); // Mencocokkan rute dan sub-rute
                    
                    const IconComponent = item.Icon;

                    return (
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className="flex flex-col items-center justify-center p-1 text-xs font-medium w-full text-center group"
                        >
                            <IconComponent 
                                size={24} 
                                weight={isActive ? "fill" : "regular"} 
                                className={isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500 transition-colors"} 
                            />
                            <span className={`mt-0.5 ${isActive ? "text-blue-600 font-semibold" : "text-gray-500 group-hover:text-blue-500 transition-colors"}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}