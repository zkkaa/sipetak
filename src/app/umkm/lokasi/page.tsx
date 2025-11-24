// File: src/app/umkm/lokasi/page.tsx

"use client";
import React, { useState } from 'react';
import { MapPin, PlusCircle,  } from '@phosphor-icons/react';
import UMKMPageLayout from '../../../components/adminlayout'; // Asumsi layout berada di /app/umkm/layout.tsx
import LocationTableUMKM from '../../../components/umkm/lokasi/tabellokasi';
import LocationDetailModalUMKM from '../../../components/umkm/lokasi/detailmodal';
import ConfirmationModal from '../../../components/common/confirmmodal';
import ActionFeedbackModal from '../../../components/common/ActionFeedbackModal';

// --- INTERFACE DAN DATA DUMMY ---
interface LapakUsaha {
    id: number;
    namaLapak: string;
    koordinat: string; // [lat, lon] string atau tipe lain
    izinStatus: 'Aktif' | 'Diajukan' | 'Ditolak';
    tanggalDaftar: string;
    tanggalKedaluwarsa: string;
}

const DUMMY_LAPAK: LapakUsaha[] = [
    { id: 1, namaLapak: "Cabang Pasar Wetan", koordinat: "-7.336, 108.222", izinStatus: 'Aktif', tanggalDaftar: "2025-01-15", tanggalKedaluwarsa: "2026-01-15" },
    { id: 2, namaLapak: "Kios Bundaran", koordinat: "-7.338, 108.225", izinStatus: 'Diajukan', tanggalDaftar: "2025-05-20", tanggalKedaluwarsa: "N/A" },
    { id: 3, namaLapak: "Gerai Sentra Kuliner", koordinat: "-7.334, 108.221", izinStatus: 'Ditolak', tanggalDaftar: "2024-11-01", tanggalKedaluwarsa: "N/A" },
];


export default function BusinessLocationPage() {
    const [lapaks, setLapaks] = useState<LapakUsaha[]>(DUMMY_LAPAK);
    const [selectedLapak, setSelectedLapak] = useState<LapakUsaha | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [actionFeedback, setActionFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleViewDetail = (lapak: LapakUsaha) => {
        setSelectedLapak(lapak);
        setModalMode('view'); // Mode default: View
    };
    
    const handleEditClick = (lapak: LapakUsaha) => {
        setSelectedLapak(lapak);
        setModalMode('edit'); // Mode: Edit
    };

    const handleSaveEdit = (updatedLapak: LapakUsaha) => {
        setLapaks(lapaks.map(l => (l.id === updatedLapak.id ? updatedLapak : l)));
        setSelectedLapak(null);
        setModalMode('view');
        setActionFeedback({ message: `Perubahan pada ${updatedLapak.namaLapak} berhasil disimpan!`, type: 'success' });
        // Logika API PUT akan ditambahkan di sini
    };

    const handleDeleteConfirmed = (id: number) => {
        setLapaks(lapaks.filter(lapak => lapak.id !== id));
        setActionFeedback({ message: "Lapak berhasil dihapus.", type: 'success' });
        setConfirmDeleteId(null);
        // Logika API DELETE akan ditambahkan di sini
    };
    
    // Fungsi untuk mengarahkan ke halaman pengajuan baru
    const handleAddNewLapak = () => {
        // Arahkan ke halaman formulir pengajuan lokasi baru
        // (Route ini akan kita buat selanjutnya)
        alert("Mengarah ke Halaman Pengajuan Lokasi Baru...");
    };

    return (
        <UMKMPageLayout>
            <div className="space-y-8">
                
                {/* Header Halaman */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin size={32} weight="fill" className="text-blue-500" /> Data Lokasi Usaha
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola dan pantau semua titik lokasi usaha Anda.</p>
                </header>

                {/* Tombol Tambah Lapak */}
                <div className="flex justify-end">
                    <button 
                        onClick={handleAddNewLapak} 
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <PlusCircle size={20} /> Ajukan Lokasi Baru
                    </button>
                </div>

                {/* Tabel Daftar Lapak */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <LocationTableUMKM 
                        lapaks={lapaks} 
                        onViewDetail={handleViewDetail} // 💡 Panggil handler View
                        onEdit={handleEditClick}
                        onDelete={setConfirmDeleteId}
                    />
                </div>
                
                {/* Modal Detail Lapak */}
                {selectedLapak && (
                    <LocationDetailModalUMKM 
                        lapak={selectedLapak}
                        onClose={() => setSelectedLapak(null)}
                        onSave={handleSaveEdit} // 💡 Teruskan handler Save
                        mode={modalMode}         // 💡 Teruskan mode
                        setMode={setModalMode}
                    />
                )}

                {/* 1. MODAL KONFIRMASI HAPUS */}
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

                {/* 2. MODAL FEEDBACK AKSI (Sukses/Gagal) */}
                {actionFeedback && (
                    <ActionFeedbackModal
                        message={actionFeedback.message}
                        type={actionFeedback.type}
                        onClose={() => setActionFeedback(null)}
                    />
                )}
            </div>
        </UMKMPageLayout>
    );
}