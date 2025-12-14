"use client";

import React, { useState, useEffect } from 'react';
import Button from "../../components/common/button";
import { MapPin, ShieldWarning, PaperPlaneTilt, ArrowLeft, XCircle, CheckCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import InputFile from '../../components/common/inputfile';

import LocationConfirmModal from '../../components/common/LocationConfirmModal';
import SubmitConfirmModal from '../../components/common/SubmitConfirmModal';
import ConfirmationModal from '../../components/common/confirmmodal';

const DynamicMapInput = dynamic(
    () => import('../../components/MapInput'),
    { ssr: false }
);

interface FormData {
    photoFile: File | null;
    violationType: string;
    customViolationName: string;
    description: string;
    latitude: string;
    longitude: string;
}

interface LocationData {
    latitude: number;
    longitude: number;
    akurasi: number;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

const InputContainer = (props: { children: React.ReactNode, title: string }) => (
    <div className="border-b border-gray-100 pb-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{props.title}</h3>
        {props.children}
    </div>
);

export default function FormLaporan() {
    const router = useRouter();
    const [previousPath, setPreviousPath] = useState<string>('/');
    
    const [formData, setFormData] = useState<FormData>({
        photoFile: null,
        violationType: '',
        customViolationName: '',
        description: '',
        latitude: '',
        longitude: '',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successReportId, setSuccessReportId] = useState('');

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const referrer = document.referrer;
            
            if (referrer.includes('/umkm/')) {
                setPreviousPath('/umkm/beranda');
            } else if (referrer.includes('/admin/')) {
                setPreviousPath('/admin/beranda');
            } else {
                setPreviousPath('/');
            }
            
            console.log('📍 Referrer:', referrer);
            console.log('🔙 Previous path:', previousPath);
        }
    }, []);

    const violationOptions = [
        'Menempati Trotoar/Fasum',
        'Menutup Akses Jalan/Gang',
        'Berjualan di Zona Terlarang',
        'Pelanggaran Lainnya',
    ];

    const handleBack = () => {
        console.log('🔙 Going back to:', previousPath);
        router.back();
    };

    const handleSubmit = async (e: FormSubmitEvent) => {
        e.preventDefault();
        
        // Validasi
        if (formData.violationType === 'Pelanggaran Lainnya' && !formData.customViolationName.trim()) {
            setErrorMessage("Mohon masukkan jenis pelanggaran lainnya.");
            setShowErrorModal(true);
            return;
        }

        if (!formData.photoFile) {
            setErrorMessage("Mohon unggah foto bukti pelanggaran.");
            setShowErrorModal(true);
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            setErrorMessage("Mohon ambil lokasi terlebih dahulu dengan klik tombol 'Ambil Lokasi'.");
            setShowErrorModal(true);
            return;
        }

        if (formData.description.length < 20) {
            setErrorMessage("Deskripsi minimal 20 karakter untuk penjelasan yang jelas.");
            setShowErrorModal(true);
            return;
        }

        setShowSubmitModal(true);
    };

    const handleConfirmSubmit = async () => {
        setShowSubmitModal(false);
        setIsSubmitting(true);

        try {
            const submitFormData = new FormData();
            
            const reportType = formData.violationType === 'Pelanggaran Lainnya' 
                ? formData.customViolationName 
                : formData.violationType;
            
            submitFormData.append('reportType', reportType);
            submitFormData.append('description', formData.description);
            submitFormData.append('latitude', formData.latitude);
            submitFormData.append('longitude', formData.longitude);
            submitFormData.append('photoFile', formData.photoFile!);

            console.log('📤 Mengirim laporan ke API...');

            const response = await fetch('/api/public/reports', {
                method: 'POST',
                body: submitFormData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Terjadi kesalahan server.');
            }

            console.log('✅ Laporan berhasil dikirim:', result);

            setSuccessReportId(result.report.id);
            setShowSuccessModal(true);
            setFormData({
                photoFile: null,
                violationType: '',
                customViolationName: '',
                description: '',
                latitude: '',
                longitude: '',
            });

        } catch (error) {
            console.error('❌ Submit Error:', error);
            setErrorMessage(
                error instanceof Error 
                    ? error.message 
                    : 'Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.'
            );
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (file: File) => {
        console.log('📎 File selected:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
        setFormData(prev => ({ ...prev, photoFile: file }));
    };

    const handleChange = (e: InputChangeEvent) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'violationType' && value !== 'Pelanggaran Lainnya' && { customViolationName: '' })
        }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setErrorMessage("Browser Anda tidak mendukung Geolocation. Gunakan browser yang lebih modern (Chrome, Firefox, Safari).");
            setShowErrorModal(true);
            return;
        }

        console.log('📍 Mengambil lokasi GPS...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const data: LocationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    akurasi: Math.round(position.coords.accuracy)
                };
                
                console.log('✅ Lokasi berhasil diambil:', data);
                
                setLocationData(data);
                setShowLocationModal(true);
            },
            (error) => {
                console.error('❌ Geolocation Error:', error);
                let errorMsg = "";
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = "Anda menolak izin akses lokasi. Silakan aktifkan izin lokasi di browser.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = "Informasi lokasi tidak tersedia. Coba lagi dalam beberapa saat.";
                        break;
                    case error.TIMEOUT:
                        errorMsg = "Request timeout. Pastikan GPS aktif dan coba lagi.";
                        break;
                    default:
                        errorMsg = error.message;
                }
                
                setErrorMessage(errorMsg);
                setShowErrorModal(true);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleConfirmLocation = (data: LocationData) => {
        setFormData(prev => ({
            ...prev,
            latitude: data.latitude.toString(),
            longitude: data.longitude.toString(),
        }));
        console.log('✅ Lokasi tersimpan:', data);
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        window.location.reload();
    };

    return (
        <section id="report" className="py-20 bg-gray-50 min-h-screen flex justify-center items-start">
            <div className="container mx-auto px-6 max-w-5xl">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft size={20} />
                    Kembali
                </button>

                <header className="text-center mb-12">
                    <ShieldWarning size={48} className="text-blue-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900">Laporkan Pelanggaran Tata Ruang</h1>
                    <p className="text-md text-gray-600 mt-2 max-w-2xl mx-auto">
                        Bantu wujudkan kota tertib dan nyaman. Laporan Anda bersifat <b>anonim</b> dan prosesnya <b>cepat</b>.
                    </p>
                </header>

                <div className="md:hidden lg:hidden mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-600 mb-4">📋 Panduan Cepat (3 Langkah)</h3>
                    <ol className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                            <span className="font-bold text-lg mr-2 text-blue-600">1.</span>
                            <span>Ambil <b>Foto Bukti</b> sejelas mungkin</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-lg mr-2 text-blue-600">2.</span>
                            <span>Klik tombol <b>Ambil Lokasi</b> untuk koordinat akurat</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-lg mr-2 text-blue-600">3.</span>
                            <span>Isi deskripsi singkat dan <b>Kirim Laporan</b></span>
                        </li>
                    </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-white p-6 md:p-10 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
                        <InputContainer 
                            title="1. Unggah Bukti Visual" 
                        >
                            <InputFile 
                                name="photoFile"
                                onChange={handleFileChange} 
                                inputHeightClass="h-56" 
                                required 
                            />
                        </InputContainer>
                        <InputContainer
                            title="2. Jenis Pelanggaran"
                        >
                            <select
                                name="violationType"
                                value={formData.violationType}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:none transition"
                                required
                            >
                                <option value="" disabled>-- Pilih Jenis Pelanggaran --</option>
                                {violationOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </InputContainer>
                        {formData.violationType === 'Pelanggaran Lainnya' && (
                            <div className="mb-6 rounded-lg p-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nama Pelanggaran Baru <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customViolationName"
                                    value={formData.customViolationName}
                                    onChange={handleChange}
                                    placeholder="Contoh: Menaruh barang dagangan di area hijau taman kota"
                                    className="w-full p-3 border rounded-lg"
                                    required
                                />
                                <p className="text-xs text-gray-600 mt-2">
                                    Jelaskan jenis pelanggaran yang tidak ada di pilihan di atas
                                </p>
                            </div>
                        )}
                        <InputContainer
                            title="3. Deskripsi Singkat"
                        >
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Contoh: Terdapat pedagang yang berjualan di atas trotoar pertigaan dadaha"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                                required
                            ></textarea>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">
                                    Minimal 20 karakter
                                </p>
                                <p className={`text-xs ${formData.description.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {formData.description.length} karakter
                                </p>
                            </div>
                        </InputContainer>
                        <InputContainer
                            title="4. Ambil Lokasi Akurat"
                        >
                            {(formData.latitude && formData.longitude) && (
                                <div className="md:hidden lg:hidden bg-white h-60 rounded-lg shadow-md overflow-hidden border mb-4">
                                    <DynamicMapInput latitude={formData.latitude} longitude={formData.longitude} />
                                </div>
                            )}
                            
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleGetLocation}
                                    className={`w-full md:w-fit ${
                                        formData.latitude 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-blue-500 hover:bg-blue-600'
                                    } text-white py-3 px-6 font-semibold transition-all duration-200`}
                                    type="button"
                                >
                                    <MapPin size={20} className="mr-2 inline" weight="fill" /> 
                                    {formData.latitude ? '✓ Perbarui Lokasi' : 'Ambil Lokasi Saat Ini'}
                                </Button>
                                
                                {(formData.latitude && formData.longitude) && (
                                    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                                        <p className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                                            <span className="mr-2">✓</span> Lokasi Berhasil Diambil
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                                            <div>
                                                <span className="font-medium">Latitude:</span><br/>
                                                {parseFloat(formData.latitude).toFixed(6)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Longitude:</span><br/>
                                                {parseFloat(formData.longitude).toFixed(6)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <input type="hidden" name="latitude" value={formData.latitude} required />
                                <input type="hidden" name="longitude" value={formData.longitude} required />
                            </div>
                        </InputContainer>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                className="w-full bg-red-600 text-white py-4 text-lg font-bold hover:bg-red-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="inline-block animate-spin mr-2">⏳</span>
                                        Mengirim Laporan...
                                    </>
                                ) : (
                                    <>
                                        <PaperPlaneTilt size={20} className="mr-2 inline" weight="fill" /> 
                                        Kirim Laporan Saya
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    <aside className="hidden md:flex lg:flex md:col-span-1 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg self-start sticky top-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-blue-600 mb-4">📋 Panduan Cepat</h3>
                                <ol className="space-y-3 text-sm text-gray-700">
                                    <li className="flex items-start">
                                        <span className="font-bold text-lg mr-2 text-blue-600">1.</span>
                                        <span>Ambil <b>Foto Bukti</b> sejelas mungkin</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold text-lg mr-2 text-blue-600">2.</span>
                                        <span>Klik <b>Ambil Lokasi</b> untuk koordinat akurat</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold text-lg mr-2 text-blue-600">3.</span>
                                        <span>Isi deskripsi dan <b>Kirim Laporan</b></span>
                                    </li>
                                </ol>
                            </div>

                            <hr className="border-blue-200" />

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                                    <span className="mr-2">🔒</span> Jaminan Privasi
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Data pribadi Anda tidak dibutuhkan. Kami hanya menggunakan bukti visual dan koordinat lokasi untuk tujuan penertiban.
                                </p>
                            </div>

                            {(formData.latitude && formData.longitude) && (
                                <div className="bg-white h-64 rounded-lg shadow-md overflow-hidden border border-blue-200">
                                    <DynamicMapInput latitude={formData.latitude} longitude={formData.longitude} />
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            <LocationConfirmModal
                isOpen={showLocationModal}
                locationData={locationData}
                onClose={() => setShowLocationModal(false)}
                onConfirm={handleConfirmLocation}
            />

            <SubmitConfirmModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onConfirm={handleConfirmSubmit}
            />

            {showSuccessModal && (
                <ConfirmationModal
                    title="Laporan Berhasil Dikirim! 🎉"
                    message={`ID Laporan: ${successReportId}. Tim kami akan segera menindaklanjuti laporan Anda. Terima kasih atas kontribusi Anda!`}
                    onClose={handleSuccessClose}
                    onConfirm={handleSuccessClose}
                    confirmText="Kembali"
                    cancelText=""
                    icon={<CheckCircle size={48} color="#FFFFFF" weight="fill" />}
                    confirmColor="green"
                />
            )}

            {showErrorModal && (
                <ConfirmationModal
                    title="Terjadi Kesalahan"
                    message={errorMessage}
                    onClose={() => setShowErrorModal(false)}
                    onConfirm={() => setShowErrorModal(false)}
                    confirmText="Mengerti"
                    cancelText=""
                    icon={<XCircle size={48} color="#FFFFFF" weight="fill" />}
                    confirmColor="red"
                />
            )}
        </section>
    );
}