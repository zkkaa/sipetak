import React from 'react';
import { PencilSimple, TrashSimple, ToggleRight, ToggleLeft } from '@phosphor-icons/react';

type UserRole = 'Admin' | 'UMKM';

interface UserAccount {
    id: number;
    nama: string;
    email: string;
    role: UserRole;
    isActive: boolean;
}

interface AccountTableProps {
    accounts: UserAccount[];
    onEdit: (account: UserAccount) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
}

const roleClasses = {
    'Admin': 'bg-red-100 text-red-700',
    'UMKM': 'bg-blue-100 text-blue-700',
};

export default function AccountTable({ accounts, onEdit, onDelete, onToggleStatus }: AccountTableProps) {
    if (accounts.length === 0) {
        return <p className="text-center py-8 text-gray-500">Tidak ada akun yang ditemukan sesuai filter.</p>;
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{acc.id}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{acc.nama}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{acc.email}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClasses[acc.role]}`}>
                                    {acc.role}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                                <button 
                                    onClick={() => onToggleStatus(acc.id)} // 💡 KIRIM ID
                                    className={`flex items-center text-sm font-semibold transition-colors rounded-full p-1`}
                                >
                                    {acc.isActive ? (
                                        <ToggleRight size={24} weight="fill" className="text-green-500 hover:text-green-600" />
                                    ) : (
                                        <ToggleLeft size={24} weight="fill" className="text-gray-400 hover:text-gray-500" />
                                    )}
                                    <span className={`ml-2 text-xs ${acc.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                        {acc.isActive ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </button>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                <button onClick={() => onEdit(acc)} className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50">
                                    <PencilSimple size={18} />
                                </button>
                                <button onClick={() => onDelete(acc.id)} className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50">
                                    <TrashSimple size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}