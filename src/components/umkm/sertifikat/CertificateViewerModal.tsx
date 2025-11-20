import React from 'react';
import { X, DownloadSimple, MapPin } from '@phosphor-icons/react';
import Image from 'next/image'; // Untuk Tanda Tangan/Logo

interface CertificateItem {
    id: number;
    nomorSertifikat: string;
    namaUsaha: string;
    tanggalTerbit: string;
    tanggalKedaluwarsa: string;
    status: 'Aktif' | 'Kedaluwarsa' | 'Ditangguhkan';
    unduhLink: string;
    namaPemilik: string;
    lokasiLapak: string; // Detail lokasi
}

interface CertificateViewerModalProps {
    certificate: CertificateItem;
    onClose: () => void;
    onDownload: (link: string, nomor: string) => void;
}

export default function CertificateViewerModal({ certificate, onClose, onDownload }: CertificateViewerModalProps) {
    const isActive = certificate.status === 'Aktif';

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center w-full h-full" onClick={onClose}>
            
            {/* Kontainer Utama Modal */}
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()} // Mencegah penutupan saat klik di dalam modal
            >
                {/* Tombol Tutup di Sudut */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 md:right-auto md:left-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition z-10"
                >
                    <X size={20} />
                </button>
                
                {/* Area Sertifikat (Scrollable) */}
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    
                    {/* 💡 DESAIN SERTIFIKAT BERBASIS HTML/CSS (Meniru Template Anda) */}
                    <div className="relative p-10 bg-white border-8 border-yellow-700/50 rounded-lg overflow-hidden text-gray-800">
                        
                        {/* Sudut Dekoratif */}
                        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-600/10 transform -skew-y-12"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-600/10 transform skew-y-12"></div>

                        <div className="text-center relative z-10">
                            <h4 className="text-sm font-semibold text-gray-600">PEMERINTAH KOTA TASIKMALAYA</h4>
                            <h1 className="text-2xl font-bold mt-2 text-yellow-700 uppercase">SERTIFIKAT IZIN PENGGUNAAN LAPAK</h1>
                            <p className="text-xs mt-1">Nomor: {certificate.nomorSertifikat}</p>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-lg text-gray-700">Dengan ini menerangkan bahwa usaha</p>
                            
                            {/* NAMA USAHA (Dinamis) */}
                            <h2 className="text-4xl font-serif font-bold my-4 text-yellow-900" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                                {certificate.namaUsaha}
                            </h2>

                            <p className="text-lg text-gray-700">Telah terdaftar atas nama:</p>
                            <p className="text-xl font-bold mt-1 text-gray-800">{certificate.namaPemilik || 'NAMA PEMILIK'}</p>
                        </div>
                        
                        {/* Detail Lokasi & Masa Berlaku */}
                        <div className="mt-6 p-4 bg-yellow-50/50 border-y border-yellow-300/50">
                            <p className="text-md font-semibold flex items-center justify-center gap-2">
                                <MapPin size={20} className="text-yellow-700" />
                                Lokasi: {certificate.lokasiLapak || 'BLOK EXAMPLE'}
                            </p>
                        </div>

                        <p className="mt-6 text-sm text-center">
                            Berlaku sampai dengan: <span className={`font-bold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {certificate.tanggalKedaluwarsa}
                            </span>
                        </p>

                        {/* Area Tanda Tangan */}
                        <div className="flex justify-around mt-10 text-xs">
                            <div className="text-center">
                                <p>Pengelola Lapak</p>
                                {/* 💡 Tanda Tangan (Ganti dengan Image asli jika ada) */}
                                <div className="h-16 w-32 bg-gray-200 my-2 flex items-center justify-center border">TTD PENGELOLA</div> 
                                <p className="font-semibold">{certificate.namaPemilik || 'Pengelola'}</p>
                            </div>
                            <div className="text-center">
                                <p>Pemerintah Setempat</p>
                                <div className="h-16 w-32 bg-gray-200 my-2 flex items-center justify-center border">TTD PEMERINTAH</div> 
                                <p className="font-semibold">Kevin Pratama</p>
                            </div>
                        </div>

                    </div>
                    {/* 💡 AKHIR DESAIN SERTIFIKAT */}

                </div>
                
                {/* Area Tombol Unduh */}
                <div className="p-4 border-t border-gray-200">
                    <button 
                        onClick={() => {
                            if(isActive) onDownload(certificate.unduhLink, certificate.nomorSertifikat);
                            onClose();
                        }}
                        className={`w-full py-3 rounded-lg font-bold text-white transition ${isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!isActive}
                    >
                        <DownloadSimple size={24} className="mr-2 inline" /> Unduh Sertifikat PDF
                    </button>
                </div>
            </div>
        </div>
    );
}