"use client";
import React from 'react';
import { X, CheckCircle, MapPinLine, FileText, XCircle } from '@phosphor-icons/react';

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

interface VerificationModalProps {
    submission: Submission;
    onClose: () => void;
    onUpdateStatus: (id: number, newStatus: 'Diterima' | 'Ditolak') => void;
}

export default function VerificationModal({ submission, onClose, onUpdateStatus }: VerificationModalProps) {
    const isPending = submission.status === 'Diajukan';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={28} className="text-blue-500" /> Detail Verifikasi #{submission.id}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Status Pengajuan */}
                <div className={`p-4 rounded-lg mb-4 text-white font-semibold ${isPending ? 'bg-yellow-500' : (submission.status === 'Diterima' ? 'bg-green-500' : 'bg-red-500')}`}>
                    Status Saat Ini: {submission.status}
                </div>

                {/* Detail Data */}
                <div className="space-y-3 text-sm text-gray-700 max-h-80 overflow-y-auto">
                    <p><strong>Nama Usaha:</strong> {submission.namaUsaha}</p>
                    <p><strong>Email:</strong> {submission.emailPemohon}</p>
                    <p><strong>Tanggal Pengajuan:</strong> {submission.tanggalPengajuan}</p>
                    <p className="flex items-center gap-1">
                        <MapPinLine size={18} /> <strong>Lokasi:</strong> {submission.lokasiDetail}
                    </p>
                    <a href={submission.dokumenUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline pt-2">
                        <FileText size={18} /> Lihat Dokumen Pendukung (Wajib Disurvei)
                    </a>
                    
                    {/* Placeholder Lokasi Peta Mini akan dimasukkan di sini jika ada */}
                </div>

                {/* Tombol Aksi Verifikasi (Hanya jika status 'Diajukan') */}
                {isPending && (
                    <div className="mt-6 pt-4 border-t flex justify-between gap-3">
                        <button 
                            onClick={() => onUpdateStatus(submission.id, 'Ditolak')} 
                            className="flex items-center gap-2 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            <XCircle size={20} /> Tolak Pengajuan
                        </button>
                        <button 
                            onClick={() => onUpdateStatus(submission.id, 'Diterima')} 
                            className="flex items-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            <CheckCircle size={20} /> Terima & Setujui
                        </button>
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="py-2 px-4 text-gray-600 hover:bg-gray-200 rounded-lg transition">
                        {isPending ? 'Tutup' : 'Kembali'}
                    </button>
                </div>
            </div>
        </div>
    );
}