"use client";
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle } from '@phosphor-icons/react';
import AdminPageLayout from '@/components/adminlayout';
import DeletionRequestTable from '@/components/admin/verifikasi/DeletionRequestTable';
import DeletionRequestModal from '@/components/admin/verifikasi/DeletionRequestModal';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import { useUser } from '@/app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';

import type { DeletionRequest } from '@/types/deletion';

export default function VerificationDeletionPage() {
    const { user, loading: userLoading } = useUser();
    
    const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
    const [selectedDeletionRequest, setSelectedDeletionRequest] = useState<DeletionRequest | null>(null);
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
            fetchDeletionRequests();
        }
    }, [user, userLoading]);

    const fetchDeletionRequests = async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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

                await fetchDeletionRequests();
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
                        <p className="text-gray-600">Memuat data pengajuan penghapusan...</p>
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verifikasi Penghapusan Lokasi
                    </h1>
                    <p className="text-gray-600">
                        Kelola pengajuan penghapusan lokasi dari UMKM
                    </p>
                </div>

                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            icon={<Clock size={48} className="text-amber-600" weight="duotone" />}
                            label="Menunggu Review"
                            count={pendingDeletionCount}
                        />
                        <StatCard
                            icon={<CheckCircle size={48} className="text-green-600" weight="duotone" />}
                            label="Disetujui"
                            count={approvedDeletionCount}
                        />
                        <StatCard
                            icon={<XCircle size={48} className="text-red-600" weight="duotone" />}
                            label="Ditolak"
                            count={rejectedDeletionCount}
                        />
                    </div>

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

function StatCard({ 
    icon, 
    label, 
    count, 
}: { 
    icon: React.ReactNode; 
    label: string; 
    count: number;
}) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex">
            <div className="w-full flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-3xl font-bold text-gray-900">{count}</p>
                </div>
                <div>
                    {icon}
                </div>
            </div>
        </div>
    );
}