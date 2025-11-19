// File: components/common/DesktopTopNav.tsx

import React, { useState } from 'react';
import { Bell, UserCircle } from '@phosphor-icons/react';
import SearchField from './searchfile';
import NotificationPanel from './notificationPanel';

interface DesktopTopNavProps {
    userName: string;
    sidebarWidth: string; 
}

export default function DesktopTopNav({ userName, sidebarWidth }: DesktopTopNavProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false); // 💡 STATE BARU
    
    // --- DATA DUMMY NOTIFIKASI ---
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Pengajuan Baru Masuk', message: 'Warung Kopi Senja mengajukan verifikasi lokasi baru.', type: 'warning' as const, isRead: false, timestamp: '15 menit lalu', link: '/admin/verifikasi' },
        { id: 2, title: 'Sertifikat Diterbitkan', message: 'Sertifikat PT. Maju Sentosa telah disetujui.', type: 'success' as const, isRead: false, timestamp: '1 jam lalu', link: '/admin/verifikasi' },
        { id: 3, title: 'Peringatan Sistem', message: 'Ada 5 laporan warga yang sudah 3 hari belum ditindaklanjuti.', type: 'critical' as const, isRead: true, timestamp: 'Kemarin', link: '/admin/laporan' },
    ]);

    const handleMarkAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, isRead: true } : n
        ));
    };
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <header 
            className={`fixes w-full top-0 h-16 bg-white border-b border-gray-200 z-20 transition-all duration-300 ease-in-out`}
            style={{ 
                left: sidebarWidth, 
                width: `calc(100% - ${sidebarWidth})` 
            }} 
        >
            <div className="flex justify-between items-center h-full px-6 w-full"> 
                <div className="relative hidden lg:block mr-4 lg:w-96"> 
                    <SearchField /> 
                </div>

                {/* Item 2: Notifikasi & Profil */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="relative">
                        <button 
                            onClick={() => setIsPanelOpen(!isPanelOpen)} 
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition relative"
                            aria-label="Toggle Notifikasi"
                        >
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                        
                        {/* 💡 Panel Notifikasi */}
                        {isPanelOpen && (
                            <NotificationPanel 
                                notifications={notifications} 
                                onClose={() => setIsPanelOpen(false)}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-2 border-l pl-4">
                        <UserCircle size={32} weight="fill" className="text-blue-500" />
                        <span className="font-semibold text-sm text-gray-700 hidden sm:block truncate max-w-[120px]">
                            {userName}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}