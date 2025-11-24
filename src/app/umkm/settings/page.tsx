"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/adminlayout';
import { UserCircle } from '@phosphor-icons/react';
import ProfileForm from '../../../components/umkm/setting/ProfileForm';
import ImageUploadModal from '../../../components/umkm/setting/ImageUploadModal';
import PasswordChangeModal from '../../../components/umkm/setting/PasswordChangeModal';
import ConfirmationModal from '../../../components/common/confirmmodal';
import Image from 'next/image';
import { useUser } from '../../../app/context/UserContext'

// Definisi untuk data yang akan di-fetch
interface UserProfileData {
    id: number;
    fullName: string;
    email: string;
    phone: string;
}

export default function ProfileSettingsPage() {
    const { user, loading } = useUser();

    // const [userData, setUserData] = useState(INITIAL_USER_DATA);
    const [profileData, setProfileData] = useState<UserProfileData>({ id: 0, fullName: '', email: '', phone: '' });
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pendingSaveData, setPendingSaveData] = useState<any>(null);

    useEffect(() => {
        if (user && !loading) { // Jika user sudah dimuat dan bukan loading state awal
            setProfileData({
                id: user.id,
                fullName: user.nama,
                email: user.email,
                phone: user.phone || '',
            });
        }
    }, [user, loading]);

    // 1. Simpan Perubahan Profil (PUT /api/umkm/profile)
    const handleSaveProfile = (data: UserProfileData) => {
        setPendingSaveData(data);
        setIsSaveConfirmOpen(true);
    };
    

    const handleSaveConfirmed = async () => {
        setIsSaveConfirmOpen(false);

        const payload = {
            // Kita hanya izinkan update phone dari form ini
            phone: pendingSaveData.phone, 
        };

        try {
            const response = await fetch('/api/umkm/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (response.ok && result.success) {
                // Update state lokal dan context (jika perlu)
                setProfileData(prev => ({ ...prev, phone: result.user.phone }));
                alert('✅ Profil berhasil diperbarui!');
            } else {
                alert(`❌ Gagal: ${result.message}`);
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan jaringan saat menyimpan.');
        }
    };

    const handleSaveNewPassword = async (oldPass: string, newPass: string) => {
        setIsPasswordModalOpen(false);

        try {
            const response = await fetch('/api/umkm/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
            });
            const result = await response.json();

            if (response.ok && result.success) {
                alert('✅ Password berhasil diubah!');
            } else {
                alert(`❌ Gagal mengubah password: ${result.message}`);
            }
        } catch (error) {
            alert('❌ Terjadi kesalahan jaringan saat mengubah password.');
        }
    };


    const handleUploadImage = (file: File) => {
        setProfileImageUrl(URL.createObjectURL(file));
        setIsImageModalOpen(false);
    };

    const handleDeleteImage = () => {
        setProfileImageUrl(null);
        setIsImageModalOpen(false);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col items-center min-h-screen py-8">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
                    {/* Background Header */}
                    <div className="relative h-48 bg-gray-200">
                        <Image 
                            src="/assets/wave_bg.jpg" 
                            alt="Background Wave" 
                            layout="fill" 
                            objectFit="cover" 
                            className="opacity-70" 
                        />
                    </div>

                    {/* Main Content */}
                    <div className="p-6 sm:p-8 relative">
                        {/* Profile Photo Area */}
                        <div className="flex items-end -mt-20 mb-6">
                            <div 
                                onClick={() => setIsImageModalOpen(true)} 
                                className="cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                {profileImageUrl ? (
                                    <Image 
                                        src={profileImageUrl} 
                                        alt="Profil" 
                                        width={128} 
                                        height={128} 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" 
                                    />
                                ) : (
                                    <UserCircle 
                                        size={128} 
                                        weight="fill" 
                                        className="text-blue-500 bg-white rounded-full border-4 border-white shadow-md" 
                                    />
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <h2 className="text-2xl font-bold text-gray-800">{profileData.fullName}</h2>
                        <p className="text-sm text-gray-500">{profileData.email}</p>

                        <hr className="my-6" />

                        {/* Profile Form */}
                        <ProfileForm
                            initialData={profileData} 
                            onSave={handleSaveProfile}
                            onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isImageModalOpen && (
                <ImageUploadModal
                    currentImageUrl={profileImageUrl}
                    onClose={() => setIsImageModalOpen(false)}
                    onUpload={handleUploadImage}
                    onDelete={handleDeleteImage}
                />
            )}

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
        </AdminLayout>
    );
}