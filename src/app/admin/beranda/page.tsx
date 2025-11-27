"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/context/UserContext';
import { fetchWithToken } from '@/lib/fetchWithToken';
import { useRouter } from 'next/navigation';
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
    image: string;
    alt?: string;
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
    const router = useRouter();

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
            alt: "Dashboard Overview"
        },
        {
            id: 2,
            image: "/carousel_2.jpg",
            alt: "UMKM Management"
        },
        {
            id: 3,
            image: "/carousel_3.jpg",
            alt: "Location Mapping"
        },
    ];

    // ✅ PERBAIKAN: Check authorization SETELAH user selesai loading
    useEffect(() => {
        if (userLoading) {
            console.log('⏳ Waiting for user to load...');
            return; // Jangan lakukan apa-apa sampai user selesai loading
        }

        // User sudah selesai loading
        console.log('✅ User loading complete. User:', user?.email);

        // Cek apakah user ada dan role-nya Admin
        if (!user) {
            console.error('❌ User tidak ada, redirect ke login');
            setActionFeedback({
                message: 'Sesi Anda telah berakhir. Silakan login kembali.',
                type: 'error'
            });
            // Redirect ke login setelah 2 detik
            setTimeout(() => router.push('/masuk'), 2000);
            return;
        }

        if (user.role !== 'Admin') {
            console.error('❌ User bukan Admin. Role:', user.role);
            setActionFeedback({
                message: 'Anda tidak memiliki akses ke halaman ini',
                type: 'error'
            });
            // Redirect ke home/dashboard user setelah 2 detik
            setTimeout(() => router.push('/umkm/beranda'), 2000);
            return;
        }

        // ✅ User adalah Admin, fetch data
        console.log('✅ User is Admin, fetching dashboard data...');
        fetchAllData();

    }, [userLoading, user, router]);

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Fetching admin dashboard data...');

            // Fetch dashboard metrics
            const dashboardResponse = await fetchWithToken('/api/master/dashboard');
            const dashboardResult = await dashboardResponse.json();

            if (dashboardResult.success) {
                console.log('✅ Dashboard metrics loaded:', dashboardResult.data);
                setDashboardData(dashboardResult.data);
            } else {
                console.error('❌ Dashboard fetch failed:', dashboardResult.message);
            }

            // Fetch recent submissions
            const submissionsResponse = await fetchWithToken('/api/submissions');
            const submissionsResult = await submissionsResponse.json();

            if (submissionsResult.success) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                console.log('✅ Submissions loaded:', recentSubmissions.length);
            } else {
                console.error('❌ Submissions fetch failed:', submissionsResult.message);
            }

            // Fetch recent reports
            const reportsResponse = await fetchWithToken('/api/reports');
            const reportsResult = await reportsResponse.json();

            if (reportsResult.success) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                console.log('✅ Reports loaded:', recentReports.length);
            } else {
                console.error('❌ Reports fetch failed:', reportsResult.message);
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

    // ✅ PERBAIKAN: Show loading screen sampai user selesai loading
    if (userLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat user...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // ✅ PERBAIKAN: Show error jika user tidak ada atau bukan Admin
    if (!user || user.role !== 'Admin') {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
                        <p className="text-red-600 font-semibold mb-2">❌ Akses Ditolak</p>
                        {!user ? (
                            <p className="text-red-500 text-sm">
                                Sesi Anda telah berakhir. Mengalihkan ke halaman login...
                            </p>
                        ) : (
                            <p className="text-red-500 text-sm">
                                Anda harus menjadi Admin untuk mengakses halaman ini. Mengalihkan...
                            </p>
                        )}
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Show loading while fetching dashboard data
    if (isLoading) {
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
                    {/* Left Column - 3/5 */}
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

                        {/* Citizen Reports Widget */}
                        <CitizenReportWidget reports={reports} />
                    </div>

                    {/* Right Column - 2/5 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Submission Widget */}
                        <SubmissionWidget submissions={submissions} />

                        {/* Calendar */}
                        <SimpleCalendar />
                    </div>
                </div>

                {/* Feedback Modal */}
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