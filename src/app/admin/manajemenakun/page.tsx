"use client";
import React, { useState, useEffect } from 'react';
import { Users, MagnifyingGlass, WarningCircle } from '@phosphor-icons/react';
import AdminPageLayout from '../../../components/adminlayout';
import AccountTable from '../../../components/admin/manajemenakun/akuntabel';
import AccountFormModal from '../../../components/admin/manajemenakun/akunformmodal';
import ConfirmCheckPopup from '../../../components/common/confirmmodal';

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

type AccountDataWithPassword = Omit<UserAccount, 'id'> & {
    password?: string;
};

export default function AccountManagementPage() {
    const [accounts, setAccounts] = useState<UserAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState<UserAccount | null>(null);
    const [filterStatus, setFilterStatus] = useState<'Semua' | boolean>('Semua');
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmToggleId, setConfirmToggleId] = useState<number | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setIsLoading(true);
            console.log('📡 Fetching UMKM accounts...');
            
            const response = await fetch('/api/accounts');
            const result = await response.json();

            if (result.success && result.data) {
                setAccounts(result.data);
                console.log('✅ Accounts loaded:', result.data.length);
            }
        } catch (error) {
            console.error('❌ Error fetching accounts:', error);
            alert('Gagal memuat data akun. Coba refresh halaman.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleClick = (id: number) => {
        setConfirmToggleId(id);
    };

    const handleToggleStatus = async (id: number) => {
        const account = accounts.find(acc => acc.id === id);
        if (!account) return;

        try {
            console.log(`🔄 Toggling status for account #${id}...`);

            const response = await fetch(`/api/accounts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !account.isActive,
                }),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Status updated');
                setAccounts(accounts.map(acc =>
                    acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
                ));
                alert(`✅ Akun ${account.isActive ? 'dinonaktifkan' : 'diaktifkan'}!`);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Toggle error:', error);
            alert('❌ Gagal mengubah status: ' + (error as Error).message);
        } finally {
            setConfirmToggleId(null);
        }
    };

    const handleOpenEdit = (account: UserAccount) => {
        setIsEditing(account);
        setShowModal(true);
    };

    const handleSaveAccount = async (newAccountData: AccountDataWithPassword) => {
        if (!isEditing) return;

        try {
            console.log(`💾 Updating account #${isEditing.id}...`);

            const payload: Record<string, unknown> = {
                nama: newAccountData.nama,
                email: newAccountData.email,
                phone: newAccountData.phone || null,
                isActive: newAccountData.isActive,
            };

            if (newAccountData.password) {
                payload.newPassword = newAccountData.password;
            }

            const response = await fetch(`/api/accounts/${isEditing.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Account updated');
                await fetchAccounts(); 
                alert('✅ Akun berhasil diperbarui!');
                setShowModal(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Save error:', error);
            alert('❌ Gagal menyimpan perubahan: ' + (error as Error).message);
        }
    };

    const handleDelete = async (id: number) => {
        const account = accounts.find(acc => acc.id === id);
        if (!account) return;

        if (!confirm(`Apakah Anda yakin ingin menghapus akun ${account.nama}?`)) return;

        try {
            console.log(`🗑️ Deleting account #${id}...`);

            const response = await fetch(`/api/accounts/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Account deleted');
                setAccounts(accounts.filter(acc => acc.id !== id));
                alert('✅ Akun berhasil dihapus!');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            alert('❌ Gagal menghapus akun: ' + (error as Error).message);
        }
    };

    const filteredAccounts = accounts
        .filter(acc => 
            (filterStatus === 'Semua' || acc.isActive === filterStatus)
        )
        .filter(acc => 
            acc.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (acc.phone && acc.phone.includes(searchTerm))
        );

    const accountToToggle = accounts.find(acc => acc.id === confirmToggleId);
    const action = accountToToggle?.isActive ? 'Nonaktifkan' : 'Aktifkan';
    const warningText = `Apakah Anda yakin ingin ${action} akun ${accountToToggle?.nama}?`;

    if (isLoading) {
        return (
            <AdminPageLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data akun...</p>
                    </div>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout>
            <div className="space-y-8">

                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Users size={32} weight="fill" className="text-blue-500" /> Manajemen Akun UMKM
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola akun UMKM yang terdaftar di sistem.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Total Akun UMKM</p>
                        <p className="text-2xl font-bold text-gray-800">{accounts.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                        <p className="text-sm text-green-600">Akun Aktif</p>
                        <p className="text-2xl font-bold text-green-700">
                            {accounts.filter(a => a.isActive).length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                        <p className="text-sm text-red-600">Akun Nonaktif</p>
                        <p className="text-2xl font-bold text-red-700">
                            {accounts.filter(a => !a.isActive).length}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-md">
                    <div className="flex gap-4 items-center">
                        <select 
                            value={filterStatus === true ? 'Aktif' : filterStatus === false ? 'Nonaktif' : 'Semua'}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFilterStatus(val === 'Aktif' ? true : val === 'Nonaktif' ? false : 'Semua');
                            }}
                            className="p-2 border rounded-lg w-full md:w-auto"
                        >
                            <option value="Semua">Semua Status ({accounts.length})</option>
                            <option value="Aktif">Aktif ({accounts.filter(a => a.isActive).length})</option>
                            <option value="Nonaktif">Nonaktif ({accounts.filter(a => !a.isActive).length})</option>
                        </select>
                    </div>

                    <div className="relative w-full md:w-64">
                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau telp..."
                            className="border p-2 pl-10 rounded-lg w-full outline-none focus:border-blue-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <AccountTable
                        accounts={filteredAccounts}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleClick}
                    />

                    {filteredAccounts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">Tidak ada akun yang ditemukan</p>
                            <p className="text-sm mt-2">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                    )}
                </div>

                {showModal && (
                    <AccountFormModal
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveAccount}
                        initialData={isEditing}
                    />
                )}

                {confirmToggleId !== null && accountToToggle && (
                    <ConfirmCheckPopup 
                        icon={<WarningCircle size={48} color="white"/>} 
                        title={`${action} Akun`} 
                        message={warningText} 
                        cancelText="Batal" 
                        confirmText={action} 
                        confirmColor={action === 'Nonaktifkan' ? 'red' : 'green'} 
                        onClose={() => setConfirmToggleId(null)} 
                        onConfirm={() => handleToggleStatus(confirmToggleId)}
                    />
                )}
            </div>
        </AdminPageLayout>
    );
}