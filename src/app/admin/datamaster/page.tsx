// File: app/admin/datamaster/page.tsx

"use client";
import React, { useState } from 'react';
import { MapPin, PlusCircle, TrashSimple } from '@phosphor-icons/react';
import dynamic from 'next/dynamic';
// import { CheckCircle, XCircle } from '@phosphor-icons/react';
import AddLocationModal from '../../../components/admin/datausaha/addlocation';

// Asumsi: Impor komponen layout admin
import AdminPageLayout from '../../../components/adminlayout';

// --- IMPOR DINAMIS PETA MASTER ---
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

const DUMMY_LOCATIONS: LocationMaster[] = [
    { id: 1, koordinat: [-7.336295088723667, 108.22286268600013], status: 'Terisi', umkmName: 'Warung Kopi Senja' },
    { id: 2, koordinat: [-7.336189577863271, 108.2227344021686], status: 'Tersedia', umkmName: '' },
    { id: 3, koordinat: [-7.336022001739442, 108.222559185228], status: 'Terlarang', umkmName: 'Zona Merah' },
    { id: 4, koordinat: [-7.336831952420015, 108.22239648378311], status: 'Terisi', umkmName: 'Toko Sembako Maju' },
];


export default function MasterLocationPage() {
    const [locations, setLocations] = useState<LocationMaster[]>(DUMMY_LOCATIONS);
    const [showForm, setShowForm] = useState(false);

    // Logika untuk menghapus titik
    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus titik lokasi ini?")) {
            setLocations(locations.filter(loc => loc.id !== id));
            // Logika API DELETE akan ditambahkan di sini
        }
    };

    // Logika untuk menambah titik (Misalnya via form input koordinat)
    const handleAdd = () => {
        // Logika untuk menampilkan modal input koordinat
        setShowForm(true);
    };

    // Fungsi untuk menentukan warna status
    const getStatusColor = (status: LocationMaster['status']) => {
        switch (status) {
            case 'Terisi': return 'text-green-600 bg-green-100';
            case 'Tersedia': return 'text-blue-600 bg-blue-100';
            case 'Terlarang': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    // 💡 LOGIKA: Menyimpan data baru ke state
    const handleSaveNewLocation = (newLocation: { lat: number, lon: number, status: 'Tersedia' | 'Terlarang', name: string }) => {
        const newId = Math.max(...locations.map(l => l.id), 0) + 1; // ID unik

        const newEntry: LocationMaster = {
            id: newId,
            koordinat: [newLocation.lat, newLocation.lon],
            status: newLocation.status,
            umkmName: newLocation.status === 'Terlarang' ? newLocation.name : '', // Jika Terlarang, gunakan Nama
        };

        setLocations([...locations, newEntry]);
        setShowForm(false); // Tutup modal
        // Logika API POST akan ditambahkan di sini
    };

    // Kita anggap ini dibungkus oleh AdminPageLayout di folder /admin
    return (
        <AdminPageLayout>
            <div className="space-y-8">

                {/* Header Halaman */}
                <header>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin size={32} weight="fill" className="text-blue-500" /> Data Lokasi Master
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola semua titik lokasi zonasi UMKM di seluruh wilayah.</p>
                </header>

                {/* Bagian Peta dan Tabel (Grid 2 Kolom) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Kolom Peta (2/3 Lebar) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-[600px]">
                        <h2 className="text-xl font-semibold mb-4">Visualisasi Zonasi Kota</h2>
                        {/* 💡 Komponen Peta Master */}
                        <div className="w-full h-full rounded-lg overflow-hidden">
                            <DynamicLocationMapMaster locations={locations} />
                        </div>
                    </div>

                    {/* Kolom Tabel (1/3 Lebar) */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Master Titik ({locations.length})</h2>
                            <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition">
                                <PlusCircle size={20} /> Tambah
                            </button>
                        </div>

                        {/* Tabel Titik Lokasi */}
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {locations.map(loc => (
                                <div key={loc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-gray-800 truncate" title={loc.umkmName || 'Titik Kosong'}>
                                            {loc.umkmName || 'Titik Kosong'}
                                        </p>
                                        <p className={`text-xs font-medium ${getStatusColor(loc.status)}`}>
                                            {loc.status}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(loc.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                                        <TrashSimple size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {showForm && (
                        <AddLocationModal
                            onClose={() => setShowForm(false)}
                            onSave={handleSaveNewLocation}
                        />
                    )}
                </div>

                {/* Placeholder Form Tambah */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                        {/* Form Tambah Lokasi akan dimasukkan di sini */}
                        <div className="bg-white p-6 rounded-xl">Form Tambah Lokasi...</div>
                    </div>
                )}
            </div>
        </AdminPageLayout>
    );
}