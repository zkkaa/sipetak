// File: src/components/umkm/lokasi/detailmodal.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { X, PencilSimple, Check, Info } from '@phosphor-icons/react';
import type { LocationDetailModalProps, IzinStatus } from '@/types/lapak';

export default function LocationDetailModalUMKM({
    lapak,
    onClose,
    onSave,
    mode,
    setMode,
    formatDate
}: LocationDetailModalProps) {
    const [editedNamaLapak, setEditedNamaLapak] = useState(lapak.namaLapak);

    // Reset edited value when lapak changes
    useEffect(() => {
        setEditedNamaLapak(lapak.namaLapak);
    }, [lapak]);

    const handleSave = () => {
        if (!editedNamaLapak.trim()) {
            alert('Nama lapak tidak boleh kosong');
            return;
        }

        const updatedLapak = {
            ...lapak,
            namaLapak: editedNamaLapak.trim()
        };

        onSave(updatedLapak);
    };

    const handleCancel = () => {
        setEditedNamaLapak(lapak.namaLapak);
        setMode('view');
    };

    // ✅ Helper function untuk badge status
    const getStatusBadge = (status: IzinStatus) => {
        const styles: Record<IzinStatus, string> = {
            'Diajukan': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Diterima': 'bg-green-100 text-green-800 border-green-300',
            'Ditolak': 'bg-red-100 text-red-800 border-red-300',
            'Pengajuan Penghapusan': ''
        };

        const icons: Record<IzinStatus, string> = {
            'Diajukan': '⏳',
            'Diterima': '✅',
            'Ditolak': '❌',
            'Pengajuan Penghapusan': ''
        };

        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${styles[status]}`}>
                <span className="text-lg">{icons[status]}</span>
                {status}
            </span>
        );
    };

    // ✅ Helper untuk info status
    const getStatusInfo = (status: IzinStatus) => {
        const info: Record<IzinStatus, { message: string; color: string }> = {
            'Diajukan': {
                message: 'Pengajuan Anda sedang dalam proses verifikasi oleh admin.',
                color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
            },
            'Diterima': {
                message: 'Selamat! Pengajuan Anda telah disetujui. Anda dapat memulai usaha di lokasi ini.',
                color: 'bg-green-50 border-green-200 text-green-800'
            },
            'Ditolak': {
                message: 'Pengajuan Anda ditolak. Silakan ajukan lokasi lain atau hubungi admin untuk informasi lebih lanjut.',
                color: 'bg-red-50 border-red-200 text-red-800'
            },
            'Pengajuan Penghapusan': {
                message: '',
                color: ''
            }
        };

        return info[status];
    };

    const statusInfo = getStatusInfo(lapak.izinStatus);

    return (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Info size={28} weight="fill" className="text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            Detail Lapak
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Edit Button - Hanya muncul di mode view dan status Diajukan */}
                        {mode === 'view' && lapak.izinStatus === 'Diajukan' && (
                            <button
                                onClick={() => setMode('edit')}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                            >
                                <PencilSimple size={18} weight="fill" />
                                Edit
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <X size={24} weight="bold" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    
                    {/* Status Badge & Info */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Status Pengajuan:</span>
                            {getStatusBadge(lapak.izinStatus)}
                        </div>
                        <div className={`p-4 rounded-lg border ${statusInfo.color}`}>
                            <p className="text-sm leading-relaxed">{statusInfo.message}</p>
                        </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                        {/* Nama Lapak - Editable */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Nama Lapak
                            </label>
                            {mode === 'edit' ? (
                                <input
                                    type="text"
                                    value={editedNamaLapak}
                                    onChange={(e) => setEditedNamaLapak(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Masukkan nama lapak"
                                />
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">{lapak.namaLapak}</p>
                            )}
                        </div>

                        {/* Jenis Usaha */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Jenis Usaha
                            </label>
                            <p className="text-base text-gray-900">{lapak.businessType}</p>
                        </div>

                        {/* ID Lokasi Master */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                ID Lokasi Master
                            </label>
                            <p className="text-base text-gray-900">#{lapak.masterLocationId}</p>
                        </div>

                        {/* Tanggal Pengajuan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Tanggal Pengajuan
                            </label>
                            <p className="text-base text-gray-900">{formatDate(lapak.createdAt)}</p>
                        </div>

                        {/* User ID (For debugging - bisa dihapus di production) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                ID Pengguna
                            </label>
                            <p className="text-base text-gray-900">#{lapak.userId}</p>
                        </div>
                    </div>
                </div>

                {/* Footer - Hanya muncul di mode edit */}
                {mode === 'edit' && (
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                            <Check size={18} weight="bold" />
                            Simpan Perubahan
                        </button>
                    </div>
                )}

                {/* Footer - View mode */}
                {mode === 'view' && (
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}