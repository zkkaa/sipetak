"use client";

import React, { useState, useEffect } from 'react';
import { UserCircle, Envelope, Phone, Password  } from '@phosphor-icons/react';

interface UserProfileData {
    id: number;
    fullName: string; 
    email: string; 
    phone: string; 
}

interface ProfileFormProps {
    initialData: UserProfileData;
    onSave: (data: UserProfileData) => void;
    onOpenPasswordModal: () => void;
}

export default function ProfileForm({ 
    initialData, 
    onSave, 
    onOpenPasswordModal 
}: ProfileFormProps) {
    const [formData, setFormData] = useState<UserProfileData>(initialData);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    useEffect(() => {
        const phoneChanged = formData.phone !== initialData.phone;
        setHasChanges(phoneChanged);
    }, [formData.phone, initialData.phone]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, phone: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!hasChanges) {
            alert('ℹ️ Tidak ada perubahan data.');
            return;
        }

        onSave(formData);
    };

    const handleCancel = () => {
        setFormData(initialData);
        setHasChanges(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-800">
                    <strong>ℹ️ Informasi:</strong> Anda hanya dapat mengubah <strong>Nomor Telepon</strong>. 
                    Untuk mengubah password, klik tombol Ubah Password di bawah.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <UserCircle size={18} weight="fill" className="text-gray-500" />
                        Nama Pemilik
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                        <input 
                            type="text" 
                            value={formData.fullName} 
                            className="w-full p-3 outline-none bg-gray-50 text-gray-500 cursor-not-allowed" 
                            disabled 
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <Phone size={18} weight="fill" className="text-blue-500" />
                        No. Telepon
                        <span className="text-green-600 text-xs">(Bisa Diubah)</span>
                    </label>
                    <div className="flex items-center border-2 border-blue-300 rounded-lg overflow-hidden transition bg-white">
                        <Phone size={20} className="text-gray-400 mx-3" />
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handlePhoneChange} 
                            placeholder="08xxxxxxxxxx"
                            className="w-full p-3 outline-none" 
                            required 
                            pattern="[0-9+\-\s()]{10,20}"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                        Format: 08xxxxxxxx atau +62xxxxxxxx
                    </p>
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <Envelope size={18} weight="fill" className="text-gray-500" />
                    Alamat Email
                </label>
                <div className="flex items-center border-2 border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                    <Envelope size={20} className="text-gray-400 mx-3" />
                    <input 
                        type="email" 
                        value={formData.email} 
                        className="w-full p-3 outline-none bg-gray-50 text-gray-500 cursor-not-allowed" 
                        disabled 
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t-2 gap-4">
                <button 
                    type="button" 
                    onClick={onOpenPasswordModal} 
                    className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <Password  size={20} weight="fill" />
                    Ubah Password
                </button>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    {hasChanges && (
                        <button 
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 sm:flex-none px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition cursor-pointer"
                        >
                            Batal
                        </button>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={!hasChanges}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-semibold transition cursor-pointer shadow-md 
                            ${hasChanges 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {hasChanges ? '💾 Simpan Perubahan' : 'Tidak Ada Perubahan'}
                    </button>
                </div>
            </div>

            {hasChanges && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-green-600 font-semibold">✓</span>
                    <p className="text-sm text-green-700">
                        Nomor telepon telah diubah. Klik <strong>Simpan Perubahan</strong> untuk menyimpan.
                    </p>
                </div>
            )}
        </form>
    );
}