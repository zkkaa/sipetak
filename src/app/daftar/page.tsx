"use client";
import React, { useState } from "react";
import Stepper, { Step } from "../../components/common/inputstepper"; // Sesuaikan path Stepper Anda
import { User, Storefront, CheckCircle } from '@phosphor-icons/react';

// --- INTERFACE GLOBAL ---
interface RegistrationData {
    namaPemilik: string;
    email: string;
    password: string;
    namaUsaha: string;
    nik: string;
    jenisUsaha: 'Makanan' | 'Jasa' | 'Retail' | '';
    alamat: string;
    setujuSK: boolean;
}

const initialData: RegistrationData = {
    namaPemilik: '',
    email: '',
    password: '',
    namaUsaha: '',
    nik: '',
    jenisUsaha: '',
    alamat: '',
    setujuSK: false,
};

// --- Komponen Langkah (Disesuaikan) ---

const Step1Account: React.FC<{ data: RegistrationData; updateData: (name: keyof RegistrationData, value: string) => void }> = ({ data, updateData }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4"><User size={20} className="text-blue-500" /> Data Akun & Pemilik</h3>
        <input type="text" placeholder="Nama Lengkap Pemilik" className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={data.namaPemilik} onChange={(e) => updateData('namaPemilik', e.target.value)} required />
        <input type="email" placeholder="Email (Username)" className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={data.email} onChange={(e) => updateData('email', e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={data.password} onChange={(e) => updateData('password', e.target.value)} required />
    </div>
);

const Step2Business: React.FC<{ data: RegistrationData; updateData: (name: keyof RegistrationData, value: string) => void }> = ({ data, updateData }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4"><Storefront size={20} className="text-blue-500" /> Detail Usaha & Legalitas</h3>
        <input type="text" placeholder="Nama Usaha (Contoh: Warung Sejahtera)" className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={data.namaUsaha} onChange={(e) => updateData('namaUsaha', e.target.value)} required />
        <input type="text" placeholder="NIK Pemilik (16 Digit)" className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={data.nik} onChange={(e) => updateData('nik', e.target.value)} maxLength={16} required />
        <select className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={data.jenisUsaha} onChange={(e) => updateData('jenisUsaha', e.target.value as RegistrationData['jenisUsaha'])} required>
            <option value="" disabled>Pilih Jenis Usaha</option>
            <option value="Makanan">Makanan & Minuman</option>
            <option value="Jasa">Jasa</option>
            <option value="Retail">Retail</option>
        </select>
        <textarea placeholder="Alamat Lengkap Usaha" className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={data.alamat} onChange={(e) => updateData('alamat', e.target.value)} rows={2} required />
    </div>
);

const Step3Confirmation: React.FC<{ data: RegistrationData; updateData: (name: keyof RegistrationData, value: string | boolean) => void }> = ({ data, updateData }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 mb-4"><CheckCircle size={20} className="text-blue-500" /> Ringkasan & Persetujuan</h3>
        <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
            <p><strong>Usaha:</strong> {data.namaUsaha || 'Belum diisi'}</p>
            <p><strong>Pemilik:</strong> {data.namaPemilik || 'Belum diisi'}</p>
            <p><strong>Email:</strong> {data.email || 'Belum diisi'}</p>
            <p className="pt-2 text-red-500">Pastikan data di atas sudah benar.</p>
        </div>
        <label className="flex items-center text-sm pt-4">
            <input 
                type="checkbox" 
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                checked={data.setujuSK} 
                onChange={(e) => updateData('setujuSK', e.target.checked)}
            />
            Saya menyetujui Syarat & Ketentuan SIPETAK. (Wajib)
        </label>
        {!data.setujuSK && <p className="text-xs text-red-500">Persetujuan diperlukan untuk melanjutkan.</p>}
    </div>
);


// --- KOMPONEN PAGE UTAMA ---
export default function DaftarPage() {
    const [formData, setFormData] = useState<RegistrationData>(initialData);

    // Handler untuk memperbarui data
    const updateData = (name: keyof RegistrationData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Logika Validasi Lanjutan (Selain validasi dasar dari Stepper)
    const validateFinalStep = () => {
        return formData.setujuSK;
    };
    
    const handleFinalCompletion = () => {
        if (!validateFinalStep()) {
            alert("Harap setujui Syarat & Ketentuan sebelum menyelesaikan pendaftaran.");
            return;
        }
        console.log("FINAL SUBMISSION:", formData);
        alert("Pendaftaran Berhasil! Silakan Masuk.");
        // router.push('/masuk');
    };

    return (
        <div className="bg-gray-50 min-h-screen p-8 flex items-center justify-center">
            
            <Stepper
                initialStep={1}
                onFinalStepCompleted={handleFinalCompletion}
                // 💡 PENTING: Penyesuaian Styling Stepper agar sesuai tema SIPETAK
                stepCircleContainerClassName="!rounded-xl" // Mengubah border-radius kontainer
                backButtonText="Kembali"
                nextButtonText="Lanjut"
                // Mengubah warna tombol dan styling lainnya
                nextButtonProps={{
                    className: "duration-350 flex items-center justify-center rounded-lg bg-blue-600 py-2 px-6 font-medium tracking-tight text-white transition hover:bg-blue-700 active:bg-blue-800"
                }}
            >
                <Step>
                    <Step1Account data={formData} updateData={updateData} />
                </Step>
                <Step>
                    <Step2Business data={formData} updateData={updateData} />
                </Step>
                <Step>
                    <Step3Confirmation data={formData} updateData={updateData} />
                </Step>
            </Stepper>
        </div>
    );
}