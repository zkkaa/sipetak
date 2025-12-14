import React from 'react';
import { Eye } from '@phosphor-icons/react';
import type { DeletionRequest } from '@/types/deletion';

interface DeletionRequestTableProps {
    requests: DeletionRequest[];
    onViewDetail: (request: DeletionRequest) => void;
}

const statusClasses = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Approved': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
};

const calculateDuration = (dateApplied: Date | string | undefined): string => {
    if (!dateApplied) return '-';
    
    try {
        const start = new Date(dateApplied);
        const now = new Date();
        
        const diffMs = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        
        if (diffMonths > 0) {
            return `${diffMonths} bulan ${remainingDays} hari`;
        }
        return `${diffDays} hari`;
    } catch {
        return '-';
    }
};

export default function DeletionRequestTable({
    requests,
    onViewDetail
}: DeletionRequestTableProps) {
    if (requests.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Tidak ada pengajuan penghapusan.</p>
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
                            Pemilik
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alasan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durasi Operasi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Pengajuan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                        <tr
                            key={request.id}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{request.id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {request.namaLapak || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                <div>
                                    <p className="font-medium">{request.namaPemilik || '-'}</p>
                                    <p className="text-xs text-gray-500">{request.emailPemohon || '-'}</p>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                                <div className="truncate" title={request.reason}>
                                    {request.reason.substring(0, 50)}
                                    {request.reason.length > 50 && '...'}
                                </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {calculateDuration(request.dateApplied)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {request.requestedAt 
                                    ? new Date(request.requestedAt).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : '-'
                                }
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span
                                    className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                        statusClasses[request.status]
                                    }`}
                                >
                                    {request.status}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onViewDetail(request)}
                                    className="text-blue-600 hover:text-blue-900 p-1 transition"
                                    title="Lihat Detail"
                                >
                                    <Eye size={20} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}