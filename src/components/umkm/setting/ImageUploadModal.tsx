// File: components/umkm/settings/ImageUploadModal.tsx (BARU)
import React from 'react';
import { X, UploadSimple, TrashSimple, UserCircle } from '@phosphor-icons/react';

interface ImageUploadModalProps {
    currentImageUrl: string | null; // URL foto saat ini (null jika default icon)
    onClose: () => void;
    onUpload: (file: File) => void;
    onDelete: () => void;
}

export default function ImageUploadModal({ currentImageUrl, onClose, onUpload, onDelete }: ImageUploadModalProps) {
    // Handler untuk input file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold">Foto Profil</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition"><X size={24} /></button>
                </div>

                {/* Tampilan Gambar Besar */}
                <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg flex items-center justify-center">
                        {currentImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={currentImageUrl} alt="Profil Saat Ini" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle size={100} weight="light" className="text-gray-400" />
                        )}
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col gap-3">
                    {/* Upload Baru */}
                    <label className="flex items-center justify-center w-full py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
                        <UploadSimple size={20} className="mr-2" /> Upload Foto Baru
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>

                    {/* Hapus Gambar */}
                    {currentImageUrl && (
                        <button onClick={onDelete} className="flex items-center justify-center w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                            <TrashSimple size={20} className="mr-2" /> Hapus Foto
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}