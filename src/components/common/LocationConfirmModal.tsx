"use client";
import React from 'react';
import { MapPin, CheckCircle } from '@phosphor-icons/react';

interface LocationData {
    latitude: number;
    longitude: number;
    akurasi: number;
}

interface LocationConfirmModalProps {
    isOpen: boolean;
    locationData: LocationData | null;
    onClose: () => void;
    onConfirm: (data: LocationData) => void;
}

export default function LocationConfirmModal({
    isOpen,
    locationData,
    onClose,
    onConfirm
}: LocationConfirmModalProps) {
    if (!isOpen || !locationData) return null;

    const handleConfirm = () => {
        onConfirm(locationData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-fadeIn">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-3">
                        <CheckCircle size={48} color="#FFFFFF" weight="fill" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                        <MapPin size={24} weight="fill" />
                        LOKASI BERHASIL DIAMBIL!
                    </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Latitude:</span>
                        <span className="text-sm font-bold text-gray-900 font-mono">
                            {locationData.latitude.toFixed(6)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Longitude:</span>
                        <span className="text-sm font-bold text-gray-900 font-mono">
                            {locationData.longitude.toFixed(6)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Akurasi:</span>
                        <span className="text-sm font-bold text-green-600">
                            ±{locationData.akurasi} meter
                        </span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 text-center mb-6">
                    Apakah Anda ingin menggunakan lokasi ini untuk laporan?
                </p>
                <div className="flex justify-center gap-3">
                    <button 
                        onClick={onClose} 
                        className="w-1/2 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        className="w-1/2 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg transition font-medium"
                    >
                        Ya, Gunakan
                    </button>
                </div>
            </div>
        </div>
    );
}