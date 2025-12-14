"use client";
import React from 'react';
import { PaperPlaneTilt } from '@phosphor-icons/react';

interface SubmitConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function SubmitConfirmModal({
    isOpen,
    title = "Kirim Laporan?",
    message = "Pastikan semua data yang Anda masukkan sudah benar. Laporan yang sudah dikirim tidak dapat diubah.",
    onClose,
    onConfirm,
    confirmText = "Ya, Kirim",
    cancelText = "Cek Lagi"
}: SubmitConfirmModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-fadeIn">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-3">
                        <PaperPlaneTilt size={48} color="#FFFFFF" weight="fill" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    
                    <p className="text-sm text-gray-600">
                        {message}
                    </p>
                </div>
                <div className="flex justify-center gap-3">
                    <button 
                        onClick={onClose} 
                        className="w-1/2 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="w-1/2 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}