// File: src/app/umkm/beranda/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';
import AdminLayout from '../../../components/adminlayout';
import CarouselFeatured from '@/components/common/carousel'; 
import StatCard from '../../../components/admin/beranda/StatCard';
import { MapPin, Certificate, ListChecks } from '@phosphor-icons/react';
import { FeaturedStatsWidget, SimpleCalendar } from '../../../components/umkm/beranda/widgetcalender';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

// Interface untuk dashboard data
interface DashboardData {
    totalLocations: number;
    activeCertificates: number;
    pendingSubmissions: number;
}

export default function UMKMDashboardPage() {
    const { user, loading: userLoading } = useUser();
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalLocations: 0,
        activeCertificates: 0,
        pendingSubmissions: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [actionFeedback, setActionFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    // Carousel items - bisa disesuaikan dengan data real dari API
    const carouselItems = [
        { 
            id: 1, 
            title: "Selamat Datang!", 
            message: `Halo ${user?.nama || 'User'}, selalu cek status izin Anda di sini.`, 
            status: 'info' as const,
            image: '/images/welcome-bg.jpg' // Opsional: tambahkan gambar
        },
        { 
            id: 2, 
            title: "Izin Akan Kedaluwarsa", 
            message: "Beberapa sertifikat akan habis dalam 30 hari. Segera perpanjang!", 
            status: 'warning' as const 
        },
        { 
            id: 3, 
            title: "Tips Mengajukan Lokasi", 
            message: "Pastikan dokumen lengkap dan lokasi sesuai zona yang diizinkan.", 
            status: 'info' as const 
        },
    ];

    // Fetch dashboard data
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

        fetchDashboardData();
    }, [user, userLoading]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching dashboard data...');

            const response = await fetchWithToken('/api/umkm/dashboard');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('📊 Dashboard data:', result);

            if (result.success && result.data) {
                setDashboardData(result.data);
            } else {
                throw new Error(result.message || 'Gagal mengambil data dashboard');
            }
        } catch (error) {
            console.error('❌ Fetch error:', error);
            const msg = error instanceof Error ? error.message : 'Terjadi kesalahan';
            setActionFeedback({
                message: msg,
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Stat data dengan nilai dari API
    const statData = [
        { 
            title: "Total Lokasi Saya", 
            value: dashboardData.totalLocations, 
            icon: <MapPin size={24} />, 
            color: 'blue' as const 
        },
        { 
            title: "Sertifikat Aktif", 
            value: dashboardData.activeCertificates, 
            icon: <Certificate size={24} />, 
            color: 'green' as const 
        },
        { 
            title: "Pengajuan Berjalan", 
            value: dashboardData.pendingSubmissions, 
            icon: <ListChecks size={24} />, 
            color: 'yellow' as const 
        },
    ];

    // Loading state
    if (userLoading || isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {userLoading ? 'Memuat autentikasi...' : 'Memuat dashboard...'}
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
                
                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Selamat Datang, {user.nama}!
                    </h1>
                    <p className="text-gray-500 mt-1">Kelola data usaha dan legalitas Anda.</p>
                </div>

                {/* GRID KONTEN UTAMA */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* KOLOM KIRI: STAT CARDS & CAROUSEL (3/5 Lebar) */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {statData.map((stat) => (
                                <StatCard 
                                    key={stat.title} 
                                    title={stat.title} 
                                    value={stat.value} 
                                    icon={stat.icon} 
                                    color={stat.color} 
                                />
                            ))}
                        </div>
                        
                        {/* Carousel */}
                        <CarouselFeatured items={carouselItems} autoScrollDelay={6} />
                    </div>

                    {/* KOLOM KANAN: WIDGETS & CALENDAR (2/5 Lebar) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Featured Stats Widget - Quick Access Buttons */}
                        <FeaturedStatsWidget />
                        
                        {/* Calendar Read-Only Real-Time */}
                        <SimpleCalendar />
                    </div>
                </div>

                {/* Modal Feedback */}
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