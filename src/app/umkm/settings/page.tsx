"use client";
import React, { useState } from 'react';
import AdminLayout from '../../../components/adminlayout';
import { UserCircle } from '@phosphor-icons/react';
import ProfileForm from '../../../components/umkm/setting/ProfileForm';
import ImageUploadModal from '../../../components/umkm/setting/ImageUploadModal';
import PasswordChangeModal from '../../../components/umkm/setting/PasswordChangeModal';
import ConfirmationModal from '../../../components/common/confirmmodal';
import Image from 'next/image';

const INITIAL_USER_DATA = {
    id: 1,
    fullName: 'Salmiaw',
    email: 'salmiaw@mail.com',
    phone: '081234567890',
};

export default function ProfileSettingsPage() {
    const [userData, setUserData] = useState(INITIAL_USER_DATA);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pendingSaveData, setPendingSaveData] = useState<any>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveProfile = (data: any) => {
        setPendingSaveData(data);
        setIsSaveConfirmOpen(true);
    };

    const handleSaveConfirmed = () => {
        console.log("Saving profile data:", pendingSaveData);
        setUserData(prev => ({ ...prev, ...pendingSaveData }));
        setIsSaveConfirmOpen(false);
        // Logika API PUT akan ditambahkan di sini
    };

    const handleSaveNewPassword = (oldPass: string, newPass: string) => {
        console.log("Password changed successfully");
        setIsPasswordModalOpen(false);
        // Logika API untuk ubah password
    };

    const handleLogout = () => {
        setIsLogoutConfirmOpen(true);
    };

    const handleLogoutConfirmed = () => {
        console.log("User logged out.");
        setIsLogoutConfirmOpen(false);
        // Logika Clear Token dan Redirect ke /masuk
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
                                        width={96} 
                                        height={96} 
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" 
                                    />
                                ) : (
                                    <UserCircle 
                                        size={96} 
                                        weight="fill" 
                                        className="text-blue-500 bg-white rounded-full border-4 border-white shadow-md" 
                                    />
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <h2 className="text-2xl font-bold text-gray-800">{userData.fullName}</h2>
                        <p className="text-sm text-gray-500">{userData.email}</p>

                        <hr className="my-6" />

                        {/* Profile Form */}
                        <ProfileForm
                            initialData={userData}
                            onSave={handleSaveProfile}
                            onLogout={handleLogout}
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

            {isLogoutConfirmOpen && (
                <ConfirmationModal
                    title="Konfirmasi Logout"
                    message="Anda yakin ingin keluar dari akun SIPETAK?"
                    onClose={() => setIsLogoutConfirmOpen(false)}
                    onConfirm={handleLogoutConfirmed}
                    confirmText="Ya, Keluar"
                    confirmColor="red"
                />
            )}
        </AdminLayout>
    );
}