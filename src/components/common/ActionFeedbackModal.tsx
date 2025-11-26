import React from 'react';
import { CheckCircle, XCircle, Info } from '@phosphor-icons/react';

interface ActionFeedbackModalProps {
    message: string;
    type: 'success' | 'error' | 'info'; 
    onClose: () => void;
}

const typeConfig = {
    success: { 
        icon: <CheckCircle size={48} color="#FFFFFF" weight="fill" />, 
        color: 'bg-green-500', 
        title: 'Berhasil' 
    },
    error: { 
        icon: <XCircle size={48} color="#FFFFFF" weight="fill" />, 
        color: 'bg-red-500', 
        title: 'Gagal' 
    },
    info: { 
        icon: <Info size={48} color="#FFFFFF" weight="fill" />, 
        color: 'bg-blue-500', 
        title: 'Informasi' 
    }
};

export default function ActionFeedbackModal({ message, type, onClose }: ActionFeedbackModalProps) {
    const config = typeConfig[type];

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs transform transition-all duration-300 text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${config.color}`}>
                    {config.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900">{config.title}</h3>
                <p className="text-sm text-gray-600 mt-2 mb-4">{message}</p>
                
                <button 
                    onClick={onClose} 
                    className={`w-full py-2 text-white rounded-lg transition ${config.color}`}
                >
                    Tutup
                </button>
            </div>
        </div>
    );
}