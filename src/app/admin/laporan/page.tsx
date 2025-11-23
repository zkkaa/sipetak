// app/admin/laporan/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Warning, Spinner } from '@phosphor-icons/react';
import AdminPageLayout from '../../../components/adminlayout';
import ReportTable from '../../../components/admin/laporan/reporttable';
import ReportDetailModal from '../../../components/admin/laporan/reportdetailmodal';

// Interface sesuai dengan komponen yang sudah ada
interface CitizenReport {
    id: number;
    jenisPelanggaran: string;
    lokasiDetail: string;
    koordinat: [number, number];
    tanggalLapor: string;
    status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai';
    buktiUrl: string;
    deskripsiWarga: string;
    adminHandlerName?: string | null;
}

export default function CitizenReportQueuePage() {
    const [reports, setReports] = useState<CitizenReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);
    const [filterStatus, setFilterStatus] = useState<'Semua' | CitizenReport['status']>('Belum Diperiksa');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch laporan dari API
    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('📡 Fetching reports from API...');
            
            const response = await fetch('/api/reports', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store', // Jangan cache untuk data real-time
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Gagal mengambil data laporan');
            }

            console.log('✅ Reports fetched:', result.data.length, 'items');

            // Transform data dari API ke format komponen
            const transformedReports: CitizenReport[] = result.data.map((report: {
                id: number;
                reportType: string;
                description: string;
                latitude: string;
                longitude: string;
                buktiFotoUrl: string | null;
                status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai';
                dateReported: string;
                adminHandlerName?: string | null;
            }) => ({
                id: report.id,
                jenisPelanggaran: report.reportType,
                lokasiDetail: `Lat: ${parseFloat(report.latitude).toFixed(4)}, Lon: ${parseFloat(report.longitude).toFixed(4)}`,
                koordinat: [parseFloat(report.latitude), parseFloat(report.longitude)] as [number, number],
                tanggalLapor: formatDate(report.dateReported),
                status: report.status,
                buktiUrl: report.buktiFotoUrl || '/placeholder-image.jpg',
                deskripsiWarga: report.description,
                adminHandlerName: report.adminHandlerName,
            }));

            setReports(transformedReports);

        } catch (err) {
            console.error('❌ Fetch Reports Error:', err);
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: Format tanggal ke format Indonesia
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch {
            return dateString;
        }
    };

    // Filter laporan berdasarkan status
    const filteredReports = reports.filter(report => 
        filterStatus === 'Semua' || report.status === filterStatus
    );
    
    // Update status laporan via API
    const handleUpdateStatus = async (id: number, newStatus: CitizenReport['status']) => {
        try {
            console.log(`📝 Updating report #${id} to status: ${newStatus}`);
            
            // TODO: Ganti dengan sistem auth yang sebenarnya
            // Untuk sekarang, ambil dari localStorage atau hardcode
            const adminId = parseInt(localStorage.getItem('adminId') || '1');

            const response = await fetch(`/api/reports/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newStatus,
                    adminId,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Gagal memperbarui status');
            }

            console.log('✅ Status updated successfully');

            // Update state lokal
            setReports(prev => prev.map(rep => 
                rep.id === id ? { ...rep, status: newStatus } : rep
            ));
            
            setSelectedReport(null);
            
            // Show success message
            alert(
                `✅ STATUS BERHASIL DIUBAH\n\n` +
                `Laporan #${id} telah diubah menjadi "${newStatus}".\n\n` +
                `Sistem akan me-refresh data...`
            );
            
            // Refresh data untuk mendapatkan adminHandlerName ter-update
            await fetchReports();

        } catch (err) {
            console.error('❌ Update Status Error:', err);
            alert(
                `❌ GAGAL MEMPERBARUI STATUS\n\n` +
                `${err instanceof Error ? err.message : 'Terjadi kesalahan'}\n\n` +
                `Silakan coba lagi.`
            );
        }
    };

    // Loading State
    if (isLoading) {
        return (
            <AdminPageLayout>
                <div className="flex flex-col justify-center items-center h-96">
                    <Spinner size={64} className="animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Memuat data laporan...</p>
                    <p className="text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
                </div>
            </AdminPageLayout>
        );
    }

    // Error State
    if (error) {
        return (
            <AdminPageLayout>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center max-w-2xl mx-auto mt-10">
                    <Warning size={64} className="text-red-500 mx-auto mb-4" weight="fill" />
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={fetchReports}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
                        >
                            🔄 Coba Lagi
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                        >
                            ↻ Refresh Halaman
                        </button>
                    </div>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout>
            <div className="space-y-6">
                
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Warning size={36} weight="fill" className="text-red-500" />
                        Penertiban Laporan Warga
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Kelola dan tindak lanjuti laporan pelanggaran tata ruang dari masyarakat.
                    </p>
                </header>

                {/* Filter Bar */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Warning size={24} className="text-blue-600" weight="fill" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {filteredReports.length} Laporan
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {filterStatus === 'Semua' ? 'Semua Status' : `Status: ${filterStatus}`}
                                </p>
                            </div>
                        </div>
                        
                        {/* Filter Dropdown */}
                        <div className="flex gap-3 items-center w-full md:w-auto">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Filter Status:
                            </label>
                            <select 
                                value={filterStatus} 
                                onChange={(e) => setFilterStatus(e.target.value as 'Semua' | CitizenReport['status'])}
                                className="flex-1 md:flex-none p-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                            >
                                <option value="Belum Diperiksa">🔴 Belum Diperiksa ({reports.filter(r => r.status === 'Belum Diperiksa').length})</option>
                                <option value="Sedang Diproses">🟡 Sedang Diproses ({reports.filter(r => r.status === 'Sedang Diproses').length})</option>
                                <option value="Selesai">🟢 Selesai ({reports.filter(r => r.status === 'Selesai').length})</option>
                                <option value="Semua">📊 Semua Status ({reports.length})</option>
                            </select>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={fetchReports}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
                            title="Refresh data"
                        >
                            <span>🔄</span>
                            <span className="hidden md:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Belum Diperiksa</p>
                                <p className="text-3xl font-bold text-red-700">
                                    {reports.filter(r => r.status === 'Belum Diperiksa').length}
                                </p>
                            </div>
                            <div className="bg-red-200 p-3 rounded-full">
                                <Warning size={32} className="text-red-700" weight="fill" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600 font-medium">Sedang Diproses</p>
                                <p className="text-3xl font-bold text-yellow-700">
                                    {reports.filter(r => r.status === 'Sedang Diproses').length}
                                </p>
                            </div>
                            <div className="bg-yellow-200 p-3 rounded-full">
                                <Spinner size={32} className="text-yellow-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Selesai</p>
                                <p className="text-3xl font-bold text-green-700">
                                    {reports.filter(r => r.status === 'Selesai').length}
                                </p>
                            </div>
                            <div className="bg-green-200 p-3 rounded-full">
                                <span className="text-3xl">✓</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    {filteredReports.length === 0 ? (
                        <div className="text-center py-16">
                            <Warning size={80} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-xl font-medium">
                                Tidak ada laporan dengan status -{filterStatus}-
                            </p>
                            <p className="text-gray-400 mt-2">
                                Pilih filter lain atau tunggu laporan baru masuk
                            </p>
                        </div>
                    ) : (
                        <ReportTable 
                            reports={filteredReports} 
                            onViewDetail={setSelectedReport}
                        />
                    )}
                </div>
                
                {/* Modal Detail */}
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