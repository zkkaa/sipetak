// File: src/components/adminlayout.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './sidebar';
import MobileBottomNav from './mobilenav';
import TopNav from './TopNav';
import { useUser } from '@/app/context/UserContext';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const currentPath = usePathname() || '/admin/beranda';
    const { user, loading } = useUser();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const desktopMarginLeft = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-60';

    // ✅ Redirect logic dengan delay untuk memastikan cookie sudah loaded
    useEffect(() => {
        console.log('🔍 AdminLayout Check:', { loading, user, currentPath });

        // Jika masih loading, jangan redirect
        if (loading) {
            console.log('⏳ Still loading, waiting...');
            return;
        }

        // Jika loading selesai dan tidak ada user
        if (!user) {
            console.log('❌ No user found after loading, will redirect');
            setShouldRedirect(true);
            
            // ✅ Delay redirect sedikit untuk memastikan
            const timer = setTimeout(() => {
                router.replace('/masuk');
            }, 100);

            return () => clearTimeout(timer);
        } else {
            console.log('✅ User authenticated:', user.email);
            setShouldRedirect(false);
        }
    }, [user, loading, router, currentPath]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Memuat...</p>
                </div>
            </div>
        );
    }

    // Redirect state
    if (shouldRedirect || !user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Mengalihkan...</p>
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