// File: src/components/adminlayout.tsx

"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import MobileBottomNav from './mobilenav';
import TopNav from './TopNav';
import { useUser } from '@/app/context/UserContext';
import { SignOut } from '@phosphor-icons/react'; 

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter(); 
    const currentPath = usePathname() || '/admin/beranda';
    const { user, loading } = useUser(); 
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const desktopMarginLeft = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60';
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Memuat sesi...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-center p-8">
                <div className="bg-white p-10 rounded-xl shadow-lg flex flex-col items-center gap-4">
                    <SignOut size={48} className="text-red-500"/>
                    <h2 className="text-xl font-bold text-gray-800">Sesi Kedaluwarsa atau Tidak Ditemukan</h2>
                    <p className="text-gray-600">Silakan masuk kembali untuk melanjutkan ke area admin.</p>
                    <button
                        onClick={() => router.replace('/masuk')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        Masuk
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Sidebar 
                currentPath={currentPath}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                userRole={user.role}
                userName={user.nama}
                userEmail={user.email}
            />

            <TopNav isSidebarCollapsed={isSidebarCollapsed} />

            <main 
                className={`
                    transition-all duration-300 ease-in-out 
                    p-4 md:p-6 lg:p-8 
                    pt-20 md:pt-24
                    mt-0 md:mt-16
                    ${desktopMarginLeft}
                    min-h-screen
                `}
            >
                {children}
            </main>

            <MobileBottomNav currentPath={currentPath} />

            <div className="h-16 md:hidden"></div>
        </div>
    );
}