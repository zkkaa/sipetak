// File: components/dashboard/CitizenReportWidget.tsx

import React from 'react';
import { Warning, Clock } from '@phosphor-icons/react';
import Link from 'next/link';

interface CitizenReport {
    id: number;
    jenisPelanggaran: string;
    tanggalLapor: string;
    status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai';
}

const statusColors = {
    'Belum Diperiksa': 'text-red-600 bg-red-100',
    'Sedang Diproses': 'text-yellow-600 bg-yellow-100',
    'Selesai': 'text-green-600 bg-green-100',
};

interface CitizenReportWidgetProps {
    reports: CitizenReport[];
}

export default function CitizenReportWidget({ reports }: CitizenReportWidgetProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Warning size={24} weight="fill" className="text-red-500" /> Laporan Warga Terbaru
            </h2>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
                {reports.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Tidak ada laporan warga terbaru.</p>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="border-b pb-3 pt-1">
                            <p className="font-semibold text-gray-700 truncate">{report.jenisPelanggaran}</p>
                            <div className="flex justify-between items-center text-xs mt-2">
                                <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[report.status]}`}>
                                    {report.status}
                                </span>
                                <span className="text-gray-400 flex items-center gap-1">
                                    <Clock size={14} /> {report.tanggalLapor}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4 text-center">
                <Link href="/admin/laporan" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Lihat Semua Laporan &rarr;
                </Link>
            </div>
        </div>
    );
}