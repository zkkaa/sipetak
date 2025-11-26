import React, { useState, useEffect } from 'react';
import { X, Info, PencilSimple } from '@phosphor-icons/react';

interface LapakUsaha {
    id: number;
    userId: number;
    masterLocationId: number;
    namaLapak: string;
    businessType: string;
    izinStatus: 'Diajukan' | 'Disetujui' | 'Ditolak';
    createdAt: string;
}

interface LocationDetailModalUMKMProps {
    lapak: LapakUsaha;
    onClose: () => void;
    onSave: (updatedLapak: LapakUsaha) => void;
    mode: 'view' | 'edit';
    setMode: React.Dispatch<React.SetStateAction<'view' | 'edit'>>;
}

export default function LocationDetailModalUMKM({ 
    lapak, 
    onClose, 
    onSave, 
    mode 
}: LocationDetailModalUMKMProps) {
    const [editedData, setEditedData] = useState<LapakUsaha>(lapak);
    const [currentMode, setCurrentMode] = useState(mode);

    useEffect(() => {
        setEditedData(lapak);
        setCurrentMode(mode);
    }, [lapak, mode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedData);
        onClose();
    };

    const isEditing = currentMode === 'edit';

    const getStatusBadge = (status: string) => {
        const statusMap = {
            'Diajukan': 'bg-yellow-100 text-yellow-700',
            'Disetujui': 'bg-green-100 text-green-700',
            'Ditolak': 'bg-red-100 text-red-700',
        };
        return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Info size={28} className="text-blue-500" /> 
                        {isEditing ? 'Edit Lapak' : 'Detail Lapak'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && lapak.izinStatus !== 'Ditolak' && (
                            <button 
                                onClick={() => setCurrentMode('edit')} 
                                className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 p-2 rounded-lg transition"
                            >
                                <PencilSimple size={20} /> Edit
                            </button>
                        )}
                        <button 
                            onClick={onClose} 
                            className="p-1 rounded-full hover:bg-gray-100 transition"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(lapak.izinStatus)}`}>
                        Status: {lapak.izinStatus}
                    </span>
                </div>

                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Lapak
                            </label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    name="namaLapak" 
                                    value={editedData.namaLapak} 
                                    onChange={handleInputChange} 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                    required 
                                />
                            ) : (
                                <p className="text-lg font-semibold text-gray-900">
                                    {lapak.namaLapak}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jenis Usaha
                            </label>
                            <p className="text-gray-900">{lapak.businessType}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID Lokasi Master
                            </label>
                            <p className="text-gray-900">#{lapak.masterLocationId}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal Pengajuan
                            </label>
                            <p className="text-gray-900">
                                {new Date(lapak.createdAt).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                        {isEditing && (
                            <>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setCurrentMode('view');
                                        setEditedData(lapak);
                                    }}
                                    className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    Simpan Perubahan
                                </button>
                            </>
                        )}
                        {!isEditing && (
                            <button 
                                type="button"
                                onClick={onClose} 
                                className="py-2 px-4 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition"
                            >
                                Tutup
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}