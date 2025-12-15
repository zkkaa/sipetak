"use client";

import React, { useState, useEffect } from 'react';
import { Warning, Spinner, CheckCircle, XCircle } from '@phosphor-icons/react';
import AdminPageLayout from '../../../components/adminlayout';
import ReportTable from '../../../components/admin/laporan/reporttable';
import ReportDetailModal from '../../../components/admin/laporan/reportdetailmodal';
import ConfirmationModal from '../../../components/common/confirmmodal';

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
    
    // Modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

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
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Gagal mengambil data laporan');
            }

            console.log('✅ Reports fetched:', result.data.length, 'items');

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

    const filteredReports = reports.filter(report =>
        filterStatus === 'Semua' || report.status === filterStatus
    );

    const handleUpdateStatus = async (id: number, newStatus: CitizenReport['status']) => {
        try {
            console.log(`📝 Updating report #${id} to status: ${newStatus}`);
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
            
            // Update local state
            setReports(prev => prev.map(rep =>
                rep.id === id ? { ...rep, status: newStatus } : rep
            ));

            // Close modal
            setSelectedReport(null);

            // Show success modal
            setModalMessage(`Status laporan #${id} berhasil diubah menjadi "${newStatus}".`);
            setShowSuccessModal(true);

            // Refresh data
            await fetchReports();

        } catch (err) {
            console.error('❌ Update Status Error:', err);
            setModalMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat memperbarui status');
            setShowErrorModal(true);
        }
    };

    const handleDeleteReport = async (id: number) => {
        try {
            console.log(`🗑️ Deleting report #${id}...`);
            
            const response = await fetch(`/api/reports/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Gagal menghapus laporan');
            }

            console.log('✅ Report deleted successfully');

            // Remove from local state
            setReports(prev => prev.filter(rep => rep.id !== id));

            // Close modal
            setSelectedReport(null);

            // Show success modal
            setModalMessage(`Laporan #${id} berhasil dihapus dari sistem.`);
            setShowSuccessModal(true);

        } catch (err) {
            console.error('❌ Delete Report Error:', err);
            setModalMessage(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus laporan');
            setShowErrorModal(true);
        }
    };

    if (isLoading) {
        return (
            <AdminPageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data laporan...</p>
                    </div>
                </div>
            </AdminPageLayout>
        );
    }

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

                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Warning size={36} weight="fill" className="text-red-500" />
                        Penertiban Laporan Warga
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Kelola dan tindak lanjuti laporan pelanggaran tata ruang dari masyarakat.
                    </p>
                </header>

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

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="p-5 border-b-2 border-gray-300">
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

                            <div className="flex gap-3 items-center w-full md:w-auto">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Filter Status:
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as 'Semua' | CitizenReport['status'])}
                                    className="flex-1 md:flex-none p-2.5 border-2 border-gray-300 rounded-lg font-medium"
                                >
                                    <option value="Belum Diperiksa">Belum Diperiksa ({reports.filter(r => r.status === 'Belum Diperiksa').length})</option>
                                    <option value="Sedang Diproses">Sedang Diproses ({reports.filter(r => r.status === 'Sedang Diproses').length})</option>
                                    <option value="Selesai">Selesai ({reports.filter(r => r.status === 'Selesai').length})</option>
                                    <option value="Semua">Semua Status ({reports.length})</option>
                                </select>
                            </div>
                        </div>
                    </div>
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

                {selectedReport && (
                    <ReportDetailModal
                        report={selectedReport}
                        onClose={() => setSelectedReport(null)}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteReport}
                    />
                )}

                {showSuccessModal && (
                    <ConfirmationModal
                        title="Berhasil! ✅"
                        message={modalMessage}
                        onClose={() => setShowSuccessModal(false)}
                        onConfirm={() => setShowSuccessModal(false)}
                        confirmText="OK"
                        cancelText=""
                        icon={<CheckCircle size={48} color="#FFFFFF" weight="fill" />}
                        confirmColor="green"
                    />
                )}

                {showErrorModal && (
                    <ConfirmationModal
                        title="Terjadi Kesalahan ❌"
                        message={modalMessage}
                        onClose={() => setShowErrorModal(false)}
                        onConfirm={() => setShowErrorModal(false)}
                        confirmText="Tutup"
                        cancelText=""
                        icon={<XCircle size={48} color="#FFFFFF" weight="fill" />}
                        confirmColor="red"
                    />
                )}
            </div>
        </AdminPageLayout>
    );
}