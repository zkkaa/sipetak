// File: app/beranda/page.tsx

"use client";
import React from 'react';
// Hapus import DashboardLayout atau BerandaLayout

import CarouselFeatured from '../../components/common/carousel'; 
import StatCard from '../../components/beranda/StatCard';
import SubmissionWidget from '../../components/beranda/SubmissionWidget';
import LocationListWidget from '../../components/beranda/LocationListWidget';
import { MapPin, Certificate, ListChecks, Package } from '@phosphor-icons/react';

// --- INTERFACES UNTUK DATA DUMMY (Opsional, tapi direkomendasikan) ---
interface CarouselItem { id: number; title: string; message: string; status: 'success' | 'warning' | 'info'; image?: string; }
interface StatItem { title: string; value: number; icon: React.ReactNode; color: 'blue' | 'green' | 'yellow' | 'red'; }
interface SubmissionItem { id: number; namaUsaha: string; emailPemohon: string; tanggal: string; status: 'Menunggu Verifikasi' | 'Ditolak' | 'Disurvei' | 'Selesai'; }
interface LocationItem { id: number; namaLokasi: string; izinStatus: 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan'; tanggalKedaluwarsa: string; }


export default function BerandaPage() {
    
    // 💡 SOLUSI: Definisikan semua variabel data dummy di dalam lingkup fungsi ini
    
    const carouselItems: CarouselItem[] = [
        { id: 1, title: "Aksi Prioritas!", message: "Ajukan Perizinan Lokasi Baru untuk usaha Anda.", status: 'warning', image: "/landhome.png" },
        { id: 2, title: "Sertifikat Aktif", message: "Sertifikat usaha Anda berlaku hingga akhir tahun ini.", status: 'success', image: "/login.png" },
        { id: 3, title: "Aksi damaikan dunia!", message: "Ajukan Perizinan Lokasi Baru untuk usaha Anda.", status: 'warning', image: "/umkm1.png" },
        { id: 4, title: "Sertifikat ini sudah pasti joss", message: "Sertifikat usaha Anda berlaku hingga akhir tahun ini.", status: 'success', image: "/umkm2.png" },
    ];

    const statData: StatItem[] = [
        { title: "Total Lokasi", value: 4, icon: <MapPin size={24} />, color: 'blue' },
        { title: "Sertifikat Aktif", value: 2, icon: <Certificate size={24} />, color: 'green' },
        { title: "Pengajuan Disurvei", value: 1, icon: <ListChecks size={24} />, color: 'yellow' },
    ];

    const submissionData: SubmissionItem[] = [
        { id: 1, namaUsaha: "Warung Kopi Senja", emailPemohon: "senja@mail.com", tanggal: "10/11/2025", status: 'Menunggu Verifikasi' },
        { id: 2, namaUsaha: "Toko Sembako Maju", emailPemohon: "maju@mail.com", tanggal: "05/11/2025", status: 'Disurvei' },
    ];

    const locationData: LocationItem[] = [
        { id: 1, namaLokasi: "Gerai Pusat, Jl. Cipto No. 12", izinStatus: 'Aktif', tanggalKedaluwarsa: "31/12/2026" },
        { id: 2, namaLokasi: "Cabang Pasar, Blok B-3", izinStatus: 'Kedaluwarsa', tanggalKedaluwarsa: "15/08/2025" },
    ];

    return (
        // Layout otomatis membungkus page.tsx, jadi kita tidak perlu <BerandaPageLayout> di sini.
        <div className="space-y-8">
            
            {/* Greeting Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Selamat Datang, CV. Sejahtera Abadi!</h1>
                <p className="text-gray-500 mt-1">Pusat kelola legalitas dan lokasi usaha Anda.</p>
            </div>

            {/* Grid Konten Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Kolom Kiri/Tengah (Utama: Carousel & Stat Cards) */}
                <div className="lg:col-span-2 space-y-8">
                    <CarouselFeatured items={carouselItems} autoScrollDelay={6} />

                    {/* Ringkasan Metrik Kunci (Stat Cards) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {statData.map((stat) => (
                            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
                        ))}
                    </div>
                    
                    {/* Riwayat Lokasi Usaha (Location List) */}
                    <LocationListWidget locations={locationData} />
                </div>

                {/* Kolom Kanan (Pengajuan Terbaru) */}
                <div className="lg:col-span-1">
                    <SubmissionWidget submissions={submissionData} />
                </div>
            </div>
        </div>
    );
}