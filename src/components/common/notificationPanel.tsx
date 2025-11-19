// File: components/common/NotificationPanel.tsx

import React from 'react';
import { CheckCircle, Warning, Clock, X, FileText } from '@phosphor-icons/react';
import Link from 'next/link';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info' | 'critical';
    isRead: boolean;
    timestamp: string;
    link?: string;
}

interface NotificationPanelProps {
    notifications: Notification[];
    onClose: () => void;
    // Handler untuk menandai sebagai sudah dibaca
    onMarkAsRead: (id: number) => void; 
}

const typeIcons = {
    success: { Icon: CheckCircle, color: 'text-green-500' },
    warning: { Icon: Warning, color: 'text-yellow-500' },
    info: { Icon: FileText, color: 'text-blue-500' },
    critical: { Icon: X, color: 'text-red-500' },
};

export default function NotificationPanel({ notifications, onClose, onMarkAsRead }: NotificationPanelProps) {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="absolute top-14 right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Notifikasi ({unreadCount} Baru)</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>
            </div>
            
            {/* Daftar Notifikasi */}
            <div className="max-h-96 overflow-y-auto divide-y">
                {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center text-sm">Tidak ada notifikasi saat ini.</p>
                ) : (
                    notifications.map(n => {
                        const { Icon, color } = typeIcons[n.type];
                        
                        return (
                            <Link 
                                key={n.id} 
                                href={n.link || "#"}
                                onClick={() => onMarkAsRead(n.id)}
                                className={`flex gap-3 p-3 hover:bg-gray-50 transition ${n.isRead ? 'opacity-80' : 'bg-blue-50/50'}`}
                            >
                                <div className={`flex-shrink-0 ${color}`}>
                                    <Icon size={24} weight={n.isRead ? 'regular' : 'fill'} />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-semibold truncate">{n.title}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Clock size={12} /> {n.timestamp}
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
            
            <div className="p-2 border-t text-center">
                <button onClick={() => {}} className="text-blue-600 text-sm hover:underline">
                    Lihat Semua
                </button>
            </div>
        </div>
    );
}