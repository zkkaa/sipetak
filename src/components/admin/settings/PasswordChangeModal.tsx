// File: src/components/admin/settings/PasswordChangeModal.tsx

"use client";
import React, { useState } from 'react';
import { X, LockSimple, Eye, EyeSlash } from '@phosphor-icons/react';
import ConfirmationModal from '../../common/confirmmodal';

interface PasswordChangeModalProps {
    onClose: () => void;
    onSave: (oldPass: string, newPass: string) => void;
}

export default function PasswordChangeModal({ onClose, onSave }: PasswordChangeModalProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!oldPassword) {
            setErrorMessage("Harap isi password lama.");
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage("Password baru minimal 6 karakter.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Password baru dan konfirmasi password tidak cocok.");
            return;
        }

        if (oldPassword === newPassword) {
            setErrorMessage("Password baru tidak boleh sama dengan password lama.");
            return;
        }

        setIsConfirmOpen(true);
    };

    const handleConfirmSave = () => {
        onSave(oldPassword, newPassword);
        setIsConfirmOpen(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-[40] flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <LockSimple size={24} weight="fill" className="text-blue-600" />
                            Ubah Password
                        </h3>
                        <button 
                            onClick={onClose} 
                            className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Error Message */}
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {errorMessage}
                            </div>
                        )}

                        {/* Password Lama */}
                        <div>
                            <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                                Password Lama
                            </label>
                            <div className="relative">
                                <input 
                                    type={showOldPassword ? "text" : "password"}
                                    value={oldPassword} 
                                    onChange={(e) => setOldPassword(e.target.value)} 
                                    className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showOldPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Password Baru */}
                        <div>
                            <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                                Password Baru
                            </label>
                            <div className="relative">
                                <input 
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    required 
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showNewPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Minimal 6 karakter</p>
                        </div>

                        {/* Konfirmasi Password Baru */}
                        <div>
                            <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                                Konfirmasi Password Baru
                            </label>
                            <div className="relative">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    required 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="py-2 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition cursor-pointer shadow-md hover:shadow-lg"
                            >
                                Simpan Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <ConfirmationModal
                    title="Konfirmasi Ubah Password"
                    message="Anda yakin ingin mengubah password Anda?"
                    onClose={() => setIsConfirmOpen(false)}
                    onConfirm={handleConfirmSave}
                    confirmText="Ya, Ubah Password"
                    confirmColor="blue"
                />
            )}
        </>
    );
}