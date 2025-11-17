// File: components/admin/AddLocationModal.tsx

import React, { useState } from 'react';
import { MapPin, X } from '@phosphor-icons/react';

interface AddLocationModalProps {
    onClose: () => void;
    onSave: (newLocation: { lat: number, lon: number, status: 'Tersedia' | 'Terlarang', name: string, reason?: string }) => void;
    clickedCoords?: { lat: number, lon: number };
}

export default function AddLocationModal({ onClose, onSave, clickedCoords }: AddLocationModalProps) {
    const [lat, setLat] = useState(clickedCoords ? clickedCoords.lat.toString() : '');
    const [lon, setLon] = useState(clickedCoords ? clickedCoords.lon.toString() : '');
    const [status, setStatus] = useState<'Tersedia' | 'Terlarang'>('Tersedia');
    const [name, setName] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);

        if (isNaN(parsedLat) || isNaN(parsedLon)) {
            alert("Koordinat tidak valid!");
            return;
        }

        onSave({ lat: parsedLat, lon: parsedLon, status, name: name.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin size={24} className="text-blue-500" /> Tambah Titik Master
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    
                    {/* Status Titik */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Status Zonasi</label>
                        <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value as 'Tersedia' | 'Terlarang')}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="Tersedia">Tersedia (Boleh diisi UMKM)</option>
                            <option value="Terlarang">Terlarang (Zona Merah)</option>
                        </select>
                    </div>

                    {/* Koordinat Lintang */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Latitude (Lintang)</label>
                        <input 
                            type="text" 
                            value={lat} 
                            onChange={(e) => setLat(e.target.value)}
                            placeholder="-6.7454"
                            className="w-full p-2 border rounded-lg"
                            required 
                        />
                    </div>
                    
                    {/* Koordinat Bujur */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Longitude (Bujur)</label>
                        <input 
                            type="text" 
                            value={lon} 
                            onChange={(e) => setLon(e.target.value)}
                            placeholder="108.5575"
                            className="w-full p-2 border rounded-lg"
                            required 
                        />
                    </div>
                    
                    {/* Nama/Penanda (Opsional) */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Penanda (Opsional)</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Zona Hijau Pasar"
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                            Batal
                        </button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition">
                            Simpan Titik
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}