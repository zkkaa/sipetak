// File: src/components/admin/manajemenakun/akuntabel.tsx

import React from 'react';
import { PencilSimple, TrashSimple, ToggleRight, ToggleLeft } from '@phosphor-icons/react';

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

interface AccountTableProps {
    accounts: UserAccount[];
    onEdit: (account: UserAccount) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
}

export default function AccountTable({ accounts, onEdit, onDelete, onToggleStatus }: AccountTableProps) {
    if (accounts.length === 0) {
        return null; // Parent will handle empty state
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama UMKM
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No. Telepon
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                #{acc.id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {acc.nama}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {acc.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                {acc.phone || <span className="text-gray-400 italic">Tidak ada</span>}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <button 
                                    onClick={() => onToggleStatus(acc.id)}
                                    className="flex items-center text-sm font-semibold transition-colors rounded-full p-1 hover:bg-gray-100"
                                >
                                    {acc.isActive ? (
                                        <>
                                            <ToggleRight size={28} weight="fill" className="text-green-500" />
                                            <span className="ml-2 text-xs text-green-600 font-semibold">
                                                Aktif
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft size={28} weight="fill" className="text-gray-400" />
                                            <span className="ml-2 text-xs text-gray-500 font-semibold">
                                                Nonaktif
                                            </span>
                                        </>
                                    )}
                                </button>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => onEdit(acc)} 
                                        className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition"
                                        title="Edit akun"
                                    >
                                        <PencilSimple size={18} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(acc.id)} 
                                        className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition"
                                        title="Hapus akun"
                                    >
                                        <TrashSimple size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}