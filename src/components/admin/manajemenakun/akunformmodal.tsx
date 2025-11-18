import React, { useState, useEffect } from 'react';
import { X, Key } from '@phosphor-icons/react';

type UserRole = 'Admin' | 'UMKM';

interface UserAccount {
    id: number;
    nama: string;
    email: string;
    role: UserRole;
    isActive: boolean;
}

// Data yang akan disimpan (tanpa ID)
type AccountData = Omit<UserAccount, 'id'>;

type AccountDataWithPassword = AccountData & {
    password?: string; // Password adalah opsional untuk operasi edit/save
};

interface AccountFormModalProps {
    onClose: () => void;
    // 💡 PERBAIKAN: Gunakan tipe baru yang menyertakan password opsional
    onSave: (data: AccountDataWithPassword) => void;
    initialData: UserAccount | null; // Data akun jika mode Edit
}

export default function AccountFormModal({ onClose, onSave, initialData }: AccountFormModalProps) {
    const isEditing = initialData !== null;
    const initialFormData: AccountData = initialData || {
        nama: '',
        email: '',
        role: 'UMKM',
        isActive: true,
    };

    const [formData, setFormData] = useState<AccountData>(initialFormData);
    const [password, setPassword] = useState(''); // Hanya untuk input password
    const [isPasswordReset, setIsPasswordReset] = useState(false); // Mode reset password

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing) {
            // Mode Tambah: Wajib ada password
            if (!password) {
                alert("Password wajib diisi untuk akun baru.");
                return;
            }
        }

        // Final data yang dikirim (termasuk password jika ada atau direset)
        const dataToSave: AccountDataWithPassword = {
            ...formData,
            // Tambahkan password hanya jika ada atau di-reset
            ...(isPasswordReset || !isEditing) && password ? { password } : {}
        };

        // Lakukan pengiriman data
        onSave(dataToSave); // Tipe sekarang sudah benar
    };


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">

                {/* Header Modal */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? `Edit Akun: ${initialData?.nama}` : 'Tambah Akun Baru'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">

                    {/* Nama Akun */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama Akun/Usaha</label>
                        <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded-lg" required />
                    </div>

                    {/* Peran (Role) */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Peran Pengguna</label>
                        <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-2 border rounded-lg">
                            <option value="UMKM">UMKM</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {/* Password Field (Kondisional) */}
                    <div className="pt-2 border-t">
                        {/* Mode Tambah: Wajib Input Password */}
                        {!isEditing && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded-lg" required={!isEditing} />
                            </div>
                        )}

                        {/* Mode Edit: Tombol Reset Password */}
                        {isEditing && !isPasswordReset && (
                            <button type="button" onClick={() => setIsPasswordReset(true)} className="text-red-600 text-sm flex items-center gap-1 hover:underline">
                                <Key size={16} /> Reset Password
                            </button>
                        )}

                        {/* Mode Edit: Input Password setelah tombol Reset diklik */}
                        {isEditing && isPasswordReset && (
                            <div>
                                <label className="block text-sm font-medium mb-1 text-red-600">Password Baru (Wajib Diisi)</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded-lg" required />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                            Batal
                        </button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition">
                            {isEditing ? 'Simpan Perubahan' : 'Tambah Akun'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}