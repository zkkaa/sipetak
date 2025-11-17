// File: app/beranda/page.tsx (Jika Anda menggunakan /beranda untuk Admin)

"use client";
import React from 'react';

// Menggunakan tipe yang didefinisikan kembali di sini untuk demo fix (Anda harus mengimpornya)
interface CarouselItem { id: number; title: string; message: string; status: 'success' | 'warning' | 'info'; image?: string; }
interface StatItem { title: string; value: number; icon: React.ReactNode; color: 'blue' | 'green' | 'yellow' | 'red'; }
interface SubmissionItem { id: number; namaUsaha: string; emailPemohon: string; tanggal: string; status: 'Diajukan' | 'Diterima' | 'Ditolak'; }
interface CitizenReport { id: number; jenisPelanggaran: string; tanggalLapor: string; status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai'; }

import CarouselFeatured from '../../../components/common/carousel'; 
import StatCard from '../../../components/admin/beranda/StatCard';
import SubmissionWidget from '../../../components/admin/beranda/SubmissionWidget';
import CitizenReportWidget from '../../../components/admin/beranda/widgetreport'; // 💡 IMPORT BARU
import { MapPin, Certificate, ListChecks, Users, Book } from '@phosphor-icons/react'; // Ikon Admin

export default function AdminBerandaPage() {
    
    // 💡 SOLUSI: DEFINISI DATA DUMMY ADMIN
    
    const carouselItems: CarouselItem[] = [
        { id: 1, title: "Aksi Prioritas!", message: "Ajukan Perizinan Lokasi Baru untuk usaha Anda.", status: 'warning', image: "/umkm1.png" },
        { id: 2, title: "Sertifikat Aktif", message: "Sertifikat usaha Anda berlaku hingga akhir tahun ini.", status: 'info', image: "/umkm2.png" },
        { id: 3, title: "Aksi damaikan dunia!", message: "Ajukan Perizinan Lokasi Baru untuk usaha Anda.", status: 'warning', image: "/umkm1.png" },
        { id: 4, title: "Sertifikat ini sudah pasti joss", message: "Sertifikat usaha Anda berlaku hingga akhir tahun ini.", status: 'success', image: "/umkm2.png" },
    ];

    const statData: StatItem[] = [
        { title: "Titik Lokasi Tersedia", value: 450, icon: <MapPin size={24} />, color: 'blue' }, 
        { title: "Sertifikat Aktif", value: 875, icon: <Certificate size={24} />, color: 'green' },
        { title: "Pengajuan Lokasi Baru", value: 12, icon: <Book size={24} />, color: 'red' }, 
    ];

    const submissionData: SubmissionItem[] = [
        // 💡 Status disesuaikan: Diajukan, Diterima, Ditolak
        { id: 1, namaUsaha: "Warung Kopi Senja", emailPemohon: "senja@mail.com", tanggal: "17/11/2025", status: 'Diajukan' },
        { id: 2, namaUsaha: "Toko Sembako Maju", emailPemohon: "maju@mail.com", tanggal: "16/11/2025", status: 'Diterima' },
        { id: 3, namaUsaha: "Jasa Servis Mobil", emailPemohon: "servis@mail.com", tanggal: "15/11/2025", status: 'Ditolak' },
    ];

    const citizenReports: CitizenReport[] = [
        // 💡 Data Laporan Warga Terbaru
        { id: 1, jenisPelanggaran: "Menempati Trotoar (Jl. Merdeka)", tanggalLapor: "17/11/2025", status: 'Belum Diperiksa' },
        { id: 2, jenisPelanggaran: "Buang Limbah Sembarangan", tanggalLapor: "16/11/2025", status: 'Sedang Diproses' },
    ];


    return (
        <div className="space-y-8">
            <div className="mb-6 md:mt-16">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back, [Nama Admin]!</h1> 
                <p className="text-gray-500 mt-1">Pusat Pengelolaan Data Tata Ruang UMKM.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-8">
                    <CarouselFeatured items={carouselItems} autoScrollDelay={6} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {statData.map((stat) => (
                            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
                        ))}
                    </div>
                    
                    {/* 💡 REVISI: Ganti Riwayat Lokasi dengan Laporan Warga */}
                    <CitizenReportWidget reports={citizenReports} /> 
                </div>

                <div className="lg:col-span-1">
                    <SubmissionWidget submissions={submissionData} />
                </div>
            </div>
        </div>
    );
}