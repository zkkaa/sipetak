"use client";
import React, { useState, useEffect } from 'react';
import { Book, FileText } from '@phosphor-icons/react';
import AdminPageLayout from '@/components/adminlayout';
import SubmissionTable from '@/components/admin/verifikasi/SubmissionTable';
import VerificationModal from '@/components/admin/verifikasi/VerificationModal';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import { useUser } from '../../../app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';

import type { Submission } from '../../../types/submission';

export default function VerificationQueuePage() {
    const { user, loading: userLoading } = useUser();
    
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [filterStatus, setFilterStatus] = useState<'Diajukan' | 'Diterima' | 'Ditolak' | 'Semua'>('Diajukan');
    
    const [isLoading, setIsLoading] = useState(true);
    const [actionFeedback, setActionFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    // Check authorization
    useEffect(() => {
        if (!userLoading && user && user.role !== 'Admin') {
            setActionFeedback({
                message: 'Anda tidak memiliki akses ke halaman ini',
                type: 'error'
            });
        }
    }, [user, userLoading]);

    // Fetch submissions
    useEffect(() => {
        if (!userLoading && user?.role === 'Admin') {
            fetchSubmissions();
        }
    }, [user, userLoading]);

    const fetchSubmissions = async () => {
        try {
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
                        <p className="text-red-600 font-semibold">❌ Akses Ditolak</p>
                        <p className="text-red-500 text-sm mt-2">Anda harus menjadi Admin untuk mengakses halaman ini</p>
                    </div>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout>
            <div className="space-y-8">

                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Book size={32} weight="fill" className="text-blue-500" />
                        Verifikasi & Pengajuan
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Kelola dan verifikasi pengajuan lokasi usaha dari UMKM.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 font-semibold">Menunggu Verifikasi</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-700 font-semibold">Diterima</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 font-semibold">Ditolak</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">{rejectedCount}</p>
                    </div>
                </div>

                {/* Filter Status */}
                <div className="flex gap-2 flex-wrap">
                    {(['Diajukan', 'Diterima', 'Ditolak', 'Semua'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filterStatus === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {status === 'Diajukan' && '⏳ '}
                            {status === 'Diterima' && '✅ '}
                            {status === 'Ditolak' && '❌ '}
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
                        <FileText size={24} />
                        Daftar Pengajuan ({filteredSubmissions.length})
                    </h2>
                    <SubmissionTable
                        submissions={filteredSubmissions}
                        onViewDetail={(submission) => setSelectedSubmission(submission)}
                    />
                </div>

                {selectedSubmission && (
                    <VerificationModal
                        submission={selectedSubmission}
                        onClose={() => setSelectedSubmission(null)}
                        onUpdateStatus={handleUpdateStatus}
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