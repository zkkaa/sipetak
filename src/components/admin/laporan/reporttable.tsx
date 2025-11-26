import React from 'react';
import { Eye, Clock } from '@phosphor-icons/react';

interface CitizenReport {
    id: number;
    jenisPelanggaran: string;
    lokasiDetail: string;
    tanggalLapor: string;
    status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai';
    koordinat: [number, number]; 
    buktiUrl: string; 
    deskripsiWarga: string; 
}

interface ReportTableProps {
    reports: CitizenReport[];
    onViewDetail: (report: CitizenReport) => void;
}

const statusClasses = {
    'Belum Diperiksa': 'bg-red-100 text-red-700',
    'Sedang Diproses': 'bg-yellow-100 text-yellow-700',
    'Selesai': 'bg-green-100 text-green-700',
};

export default function ReportTable({ reports, onViewDetail }: ReportTableProps) {
    if (reports.length === 0) {
        return <p className="text-center py-8 text-gray-500">Tidak ada laporan dalam antrian yang sesuai.</p>;
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pelanggaran</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lapor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{report.id}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.jenisPelanggaran}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate">{report.lokasiDetail}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1">
                                <Clock size={14} /> {report.tanggalLapor}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[report.status]}`}>
                                    {report.status}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onViewDetail(report)} className="text-blue-600 hover:text-blue-900 p-1">
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