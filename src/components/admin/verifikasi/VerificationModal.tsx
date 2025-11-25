// File: src/components/admin/verifikasi/VerificationModal.tsx

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Info } from '@phosphor-icons/react';
import type { Submission } from '../../../types/submission';

interface VerificationModalProps {
    submission: Submission;
    onClose: () => void;
    onUpdateStatus: (id: number, newStatus: 'Diterima' | 'Ditolak') => Promise<void>;
}

export default function VerificationModal({
    submission,
    onClose,
    onUpdateStatus
}: VerificationModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showReasonInput, setShowReasonInput] = useState(false);

    const isPending = submission.izinStatus === 'Diajukan';

    const getStatusColor = (status: 'Diajukan' | 'Diterima' | 'Ditolak') => {
        switch (status) {
            case 'Diajukan':
                return 'bg-yellow-50 border-yellow-200';
            case 'Diterima':
                return 'bg-green-50 border-green-200';
            case 'Ditolak':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const getStatusBadgeColor = (status: 'Diajukan' | 'Diterima' | 'Ditolak') => {
        switch (status) {
            case 'Diajukan':
                return 'bg-yellow-100 text-yellow-700';
            case 'Diterima':
                return 'bg-green-100 text-green-700';
            case 'Ditolak':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            await onUpdateStatus(submission.id, 'Diterima');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Silakan masukkan alasan penolakan');
            return;
        }
        setIsProcessing(true);
        try {
            await onUpdateStatus(submission.id, 'Ditolak');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 ${getStatusColor(submission.izinStatus)}`}>

                {/* Header */}
                <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={28} className="text-blue-500" />
                            Detail Pengajuan #{submission.id}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">Verifikasi dan proses pengajuan lokasi usaha</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <Info size={20} className="text-blue-500" />
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(submission.izinStatus)}`}>
                            Status: {submission.izinStatus}
                        </span>
                    </div>

                    {/* Detail Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Left Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 border-b pb-2">Informasi Lapak</h3>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Nama Lapak</label>
                                <p className="text-lg font-semibold text-gray-900">{submission.namaLapak}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Jenis Usaha</label>
                                <p className="text-gray-900">{submission.businessType}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">ID Lokasi Master</label>
                                <p className="text-gray-900">#{submission.masterLocationId}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Tanggal Pengajuan</label>
                                <p className="text-gray-900">
                                    {submission.dateApplied 
                                        ? new Date(submission.dateApplied).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : '-'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 border-b pb-2">Informasi Pemilik</h3>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Nama Pemilik</label>
                                <p className="text-gray-900 font-medium">{submission.namaPemilik}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Email</label>
                                <p className="text-gray-900">
                                    <a href={`mailto:${submission.emailPemohon}`} className="text-blue-600 hover:underline">
                                        {submission.emailPemohon}
                                    </a>
                                </p>
                            </div>

                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs text-blue-600">
                                    💡 <strong>Tips:</strong> Verifikasi dokumen dan lokasi sebelum menyetujui pengajuan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rejection Reason (conditional) */}
                    {showReasonInput && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <label className="text-sm font-medium text-gray-700 block mb-2">
                                Alasan Penolakan
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Jelaskan alasan penolakan untuk pemilik UMKM..."
                                className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        {isPending ? (
                            <>
                                {!showReasonInput && (
                                    <>
                                        <button
                                            onClick={() => setShowReasonInput(true)}
                                            disabled={isProcessing}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={20} />
                                            {isProcessing ? 'Memproses...' : 'Tolak Pengajuan'}
                                        </button>

                                        <button
                                            onClick={handleApprove}
                                            disabled={isProcessing}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle size={20} />
                                            {isProcessing ? 'Memproses...' : 'Setujui Pengajuan'}
                                        </button>
                                    </>
                                )}

                                {showReasonInput && (
                                    <>
                                        <button
                                            onClick={() => setShowReasonInput(false)}
                                            disabled={isProcessing}
                                            className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={isProcessing || !rejectionReason.trim()}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-700 text-white rounded-lg hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={20} />
                                            {isProcessing ? 'Memproses...' : 'Konfirmasi Penolakan'}
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                Tutup
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}