import React from 'react';
import { Eye, TrashSimple, PencilSimple } from '@phosphor-icons/react';

interface LapakUsaha {
    id: number;
    namaLapak: string;
    koordinat: string;
    izinStatus: 'Aktif' | 'Diajukan' | 'Ditolak';
    tanggalDaftar: string;
    tanggalKedaluwarsa: string;
}

interface LocationTableUMKMProps {
    lapaks: LapakUsaha[];
    onViewDetail: (lapak: LapakUsaha) => void;
    onEdit: (lapak: LapakUsaha) => void;
    onDelete: (id: number) => void;
}

const statusClasses = {
    'Aktif': 'bg-green-100 text-green-700',
    'Diajukan': 'bg-yellow-100 text-yellow-700',
    'Ditolak': 'bg-red-100 text-red-700',
};

export default function LocationTableUMKM({ lapaks, onViewDetail, onEdit, onDelete }: LocationTableUMKMProps) {

    const isExpiredOrSoon = (dateStr: string) => {
        if (dateStr === 'N/A') return 'pending';
        const expirationDate = new Date(dateStr);
        const today = new Date();
        const soonThreshold = 30 * 24 * 60 * 60 * 1000; // 30 hari dalam milidetik

        if (expirationDate < today) {
            return 'expired';
        } else if (expirationDate.getTime() - today.getTime() <= soonThreshold) {
            return 'soon';
        }
        return 'active';
    };

    if (lapaks.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium text-gray-700">Anda belum mendaftarkan lokasi usaha.</p>
                <p className="text-gray-500 mt-2">Klik `Ajukan Lokasi Baru`` untuk memulai.</p>
            </div>
        );
    }


    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lapak</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Koordinat</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Izin</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kedaluwarsa</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {lapaks.map((lapak) => {
                        const expireStatus = isExpiredOrSoon(lapak.tanggalKedaluwarsa);
                        const statusClass = expireStatus === 'expired' ? 'text-red-600 font-bold' : expireStatus === 'soon' ? 'text-yellow-600' : 'text-gray-500';

                        return (
                            <tr key={lapak.id} className={`transition-colors ${expireStatus === 'expired' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{lapak.id}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lapak.namaLapak}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{lapak.koordinat}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[lapak.izinStatus]}`}>
                                        {lapak.izinStatus}
                                    </span>
                                </td>
                                <td className={`px-4 py-4 whitespace-nowrap text-sm ${statusClass}`}>
                                    {lapak.tanggalKedaluwarsa}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                    <button onClick={() => onViewDetail(lapak)} className="text-blue-600 hover:text-blue-900 p-1">
                                        <Eye size={20} />
                                    </button>
                                    <button onClick={() => onEdit(lapak)} className="text-yellow-600 hover:text-yellow-800 p-1">
                                        <PencilSimple size={20} />
                                    </button>
                                    <button onClick={() => onDelete(lapak.id)} className="text-red-600 hover:text-red-800 p-1">
                                        <TrashSimple size={20} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}