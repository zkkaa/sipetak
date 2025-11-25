// File: src/app/admin/datamaster/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { PlusCircle, TrashSimple, ArrowsClockwise } from '@phosphor-icons/react';
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
    koordinat: [number, number];
    status: 'Tersedia' | 'Terisi' | 'Terlarang';
    umkmName: string;
}

interface UmkmDetail {
    namaPemilik: string;
    emailKontak: string;
    tanggalPengajuan: string;
}

interface LocationDetail extends LocationMaster {
    umkmDetail?: UmkmDetail;
    reasonForRestriction?: string;
}

interface NewLocationInput {
    lat: number;
    lon: number;
    status: 'Tersedia' | 'Terlarang';
    name: string;
    reason?: string;
}

export default function MasterLocationPage() {
    const [locations, setLocations] = useState<LocationDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'Semua' | LocationMaster['status']>('Semua');
    const [selectedDetail, setSelectedDetail] = useState<LocationDetail | null>(null);
    const [tempCoords, setTempCoords] = useState<{ lat: number, lon: number } | undefined>(undefined);
    const [isAddingMode, setIsAddingMode] = useState(false);

    // ✅ Fetch locations from API
    useEffect(() => {
        fetchLocations();  
    }, []);

    const fetchLocations = async () => {
        try {
            setIsLoading(true);
            console.log('📡 Fetching master locations...');
            
            const response = await fetch('/api/master/locations');
            const result = await response.json();

            if (result.success && result.data) {
                // Transform data dari API
                const transformedLocations: LocationDetail[] = result.data.map((loc: {
                    id: number;
                    latitude: number;
                    longitude: number;
                    status: 'Tersedia' | 'Terisi' | 'Terlarang';
                    penandaName: string | null;
                    reasonRestriction: string | null;
                }) => ({
                    id: loc.id,
                    koordinat: [loc.latitude, loc.longitude] as [number, number],
                    status: loc.status,
                    umkmName: loc.penandaName || (loc.status === 'Tersedia' ? 'Titik Kosong' : 'Zona Terlarang'),
                    reasonForRestriction: loc.reasonRestriction || undefined,
                }));

                setLocations(transformedLocations);
                console.log('✅ Locations loaded:', transformedLocations.length);
            }
        } catch (error) {
            console.error('❌ Error fetching locations:', error);
            alert('Gagal memuat data lokasi. Coba refresh halaman.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLocations = locations.filter(loc =>
        filterStatus === 'Semua' || loc.status === filterStatus
    );

    // ✅ Delete location via API
    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus titik lokasi ini?")) return;

        try {
            console.log(`🗑️ Deleting location #${id}...`);
            
            const response = await fetch(`/api/master/locations/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Location deleted');
                setLocations(locations.filter(loc => loc.id !== id));
                alert('✅ Titik lokasi berhasil dihapus!');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('❌ Gagal menghapus lokasi: ' + (error as Error).message);
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
        setIsAddingMode(false);
    };

    // ✅ Save new location via API
    const handleSaveNewLocation = async (newLocation: NewLocationInput) => {
        try {
            console.log('💾 Saving new location...', newLocation);

            const response = await fetch('/api/master/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: newLocation.lat,
                    longitude: newLocation.lon,
                    status: newLocation.status,
                    penandaName: newLocation.name || null,
                    reasonRestriction: newLocation.status === 'Terlarang' ? newLocation.reason : null,
                }),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Location created:', result.location);
                alert('✅ Titik lokasi berhasil ditambahkan!');
                
                // Refresh data
                await fetchLocations();
                
                setShowForm(false);
                setTempCoords(undefined);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Save error:', error);
            alert('❌ Gagal menyimpan lokasi: ' + (error as Error).message);
        }
    };

    const getStatusColor = (status: LocationMaster['status']) => {
        switch (status) {
            case 'Terisi': return 'text-green-600 bg-green00';
            case 'Tersedia': return 'text-blue-600 bg-blue00';
            case 'Terlarang': return 'text-red-600 bg-red00';
            default: return 'text-gray-600 bg-gray00';
        }
    };

    if (isLoading) {
        return (
            <AdminPageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h2 w2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data lokasi...</p>
                    </div>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout>
            <div className="space-y-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Data Lokasi Usaha
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola Lokasi Usaha UMKM</p>
                </div>
                <div className="grid grid-cols md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-600">Total Lokasi</p>
                        <p className="text-2xl font-bold text-gray-800">{locations.length}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg shadow">
                        <p className="text-sm text-blue-600">Tersedia</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {locations.filter(l => l.status === 'Tersedia').length}
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow">
                        <p className="text-sm text-green-600">Terisi</p>
                        <p className="text-2xl font-bold text-green-700">
                            {locations.filter(l => l.status === 'Terisi').length}
                        </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg shadow">
                        <p className="text-sm text-red-600">Terlarang</p>
                        <p className="text-2xl font-bold text-red-700">
                            {locations.filter(l => l.status === 'Terlarang').length}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols lg:grid-cols-3 gap-8">
                    {/* Map */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg h-[600px] relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Visualisasi Zonasi Kota</h2>
                            <button
                                onClick={fetchLocations}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition"
                                title="Refresh data"
                            >
                                <ArrowsClockwise size={18} />
                                <span className="text-sm">Refresh</span>
                            </button>
                        </div>
                        <div className="w-full h-full rounded-lg overflow-hidden">
                            <DynamicLocationMapMaster
                                locations={locations}
                                onClickMap={handleMapClick}
                                isAddingMode={isAddingMode}
                            />
                        </div>
                        {isAddingMode && (
                            <div className="absolute inset-0 bg-blue-600/50 z-10 flex items-center justify-center text-white text-xl font-bold rounded-xl pointer-events-none">
                                🖱️ Klik pada peta untuk menentukan titik lokasi baru...
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Master Titik ({filteredLocations.length})</h2>
                            <button 
                                onClick={handleAdd} 
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                            >
                                <PlusCircle size={20} /> Tambah
                            </button>
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as 'Semua' | LocationMaster['status'])}
                            className="w-full p-2 border rounded-lg mb-4"
                        >
                            <option value="Semua">Semua Status ({locations.length})</option>
                            <option value="Tersedia">Tersedia ({locations.filter(l => l.status === 'Tersedia').length})</option>
                            <option value="Terisi">Terisi ({locations.filter(l => l.status === 'Terisi').length})</option>
                            <option value="Terlarang">Terlarang ({locations.filter(l => l.status === 'Terlarang').length})</option>
                        </select>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {filteredLocations.map(loc => (
                                <div 
                                    key={loc.id} 
                                    onClick={() => handleShowDetail(loc)} 
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50/50 hover:border-blue-300 transition cursor-pointer"
                                >
                                    <div className="truncate flex-1">
                                        <p className="text-sm font-medium text-gray-800 truncate" title={loc.umkmName}>
                                            {loc.umkmName}
                                        </p>
                                        <p className={`text-xs font-medium ${getStatusColor(loc.status)} px-2 py-1 rounded mt-1 w-fit`}>
                                            {loc.status}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(loc.id); }} 
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 ml-2"
                                    >
                                        <TrashSimple size={18} />
                                    </button>
                                </div>
                            ))}

                            {filteredLocations.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Tidak ada lokasi dengan status {filterStatus}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showForm && (
                    <AddLocationModal
                        onClose={() => setShowForm(false)}
                        onSave={handleSaveNewLocation}
                        clickedCoords={tempCoords}
                    />
                )}

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
        