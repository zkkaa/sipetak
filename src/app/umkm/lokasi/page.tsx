// File: src/app/umkm/lokasi/page.tsx

"use client";
import React, { useEffect, useState } from 'react';
import { MapPin, PlusCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';
import AdminLayout from '@/components/adminlayout';
import LocationTableUMKM from '@/components/umkm/lokasi/tabellokasi';
import LocationDetailModalUMKM from '@/components/umkm/lokasi/detailmodal';
import ConfirmationModal from '@/components/common/confirmmodal';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

interface LapakUsaha {
    id: number;
    userId: number;
    masterLocationId: number;
    namaLapak: string;
    businessType: string;
    izinStatus: 'Diajukan' | 'Disetujui' | 'Ditolak';
    createdAt: string;
}

export default function LokasiPage() {
    const router = useRouter();
    const { user, loading: userLoading } = useUser();
    
    const [lapaks, setLapaks] = useState<LapakUsaha[]>([]);
    const [selectedLapak, setSelectedLapak] = useState<LapakUsaha | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
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
                // Filter untuk user yang login
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

    const handleDeleteConfirmed = async (id: number) => {
        try {
            setActionFeedback({ message: 'Menghapus lapak...', type: 'info' });

            const response = await fetchWithToken(`/api/umkm/submissions/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setLapaks(lapaks.filter(lapak => lapak.id !== id));
                setActionFeedback({
                    message: 'Lapak berhasil dihapus.',
                    type: 'success'
                });
                setConfirmDeleteId(null);
            } else {
                throw new Error(result.message || 'Gagal menghapus lapak');
            }
        } catch (error) {
            setActionFeedback({
                message: `Gagal menghapus: ${(error as Error).message}`,
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

    // Not authenticated
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
                            onDelete={setConfirmDeleteId}
                        />
                    )}
                </div>
                {selectedLapak && (
                    <LocationDetailModalUMKM
                        lapak={selectedLapak}
                        onClose={() => setSelectedLapak(null)}
                        onSave={handleSaveEdit}
                        mode={modalMode}
                        setMode={setModalMode}
                    />
                )}
                {confirmDeleteId !== null && (
                    <ConfirmationModal
                        title="Konfirmasi Penghapusan"
                        message="Apakah Anda yakin ingin menghapus lapak ini? Aksi ini tidak dapat dibatalkan."
                        onClose={() => setConfirmDeleteId(null)}
                        onConfirm={() => handleDeleteConfirmed(confirmDeleteId)}
                        confirmText="Ya, Hapus Permanen"
                        confirmColor="red"
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
        </AdminLayout>
    );
}