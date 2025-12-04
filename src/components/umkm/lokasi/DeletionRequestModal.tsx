// File: src/components/umkm/lokasi/DeletionRequestModal.tsx
"use client";
import React, { useState } from 'react';
import { X, Warning, XCircle, WarningCircle } from '@phosphor-icons/react';

interface DeletionRequestModalProps {
    lapakName: string;
    lapakId: number;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
}

export default function DeletionRequestModal({
    lapakName,
    lapakId,
    onClose,
    onSubmit
}: DeletionRequestModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MIN_CHARS = 30;
    const MAX_CHARS = 500;
    const charCount = reason.trim().length;
    const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

    const handleContinue = () => {
        if (!isValidLength) return;
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async () => {
        if (!isValidLength || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(reason.trim());
        } catch (error) {
            console.error('Error submitting deletion request:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 p-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <Warning size={24} className="text-red-600" weight="duotone" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {step === 1 ? 'Pengajuan Penghapusan Lokasi' : 'Konfirmasi Akhir'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                **Step {step}: {step === 1 ? 'Modal Confirmation kedua' : 'Modal Confirmation kedua'}**
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 ? (
                        // ========== STEP 1: Input Alasan ==========
                        <div className="space-y-5">
                            {/* Info Box */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <WarningCircle size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Anda akan mengajukan penghapusan lokasi{' '}
                                            <span className="font-semibold text-gray-900">{lapakName}</span>
                                        </p>
                                        <div className="mt-3 space-y-1.5">
                                            <p className="text-xs font-medium text-gray-600">Konsekuensi:</p>
                                            <ul className="space-y-1 text-xs text-gray-600">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-gray-400 mt-0.5">•</span>
                                                    <span>Lokasi tidak dapat digunakan selama proses review</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-gray-400 mt-0.5">•</span>
                                                    <span>Admin akan meninjau pengajuan Anda</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-gray-400 mt-0.5">•</span>
                                                    <span>Proses dapat memakan waktu beberapa hari</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Alasan Penghapusan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Jelaskan alasan Anda ingin menghapus lokasi ini..."
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none resize-none transition ${
                                        charCount > 0 && !isValidLength 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                                    }`}
                                    rows={5}
                                    maxLength={MAX_CHARS}
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <span className={`text-xs font-medium ${
                                        charCount < MIN_CHARS 
                                            ? 'text-red-600' 
                                            : 'text-green-600'
                                    }`}>
                                        {charCount < MIN_CHARS 
                                            ? `Minimal ${MIN_CHARS - charCount} karakter lagi`
                                            : '✓ Alasan memenuhi syarat'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {charCount} / {MAX_CHARS}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // ========== STEP 2: Konfirmasi Final ==========
                        <div className="space-y-5">
                            {/* Confirmation Box */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <XCircle size={24} className="text-red-600 flex-shrink-0" weight="duotone" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">Konfirmasi Akhir</h3>
                                        <p className="text-sm text-gray-600">
                                            Apakah Anda yakin ingin mengajukan penghapusan lokasi ini?
                                        </p>
                                    </div>
                                </div>

                                {/* Data Summary */}
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Data yang akan dikirim:
                                    </p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></span>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500">Nama Lapak</span>
                                                <p className="text-sm font-medium text-gray-900">{lapakName}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></span>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500">Alasan</span>
                                                <p className="text-sm text-gray-700 italic leading-relaxed mt-0.5">
                                                    {reason.trim()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warning Box */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <Warning size={16} className="text-red-600 flex-shrink-0 mt-0.5" weight="fill" />
                                    <p className="text-xs text-red-900 leading-relaxed">
                                        Pengajuan ini <span className="font-semibold">tidak dapat dibatalkan</span> setelah dikirim. 
                                        Pastikan data sudah benar sebelum melanjutkan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    {step === 1 ? (
                        <>
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition font-medium disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleContinue}
                                disabled={!isValidLength || isSubmitting}
                                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Lanjutkan
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleBack}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition font-medium disabled:opacity-50"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    'Ya, Ajukan Penghapusan'
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}