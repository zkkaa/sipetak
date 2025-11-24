// File: src/components/umkm/sertifikat/CertificateTable.tsx

import React from 'react';
import { Eye } from '@phosphor-icons/react';

// ✅ Interface yang konsisten dengan page.tsx dan modal
interface CertificateItem {
    id: number;
    nomorSertifikat: string;
    namaUsaha: string;
    tanggalTerbit: string;
    tanggalKedaluwarsa: string;
    status: 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan';
    unduhLink: string;
    namaPemilik: string;
    lokasiLapak: string;
    // ✅ Field opsional untuk modal
    namaPengelola?: string;
    namaPemerintah?: string;
}

interface CertificateTableProps {
    certificates: CertificateItem[];
    onView: (cert: CertificateItem) => void;
}

const statusClasses = {
    'Aktif': 'bg-green-100 text-green-700',
    'Kedaluwarsa': 'bg-red-100 text-red-700',
    'Ditangguhkan': 'bg-yellow-100 text-yellow-700',
};

export default function CertificateTable({ certificates, onView }: CertificateTableProps) {
    if (certificates.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium text-gray-700">Anda belum memiliki sertifikat yang diterbitkan.</p>
                <p className="text-gray-500 mt-2">Ajukan lokasi baru untuk mendapatkan sertifikat.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Sertifikat</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Usaha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kedaluwarsa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {cert.nomorSertifikat}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {cert.namaUsaha}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {new Date(cert.tanggalKedaluwarsa).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[cert.status]}`}>
                                    {cert.status}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onView(cert)}
                                    className="p-2 rounded-full transition bg-blue-500 text-white hover:bg-blue-600"
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