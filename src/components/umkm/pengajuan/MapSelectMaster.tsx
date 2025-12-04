"use client";
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-expect-error Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
});

const createCustomIcon = (color: string) => {
    const html = `<div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`;
    return L.divIcon({
        className: 'custom-div-icon',
        html: html,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

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

const MapSelectMaster: React.FC<MapSelectMasterProps> = ({ 
    masterLocations, 
    onSelectLocation, 
    selectedMasterId 
}) => {
    const defaultCenter: [number, number] = [-7.3364, 108.2225];

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
            if (!loc.koordinat || loc.koordinat.length < 2) {
                console.warn(`Lokasi ID ${loc.id} dilewati karena koordinat tidak lengkap.`);
                return null;
            }

            const color = getMarkerColor(loc.status);
            const icon = createCustomIcon(color);

            return (
                <Marker
                    key={loc.id} 
                    position={[loc.koordinat[0], loc.koordinat[1]]} 
                    icon={icon}
                >
                    <Popup>
                        <div className="min-w-[200px]">
                            <h4 className={`font-bold text-lg ${
                                loc.status === 'Tersedia' ? 'text-blue-600' : 
                                loc.status === 'Terlarang' ? 'text-red-600' : 
                                'text-green-600'
                            }`}>
                                {loc.status === 'Terisi' ? loc.umkmName : 
                                 loc.status === 'Terlarang' ? 'Zona Terlarang' : 
                                 'Titik Tersedia'}
                            </h4>
                            <p className="text-sm mt-1 text-gray-600">
                                ID: {loc.id}
                            </p>
                            <p className="text-xs text-gray-500">
                                {loc.koordinat[0].toFixed(5)}, {loc.koordinat[1].toFixed(5)}
                            </p>

                            {/* Keterangan untuk titik Terisi (Hijau) */}
                            {loc.status === 'Terisi' && (
                                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                                    <p className="text-green-700 text-sm font-semibold flex items-center gap-1">
                                        <span>✓</span> Titik Telah Terisi
                                    </p>
                                    <p className="text-green-600 text-xs mt-1">
                                        Lokasi ini sudah digunakan oleh UMKM lain dan tidak dapat dipilih untuk pengajuan baru.
                                    </p>
                                </div>
                            )}

                            {/* Keterangan untuk titik Terlarang (Merah) */}
                            {loc.status === 'Terlarang' && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="text-red-700 text-sm font-semibold">
                                        ⚠️ Zona Terlarang
                                    </p>
                                    <p className="text-red-600 text-xs mt-1">
                                        Alasan: {loc.reasonForRestriction || 'Aturan Zonasi.'}
                                    </p>
                                </div>
                            )}
                            
                            {/* Tombol untuk titik Tersedia (Biru) */}
                            {loc.status === 'Tersedia' && (
                                <button
                                    onClick={() => onSelectLocation(loc.id, 'Tersedia')}
                                    className="w-full py-2 mt-3 text-sm text-white rounded bg-blue-600 hover:bg-blue-700 transition font-semibold"
                                >
                                    ✓ Pilih Lokasi Ini
                                </button>
                            )}
                        </div>
                    </Popup>
                </Marker>
            );
        }).filter(marker => marker !== null);
    }, [masterLocations, onSelectLocation]);

    const centerMap = useMemo(() => {
        if (masterLocations.length > 0 && masterLocations[0].koordinat) {
            return masterLocations[0].koordinat;
        }
        return defaultCenter;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [masterLocations]);

    return (
        <MapContainer
            center={centerMap}
            zoom={15}
            scrollWheelZoom={true}
            className="w-full h-full z-10"
            style={{ minHeight: '400px' }}
        >
            <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <ChangeView key={masterLocations.length} center={centerMap} zoom={15} />
            {markers}
            {selectedMasterId && masterLocations.find(l => l.id === selectedMasterId) && (
                <Marker
                    position={masterLocations.find(l => l.id === selectedMasterId)!.koordinat}
                    icon={createCustomIcon('orange')}
                />
            )}
        </MapContainer>
    );
};

export default MapSelectMaster;