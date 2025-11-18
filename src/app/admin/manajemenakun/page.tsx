"use client";
import React, { useState } from 'react';
import { Users, PlusCircle, MagnifyingGlass, WarningCircle } from '@phosphor-icons/react';
import AdminPageLayout from '../../../components/adminlayout'; // Asumsi path layout Admin
import AccountTable from '../../../components/admin/manajemenakun/akuntabel';
import AccountFormModal from '../../../components/admin/manajemenakun/akunformmodal';
import ConfirmCheckPopup from '../../../components/common/confirmmodal';

// --- INTERFACE DAN DATA DUMMY ---
type UserRole = 'Admin' | 'UMKM';

interface UserAccount {
    id: number;
    nama: string;
    email: string;
    role: UserRole;
    isActive: boolean; // Status akun (Aktif/Nonaktif)
}

const DUMMY_ACCOUNTS: UserAccount[] = [
    { id: 1, nama: "Budi Santoso", email: "budi.s@sipetak.com", role: 'Admin', isActive: true },
    { id: 2, nama: "CV Sejahtera Abadi", email: "sejahtera@mail.com", role: 'UMKM', isActive: true },
    { id: 3, nama: "PT Jaya Sentosa", email: "jaya@sentosa.com", role: 'UMKM', isActive: false },
    { id: 4, nama: "Tim Verifikasi A", email: "verif.a@sipetak.com", role: 'Admin', isActive: true },
];


export default function AccountManagementPage() {
    const [accounts, setAccounts] = useState<UserAccount[]>(DUMMY_ACCOUNTS);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState<UserAccount | null>(null); // Null untuk tambah, objek untuk edit
    const [filterRole, setFilterRole] = useState<'Semua' | UserRole>('Semua');
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmToggleId, setConfirmToggleId] = useState<number | null>(null);

    // --- HANDLERS CRUD ---

    // Fungsi untuk membuka konfirmasi
    const handleToggleClick = (id: number) => {
        setConfirmToggleId(id);
    };

    // 💡 LOGIKA TOGGLE STATUS (Final)
    const handleToggleStatus = (id: number) => {
        // Logika API PUT untuk mengupdate status
        setAccounts(accounts.map(acc =>
            acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
        ));
        setConfirmToggleId(null); // Tutup popup setelah konfirmasi
    };

    const handleOpenAdd = () => {
        setIsEditing(null); // Mode Tambah
        setShowModal(true);
    };

    const handleOpenEdit = (account: UserAccount) => {
        setIsEditing(account); // Mode Edit
        setShowModal(true);
    };

    const handleSaveAccount = (newAccountData: Omit<UserAccount, 'id'>) => {
        if (isEditing) {
            // Logika Update
            setAccounts(accounts.map(acc =>
                acc.id === isEditing.id ? { ...isEditing, ...newAccountData, id: isEditing.id } : acc
            ));
        } else {
            // Logika Create
            const newId = Math.max(...accounts.map(a => a.id), 0) + 1;
            const newEntry: UserAccount = { ...newAccountData, id: newId, isActive: true };
            setAccounts([...accounts, newEntry]);
        }
        setShowModal(false);
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
            setAccounts(accounts.filter(acc => acc.id !== id));
            // Logika API DELETE
        }
    };

    // 💡 LOGIKA FILTER & PENCARIAN
    const filteredAccounts = accounts
        .filter(acc =>
            (filterRole === 'Semua' || acc.role === filterRole)
        )
        .filter(acc =>
            acc.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const accountToToggle = accounts.find(acc => acc.id === confirmToggleId);
    const action = accountToToggle?.isActive ? 'Nonaktifkan' : 'Aktifkan';
    const warningText = `Apakah Anda yakin ingin ${action} akun ${accountToToggle?.nama} ini?`;

    return (
        <AdminPageLayout>
            <div className="space-y-8">

                {/* Header Halaman */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Users size={32} weight="fill" className="text-blue-500" /> Manajemen Akun
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola akun Admin dan UMKM yang terdaftar di sistem.</p>
                </header>

                {/* Filter, Search, dan Tombol Tambah */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-md">
                    <div className="flex gap-4">
                        {/* Filter Peran */}
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value as 'Semua' | UserRole)}
                            className="p-2 border rounded-lg w-full md:w-auto"
                        >
                            <option value="Semua">Semua Peran</option>
                            <option value="Admin">Admin</option>
                            <option value="UMKM">UMKM</option>
                        </select>
                        {/* Tombol Tambah */}
                        <button
                            onClick={handleOpenAdd}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <PlusCircle size={20} /> Tambah Akun
                        </button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            className="border p-2 pl-10 rounded-lg w-full outline-none focus:border-blue-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabel Daftar Akun */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <AccountTable
                        accounts={filteredAccounts}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleClick} //
                    />
                </div>

                {/* Modal Form Tambah/Edit Akun */}
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
                        onConfirm={() => handleToggleStatus(confirmToggleId)} // Panggil logic final
                    />
                )}
            </div>
        </AdminPageLayout>
    );
}