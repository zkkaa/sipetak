'use client';

import React, { useRef } from 'react';
import { X, DownloadSimple, MapPin } from '@phosphor-icons/react';
import Image from 'next/image';

interface CertificateItem {
    id: number;
    nomorSertifikat: string;
    namaUsaha: string;
    tanggalTerbit: string;
    tanggalKedaluwarsa: string;
    status: 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan';
    unduhLink: string;
    namaPemilik: string;
    lokasiLapak: string;
    namaPengelola: string; // 💡 TAMBAHAN: Nama pengelola setempat
    namaPemerintah: string; // 💡 TAMBAHAN: Nama pemerintah setempat
}

interface CertificateViewerModalProps {
    certificate: CertificateItem;
    onClose: () => void;
}

export default function CertificateViewerModal({ certificate, onClose }: CertificateViewerModalProps) {
    const isActive = certificate.status === 'Aktif';
    const componentRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = React.useState(false);

    const handleDownloadPDF = async () => {
        if (!componentRef.current || !isActive) return;

        setIsDownloading(true);
        try {
            // Tunggu semua image ter-load
            const images = componentRef.current.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => 
                new Promise((resolve) => {
                    if (img.complete) {
                        resolve(null);
                    } else {
                        img.onload = () => resolve(null);
                        img.onerror = () => resolve(null);
                    }
                })
            );
            
            await Promise.all(imagePromises);
            
            // Tunggu sedikit untuk memastikan semua render complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Dynamic import untuk menghindari SSR issues
            const { toPng } = await import('html-to-image');
            const { jsPDF } = await import('jspdf');

            const element = componentRef.current;
            
            // Convert HTML ke PNG dengan opsi yang lebih strict
            const imgData = await toPng(element, {
                cacheBust: true,
                pixelRatio: 2,
                quality: 1,
                skipAutoScale: false
            });

            // Buat PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${certificate.nomorSertifikat}.pdf`);
            
            setIsDownloading(false);
            onClose();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal mengunduh sertifikat. Silakan coba lagi.');
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center w-full h-full" onClick={onClose}>

            {/* Kontainer Utama Modal - Responsive untuk Mobile dan Desktop */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl sm:max-w-4xl h-auto transform transition-all duration-300 mx-2 sm:mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tombol Tutup di Sudut */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:right-auto md:left-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition z-10"
                >
                    <X size={20} />
                </button>

                {/* Area Sertifikat (Scrollable) */}
                <div
                    ref={componentRef}
                    className="max-h-[80vh] overflow-y-auto p-4 sm:p-8"
                    style={{ backgroundColor: "#F8F9FA" }}
                >

                    {/* DESAIN SERTIFIKAT BERBASIS HTML/CSS */}
                    <div className="relative p-6 sm:p-10 bg-white border-4 sm:border-8 border-yellow-700 rounded-lg overflow-hidden text-gray-800">

                        {/* Sudut Dekoratif */}
                        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-600/10 transform -skew-y-12"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-600/10 transform skew-y-12"></div>

                        <div className="text-center relative z-10">
                            <h4 className="text-sm font-semibold text-gray-600">PEMERINTAH KOTA TASIKMALAYA</h4>
                            <h1 className="text-2xl font-bold mt-2 text-yellow-700 uppercase">SERTIFIKAT IZIN PENGGUNAAN LAPAK</h1>
                            <p className="text-xs mt-1">Nomor: {certificate.nomorSertifikat}</p>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-base text-gray-700">Dengan ini menerangkan bahwa usaha</p>

                            {/* NAMA USAHA (Dinamis) */}
                            <h2 className="text-3xl font-serif font-bold my-3 text-yellow-900" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                                {certificate.namaUsaha}
                            </h2>

                            <p className="text-base text-gray-700">Telah terdaftar atas nama:</p>
                            <p className="text-lg font-bold mt-1 text-gray-800">{certificate.namaPemilik || 'NAMA PEMILIK'}</p>
                        </div>

                        {/* Detail Lokasi & Masa Berlaku */}
                        <div className="mt-4 p-3 bg-yellow-50 border-y border-yellow-300">
                            <p className="text-sm font-semibold flex items-center justify-center gap-2">
                                <MapPin size={18} className="text-yellow-700" />
                                Lokasi: {certificate.lokasiLapak || 'BLOK EXAMPLE'}
                            </p>
                        </div>

                        <p className="mt-4 text-xs text-center">
                            Berlaku sampai dengan: <span className={`font-bold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {certificate.tanggalKedaluwarsa}
                            </span>
                        </p>

                        {/* Area Tanda Tangan */}
                        <div className="flex justify-around mt-6 text-xs">
                            <div className="text-center">
                                <p className="text-xs">Pengelola Setempat</p>
                                <div className="h-12 w-24 my-1 flex items-center justify-center">
                                    <Image src="/td_azka.png" alt="Tanda Tangan Pengelola" width={128} height={64} className="my-1 mx-auto max-h-12" />
                                </div>
                                <p className="font-semibold text-xs">Muhammad Azka</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs">Pemerintah Setempat</p>
                                <div className="h-12 w-24 my-1 flex items-center justify-center">
                                    <Image src="/td_kevin.png" alt="Tanda Tangan Pemerintah" width={128} height={64} className="my-1 mx-auto max-h-12" />
                                </div>
                                <p className="font-semibold text-xs">Kevin Pratama</p>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Area Tombol Unduh */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleDownloadPDF}
                        disabled={!isActive || isDownloading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${isActive && !isDownloading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        <DownloadSimple size={24} /> 
                        {isDownloading ? 'Sedang mengunduh...' : 'Unduh Sertifikat PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
}