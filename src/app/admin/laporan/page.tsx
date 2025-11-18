"use client";
import React, { useState } from 'react';
import { Warning } from '@phosphor-icons/react';
import AdminPageLayout from '../../../components/adminlayout'; // Asumsi path layout Admin
import ReportTable from '../../../components/admin/laporan/reporttable';
import ReportDetailModal from '../../../components/admin/laporan/reportdetailmodal';

// --- INTERFACE DAN DATA DUMMY ---
// Status yang disepakati: Belum Diperiksa, Sedang Diproses, Selesai
interface CitizenReport {
    id: number;
    jenisPelanggaran: string;
    lokasiDetail: string; // Detail lokasi laporan (alamat/deskripsi)
    koordinat: [number, number]; // [lat, lon]
    tanggalLapor: string;
    status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai';
    buktiUrl: string; // URL foto bukti visual
    deskripsiWarga: string;
}

const DUMMY_REPORTS: CitizenReport[] = [
    { id: 1, jenisPelanggaran: "Menempati Trotoar", lokasiDetail: "Jl. Merdeka No. 10, Cirebon", koordinat: [-6.745, 108.557], tanggalLapor: "2025-11-17", status: 'Belum Diperiksa', buktiUrl: "/laporan/trotoar1.jpg", deskripsiWarga: "Pedagang kaki lima menaruh gerobak permanen di trotoar utama." },
    { id: 2, jenisPelanggaran: "Buang Limbah Sembarangan", lokasiDetail: "Belakang Pasar X, Gang B", koordinat: [-6.740, 108.560], tanggalLapor: "2025-11-16", status: 'Sedang Diproses', buktiUrl: "/laporan/limbah1.jpg", deskripsiWarga: "Sering ada yang membuang limbah cair ke selokan, baunya menyengat." },
    { id: 3, jenisPelanggaran: "Menutup Akses Jalan", lokasiDetail: "Jl. Pemuda No. 5, Tasikmalaya", koordinat: [-7.336, 108.222], tanggalLapor: "2025-11-15", status: 'Selesai', buktiUrl: "/laporan/akses.jpg", deskripsiWarga: "Sebuah toko menaruh palang di pinggir jalan untuk parkir pribadi." },
];


export default function CitizenReportQueuePage() {
    const [reports, setReports] = useState<CitizenReport[]>(DUMMY_REPORTS);
    const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
    // const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
    const [filterStatus, setFilterStatus] = useState<'Semua' | CitizenReport['status']>('Belum Diperiksa');

    // Filter laporan berdasarkan status yang dipilih
    const filteredReports = reports.filter(report => 
        filterStatus === 'Semua' || report.status === filterStatus
    );
    
    // Logika untuk mengubah status laporan (di dalam modal)
    const handleUpdateStatus = (id: number, newStatus: CitizenReport['status']) => {
        setReports(prev => prev.map(rep => 
            rep.id === id ? { ...rep, status: newStatus } : rep
        ));
        setSelectedReport(null); // Tutup modal setelah aksi
        alert(`Status laporan #${id} berhasil diubah menjadi ${newStatus}.`);
    };

    return (
        <AdminPageLayout>
            <div className="space-y-8">
                
                {/* Header Halaman */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Warning size={32} weight="fill" className="text-red-500" /> Penertiban Laporan Warga
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola dan tindak lanjuti laporan pelanggaran tata ruang dari masyarakat.</p>
                </header>

                {/* FILTER BAR */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Total Laporan: {filteredReports.length} Item
                    </h2>
                    
                    {/* Filter Status */}
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value as 'Semua' | CitizenReport['status'])}
                        className="p-2 border rounded-lg w-full md:w-auto"
                    >
                        <option value="Belum Diperiksa">Belum Diperiksa (Antrian)</option>
                        <option value="Sedang Diproses">Sedang Diproses</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Semua">Semua Status</option>
                    </select>
                </div>

                {/* Tabel Antrian Laporan */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <ReportTable 
                        reports={filteredReports} 
                        onViewDetail={setSelectedReport}
                    />
                </div>
                
                {/* 💡 Modal Detail Laporan */}
                {selectedReport && (
                    <ReportDetailModal 
                        report={selectedReport}
                        onClose={() => setSelectedReport(null)}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}
            </div>
        </AdminPageLayout>
    );
}