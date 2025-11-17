"use client";
import React, { useState } from 'react';
import { PlusCircle, TrashSimple } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
import AdminPageLayout from '../../../components/adminlayout';
import AddLocationModal from '../../../components/admin/datausaha/addlocation';
import LocationDetailModal from '../../../components/admin/datausaha/LocationDetailModal';

const DynamicLocationMapMaster = dynamic(
    () => import('../../../components/admin/datausaha/LocationMapMaster'),
    { ssr: false }
);

interface LocationMaster {
    id: number;
    koordinat: [number, number]; // [lat, lon]
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    umkmName: string; // Kosong jika Tersedia
}

// Tambahan: Interface detail UMKM untuk Pop-up
interface UmkmDetail {
    namaPemilik: string;
    emailKontak: string;
    tanggalPengajuan: string;
}

// Tambahan: Data lengkap untuk Pop-up Detail
interface LocationDetail extends LocationMaster {
    umkmDetail?: UmkmDetail;
    reasonForRestriction?: string;
}

// Interface untuk input form modal
interface NewLocationInput {
    lat: number;
    lon: number;
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    name: string;
    reason?: string;
}


// DUMMY DATA LENGKAP (Tambahkan detail UMKM/Larangan)
const DUMMY_LOCATIONS_FULL: LocationDetail[] = [
    {
        id: 1, koordinat: [-7.33629, 108.2228], status: 'Terisi', umkmName: 'Warung Kopi Senja',
        umkmDetail: { namaPemilik: 'Budi Santoso', emailKontak: 'budi@mail.com', tanggalPengajuan: '10/11/2025' }
    },
    { id: 2, koordinat: [-7.33618, 108.2227], status: 'Tersedia', umkmName: '' },
    {
        id: 3, koordinat: [-7.33602, 108.2225], status: 'Terlarang', umkmName: 'Zona Merah',
        reasonForRestriction: 'Lokasi berada di atas saluran air utama, dilarang untuk pendirian permanen.'
    },
    {
        id: 4, koordinat: [-7.33683, 108.2223], status: 'Terisi', umkmName: 'Toko Sembako Maju',
        umkmDetail: { namaPemilik: 'Siti Rahayu', emailKontak: 'siti@mail.com', tanggalPengajuan: '05/11/2025' }
    },
];


export default function MasterLocationPage() {
    const [locations, setLocations] = useState<LocationDetail[]>(DUMMY_LOCATIONS_FULL);
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'Semua' | LocationMaster['status']>('Semua'); // 💡 STATE FILTER
    const [selectedDetail, setSelectedDetail] = useState<LocationDetail | null>(null); // 💡 STATE POPUP DETAIL
    const [tempCoords, setTempCoords] = useState<{ lat: number, lon: number } | undefined>(undefined);

    const [isAddingMode, setIsAddingMode] = useState(false);

    // 💡 LOGIKA FILTER (Poin 1)
    const filteredLocations = locations.filter(loc =>
        filterStatus === 'Semua' || loc.status === filterStatus
    );

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus titik lokasi ini?")) {
            setLocations(locations.filter(loc => loc.id !== id));
        }
    };

    const handleAdd = () => {
        setIsAddingMode(true);
        setSelectedDetail(null);
        setTempCoords(undefined);
    };

    const handleMapClick = (lat: number, lon: number) => {
        if (isAddingMode) {
            setTempCoords({ lat, lon });
            setShowForm(true);
            setIsAddingMode(false);
        }
    };

    const handleShowDetail = (loc: LocationDetail) => {
        setSelectedDetail(loc);
        setIsAddingMode(false); // Nonaktifkan mode tambah
    };

    const handleSaveNewLocation = (newLocation: NewLocationInput) => {
        const newId = Math.max(...locations.map(l => l.id), 0) + 1;

        const newEntry: LocationDetail = {
            id: newId,
            koordinat: [newLocation.lat, newLocation.lon],
            status: newLocation.status,
            umkmName: newLocation.status === 'Terlarang' ? newLocation.name : newLocation.name || '',
            reasonForRestriction: newLocation.reason || undefined,
            umkmDetail: newLocation.status === 'Terisi' ? {
                namaPemilik: newLocation.name, emailKontak: 'N/A', tanggalPengajuan: 'N/A'
            } : undefined
        };

        setLocations([...locations, newEntry]);
        setShowForm(false);
        setTempCoords(undefined);
    };

    const getStatusColor = (status: LocationMaster['status']) => {
        switch (status) {
            case 'Terisi': return 'text-green-600 bg-green-100';
            case 'Tersedia': return 'text-blue-600 bg-blue-100';
            case 'Terlarang': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <AdminPageLayout>
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-[600px] relative">
                        <h2 className="text-xl font-semibold mb-4">Visualisasi Zonasi Kota</h2>
                        <div className="w-full h-full rounded-lg overflow-hidden">
                            <DynamicLocationMapMaster
                                locations={locations}
                                onClickMap={handleMapClick} // 💡 TERUSKAN HANDLER KLIK PETA
                                isAddingMode={isAddingMode} // 💡 TERUSKAN MODE TAMBAH
                            />
                        </div>
                        {isAddingMode && (
                            <div className="absolute inset-0 bg-blue-600/50 z-10 flex items-center justify-center text-white text-xl font-bold rounded-xl pointer-events-none">
                                🖱️ Klik pada peta untuk menentukan titik lokasi baru...
                            </div>
                        )}
                    </div>

                    {/* Kolom Tabel (1/3 Lebar) */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Master Titik ({filteredLocations.length})</h2>
                            <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                                <PlusCircle size={20} /> Tambah
                            </button>
                        </div>

                        {/* 💡 FILTER DROP DOWN (Poin 1) */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'Semua' | LocationMaster['status'])}
                            className="w-full p-2 border rounded-lg mb-4"
                        >
                            <option value="Semua">Semua Status</option>
                            <option value="Terisi">Terisi</option>
                            <option value="Tersedia">Tersedia</option>
                            <option value="Terlarang">Terlarang</option>
                        </select>

                        {/* Tabel Titik Lokasi */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {filteredLocations.map(loc => (
                                <div key={loc.id} onClick={() => handleShowDetail(loc)} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer">
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-gray-800 truncate" title={loc.umkmName || 'Titik Kosong'}>
                                            {loc.umkmName || 'Titik Kosong'}
                                        </p>
                                        <p className={`text-xs font-medium ${getStatusColor(loc.status)}`}>
                                            {loc.status}
                                        </p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                                        <TrashSimple size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 💡 RENDER MODAL TAMBAH LOKASI (Poin 3) */}
                {showForm && (
                    <AddLocationModal
                        onClose={() => setShowForm(false)}
                        onSave={handleSaveNewLocation}
                        clickedCoords={tempCoords} // Teruskan koordinat klik peta
                    />
                )}

                {/* 💡 RENDER POPUP DETAIL */}
                {selectedDetail && (
                    <LocationDetailModal
                        location={selectedDetail}
                        onClose={() => setSelectedDetail(null)}
                    />
                )}
            </div>
        </AdminPageLayout>
    );
}