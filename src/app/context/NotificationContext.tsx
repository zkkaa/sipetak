/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './UserContext';

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'warning' | 'success' | 'critical';
    isRead: boolean;
    timestamp: string;
    link: string;
    relatedId?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const mapNotificationType = (type: string): 'warning' | 'success' | 'critical' => {
        switch (type) {
            case 'submission_approved':
            case 'certificate_issued':
                return 'success';
            case 'submission_rejected':
            case 'report_unhandled':
                return 'critical';
            default:
                return 'warning';
        }
    };
    const formatTimestamp = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID');
    };

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            console.log('🔔 Fetching notifications for user:', user.id);
            const response = await fetch('/api/notifications', {
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('❌ Failed to fetch notifications');
                return;
            }

            const data = await response.json();
            
            if (data.success && data.notifications) {
                const mapped: Notification[] = data.notifications.map((notif: any) => ({
                    id: notif.id,
                    title: notif.title,
                    message: notif.message,
                    type: mapNotificationType(notif.type as string),
                    isRead: notif.isRead,
                    timestamp: formatTimestamp(notif.createdAt),
                    link: notif.link || '#',
                    relatedId: notif.relatedId,
                }));
                
                setNotifications(mapped);
                console.log(`✅ Loaded ${mapped.length} notifications`);
            }
        } catch (error) {
            console.error('❌ Error fetching notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        fetchNotifications();

        console.log('🔌 Setting up Realtime subscription for user:', user.id);

        const channel = supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes' as any,
                {
                    event: '*', 
                    schema: 'public',
                    table: 'notifications',
                    filter: `userId=eq.${user.id}`, 
                },
                (payload: any) => {
                    console.log('🔔 Realtime notification received:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newNotif: Notification = {
                            id: payload.new.id,
                            title: payload.new.title,
                            message: payload.new.message,
                            type: mapNotificationType(payload.new.type as string),
                            isRead: payload.new.isRead,
                            timestamp: formatTimestamp(payload.new.createdAt),
                            link: payload.new.link || '#',
                            relatedId: payload.new.relatedId || undefined,
                        };

                        setNotifications(prev => [newNotif, ...prev]);
                        
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification(newNotif.title, {
                                body: newNotif.message,
                                icon: '/logo.png',
                            });
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev =>
                            prev.map(n =>
                                n.id === payload.new.id
                                    ? {
                                          ...n,
                                          isRead: payload.new.isRead,
                                          timestamp: formatTimestamp(payload.new.createdAt),
                                      }
                                    : n
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => prev.filter(n => n.id !== payload.old?.id));
                    }
                }
            )
            .subscribe((status) => {
                console.log('🔌 Realtime subscription status:', status);
            });

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            console.log('🔌 Unsubscribing from Realtime');
            supabase.removeChannel(channel);
        };
    }, [user, fetchNotifications]);

    const markAsRead = async (id: number) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                credentials: 'include',
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
                );
            }
        } catch (error) {
            console.error('❌ Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                credentials: 'include',
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (error) {
            console.error('❌ Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (error) {
            console.error('❌ Error deleting notification:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                refreshNotifications: fetchNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};