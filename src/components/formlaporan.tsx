"use client";
import React, { useState } from 'react';
import Button from "../components/common/button";
import { Camera, MapPin, ShieldWarning, PaperPlaneTilt } from '@phosphor-icons/react';
import dynamic from 'next/dynamic'; 

const DynamicMapInput = dynamic(
    () => import('./MapInput'),
    { ssr: false }
);

interface FormData {
    photoFile: File | null;
    violationType: string;
    customViolationName: string; 
    description: string;
    latitude: string;
    longitude: string;
    contactEmail: string;
}
type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

const InputContainer = (props: { children: React.ReactNode, title: string, description: string }) => (
    <div className="border-b border-gray-100 pb-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{props.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{props.description}</p>
        {props.children}
    </div>
);

export default function FormLaporan() {
    const [formData, setFormData] = useState<FormData>({
        photoFile: null,
        violationType: '',
        customViolationName: '', 
        description: '',
        latitude: '',
        longitude: '',
        contactEmail: '',
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const violationOptions = [
        'Menempati Trotoar/Fasum',
        'Menutup Akses Jalan/Gang',
        'Berjualan di Zona Terlarang',
        'Pelanggaran Lainnya', 
    ];

    const handleSubmit = (e: FormSubmitEvent) => {
        e.preventDefault();
        if (formData.violationType === 'Pelanggaran Lainnya' && !formData.customViolationName.trim()) {
            alert("Mohon masukkan Jenis Pelanggaran Lainnya.");
            return;
        }

        console.log("Data Laporan Dikirim:", formData);
        alert("Laporan berhasil dikirim! Terima kasih.");
    };

    const handleChange = (e: InputChangeEvent) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            const inputElement = e.target as HTMLInputElement;
            const file = inputElement.files?.[0] || null;

            if (file) {
                setFormData(prev => ({ ...prev, photoFile: file }));
                const reader = new FileReader();
                reader.onloadend = () => { setPreviewUrl(reader.result as string); };
                reader.readAsDataURL(file);
            } else {
                setFormData(prev => ({ ...prev, photoFile: null }));
                setPreviewUrl(null);
            }
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ...(name === 'violationType' && value !== 'Pelanggaran Lainnya' && { customViolationName: '' })
            }));
        }
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                }));
                alert(`Lokasi berhasil diambil!\nLat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`);
            },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (error) => {
                    alert("Gagal mengambil lokasi. Pastikan izin lokasi diberikan.");
                });
        } else {
            alert("Browser Anda tidak mendukung Geolocation.");
        }
    };

    return (
        <section id="report" className="py-20 bg-gray-50 min-h-screen flex justify-center items-start">
            <div className="container mx-auto px-6 max-w-5xl">

                <header className="text-center mb-12">
                    <ShieldWarning size={48} className="text-blue-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-gray-900">Laporkan Pelanggaran Tata Ruang</h1>
                    <p className="text-md text-gray-600 mt-2 max-w-2xl mx-auto">
                        Bantu wujudkan kota tertib dan nyaman. Laporan Anda bersifat <b>anonim</b> dan prosesnya <b>cepat</b>.
                    </p>
                </header>

                <div className="md:hidden lg:hidden mb-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-600 mb-4">Panduan Cepat (3 Langkah)</h3>
                    <ol className="space-y-3 text-gray-700">
                        <li><span className="font-bold text-lg mr-2">1.</span> Ambil Foto Bukti Sejelas Mungkin.</li>
                        <li><span className="font-bold text-lg mr-2">2.</span> Klik <b>Ambil Lokasi</b> untuk mendapatkan koordinat yang akurat.</li>
                        <li><span className="font-bold text-lg mr-2">3.</span> Isi deskripsi singkat dan <b>Kirim Laporan</b>.</li>
                    </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 bg-white p-6 md:p-10 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit} className="md:col-span-2">
                        <InputContainer
                            title="1. Unggah Bukti Visual"
                            description="Foto harus jelas menunjukkan pelanggaran (HP akan menawarkan opsi Kamera atau Galeri)."
                        >
                            <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition duration-150 h-56">
                                <input
                                    type="file"
                                    name="photoFile"
                                    accept="image/*"
                                    capture="environment" 
                                    onChange={handleChange}
                                    className="hidden"
                                    required
                                />

                                {previewUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={previewUrl} alt="Pratinjau Bukti" className="max-h-full max-w-full object-contain rounded-md" />
                                ) : (
                                    <div className="flex flex-col items-center text-center text-gray-700">
                                        <Camera size={32} className="text-gray-500 mb-2" />
                                        <span>
                                            {formData.photoFile ? formData.photoFile.name : "Klik di sini untuk unggah foto / ambil gambar"}
                                        </span>
                                    </div>
                                )}
                            </label>
                        </InputContainer>

                        <InputContainer
                            title="2. Jenis Pelanggaran"
                            description="Pilih kategori pelanggaran yang paling sesuai."
                        >
                            <select
                                name="violationType"
                                value={formData.violationType}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="" disabled>-- Pilih Jenis --</option>
                                {violationOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </InputContainer>

                        {formData.violationType === 'Pelanggaran Lainnya' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pelanggaran Baru (Wajib)</label>
                                <input
                                    type="text"
                                    name="customViolationName"
                                    value={formData.customViolationName}
                                    onChange={handleChange}
                                    placeholder="Contoh: Menaruh barang dagangan di area hijau"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                            </div>
                        )}

                        <InputContainer
                            title="3. Deskripsi Singkat"
                            description="Jelaskan rincian pelanggaran (lokasi spesifik, waktu, dll.)."
                        >
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                required
                            ></textarea>
                        </InputContainer>

                        <InputContainer
                            title="4. Ambil Lokasi Akurat"
                            description="Otomatis mengambil koordinat GPS dari ponsel/perangkat Anda."
                        >
                            <div className="md:hidden lg:hidden bg-white h-60 rounded-lg shadow-md overflow-hidden border">
                                <DynamicMapInput latitude={formData.latitude} longitude={formData.longitude} />
                            </div>
                            <hr className="my-4 border-gray-200" />
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={handleGetLocation}
                                    className="w-fit bg-green-500 text-white py-2 px-4 font-medium hover:bg-green-600 transition"
                                    type="button"
                                >
                                    <MapPin size={20} className="mr-2 inline" /> {formData.latitude ? 'Lokasi Diperbarui' : 'Ambil Lokasi Saat Ini'}
                                </Button>
                                {(formData.latitude && formData.longitude) && (
                                    <p className="text-sm text-green-600 mt-1">
                                        Lokasi Terambil: Lat: {formData.latitude}, Lon: {formData.longitude}
                                    </p>
                                )}
                                <input type="hidden" name="latitude" value={formData.latitude} required />
                                <input type="hidden" name="longitude" value={formData.longitude} required />
                            </div>
                        </InputContainer>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-red-600 text-white py-3 text-lg font-semibold hover:bg-red-700 transition"
                            >
                                <PaperPlaneTilt size={20} className="mr-2 inline" /> Kirim Laporan Saya
                            </Button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Laporan Anda bersifat anonim dan akan segera diproses.
                            </p>
                        </div>
                    </form>

                    <aside className="hidden md:flex lg:flex md:col-span-1 bg-gray-50 p-6 rounded-lg self-stretch flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-blue-600 mb-4">Panduan Cepat (3 Langkah)</h3>
                            <ol className="space-y-4 text-gray-700">
                                <li><span className="font-bold text-lg mr-2">1.</span> Ambil Foto Bukti Sejelas Mungkin.</li>
                                <li><span className="font-bold text-lg mr-2">2.</span> Klik <b>Ambil Lokasi</b> untuk mendapatkan koordinat yang akurat.</li>
                                <li><span className="font-bold text-lg mr-2">3.</span> Isi deskripsi singkat dan <b>Kirim Laporan</b>.</li>
                            </ol>

                            <hr className="my-6 border-gray-200" />

                            <h3 className="text-lg font-bold text-gray-800 mb-3">Jaminan Privasi</h3>
                            <p className="text-sm text-gray-600">Data pribadi Anda tidak dibutuhkan. Kami hanya menggunakan bukti visual dan koordinat lokasi untuk tujuan penertiban.</p>
                            <div className="mt-8 bg-white h-60 rounded-lg shadow-md overflow-hidden">
                                <DynamicMapInput latitude={formData.latitude} longitude={formData.longitude} />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}