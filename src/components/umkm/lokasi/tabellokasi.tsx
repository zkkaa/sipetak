// File: src/components/umkm/lokasi/tabellokasi.tsx
// ✅ UPDATED - Tambah support untuk status "Pengajuan Penghapusan"

import React from 'react';
import { Eye, TrashSimple, PencilSimple } from '@phosphor-icons/react';
import type { LapakUsaha } from '@/types/lapak';

interface LocationTableUMKMProps {
    lapaks: LapakUsaha[];
    onViewDetail: (lapak: LapakUsaha) => void;
    onEdit: (lapak: LapakUsaha) => void;
    onDelete: (id: number) => void;
    formatDate: (date: string | Date | null) => string;
}

// ✅ UPDATED: Tambah status "Pengajuan Penghapusan"
const statusClasses = {
    'Diajukan': 'bg-yellow-100 text-yellow-700',
    'Diterima': 'bg-green-100 text-green-700',
    'Ditolak': 'bg-red-100 text-red-700',
    'Pengajuan Penghapusan': 'bg-orange-100 text-orange-700', // 🆕 NEW
};

export default function LocationTableUMKM({ 
    lapaks, 
    onViewDetail, 
    onEdit, 
    onDelete,
    formatDate 
}: LocationTableUMKMProps) {

    if (lapaks.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium text-gray-700">
                    Anda belum mendaftarkan lokasi usaha.
                </p>
                <p className="text-gray-500 mt-2">
                    Klik <span className="font-semibold">Ajukan Lokasi Baru</span> untuk memulai.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Lapak
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jenis Usaha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status Izin
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Pengajuan
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {lapaks.map((lapak) => {
                        // ✅ Logic button visibility berdasarkan status
                        const canEdit = lapak.izinStatus === 'Diajukan';
                        const canDelete = lapak.izinStatus !== 'Pengajuan Penghapusan'; // Semua status kecuali ini
                        
                        return (
                            <tr 
                                key={lapak.id} 
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                    #{lapak.id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {lapak.namaLapak}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {lapak.businessType}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span 
                                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            statusClasses[lapak.izinStatus]
                                        }`}
                                    >
                                        {lapak.izinStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(lapak.createdAt)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                    <button 
                                        onClick={() => onViewDetail(lapak)} 
                                        className="text-blue-600 hover:text-blue-900 p-1 transition"
                                        title="Lihat Detail"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    
                                    {/* ✅ Edit: Hanya untuk "Diajukan" */}
                                    {canEdit && (
                                        <button 
                                            onClick={() => onEdit(lapak)} 
                                            className="text-yellow-600 hover:text-yellow-800 p-1 transition"
                                            title="Edit"
                                        >
                                            <PencilSimple size={20} />
                                        </button>
                                    )}
                                    
                                    {/* ✅ Delete: Semua status KECUALI "Pengajuan Penghapusan" */}
                                    {canDelete && (
                                        <button 
                                            onClick={() => onDelete(lapak.id)} 
                                            className="text-red-600 hover:text-red-800 p-1 transition"
                                            title="Hapus / Ajukan Penghapusan"
                                        >
                                            <TrashSimple size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}