// File: src/components/admin/verifikasi/SubmissionTable.tsx

import React from 'react';
import { Eye } from '@phosphor-icons/react';
import type { Submission } from '../../../types/submission';

interface SubmissionTableProps {
    submissions: Submission[];
    onViewDetail: (submission: Submission) => void;
}

// ✅ Status classes yang benar (gunakan "Diterima" bukan "Disetujui")
const statusClasses = {
    'Diajukan': 'bg-yellow-100 text-yellow-700',
    'Diterima': 'bg-green-100 text-green-700',
    'Ditolak': 'bg-red-100 text-red-700',
};

export default function SubmissionTable({ 
    submissions, 
    onViewDetail 
}: SubmissionTableProps) {
    
    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Tidak ada pengajuan dalam kategori ini.</p>
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
                            Jenis Usaha
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
                    {submissions.map((submission) => (
                        <tr
                            key={submission.id}
                            className="hover:bg-gray-50 transition-colors"
                        >
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{submission.id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {submission.namaLapak}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                <div>
                                    <p className="font-medium">{submission.namaPemilik}</p>
                                    <p className="text-xs text-gray-500">{submission.emailPemohon}</p>
                                </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {submission.businessType}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                {submission.dateApplied 
                                    ? new Date(submission.dateApplied).toLocaleDateString('id-ID', {
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
                                        statusClasses[submission.izinStatus]
                                    }`}
                                >
                                    {submission.izinStatus}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onViewDetail(submission)}
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