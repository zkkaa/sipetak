"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/adminlayout';
import { UserCircle } from '@phosphor-icons/react';
import ProfileForm from '../../../components/umkm/setting/ProfileForm';
import PasswordChangeModal from '../../../components/umkm/setting/PasswordChangeModal';
import ConfirmationModal from '../../../components/common/confirmmodal';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';
import Image from 'next/image';
import { useUser } from '../../../app/context/UserContext';

interface UserProfileData {
    id: number;
    fullName: string;
    email: string;
    phone: string;
}

export default function ProfileSettingsPage() {
    const { user, loading } = useUser();
    const [profileData, setProfileData] = useState<UserProfileData>({ 
        id: 0, 
        fullName: '', 
        email: '', 
        phone: '' 
    });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [pendingSaveData, setPendingSaveData] = useState<UserProfileData | null>(null);
    const [actionFeedback, setActionFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                setActionFeedback({
                    message: 'Anda harus login terlebih dahulu',
                    type: 'error'
                });
                return;
            }

            if (user.role !== 'UMKM') {
                setActionFeedback({
                    message: 'Akses ditolak. Halaman ini hanya untuk UMKM.',
                    type: 'error'
                });
                return;
            }

            setProfileData({
                id: user.id,
                fullName: user.nama,
                email: user.email,
                phone: user.phone || ''
            });
        }
    }, [user, loading]);

    const handleSaveProfile = (data: UserProfileData) => {
        setPendingSaveData(data);
        setIsSaveConfirmOpen(true);
    };

    const handleSaveConfirmed = async () => {
        if (!pendingSaveData) return;

        setIsSaveConfirmOpen(false);
        setActionFeedback({ 
            message: 'Menyimpan perubahan...', 
            type: 'info' 
        });

        const payload = {
            phone: pendingSaveData.phone,
        };

        try {
            const response = await fetch('/api/umkm/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setProfileData(prev => ({ ...prev, phone: result.user.phone }));
                setActionFeedback({ 
                    message: '✅ Profil berhasil diperbarui!', 
                    type: 'success' 
                });
            } else {
                setActionFeedback({ 
                    message: `❌ Gagal: ${result.message}`, 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setActionFeedback({ 
                message: '❌ Terjadi kesalahan jaringan saat menyimpan.', 
                type: 'error' 
            });
        }
    };

    const handleSaveNewPassword = async (oldPass: string, newPass: string) => {
        setIsPasswordModalOpen(false);
        setActionFeedback({ 
            message: 'Mengubah password...', 
            type: 'info' 
        });

        try {
            const response = await fetch('/api/umkm/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    oldPassword: oldPass, 
                    newPassword: newPass 
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setActionFeedback({ 
                    message: '✅ Password berhasil diubah!', 
                    type: 'success' 
                });
            } else {
                setActionFeedback({ 
                    message: `❌ Gagal mengubah password: ${result.message}`, 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setActionFeedback({ 
                message: '❌ Terjadi kesalahan jaringan saat mengubah password.', 
                type: 'error' 
            });
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat profil...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!user || user.role !== 'UMKM') {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-semibold">❌ Akses Ditolak</p>
                        <p className="text-red-500 text-sm mt-2">
                            Halaman ini hanya untuk UMKM
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col items-center min-h-screen py-8">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
                    <div className="relative h-48 bg-gray-200">
                        <Image
                            src="/blue.jpeg"
                            alt="Background Wave"
                            layout="fill"
                            objectFit="cover"
                            className="opacity-70"
                        />
                    </div>

                    <div className="p-6 sm:p-8 relative">
                        <div className="flex items-end -mt-20 mb-6">
                            <UserCircle
                                size={128}
                                weight="fill"
                                className="text-blue-500 bg-white rounded-full border-4 border-white shadow-md"
                            />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800">{profileData.fullName}</h2>
                        <p className="text-sm text-gray-500">{profileData.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            🏪 UMKM
                        </span>

                        <hr className="my-6" />

                        <ProfileForm
                            initialData={profileData}
                            onSave={handleSaveProfile}
                            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {isPasswordModalOpen && (
                <PasswordChangeModal
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSave={handleSaveNewPassword}
                />
            )}

            {isSaveConfirmOpen && (
                <ConfirmationModal
                    title="Konfirmasi Simpan"
                    message="Anda yakin ingin menyimpan perubahan profil?"
                    onClose={() => setIsSaveConfirmOpen(false)}
                    onConfirm={handleSaveConfirmed}
                    confirmText="Ya, Simpan"
                    confirmColor="blue"
                />
            )}

            {actionFeedback && (
                <ActionFeedbackModal
                    message={actionFeedback.message}
                    type={actionFeedback.type}
                    onClose={() => setActionFeedback(null)}
                />
            )}
        </AdminLayout>
    );
}