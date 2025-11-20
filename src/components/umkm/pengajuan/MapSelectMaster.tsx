"use client";
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// import { Handshake } from '@phosphor-icons/react';

// Hapus ikon default Leaflet (sudah ada di root MapInput.tsx)
// @ts-expect-error Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
});

// Tipe Marker Kustom
// 💡 SOLUSI 1: Deklarasikan fungsi ini di sini (atau impor)
const createCustomIcon = (color: string) => {
    const html = `<div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`;
    return L.divIcon({
        className: 'custom-div-icon',
        html: html,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};


// Komponen Internal untuk Perubahan Peta (ChangeView tetap sama)
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

interface MasterLocation {
    id: number;
    koordinat: [number, number];
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    umkmName: string;
    reasonForRestriction?: string;
}

interface MapSelectMasterProps {
    masterLocations: MasterLocation[];
    onSelectLocation: (id: number | null, status: 'Tersedia' | 'Terlarang' | null) => void;
    selectedMasterId: number | null;
}

const MapSelectMaster: React.FC<MapSelectMasterProps> = ({ masterLocations, onSelectLocation, selectedMasterId }) => {
    const centerLat = -7.3364;
    const centerLon = 108.2225;
    const defaultCenter: [number, number] = [centerLat, centerLon];
    

    // 💡 Handler Klik Peta untuk Seleksi
    const MapClickHandler: React.FC = () => {
    useMapEvents({
        // 💡 SOLUSI: Gunakan underscore (_) untuk parameter yang tidak digunakan
        click: () => { 
            // Logika ini untuk Admin Master, tidak diperlukan di sini (User hanya klik marker)
            // Karena ini adalah MapSelectMaster UMKM, kita tidak perlu logic klik ini.
            // Biarkan saja, karena kita hanya ingin klik pada marker yang bekerja.
        },
    });
    return null;
};

    // Tentukan warna marker
    const getMarkerColor = (status: MasterLocation['status']) => {
        switch (status) {
            case 'Terisi': return 'green';
            case 'Tersedia': return 'blue';
            case 'Terlarang': return 'red';
            default: return 'gray';
        }
    };

    const markers = useMemo(() => {
        return masterLocations.map(loc => {
            const color = getMarkerColor(loc.status);
            const icon = createCustomIcon(color);
            

            // Tentukan konten Popup (sesuai permintaan Anda)
            const PopupContent = () => (
                <div>
                    <h4 className={`font-bold text-lg ${loc.status === 'Tersedia' ? 'text-blue-600' : loc.status === 'Terlarang' ? 'text-red-600' : 'text-gray-600'}`}>
                        {loc.status === 'Terisi' ? loc.umkmName : loc.status === 'Terlarang' ? 'Zona Terlarang' : 'Titik Tersedia'}
                    </h4>
                    <p className="text-sm mt-1">{loc.koordinat[0].toFixed(5)}, {loc.koordinat[1].toFixed(5)}</p>

                    {loc.status === 'Terlarang' && (
                        <p className="text-red-500 text-xs mt-2">Alasan: {loc.reasonForRestriction || 'Aturan Zonasi.'}</p>
                    )}
                    {loc.status === 'Tersedia' && (
                        <button
                            // 💡 PENTING: Panggil onSelectLocation dengan ID dan status yang sesuai
                            onClick={() => onSelectLocation(loc.id, 'Tersedia')}
                            className={`w-full py-1 mt-2 text-sm text-white rounded bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center`}
                        >
                            Pilih Lokasi Ini
                        </button>
                    )}
                </div>
            );

            return (
                <Marker
                    key={loc.id}
                    position={[loc.koordinat[0], loc.koordinat[1]]}
                    icon={icon}
                // ❌ HAPUS eventHandlers yang mereset state saat klik marker
                // eventHandlers={{
                //     click: () => onSelectLocation(null, null) 
                // }}
                >
                    <Popup>
                        <PopupContent /> {/* Tombol Pilih ada di dalam sini */}
                    </Popup>
                </Marker>
            );
        });
    }, [masterLocations, onSelectLocation]);


    return (
        // 💡 SOLUSI 1: Tingkatkan Z-Index MapContainer
        // Gunakan z-index yang lebih tinggi (misalnya z-10 atau z-20) untuk memastikan peta di atas elemen lain.
        <MapContainer
            center={defaultCenter}
            zoom={15}
            scrollWheelZoom={true}
            className="w-full h-full z-10" // 💡 TINGKATKAN Z-INDEX
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* 💡 PASTIKAN MapClickHandler di render (Sudah benar) */}
            <MapClickHandler />

            {/* 💡 PASTIKAN ChangeView di render (Sudah benar) */}
            <ChangeView center={defaultCenter} zoom={15} />

            {markers}

            {/* Marker Penanda Seleksi (Tetap sama) */}
            {selectedMasterId && (
                <Marker
                    position={masterLocations.find(l => l.id === selectedMasterId)!.koordinat}
                    icon={createCustomIcon('orange')}
                />
            )}
        </MapContainer>
    );
};
export default MapSelectMaster;