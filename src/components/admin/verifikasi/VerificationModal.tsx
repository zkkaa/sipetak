"use client";
import React from 'react';
import { X, CheckCircle, MapPinLine, FileText, XCircle } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';

// IMPOR DINAMIS PETA
const DynamicMapInput = dynamic(
    () => import('../../MapInput'), // Sesuaikan path MapInput Anda
    { ssr: false }
);

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
    const dummyLat = -7.3364;
    const dummyLon = 108.2225;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl">

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">

                    {/* KOLOM 1: Detail Tekstual (70% Konten) */}
                    <div className="space-y-3 text-sm text-gray-700 pr-4">
                        <p><strong>Nama Usaha:</strong> {submission.namaUsaha}</p>
                        <p><strong>Email:</strong> {submission.emailPemohon}</p>
                        <p><strong>Tanggal Pengajuan:</strong> {submission.tanggalPengajuan}</p>

                        <div className="pt-2 border-t mt-4">
                            <p className="font-medium text-gray-800">Lokasi Diajukan:</p>
                            <p className="flex items-center gap-1">
                                <MapPinLine size={18} /> {submission.lokasiDetail}
                            </p>
                        </div>

                        {/* Link Dokumen */}
                        <a href={submission.dokumenUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline pt-2">
                            <FileText size={18} /> Lihat Dokumen Pendukung
                        </a>
                    </div>

                    {/* KOLOM 2: PETA INTERAKTIF (30% Konten) */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800">Visualisasi Peta</h3>
                        <div className="w-64 h-64 rounded-lg overflow-hidden border border-gray-200 shadow-md">
                            <DynamicMapInput
                                // 💡 SOLUSI: Tambahkan key yang unik berdasarkan ID submission
                                key={`map-${submission.id}`}
                                latitude={dummyLat.toString()}
                                longitude={dummyLon.toString()}
                            />
                        </div>
                        <p className="text-xs text-gray-500">Koordinat: {dummyLat}, {dummyLon}</p>
                    </div>

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