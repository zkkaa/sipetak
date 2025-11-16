import React from 'react';
import { MapPin, CalendarBlank, CheckCircle, WarningCircle } from '@phosphor-icons/react';

interface Location {
    id: number;
    namaLokasi: string;
    izinStatus: 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan';
    tanggalKedaluwarsa: string;
}

const statusColors = {
    Aktif: 'bg-green-100 text-green-700 border-green-300',
    Kedaluwarsa: 'bg-red-100 text-red-700 border-red-300',
    Ditangguhkan: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

interface LocationListWidgetProps {
    locations: Location[];
}

export default function LocationListWidget({ locations }: LocationListWidgetProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={24} weight="fill" className="text-blue-500" /> Riwayat Lokasi Usaha
            </h2>

            <div className="space-y-4 max-h-80 overflow-y-auto">
                {locations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Anda belum mendaftarkan lokasi usaha.</p>
                ) : (
                    locations.map((loc) => (
                        <div key={loc.id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition">
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${statusColors[loc.izinStatus]}`}>
                                    {loc.izinStatus === 'Aktif' ? <CheckCircle size={20} weight="fill" /> : <WarningCircle size={20} weight="fill" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{loc.namaLokasi}</p>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <CalendarBlank size={14} /> Kedaluwarsa: {loc.tanggalKedaluwarsa}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[loc.izinStatus]}`}>
                                {loc.izinStatus}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}