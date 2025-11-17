import React from 'react';
import { Eye } from '@phosphor-icons/react';

interface Submission {
    id: number;
    namaUsaha: string;
    emailPemohon: string;
    tanggalPengajuan: string;
    jenis: 'Lokasi Baru' | 'Sertifikat';
    status: 'Diajukan' | 'Diterima' | 'Ditolak';
    lokasiDetail: string;
    dokumenUrl: string;
}

interface SubmissionTableProps {
    submissions: Submission[];
    onViewDetail: (submission: Submission) => void;
}

const statusClasses = {
    'Diajukan': 'bg-yellow-100 text-yellow-700',
    'Diterima': 'bg-green-100 text-green-700',
    'Ditolak': 'bg-red-100 text-red-700',
};

export default function SubmissionTable({ submissions, onViewDetail }: SubmissionTableProps) {
    if (submissions.length === 0) {
        return <p className="text-center py-8 text-gray-500">Tidak ada item dalam antrian ini.</p>;
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Usaha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{sub.id}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.namaUsaha}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{sub.jenis}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{sub.tanggalPengajuan}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[sub.status]}`}>
                                    {sub.status}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onViewDetail(sub)} className="text-blue-600 hover:text-blue-900">
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