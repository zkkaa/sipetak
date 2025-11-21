"use client";
import React, { useState, useEffect } from 'react';
import { UserCircle, Envelope, Phone } from '@phosphor-icons/react';

interface UserProfileData {
    id: number;
    fullName: string;
    email: string;
    phone: string;
}

interface ProfileFormProps {
    initialData: UserProfileData;
    onSave: (data: UserProfileData) => void;
    onLogout: () => void;
    onOpenPasswordModal: () => void;
}

export default function ProfileForm({ 
    initialData, 
    onSave, 
    onLogout, 
    onOpenPasswordModal 
}: ProfileFormProps) {
    const [formData, setFormData] = useState<UserProfileData>(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {/* Main Input Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Pemilik */}
                <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        Nama Pemilik
                    </label>
                    <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
                        <UserCircle size={20} className="text-gray-400 mx-2" />
                        <input 
                            type="text" 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            className="w-full p-2 outline-none" 
                            required 
                        />
                    </div>
                </div>

                {/* No. Telepon */}
                <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        No. Telepon
                    </label>
                    <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
                        <Phone size={20} className="text-gray-400 mx-2" />
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            className="w-full p-2 outline-none" 
                            required 
                        />
                    </div>
                </div>
            </div>

            {/* Email Address */}
            <div>
                <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                    Alamat Email
                </label>
                <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                    <Envelope size={20} className="text-gray-400 mx-2" />
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        className="w-full p-2 outline-none bg-gray-50 cursor-not-allowed" 
                        disabled 
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah.</p>
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
                <button 
                    type="button" 
                    onClick={onLogout} 
                    className="text-red-600 hover:text-red-800 font-medium transition cursor-pointer"
                >
                    Logout
                </button>
                
                <div className="flex gap-4">
                    <button 
                        type="button" 
                        onClick={onOpenPasswordModal} 
                        className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition cursor-pointer shadow-md hover:shadow-lg"
                    >
                        Ubah Password
                    </button>
                    
                    <button 
                        type="submit" 
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer shadow-md hover:shadow-lg"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </form>
    );
}