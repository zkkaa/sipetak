// File: utils/navData.tsx

import { House, MapPin, PlusCircle, Certificate, ListChecks, UserCircle, Users, Book } from '@phosphor-icons/react';

// Struktur untuk semua link
export interface NavItem {
    name: string;
    href: string;
    Icon: React.ElementType;
    roles: ('Admin' | 'UMKM')[]; // Peran mana yang dapat melihat link ini
    isAccount?: boolean;
}

export const allNavLinks: NavItem[] = [
    // --- UMKM & ADMIN ---
    { name: "Dashboard Utama", href: "/beranda", Icon: House, roles: ['UMKM'] },
    { name: "Settings Akun", href: "/beranda/settings", Icon: UserCircle, roles: ['UMKM', 'Admin'], isAccount: true }, 

    // --- UMKM KHUSUS ---
    { name: "Data Lokasi Usaha", href: "/beranda/lokasi", Icon: MapPin, roles: ['UMKM'] },
    { name: "Pengajuan Baru", href: "/beranda/pengajuan", Icon: PlusCircle, roles: ['UMKM'] },
    { name: "Sertifikat Usaha", href: "/beranda/sertifikat", Icon: Certificate, roles: ['UMKM'] },
    { name: "Riwayat Laporan", href: "/beranda/riwayat", Icon: ListChecks, roles: ['UMKM'] },
    
    // --- ADMIN KHUSUS ---
    { name: "Admin Dashboard", href: "/admin/beranda", Icon: House, roles: ['Admin'] },
    { name: "Manajemen Akun", href: "/admin/akun", Icon: Users, roles: ['Admin'] },
    { name: "Verifikasi Pengajuan", href: "/admin/verifikasi", Icon: Book, roles: ['Admin'] },
    { name: "Penertiban Laporan", href: "/admin/adminlaporan", Icon: ListChecks, roles: ['Admin'] },
    { name: "Data Lokasi Master", href: "/admin/datamaster", Icon: MapPin, roles: ['Admin'] },
];