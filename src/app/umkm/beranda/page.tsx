// File: app/umkm/beranda/page.tsx

"use client";
import React from 'react';
import AdminLayout from '../../../components/adminlayout';
import CarouselFeatured from '@/components/common/carousel'; 
import StatCard from '../../../components/admin/beranda/StatCard';
import { MapPin, Certificate, ListChecks } from '@phosphor-icons/react';
import { FeaturedStatsWidget, SimpleCalendar } from '../../../components/umkm/beranda/widgetcalender';

// --- DATA DUMMY UNTUK UMKM ---
const USER_NAME = "Salmiaw";

const carouselItems = [
    { id: 1, title: "Selamat Datang!", message: `Halo ${USER_NAME}, selalu cek status izin Anda di sini.`, status: 'info' as const },
    { id: 2, title: "Izin Akan Kedaluwarsa", message: "Sertifikat Cabang Pasar Wetan akan habis dalam 30 hari.", status: 'warning' as const },
    { id: 3, title: "Pengajuan Diterima!", message: "Pengajuan kios Bundaran Anda telah disetujui Admin.", status: 'success' as const },
    { id: 4, title: "Pusat Panduan", message: "Pelajari cara mengajukan lokasi baru yang cepat dan benar.", status: 'info' as const },
];

const statData = [
    { title: "Total Lokasi Saya", value: 3, icon: <MapPin size={24} />, color: 'blue' as const },
    { title: "Sertifikat Aktif", value: 2, icon: <Certificate size={24} />, color: 'green' as const },
    { title: "Pengajuan Berjalan", value: 1, icon: <ListChecks size={24} />, color: 'yellow' as const },
];

export default function UMKMDashboardPage() {
    return (
        <AdminLayout>
            <div className="space-y-8">
                
                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Selamat Datang, {USER_NAME}!</h1>
                    <p className="text-gray-500 mt-1">Kelola data usaha dan legalitas Anda.</p>
                </div>

                {/* GRID KONTEN UTAMA */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* KOLOM KIRI: STAT CARDS & CAROUSEL (3/5 Lebar) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {statData.map((stat) => (
                                <StatCard 
                                    key={stat.title} 
                                    title={stat.title} 
                                    value={stat.value} 
                                    icon={stat.icon} 
                                    color={stat.color} 
                                />
                            ))}
                        </div>
                        
                        {/* Carousel */}
                        <CarouselFeatured items={carouselItems} autoScrollDelay={6} />
                    </div>

                    {/* KOLOM KANAN: WIDGETS & CALENDAR (2/5 Lebar) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Featured Stats Widget - 3 Box Layout */}
                        <FeaturedStatsWidget />
                        
                        {/* Calendar Read-Only Real-Time */}
                        <SimpleCalendar />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}