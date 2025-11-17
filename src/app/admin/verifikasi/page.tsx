"use client";
import React, { useState } from 'react';
import { Book, FileText } from '@phosphor-icons/react';
import AdminPageLayout from '../../../components/adminlayout'; // Asumsi path layout Admin
import SubmissionTable from '../../../components/admin/verifikasi/SubmissionTable';
import VerificationModal from '../../../components/admin/verifikasi/VerificationModal';

// --- INTERFACE DAN DATA DUMMY ---
// Status yang disepakati: Diajukan, Diterima, Ditolak
interface Submission {
    id: number;
    namaUsaha: string;
    emailPemohon: string;
    tanggalPengajuan: string;
    jenis: 'Lokasi Baru' | 'Sertifikat'; // Jenis pengajuan
    status: 'Diajukan' | 'Diterima' | 'Ditolak';
    // Detail tambahan yang akan ditampilkan di Modal
    lokasiDetail: string; 
    dokumenUrl: string;
}

const DUMMY_SUBMISSIONS: Submission[] = [
    { id: 1, namaUsaha: "Warung Kopi Senja", emailPemohon: "senja@mail.com", tanggalPengajuan: "2025-11-17", jenis: 'Lokasi Baru', status: 'Diajukan', lokasiDetail: "Jl. Merdeka No. 10, Cirebon", dokumenUrl: "#" },
    { id: 2, namaUsaha: "Toko Roti Manis", emailPemohon: "roti@mail.com", tanggalPengajuan: "2025-11-16", jenis: 'Sertifikat', status: 'Diajukan', lokasiDetail: "Jl. Kebon Jati, Bandung", dokumenUrl: "#" },
    { id: 3, namaUsaha: "Jasa Servis Mobil", emailPemohon: "servis@mail.com", tanggalPengajuan: "2025-11-15", jenis: 'Lokasi Baru', status: 'Diterima', lokasiDetail: "Jl. Cipto No. 5, Cirebon", dokumenUrl: "#" },
];


export default function VerificationQueuePage() {
    const [submissions, setSubmissions] = useState<Submission[]>(DUMMY_SUBMISSIONS);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // Filter hanya yang statusnya 'Diajukan' (Antrian Kerja)
    const pendingSubmissions = submissions.filter(sub => sub.status === 'Diajukan');
    const processedSubmissions = submissions.filter(sub => sub.status !== 'Diajukan');
    
    // Logika untuk mengubah status pengajuan (di dalam modal)
    const handleUpdateStatus = (id: number, newStatus: 'Diterima' | 'Ditolak') => {
        setSubmissions(prev => prev.map(sub => 
            sub.id === id ? { ...sub, status: newStatus } : sub
        ));
        setSelectedSubmission(null); // Tutup modal setelah aksi
        alert(`Pengajuan #${id} berhasil di${newStatus.toLowerCase()}!`);
    };

    return (
        <AdminPageLayout>
            <div className="space-y-8">
                
                {/* Header Halaman */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Book size={32} weight="fill" className="text-blue-500" /> Verifikasi & Pengajuan
                    </h1>
                    <p className="text-gray-500 mt-1">Antrian kerja untuk meninjau dan memproses permohonan UMKM.</p>
                </header>

                {/* 1. Antrian Kerja (Pending Submissions) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-orange-600 flex items-center gap-2">
                        <FileText size={24} /> Antrian Verifikasi ({pendingSubmissions.length} Item)
                    </h2>
                    <SubmissionTable 
                        submissions={pendingSubmissions} 
                        onViewDetail={setSelectedSubmission}
                    />
                </div>

                {/* 2. Riwayat Pengajuan (Processed Submissions) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        Riwayat Pengajuan Selesai ({processedSubmissions.length} Item)
                    </h2>
                    <SubmissionTable 
                        submissions={processedSubmissions} 
                        onViewDetail={setSelectedSubmission}
                    />
                </div>
                
                {/* 💡 Modal Verifikasi */}
                {selectedSubmission && (
                    <VerificationModal 
                        submission={selectedSubmission}
                        onClose={() => setSelectedSubmission(null)}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}
            </div>
        </AdminPageLayout>
    );
}