"use client";
import React, { useState } from 'react';
import { Certificate, WarningCircle, MagnifyingGlass } from '@phosphor-icons/react';

// Asumsi path layout yang benar di dalam route group /umkm
import AdminLayout from '../../../components/adminlayout'; 
import CertificateTable from '../../../components/umkm/sertifikat/CertificateTable'; 
import CertificateViewerModal from '@/components/umkm/sertifikat/CertificateViewerModal';

// --- INTERFACE DAN DATA DUMMY ---
interface CertificateItem {
    id: number;
    nomorSertifikat: string;
    namaUsaha: string;
    tanggalTerbit: string;
    tanggalKedaluwarsa: string;
    status: 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan';
    unduhLink: string;
    // 💡 TAMBAHAN: Properties yang hilang agar sinkron
    namaPemilik: string; // HARUS ADA
    lokasiLapak: string;
}



const DUMMY_CERTIFICATES: CertificateItem[] = [
    { id: 1, nomorSertifikat: 'SIPETAK-001/2025', namaUsaha: 'Warung Kopi Senja', tanggalTerbit: '2025-01-01', tanggalKedaluwarsa: '2026-01-01', status: 'Aktif', unduhLink: '#', namaPemilik: 'Muhammad Azka', lokasiLapak: 'BLOK EXAMPLE' },
    { id: 2, nomorSertifikat: 'SIPETAK-002/2024', namaUsaha: 'Toko Roti Manis', tanggalTerbit: '2024-05-15', tanggalKedaluwarsa: '2025-05-15', status: 'Kedaluwarsa', unduhLink: '#', namaPemilik: 'Kevin Pratama', lokasiLapak: 'Kios B-3 Pasar' },
    { id: 3, nomorSertifikat: 'SIPETAK-003/2025', namaUsaha: 'Bakery Lezat', tanggalTerbit: '2025-10-20', tanggalKedaluwarsa: '2026-10-20', status: 'Aktif', unduhLink: '#', namaPemilik: 'Siti Aminah', lokasiLapak: 'Kios C-7 Pasar' },
];


export default function CertificatePage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [certificates, setCertificates] = useState<CertificateItem[]>(DUMMY_CERTIFICATES);
    const [viewingCertificate, setViewingCertificate] = useState<CertificateItem | null>(null); // 💡 State View Modal
    const [searchTerm, setSearchTerm] = useState('');
    

    const handleDownload = (link: string, nomor: string) => {
        alert(`Simulasi unduh sertifikat ${nomor}. Link: ${link}`);
        // Di sini Anda akan menggunakan window.open(link) atau API download
    };

    const handleView = (cert: CertificateItem) => {
        setViewingCertificate(cert);
    };

    const filteredCertificates = certificates.filter(cert => 
        cert.namaUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.nomorSertifikat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                
                {/* Header Halaman */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Certificate size={32} weight="fill" className="text-blue-500" /> Sertifikat Usaha
                    </h1>
                    <p className="text-gray-500 mt-1">Akses dan unduh sertifikat legalitas usaha Anda.</p>
                </header>

                <div className="flex justify-end bg-white p-4 rounded-xl shadow-md">
                    <div className="relative w-full md:w-80">
                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input  
                            type="text" 
                            placeholder="Cari nama usaha atau nomor sertifikat..." 
                            className="border p-2 pl-10 rounded-lg w-full outline-none focus:border-blue-400" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabel Daftar Sertifikat */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <CertificateTable 
                        certificates={filteredCertificates} 
                        onView={handleView} // 💡 TERUSKAN HANDLER VIEW
                    />
                </div>

                {/* 💡 RENDER MODAL VIEWER */}
                {viewingCertificate && (
                    <CertificateViewerModal
                        certificate={viewingCertificate}
                        onClose={() => setViewingCertificate(null)}
                        onDownload={handleDownload}
                    />
                )}
                
                {/* 💡 Widget Informasi Tambahan (Opsional) */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
                    <WarningCircle size={32} className="text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                        Sertifikat yang telah kedaluwarsa (Merah) harus segera diajukan perpanjangan melalui laman Pengajuan.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}