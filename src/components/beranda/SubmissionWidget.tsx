import React from 'react';
import { Clock, MapPinLine, CheckCircle, XCircle } from '@phosphor-icons/react';
import Link from 'next/link';

interface Submission {
    id: number;
    namaUsaha: string;
    emailPemohon: string;
    tanggal: string;
    status: 'Menunggu Verifikasi' | 'Ditolak' | 'Disurvei' | 'Selesai';
}

const statusColors = {
    'Menunggu Verifikasi': 'text-yellow-600 bg-yellow-50',
    'Ditolak': 'text-red-600 bg-red-50',
    'Disurvei': 'text-blue-600 bg-blue-50',
    'Selesai': 'text-green-600 bg-green-50',
};

interface SubmissionWidgetProps {
    submissions: Submission[];
}

export default function SubmissionWidget({ submissions }: SubmissionWidgetProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPinLine size={24} weight="fill" className="text-blue-500" /> Pengajuan Lokasi Terbaru
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {submissions.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Tidak ada pengajuan lokasi yang sedang diproses.</p>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="border-b pb-3 pt-1">
                            <p className="font-semibold text-gray-700 truncate">{sub.namaUsaha}</p>
                            <p className="text-xs text-gray-500 truncate mb-2">{sub.emailPemohon}</p>
                            
                            <div className="flex justify-between items-center text-xs">
                                <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[sub.status]}`}>
                                    {sub.status}
                                </span>
                                <span className="text-gray-400 flex items-center gap-1">
                                    <Clock size={14} /> {sub.tanggal}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4 text-center">
                <Link href="/beranda/pengajuan" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Lihat Semua Pengajuan &rarr;
                </Link>
            </div>
        </div>
    );
}