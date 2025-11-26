"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, SignOut, Gear, Warning } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useUser } from '../app/context/UserContext';
import Image from 'next/image';

interface TopNavProps {
    isSidebarCollapsed?: boolean;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'critical';
    isRead: boolean;
    timestamp: string;
    link: string;
}

export default function TopNav({ isSidebarCollapsed = false }: TopNavProps) {
    const router = useRouter();
    const { user, setUser } = useUser();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const [notifications] = useState<Notification[]>([
        {
            id: 1,
            title: 'Pengajuan Baru Masuk',
            message: 'Warung Kopi Senja mengajukan verifikasi lokasi baru.',
            type: 'warning',
            isRead: false,
            timestamp: '15 menit lalu',
            link: '/admin/verifikasi'
        },
        {
            id: 2,
            title: 'Sertifikat Diterbitkan',
            message: 'Sertifikat PT. Maju Sentosa telah disetujui.',
            type: 'success',
            isRead: false,
            timestamp: '1 jam lalu',
            link: '/admin/verifikasi'
        },
        {
            id: 3,
            title: 'Peringatan Sistem',
            message: 'Ada 5 laporan warga yang sudah 3 hari belum ditindaklanjuti.',
            type: 'critical',
            isRead: true,
            timestamp: 'Kemarin',
            link: '/admin/laporan'
        },
    ]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                router.replace('/masuk');
            } else {
                alert('Gagal logout. Silakan coba lagi.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Terjadi kesalahan saat logout.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleSettings = () => {
        console.log('🔧 Navigating to settings...');
        setIsProfileOpen(false);
        const settingsPath = user?.role === 'Admin' ? '/admin/settings' : '/umkm/settings';
        console.log('📍 Settings path:', settingsPath);
        router.push(settingsPath);
    };

    const handleReport = () => {
        setIsProfileOpen(false);
        router.push('/laporan');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            <header
                className={`hidden md:flex fixed top-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-20 items-center justify-between px-6 transition-all duration-300`}
                style={{
                    left: isSidebarCollapsed ? '80px' : '240px',
                    width: isSidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 240px)'
                }}
            >
                <div className="flex items-center gap-6 ml-auto">
                    <div ref={notificationRef} className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative text-gray-600 cursor-pointer hover:text-gray-800 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Notifikasi"
                        >
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        Tidak ada notifikasi
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {notifications.map((notif) => (
                                            <button
                                                key={notif.id}
                                                onClick={() => {
                                                    setIsNotificationOpen(false);
                                                    router.push(notif.link);
                                                }}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors  cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-2">
                                                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${notif.type === 'critical' ? 'bg-red-500' :
                                                        notif.type === 'warning' ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {notif.timestamp}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors pl-3 border-l-2 border-gray-200"
                        >
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">{user?.nama || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.nama ? getInitials(user.nama) : 'U'}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 z-20 flex items-center justify-between px-4 md:hidden">
                <Image
                    src='/logo.png'
                    alt='SIPETAK Logo'
                    width={32}
                    height={32}
                    className='w-8 h-8 object-contain'
                />

                <div className="flex items-center gap-3">
                    <div ref={notificationRef} className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative text-gray-600 hover:text-gray-800 p-2"
                            aria-label="Notifikasi"
                        >
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        Tidak ada notifikasi
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {notifications.map((notif) => (
                                            <button
                                                key={notif.id}
                                                onClick={() => {
                                                    setIsNotificationOpen(false);
                                                    router.push(notif.link);
                                                }}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-blue-50' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-2">
                                                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${notif.type === 'critical' ? 'bg-red-500' :
                                                        notif.type === 'warning' ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {notif.timestamp}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-shadow"
                        >
                            {user?.nama ? getInitials(user.nama) : 'U'}
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800">{user?.nama}</p>
                                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                </div>

                                <button
                                    onClick={handleSettings}
                                    type="button"
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                >
                                    <Gear size={16} />
                                    <span>Pengaturan</span>
                                </button>
                                <button
                                    onClick={handleReport}
                                    className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-sm "
                                >
                                    <Warning size={16} />
                                    <span>Laporan</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    type="button"
                                    disabled={isLoggingOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-gray-100 disabled:opacity-50"
                                >
                                    <SignOut size={16} />
                                    <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}