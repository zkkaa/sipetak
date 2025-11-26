"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';
import CarouselFeatured from '../../../components/common/carousel';
import StatCard from '../../../components/admin/beranda/StatCard';
import SubmissionWidget from '../../../components/admin/beranda/SubmissionWidget';
import CitizenReportWidget from '../../../components/admin/beranda/widgetreport';
import { SimpleCalendar } from '../../../components/umkm/beranda/widgetcalender';
import { MapPin, Certificate, Book } from '@phosphor-icons/react';
import AdminLayout from '../../../components/adminlayout';
import ActionFeedbackModal from '@/components/common/ActionFeedbackModal';

interface CarouselItem {
    id: number;
    image?: string;
    alt: string;
}

interface DashboardData {
    availableLocations: number;
    activeCertificates: number;
    newSubmissions: number;
}

interface SubmissionItem {
    id: number;
    namaUsaha: string;
    emailPemohon: string;
    tanggal: string;
    status: 'Diajukan' | 'Diterima' | 'Ditolak';
}

interface CitizenReport {
    id: number;
    jenisPelanggaran: string;
    tanggalLapor: string;
    status: 'Belum Diperiksa' | 'Sedang Diproses' | 'Selesai';
}

export default function AdminBerandaPage() {
    const { user, loading: userLoading } = useUser();

    const [dashboardData, setDashboardData] = useState<DashboardData>({
        availableLocations: 0,
        activeCertificates: 0,
        newSubmissions: 0
    });
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [reports, setReports] = useState<CitizenReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionFeedback, setActionFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    const carouselItems: CarouselItem[] = [
        {
            id: 1,
            image: "/carousel_1.jpg",
            alt: 'azkia'
        },
        {
            id: 2,
            image: "/carousel_2.jpg",
            alt: 'azka & salma'
        },
        {
            id: 3,
            image: "/carousel_3.jpg",
            alt: 'kevin & mufthi'
        },
    ];

    // Check authorization
    useEffect(() => {
        if (!userLoading && user && user.role !== 'Admin') {
            setActionFeedback({
                message: 'Anda tidak memiliki akses ke halaman ini',
                type: 'error'
            });
        }
    }, [user, userLoading]);

    // Fetch all data
    useEffect(() => {
        if (!userLoading && user?.role === 'Admin') {
            fetchAllData();
        }
    }, [user, userLoading]);

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching admin dashboard data...');

            const dashboardResponse = await fetchWithToken('/api/master/dashboard');
            const dashboardResult = await dashboardResponse.json();

            if (dashboardResult.success) {
                setDashboardData(dashboardResult.data);
            }

            const submissionsResponse = await fetchWithToken('/api/submissions');
            const submissionsResult = await submissionsResponse.json();

            if (submissionsResult.success) {
                const recentSubmissions = submissionsResult.data.slice(0, 5).map((sub: any) => ({
                    id: sub.id,
                    namaUsaha: sub.namaLapak,
                    emailPemohon: sub.emailPemohon,
                    tanggal: sub.dateApplied
                        ? new Date(sub.dateApplied).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                        : '-',
                    status: sub.izinStatus
                }));
                setSubmissions(recentSubmissions);
            }

            const reportsResponse = await fetchWithToken('/api/reports');
            const reportsResult = await reportsResponse.json();

            if (reportsResult.success) {
                const recentReports = reportsResult.data.slice(0, 3).map((report: any) => ({
                    id: report.id,
                    jenisPelanggaran: report.reportType || report.description?.substring(0, 50) || 'Pelanggaran',
                    tanggalLapor: report.dateReported
                        ? new Date(report.dateReported).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                        : '-',
                    status: report.status
                }));
                setReports(recentReports);
            }

            console.log('✅ All dashboard data loaded');

        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            setActionFeedback({
                message: 'Gagal memuat data dashboard',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (userLoading || isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat dashboard...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Authorization check
    if (user?.role !== 'Admin') {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-semibold">❌ Akses Ditolak</p>
                        <p className="text-red-500 text-sm mt-2">Anda harus menjadi Admin untuk mengakses halaman ini</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const statData = [
        {
            title: "Titik Lokasi Tersedia",
            value: dashboardData.availableLocations,
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
            title: "Pengajuan Lokasi Baru",
            value: dashboardData.newSubmissions,
            icon: <Book size={24} />,
            color: 'red' as const
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Selamat Datang, {user.nama}!
                    </h1>
                    <p className="text-gray-500 mt-1">Pusat Pengelolaan Data Tata Ruang UMKM.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">
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
                        <CarouselFeatured items={carouselItems} autoScrollDelay={6} />
                        <CitizenReportWidget reports={reports} />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <SubmissionWidget submissions={submissions} />
                        <SimpleCalendar />
                    </div>
                </div>

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