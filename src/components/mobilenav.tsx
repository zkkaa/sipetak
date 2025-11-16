"use client";
import React from 'react';
import { House, MapPin, Certificate, ListChecks, UserCircle } from '@phosphor-icons/react';
import Link from 'next/link';

interface NavItem {
    name: string;
    href: string;
    Icon: React.ElementType;
}

const mobileNavLinks: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", Icon: House },
    { name: "Lokasi", href: "/dashboard/lokasi", Icon: MapPin },
    { name: "Sertifikat", href: "/dashboard/sertifikat", Icon: Certificate },
    { name: "Laporan", href: "/dashboard/riwayat", Icon: ListChecks },
    { name: "Akun", href: "/dashboard/akun", Icon: UserCircle },
];

// Asumsi pathName datang dari usePathname()
interface MobileBottomNavProps {
    currentPath: string; 
}

export default function MobileBottomNav({ currentPath }: MobileBottomNavProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
            <nav className="flex justify-around items-center h-16 max-w-lg mx-auto">
                {mobileNavLinks.map((item) => {
                    const isActive = currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href));
                    const IconComponent = item.Icon;

                    return (
                        <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center p-1 text-xs font-medium w-full text-center">
                            <IconComponent size={24} weight={isActive ? "fill" : "regular"} className={isActive ? "text-blue-600" : "text-gray-500"} />
                            <span className={`mt-0.5 ${isActive ? "text-blue-600" : "text-gray-500"}`}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}