// File: components/admin/LocationDetailModal.tsx (Baru)

import React from 'react';
import { X, Info, User, Envelope , Calendar, MapPinLine, WarningCircle } from '@phosphor-icons/react';

interface UmkmDetail {
    namaPemilik: string;
    emailKontak: string;
    tanggalPengajuan: string;
}

interface LocationDetail {
    id: number;
    koordinat: [number, number]; 
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    umkmName: string;
    umkmDetail?: UmkmDetail;
    reasonForRestriction?: string;
}

interface LocationDetailModalProps {
    location: LocationDetail;
    onClose: () => void;
}

export default function LocationDetailModal({ location, onClose }: LocationDetailModalProps) {
    const statusColor = location.status === 'Terisi' ? 'bg-green-500' : location.status === 'Tersedia' ? 'bg-blue-500' : 'bg-red-500';

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Info size={28} className="text-blue-500" /> Detail Titik Lokasi
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {/* Status Umum */}
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                        <p className="text-sm font-semibold">Status Zonasi</p>
                        <span className={`py-1 px-3 rounded-full text-white font-bold text-sm ${statusColor}`}>
                            {location.status}
                        </span>
                    </div>

                    {/* Koordinat */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinLine size={20} className="text-gray-400" />
                        Koordinat: {location.koordinat[0]}, {location.koordinat[1]}
                    </div>

                    {/* Konten Kondisional */}
                    {location.status === 'Terisi' && location.umkmDetail ? (
                        <div className="border p-4 rounded-lg space-y-3">
                            <h3 className="font-bold text-lg text-green-700">Detail Usaha ({location.umkmName})</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <User size={18} className="text-gray-500" /> Pemilik: {location.umkmDetail.namaPemilik}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Envelope  size={18} className="text-gray-500" /> Email: {location.umkmDetail.emailKontak}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={18} className="text-gray-500" /> Diajukan: {location.umkmDetail.tanggalPengajuan}
                            </div>
                        </div>
                    ) : location.status === 'Terlarang' && location.reasonForRestriction ? (
                        <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50">
                            <h3 className="font-bold text-red-700 flex items-center gap-2">
                                <WarningCircle size={20} /> Zona Terlarang
                            </h3>
                            <p className="text-sm mt-1">{location.reasonForRestriction}</p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-blue-50 text-blue-700 text-sm">
                            Titik ini **Tersedia** dan siap untuk diajukan oleh UMKM.
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}