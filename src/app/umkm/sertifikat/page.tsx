"use client";
import React, { useState, useEffect } from 'react';
import { Certificate, WarningCircle, MagnifyingGlass } from '@phosphor-icons/react';
import { useUser } from '@/app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';
import AdminLayout from '../../../components/adminlayout'; 
import CertificateTable from '../../../components/umkm/sertifikat/CertificateTable'; 
import CertificateViewerModal from '@/components/umkm/sertifikat/CertificateViewerModal';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

// --- INTERFACE ---
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
}

export default function CertificatePage() {
    const { user, loading: userLoading } = useUser();
    
    const [certificates, setCertificates] = useState<CertificateItem[]>([]);
    const [viewingCertificate, setViewingCertificate] = useState<CertificateItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [actionFeedback, setActionFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    // Fetch certificates saat component mount dan user siap
    useEffect(() => {
        if (userLoading) {
            console.log('📌 Menunggu user context dimuat...');
            return;
        }

        if (!user) {
            console.error('❌ User tidak ada');
            setActionFeedback({
                message: 'User tidak terautentikasi. Silakan login terlebih dahulu.',
                type: 'error'
            });
            setIsLoading(false);
            return;
        }

        console.log('✅ User siap, user ID:', user.id);
        fetchCertificates();
    }, [user, userLoading]);

    const fetchCertificates = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching certificates...');

            const response = await fetchWithToken('/api/umkm/certificates');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('📊 API Response:', data);

            if (data.success && Array.isArray(data.certificates)) {
                setCertificates(data.certificates);
                console.log(`✅ Ditemukan ${data.certificates.length} sertifikat`);

                if (data.certificates.length === 0) {
                    setActionFeedback({
                        message: 'Anda belum memiliki sertifikat. Ajukan lokasi dan tunggu persetujuan admin.',
                        type: 'info'
                    });
                }
            } else {
                throw new Error(data.message || 'Format response tidak valid');
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            const msg = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data';
            setActionFeedback({
                message: msg,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = (cert: CertificateItem) => {
        setViewingCertificate(cert);
    };

    const filteredCertificates = certificates.filter(cert => 
        cert.namaUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.nomorSertifikat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Loading state
    if (userLoading || isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {userLoading ? 'Memuat autentikasi...' : 'Memuat sertifikat...'}
                        </p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-semibold">❌ Anda harus login terlebih dahulu</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                
                {/* Header Halaman */}
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Certificate size={32} weight="fill" className="text-blue-500" /> Sertifikat Usaha
                    </h1>
                    <p className="text-gray-500 mt-1">Akses dan unduh sertifikat legalitas usaha Anda.</p>
                </header>

                <div className="flex justify-end bg-white p-4 rounded-xl shadow-md">
                    <div className="relative w-full md:w-80">
                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input  
                            type="text" 
                            placeholder="Cari nama usaha atau nomor sertifikat..." 
                            className="border p-2 pl-10 rounded-lg w-full outline-none focus:border-blue-400" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabel Daftar Sertifikat */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <CertificateTable 
                        certificates={filteredCertificates} 
                        onView={handleView}
                    />
                </div>

                {/* Modal Viewer */}
                {viewingCertificate && (
                    <CertificateViewerModal
                        certificate={viewingCertificate}
                        onClose={() => setViewingCertificate(null)}
                    />
                )}
                
                {/* Widget Informasi Tambahan */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
                    <WarningCircle size={32} className="text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                        Sertifikat yang telah kedaluwarsa (Merah) harus segera diajukan perpanjangan melalui laman Pengajuan.
                    </p>
                </div>

                {/* Modal Feedback Aksi */}
                {actionFeedback && (
                    <ActionFeedbackModal
                        message={actionFeedback.message}
                        type={actionFeedback.type}
                        onClose={() => setActionFeedback(null)}
                    />
                )}
            </div>
        </AdminLayout>
    );
}