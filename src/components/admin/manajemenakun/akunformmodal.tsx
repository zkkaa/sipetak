import React, { useState } from 'react';
import { X, Key } from '@phosphor-icons/react';

type UserRole = 'Admin' | 'UMKM';

interface UserAccount {
    id: number;
    nama: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    phone: string | null;
    nik: string | null;
}

type AccountData = Omit<UserAccount, 'id'>;

type AccountDataWithPassword = AccountData & {
    password?: string;
};

interface AccountFormModalProps {
    onClose: () => void;
    onSave: (data: AccountDataWithPassword) => void;
    initialData: UserAccount | null;
}

export default function AccountFormModal({ onClose, onSave, initialData }: AccountFormModalProps) {
    const initialFormData: AccountData = initialData || {
        nama: '',
        email: '',
        role: 'UMKM',
        isActive: true,
        phone: null,
        nik: null,
    };

    const [formData, setFormData] = useState<AccountData>(initialFormData);
    const [password, setPassword] = useState('');
    const [isPasswordReset, setIsPasswordReset] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPasswordReset && !password) {
            alert("Password baru wajib diisi!");
            return;
        }

        const dataToSave: AccountDataWithPassword = {
            ...formData,
            ...(isPasswordReset && password ? { password } : {})
        };

        onSave(dataToSave);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Edit Akun: {initialData?.nama}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nama UMKM <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="nama" 
                            value={formData.nama} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            No. Telepon
                        </label>
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone || ''} 
                            onChange={handleInputChange} 
                            placeholder="Contoh: 08123456789"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    <div className="pt-2 border-t">
                        {!isPasswordReset ? (
                            <button 
                                type="button" 
                                onClick={() => setIsPasswordReset(true)} 
                                className="text-red-600 text-sm flex items-center gap-2 hover:text-red-700 transition"
                            >
                                <Key size={16} /> Reset Password
                            </button>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium mb-1 text-red-600">
                                    Password Baru <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="Minimal 6 karakter"
                                    className="w-full p-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                                    required={isPasswordReset}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPasswordReset(false);
                                        setPassword('');
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                                >
                                    Batalkan reset password
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}