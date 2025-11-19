import React from 'react';
import { X, MapPinLine, Info, PencilSimple } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// IMPOR DINAMIS PETA
const DynamicMapInput = dynamic(
    () => import('../../MapInput'), // Sesuaikan path MapInput Anda
    { ssr: false }
);

interface LapakUsaha {
    id: number;
    namaLapak: string;
    koordinat: string;
    izinStatus: 'Aktif' | 'Diajukan' | 'Ditolak';
    tanggalDaftar: string;
    tanggalKedaluwarsa: string;
}

interface LocationDetailModalUMKMProps {
    lapak: LapakUsaha;
    onClose: () => void;
    onSave: (updatedLapak: LapakUsaha) => void; // 💡 TAMBAHAN: Handler Save
    mode: 'view' | 'edit';                    // 💡 TAMBAHAN: Mode saat dibuka
    setMode: React.Dispatch<React.SetStateAction<'view' | 'edit'>>;
}

export default function LocationDetailModalUMKM({ lapak, onClose, onSave, mode, setMode }: LocationDetailModalUMKMProps) {
    const [editedData, setEditedData] = useState<LapakUsaha>(lapak);
    const [currentMode, setCurrentMode] = useState(mode);

    // Sinkronisasi data saat lapak berubah (jika dibuka dengan data berbeda)
    useEffect(() => {
        setEditedData(lapak);
        setCurrentMode(mode);
    }, [lapak, mode]);

    // Parsing koordinat untuk peta
    const [lat, lon] = lapak.koordinat.split(',').map(c => c.trim());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedData);
        onClose();
    };

    const isEditing = currentMode === 'edit';

    const statusClasses = {
        'Aktif': 'bg-green-500',
        'Diajukan': 'bg-yellow-500',
        'Ditolak': 'bg-red-500',
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl">

                {/* Header Modal */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Info size={28} className="text-blue-500" /> {isEditing ? 'Edit Lapak' : 'Detail Lapak'}
                    </h2>
                    {/* Tombol Edit/View */}
                    {!isEditing && (
                        <button onClick={() => setCurrentMode('edit')} className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 p-2 rounded-lg transition">
                            <PencilSimple size={20} /> Edit
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Status Pengajuan (Sama) */}

                {/* LAYOUT UTAMA: GRID 2 KOLOM */}
                <form onSubmit={handleSave}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* KOLOM 1: Detail Tekstual */}
                        <div className="space-y-3 text-sm text-gray-700 pr-4">
                            <label className="block text-sm font-medium pt-2">Nama Lapak:</label>
                            {isEditing ? (
                                <input type="text" name="namaLapak" value={editedData.namaLapak} onChange={handleInputChange} className="w-full p-2 border rounded-lg" required />
                            ) : (
                                <p className="text-lg font-semibold">{lapak.namaLapak}</p>
                            )}

                            {/* ... (Input lainnya bisa ditambahkan di sini, misalnya deskripsi) ... */}

                            <div className="pt-3 border-t mt-3">
                                <p className="font-medium text-gray-800">Koordinat Lokasi:</p>
                                <p className="flex items-center gap-1 text-base mt-1">
                                    <MapPinLine size={18} /> {lapak.koordinat}
                                </p>
                            </div>
                        </div>

                        {/* KOLOM 2: PETA INTERAKTIF */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-gray-800">Visualisasi Peta Lokasi</h3>
                            <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-md">
                                <DynamicMapInput latitude={lat} longitude={lon} />
                            </div>
                            <p className="text-xs text-gray-500">Titik yang terverifikasi di SIPETAK.</p>
                        </div>
                    </div>

                    {/* Footer Aksi */}
                    <div className="mt-6 flex justify-end gap-3">
                        {isEditing && (
                            <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                Simpan Perubahan
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="py-2 px-4 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                            {isEditing ? 'Batal Edit' : 'Tutup'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}