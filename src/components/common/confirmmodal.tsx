import React from 'react';
import { WarningCircle } from '@phosphor-icons/react'; 

interface ConfirmationModalProps {
    title: string;
    message: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmText?: string; 
    cancelText?: string; 
    icon?: React.ReactNode; 
    confirmColor?: 'red' | 'green' | 'blue' | 'yellow';
}

const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-green-600 hover:bg-green-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
};

const iconBgClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
};

export default function ConfirmationModal({
    title,
    message,
    onClose,
    onConfirm,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    icon = <WarningCircle size={48} color="#FFFFFF" weight="fill" />, 
    confirmColor = 'red' 
}: ConfirmationModalProps) {
    
    const colorClass = colorClasses[confirmColor] || colorClasses.red;
    const iconBgClass = iconBgClasses[confirmColor] || iconBgClasses.red;

    const handleConfirmClick = () => {
        onConfirm();
        onClose(); 
    };

    const isSingleButton = !cancelText || cancelText.trim() === '';

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300">
                
                <div className="text-center mb-6">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${iconBgClass}`}>
                        {icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{message}</p>
                </div>
                
                {isSingleButton ? (
                    <button 
                        onClick={handleConfirmClick} 
                        className={`w-full py-3 text-white rounded-lg transition font-semibold ${colorClass}`}
                    >
                        {confirmText}
                    </button>
                ) : (
                    <div className="flex justify-center gap-3">
                        <button 
                            onClick={onClose} 
                            className="w-1/2 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={handleConfirmClick} 
                            className={`w-1/2 py-2 text-white rounded-lg transition ${colorClass}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}