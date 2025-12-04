"use client";
import React, { useEffect, useState } from 'react';
import { MapPin, PlusCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';
import AdminLayout from '@/components/adminlayout';
import LocationTableUMKM from '@/components/umkm/lokasi/tabellokasi';
import LocationDetailModalUMKM from '@/components/umkm/lokasi/detailmodal';
import DeletionRequestModal from '@/components/umkm/lokasi/DeletionRequestModal';
import ConfirmationModal from '@/components/common/confirmmodal';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import type { LapakUsaha } from '../../../types/lapak';

const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return 'Tanggal tidak tersedia';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'Tanggal tidak valid';
        }
        
        return new Intl.DateTimeFormat('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Error format tanggal';
    }
};

export default function LokasiPage() {
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    
    const [lapaks, setLapaks] = useState<LapakUsaha[]>([]);
    const [selectedLapak, setSelectedLapak] = useState<LapakUsaha | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    
    // ✅ State untuk berbagai jenis modal
    const [showDeletionRequestModal, setShowDeletionRequestModal] = useState(false);
    const [lapakToDelete, setLapakToDelete] = useState<LapakUsaha | null>(null);
    const [confirmCancelModal, setConfirmCancelModal] = useState<{ show: boolean; lapakId: number | null }>({ 
        show: false, 
        lapakId: null 
    });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ show: boolean; lapakId: number | null }>({
        show: false,
        lapakId: null
    });
    
    const [actionFeedback, setActionFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userLoading) {
            console.log('📌 Menunggu user context dimuat...');
            return;
        }

        if (!user) {
            console.error('❌ User tidak ada');
            setActionFeedback({
                message: 'User tidak terautentikasi. Silakan login terlebih dahulu.',
                type: 'error'
            });
            setIsLoading(false);
            return;
        }

        console.log('✅ User siap, user ID:', user.id);
        fetchLapaks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userLoading]);

    const fetchLapaks = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching submissions...');

            const response = await fetchWithToken('/api/umkm/submissions');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 API Response:', data);

            if (data.success && Array.isArray(data.submissions)) {
                const userLocations = data.submissions.filter(
                    (loc: LapakUsaha) => loc.userId === user?.id
                );

                console.log(`✅ Ditemukan ${userLocations.length} lokasi`);
                setLapaks(userLocations);

                if (userLocations.length === 0) {
                    setActionFeedback({
                        message: 'Anda belum mengajukan lokasi apapun',
                        type: 'info'
                    });
                }
            } else {
                throw new Error(data.message || 'Format response tidak valid');
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            const msg = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data';
            setActionFeedback({
                message: msg,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = (lapak: LapakUsaha) => {
        setSelectedLapak(lapak);
        setModalMode('view');
    };

    const handleEditClick = (lapak: LapakUsaha) => {
        setSelectedLapak(lapak);
        setModalMode('edit');
    };

    const handleSaveEdit = async (updatedLapak: LapakUsaha) => {
        setActionFeedback({ message: 'Menyimpan perubahan...', type: 'info' });

        try {
            const response = await fetchWithToken(`/api/umkm/submissions/${updatedLapak.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ namaLapak: updatedLapak.namaLapak }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setLapaks(lapaks.map(l => l.id === updatedLapak.id ? updatedLapak : l));
                setSelectedLapak(null);
                setActionFeedback({ 
                    message: 'Perubahan berhasil disimpan!', 
                    type: 'success' 
                });
            } else {
                throw new Error(result.message || 'Gagal menyimpan perubahan');
            }
        } catch (error) {
            setActionFeedback({
                message: `Gagal menyimpan: ${(error as Error).message}`,
                type: 'error'
            });
        }
    };

    // ========== 🆕 CONDITIONAL DELETE LOGIC ==========
    const handleDeleteClick = (lapakId: number) => {
        const lapak = lapaks.find(l => l.id === lapakId);
        if (!lapak) return;

        console.log('🗑️ Delete clicked for lapak:', lapak.namaLapak, 'status:', lapak.izinStatus);

        switch (lapak.izinStatus) {
            case 'Diajukan':
                // ✅ Simple confirm: Cancel pengajuan
                setConfirmCancelModal({ show: true, lapakId });
                break;

            case 'Diterima':
                // ✅ 2-step modal: Ajukan penghapusan
                setLapakToDelete(lapak);
                setShowDeletionRequestModal(true);
                break;

            case 'Ditolak':
                // ✅ Simple confirm: Hapus lokasi
                setConfirmDeleteModal({ show: true, lapakId });
                break;

            case 'Pengajuan Penghapusan':
                // ✅ Tidak ada action (button hidden di table)
                break;
        }
    };

    // ========== Handle Cancel Pengajuan (Status: Diajukan) ==========
    const handleCancelSubmission = async (lapakId: number) => {
        try {
            setActionFeedback({ message: 'Membatalkan pengajuan...', type: 'info' });

            const response = await fetchWithToken(`/api/umkm/submissions/${lapakId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setLapaks(lapaks.filter(lapak => lapak.id !== lapakId));
                setActionFeedback({
                    message: 'Pengajuan berhasil dibatalkan.',
                    type: 'success'
                });
                setConfirmCancelModal({ show: false, lapakId: null });
            } else {
                throw new Error(result.message || 'Gagal membatalkan pengajuan');
            }
        } catch (error) {
            setActionFeedback({
                message: `Gagal membatalkan: ${(error as Error).message}`,
                type: 'error'
            });
        }
    };

    // ========== Handle Delete Permanent (Status: Ditolak) ==========
    const handleDeletePermanent = async (lapakId: number) => {
        try {
            setActionFeedback({ message: 'Menghapus lokasi...', type: 'info' });

            const response = await fetchWithToken(`/api/umkm/submissions/${lapakId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setLapaks(lapaks.filter(lapak => lapak.id !== lapakId));
                setActionFeedback({
                    message: 'Lokasi berhasil dihapus.',
                    type: 'success'
                });
                setConfirmDeleteModal({ show: false, lapakId: null });
            } else {
                throw new Error(result.message || 'Gagal menghapus lokasi');
            }
        } catch (error) {
            setActionFeedback({
                message: `Gagal menghapus: ${(error as Error).message}`,
                type: 'error'
            });
        }
    };

    // ========== Handle Submit Deletion Request (Status: Diterima) ==========
    const handleSubmitDeletionRequest = async (reason: string) => {
        if (!lapakToDelete) return;

        try {
            setActionFeedback({ message: 'Mengirim pengajuan penghapusan...', type: 'info' });

            const response = await fetchWithToken('/api/deletion-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    umkmLocationId: lapakToDelete.id,
                    reason
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // ✅ Update status lokal ke "Pengajuan Penghapusan"
                setLapaks(lapaks.map(l => 
                    l.id === lapakToDelete.id 
                        ? { ...l, izinStatus: 'Pengajuan Penghapusan' }
                        : l
                ));

                setShowDeletionRequestModal(false);
                setLapakToDelete(null);
                setActionFeedback({
                    message: 'Pengajuan penghapusan berhasil dikirim! Admin akan meninjaunya.',
                    type: 'success'
                });
            } else {
                throw new Error(result.message || 'Gagal mengirim pengajuan');
            }
        } catch (error) {
            setActionFeedback({
                message: `Gagal mengirim pengajuan: ${(error as Error).message}`,
                type: 'error'
            });
        }
    };

    const handleAddNewLapak = () => {
        router.push('/umkm/pengajuan');
    };

    if (userLoading || isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {userLoading ? 'Memuat autentikasi...' : 'Memuat data lokasi...'}
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-semibold">❌ Anda harus login terlebih dahulu</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin size={32} weight="fill" className="text-blue-500" />
                        Data Lokasi Usaha
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Kelola dan pantau semua titik lokasi usaha Anda.
                    </p>
                </header>

                <div className="flex justify-end">
                    <button
                        onClick={handleAddNewLapak}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <PlusCircle size={20} /> Ajukan Lokasi Baru
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    {lapaks.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>Anda belum mengajukan lokasi apapun</p>
                        </div>
                    ) : (
                        <LocationTableUMKM
                            lapaks={lapaks}
                            onViewDetail={handleViewDetail}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            formatDate={formatDate}
                        />
                    )}
                </div>

                {/* ========== MODALS ========== */}
                
                {/* Detail/Edit Modal */}
                {selectedLapak && (
                    <LocationDetailModalUMKM
                        lapak={selectedLapak}
                        onClose={() => setSelectedLapak(null)}
                        onSave={handleSaveEdit}
                        mode={modalMode}
                        setMode={setModalMode}
                        formatDate={formatDate}
                    />
                )}

                {/* 2-Step Deletion Request Modal (Status: Diterima) */}
                {showDeletionRequestModal && lapakToDelete && (
                    <DeletionRequestModal
                        lapakName={lapakToDelete.namaLapak}
                        lapakId={lapakToDelete.id}
                        onClose={() => {
                            setShowDeletionRequestModal(false);
                            setLapakToDelete(null);
                        }}
                        onSubmit={handleSubmitDeletionRequest}
                    />
                )}

                {/* Confirmation: Cancel Submission (Status: Diajukan) */}
                {confirmCancelModal.show && confirmCancelModal.lapakId && (
                    <ConfirmationModal
                        title="Batalkan Pengajuan"
                        message="Apakah Anda yakin ingin membatalkan pengajuan lokasi ini?"
                        onClose={() => setConfirmCancelModal({ show: false, lapakId: null })}
                        onConfirm={() => handleCancelSubmission(confirmCancelModal.lapakId!)}
                        confirmText="Ya, Batalkan"
                        confirmColor="yellow"
                    />
                )}

                {/* Confirmation: Delete Permanent (Status: Ditolak) */}
                {confirmDeleteModal.show && confirmDeleteModal.lapakId && (
                    <ConfirmationModal
                        title="Hapus Lokasi"
                        message="Apakah Anda yakin ingin menghapus lokasi ini? Aksi ini tidak dapat dibatalkan."
                        onClose={() => setConfirmDeleteModal({ show: false, lapakId: null })}
                        onConfirm={() => handleDeletePermanent(confirmDeleteModal.lapakId!)}
                        confirmText="Ya, Hapus Permanen"
                        confirmColor="red"
                    />
                )}

                {/* Action Feedback */}
                {actionFeedback && (
                    <ActionFeedbackModal
                        message={actionFeedback.message}
                        type={actionFeedback.type}
                        onClose={() => setActionFeedback(null)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}