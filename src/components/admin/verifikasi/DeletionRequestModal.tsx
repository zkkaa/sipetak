import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MapPin, User, Clock } from '@phosphor-icons/react';
import type { DeletionRequest } from '@/types/deletion';

interface DeletionRequestModalProps {
    request: DeletionRequest;
    onClose: () => void;
    onApprove: (id: number) => Promise<void>;
    onReject: (id: number, reason: string) => Promise<void>;
}

export default function DeletionRequestModal({
    request,
    onClose,
    onApprove,
    onReject
}: DeletionRequestModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const isPending = request.status === 'Pending';

    const calculateDuration = (): string => {
        if (!request.dateApplied) return '-';
        
        try {
            const start = new Date(request.dateApplied);
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

    const handleApprove = async () => {
        if (!window.confirm('⚠️ KONFIRMASI: Apakah Anda yakin ingin MENYETUJUI penghapusan lokasi ini? Data akan dihapus PERMANEN dari database!')) {
            return;
        }

        setIsProcessing(true);
        try {
            await onApprove(request.id);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('⚠️ Silakan masukkan alasan penolakan');
            return;
        }

        if (!window.confirm('Apakah Anda yakin ingin menolak pengajuan penghapusan ini?')) {
            return;
        }

        setIsProcessing(true);
        try {
            await onReject(request.id, rejectionReason.trim());
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = () => {
        const styles = {
            Pending: 'bg-amber-50 text-amber-700 border-amber-200',
            Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            Rejected: 'bg-red-50 text-red-700 border-red-200'
        };
        return styles[request.status] || styles.Pending;
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                <div className="flex justify-between items-start border-b border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-white">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Review Pengajuan Penghapusan
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge()}`}>
                                {request.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">ID Pengajuan: #{request.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <MapPin size={20} className="text-blue-600" weight="duotone" />
                                    <h3 className="font-semibold text-gray-900">Informasi Lokasi</h3>
                                </div>
                                <InfoField label="Nama Lapak" value={request.namaLapak || '-'} />
                                <InfoField label="Jenis Usaha" value={request.businessType || '-'} />
                                <InfoField 
                                    label="Koordinat" 
                                    value={
                                        request.latitude && request.longitude 
                                            ? `${request.latitude}, ${request.longitude}`
                                            : '-'
                                    }
                                    mono
                                />
                                <InfoField 
                                    label="Tanggal Pengajuan Awal" 
                                    value={
                                        request.dateApplied 
                                            ? new Date(request.dateApplied).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : '-'
                                    }
                                />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <User size={20} className="text-blue-600" weight="duotone" />
                                    <h3 className="font-semibold text-gray-900">Informasi Pemilik</h3>
                                </div>

                                <InfoField label="Nama Pemilik" value={request.namaPemilik || '-'} />
                                <InfoField 
                                    label="Email" 
                                    value={
                                        <a href={`mailto:${request.emailPemohon}`} className="text-blue-600 hover:underline">
                                            {request.emailPemohon || '-'}
                                        </a>
                                    }
                                />
                                <InfoField 
                                    label="Tanggal Pengajuan Penghapusan" 
                                    value={
                                        request.requestedAt 
                                            ? new Date(request.requestedAt).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : '-'
                                    }
                                />
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg">
                                    <Clock size={20} className="text-blue-600" weight="duotone" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Durasi Operasi</p>
                                    <p className="text-lg font-semibold text-gray-900">{calculateDuration()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <label className="text-sm font-semibold text-gray-900 block mb-2">
                                Alasan Penghapusan dari Pemilik:
                            </label>
                            <p className="text-sm text-gray-700 leading-relaxed italic">
                                {request.reason}
                            </p>
                        </div>
                        {request.status === 'Rejected' && request.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <label className="text-sm font-semibold text-red-900 block mb-2">
                                    Alasan Penolakan dari Admin:
                                </label>
                                <p className="text-sm text-gray-800 leading-relaxed">
                                    {request.rejectionReason}
                                </p>
                            </div>
                        )}
                        {showRejectInput && isPending && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <label className="text-sm font-medium text-gray-900 block mb-2">
                                    Alasan Penolakan <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-600 mb-3">
                                    Alasan ini akan dikirimkan ke pemilik UMKM
                                </p>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Jelaskan mengapa pengajuan penghapusan ditolak..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {isPending ? (
                        <div className="flex gap-3">
                            {!showRejectInput ? (
                                <>
                                    <button
                                        onClick={() => setShowRejectInput(true)}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium disabled:opacity-50"
                                    >
                                        <XCircle size={20} />
                                        Tolak
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                                    >
                                        <CheckCircle size={20} />
                                        {isProcessing ? 'Memproses...' : 'Setujui Penghapusan'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowRejectInput(false);
                                            setRejectionReason('');
                                        }}
                                        disabled={isProcessing}
                                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition font-medium disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        disabled={isProcessing || !rejectionReason.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:bg-gray-300"
                                    >
                                        <XCircle size={20} />
                                        {isProcessing ? 'Memproses...' : 'Konfirmasi Penolakan'}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                            Tutup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoField({ 
    label, 
    value, 
    mono = false 
}: { 
    label: string; 
    value: React.ReactNode; 
    mono?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
                {label}
            </label>
            <p className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>
                {value}
            </p>
        </div>
    );
}