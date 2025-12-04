"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Trash, Clock, CheckCircle, XCircle } from '@phosphor-icons/react';
import AdminPageLayout from '@/components/adminlayout';
import SubmissionTable from '@/components/admin/verifikasi/SubmissionTable';
import VerificationModal from '@/components/admin/verifikasi/VerificationModal';
import DeletionRequestTable from '@/components/admin/verifikasi/DeletionRequestTable';
import DeletionRequestModal from '@/components/admin/verifikasi/DeletionRequestModal';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import { useUser } from '../../../app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';

import type { Submission } from '../../../types/submission';
import type { DeletionRequest } from '../../../types/deletion';

export default function VerificationQueuePage() {
    const { user, loading: userLoading } = useUser();
    
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
    
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [selectedDeletionRequest, setSelectedDeletionRequest] = useState<DeletionRequest | null>(null);
    
    const [filterStatus, setFilterStatus] = useState<'Diajukan' | 'Diterima' | 'Ditolak' | 'Semua'>('Diajukan');
    const [filterDeletionStatus, setFilterDeletionStatus] = useState<'Pending' | 'Approved' | 'Rejected' | 'Semua'>('Pending');
    
    const [isLoading, setIsLoading] = useState(true);
    const [actionFeedback, setActionFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    useEffect(() => {
        if (!userLoading && user && user.role !== 'Admin') {
            setActionFeedback({
                message: 'Anda tidak memiliki akses ke halaman ini',
                type: 'error'
            });
        }
    }, [user, userLoading]);

    useEffect(() => {
        if (!userLoading && user?.role === 'Admin') {
            fetchData();
        }
    }, [user, userLoading]);

    const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchSubmissions(),
            fetchDeletionRequests()
        ]);
        setIsLoading(false);
    };

    const fetchSubmissions = async () => {
        try {
            console.log('🔄 Mengambil data pengajuan...');
            const response = await fetchWithToken('/api/submissions');
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                console.log('✅ Data pengajuan berhasil dimuat:', result.data.length);
                setSubmissions(result.data);
            } else {
                throw new Error(result.message || 'Gagal memuat data');
            }
        } catch (error) {
            console.error('❌ Error fetching submissions:', error);
            setActionFeedback({
                message: 'Gagal memuat data pengajuan',
                type: 'error'
            });
        }
    };

    const fetchDeletionRequests = async () => {
        try {
            console.log('🔄 Mengambil data pengajuan penghapusan...');
            const response = await fetchWithToken('/api/deletion-requests');
            const result = await response.json();

            if (result.success && Array.isArray(result.requests)) {
                console.log('✅ Data pengajuan penghapusan berhasil dimuat:', result.requests.length);
                setDeletionRequests(result.requests);
            } else {
                throw new Error(result.message || 'Gagal memuat data penghapusan');
            }
        } catch (error) {
            console.error('❌ Error fetching deletion requests:', error);
            setActionFeedback({
                message: 'Gagal memuat data pengajuan penghapusan',
                type: 'error'
            });
        }
    };

    const filteredSubmissions = filterStatus === 'Semua'
        ? submissions
        : submissions.filter(sub => sub.izinStatus === filterStatus);

    const pendingCount = submissions.filter(s => s.izinStatus === 'Diajukan').length;
    const approvedCount = submissions.filter(s => s.izinStatus === 'Diterima').length;
    const rejectedCount = submissions.filter(s => s.izinStatus === 'Ditolak').length;

    const handleUpdateStatus = async (id: number, newStatus: 'Diterima' | 'Ditolak') => {
        try {
            setActionFeedback({
                message: 'Memproses perubahan status...',
                type: 'info'
            });

            const response = await fetchWithToken(`/api/submissions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Status berhasil diperbarui');
                setSubmissions(prev =>
                    prev.map(sub =>
                        sub.id === id ? { ...sub, izinStatus: newStatus } : sub
                    )
                );
                setSelectedSubmission(null);
                setActionFeedback({
                    message: `Pengajuan berhasil ${newStatus === 'Diterima' ? 'disetujui' : 'ditolak'}!`,
                    type: 'success'
                });
            } else {
                throw new Error(result.message || 'Gagal mengubah status');
            }
        } catch (error) {
            console.error('❌ Error updating status:', error);
            setActionFeedback({
                message: error instanceof Error ? error.message : 'Gagal mengubah status',
                type: 'error'
            });
        }
    };

    const filteredDeletionRequests = filterDeletionStatus === 'Semua'
        ? deletionRequests
        : deletionRequests.filter(req => req.status === filterDeletionStatus);

    const pendingDeletionCount = deletionRequests.filter(r => r.status === 'Pending').length;
    const approvedDeletionCount = deletionRequests.filter(r => r.status === 'Approved').length;
    const rejectedDeletionCount = deletionRequests.filter(r => r.status === 'Rejected').length;

    const handleApproveDeletion = async (id: number) => {
        try {
            setActionFeedback({
                message: 'Memproses persetujuan penghapusan...',
                type: 'info'
            });

            const response = await fetchWithToken(`/api/deletion-requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Penghapusan disetujui');
                
                setDeletionRequests(prev => prev.filter(r => r.id !== id));
                
                setSelectedDeletionRequest(null);
                setActionFeedback({
                    message: 'Pengajuan penghapusan disetujui. Lokasi telah dihapus dari sistem.',
                    type: 'success'
                });

                await fetchData();
            } else {
                throw new Error(result.message || 'Gagal menyetujui penghapusan');
            }
        } catch (error) {
            console.error('❌ Error approving deletion:', error);
            setActionFeedback({
                message: error instanceof Error ? error.message : 'Gagal menyetujui penghapusan',
                type: 'error'
            });
        }
    };

    const handleRejectDeletion = async (id: number, reason: string) => {
        try {
            setActionFeedback({
                message: 'Memproses penolakan...',
                type: 'info'
            });

            const response = await fetchWithToken(`/api/deletion-requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'reject',
                    rejectionReason: reason
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ Penghapusan ditolak');
                
                setDeletionRequests(prev =>
                    prev.map(r =>
                        r.id === id 
                            ? { ...r, status: 'Rejected', rejectionReason: reason }
                            : r
                    )
                );
                
                setSelectedDeletionRequest(null);
                setActionFeedback({
                    message: 'Pengajuan penghapusan ditolak. Status lokasi dikembalikan ke "Diterima".',
                    type: 'success'
                });

                await fetchSubmissions();
            } else {
                throw new Error(result.message || 'Gagal menolak penghapusan');
            }
        } catch (error) {
            console.error('❌ Error rejecting deletion:', error);
            setActionFeedback({
                message: error instanceof Error ? error.message : 'Gagal menolak penghapusan',
                type: 'error'
            });
        }
    };

    if (userLoading || isLoading) {
        return (
            <AdminPageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data pengajuan...</p>
                    </div>
                </div>
            </AdminPageLayout>
        );
    }

    if (user?.role !== 'Admin') {
        return (
            <AdminPageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-semibold">Akses Ditolak</p>
                        <p className="text-red-500 text-sm mt-2">Anda harus menjadi Admin untuk mengakses halaman ini</p>
                    </div>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verifikasi & Pengajuan
                    </h1>
                    <p className="text-gray-600">
                        Kelola pengajuan lokasi baru dan penghapusan lokasi dari UMKM
                    </p>
                </div>

                {/* ========== SECTION 1: Pengajuan Lokasi Baru ========== */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                        <FileText size={28} className="text-blue-600" weight="duotone" />
                        <h2 className="text-xl font-semibold text-gray-900">Pengajuan Lokasi Baru</h2>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={<Clock size={24} className="text-amber-600" weight="duotone" />}
                            label="Menunggu Verifikasi"
                            count={pendingCount}
                            color="amber"
                        />
                        <StatCard
                            icon={<CheckCircle size={24} className="text-green-600" weight="duotone" />}
                            label="Diterima"
                            count={approvedCount}
                            color="green"
                        />
                        <StatCard
                            icon={<XCircle size={24} className="text-red-600" weight="duotone" />}
                            label="Ditolak"
                            count={rejectedCount}
                            color="red"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {(['Diajukan', 'Diterima', 'Ditolak', 'Semua'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    filterStatus === status
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Pengajuan ({filteredSubmissions.length})
                            </h3>
                        </div>
                        <SubmissionTable
                            submissions={filteredSubmissions}
                            onViewDetail={(submission) => setSelectedSubmission(submission)}
                        />
                    </div>
                </section>

                {/* ========== SECTION 2: Pengajuan Penghapusan Lokasi ========== */}
                <section className="space-y-6" id="deletion-requests">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                        <Trash size={28} className="text-red-600" weight="duotone" />
                        <h2 className="text-xl font-semibold text-gray-900">Pengajuan Penghapusan Lokasi</h2>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={<Clock size={24} className="text-amber-600" weight="duotone" />}
                            label="Menunggu Review"
                            count={pendingDeletionCount}
                            color="amber"
                        />
                        <StatCard
                            icon={<CheckCircle size={24} className="text-green-600" weight="duotone" />}
                            label="Disetujui"
                            count={approvedDeletionCount}
                            color="green"
                        />
                        <StatCard
                            icon={<XCircle size={24} className="text-red-600" weight="duotone" />}
                            label="Ditolak"
                            count={rejectedDeletionCount}
                            color="red"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {(['Pending', 'Approved', 'Rejected', 'Semua'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterDeletionStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    filterDeletionStatus === status
                                        ? 'bg-red-600 text-white shadow-md'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-red-400 hover:bg-red-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Pengajuan Penghapusan ({filteredDeletionRequests.length})
                            </h3>
                        </div>
                        <DeletionRequestTable
                            requests={filteredDeletionRequests}
                            onViewDetail={(request) => setSelectedDeletionRequest(request)}
                        />
                    </div>
                </section>

                {/* ========== MODALS ========== */}
                {selectedSubmission && (
                    <VerificationModal
                        submission={selectedSubmission}
                        onClose={() => setSelectedSubmission(null)}
                        onUpdateStatus={handleUpdateStatus}
                    />
                )}

                {selectedDeletionRequest && (
                    <DeletionRequestModal
                        request={selectedDeletionRequest}
                        onClose={() => setSelectedDeletionRequest(null)}
                        onApprove={handleApproveDeletion}
                        onReject={handleRejectDeletion}
                    />
                )}

                {actionFeedback && (
                    <ActionFeedbackModal
                        message={actionFeedback.message}
                        type={actionFeedback.type}
                        onClose={() => setActionFeedback(null)}
                    />
                )}
            </div>
        </AdminPageLayout>
    );
}

// Helper Component: Stat Card
function StatCard({ 
    icon, 
    label, 
    count, 
    color 
}: { 
    icon: React.ReactNode; 
    label: string; 
    count: number;
    color: 'amber' | 'green' | 'red';
}) {
    const colorClasses = {
        amber: 'bg-amber-50 border-amber-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200'
    };

    return (
        <div className={`${colorClasses[color]} border rounded-lg p-5`}>
            <div className="flex items-center gap-3 mb-2">
                {icon}
                <p className="text-sm font-medium text-gray-700">{label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
    );
}