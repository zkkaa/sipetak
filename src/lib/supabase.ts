import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10, 
        },
    },
});

export type NotificationPayload = {
    id: number;
    userId: number;
    type: 'submission_new' | 'submission_approved' | 'submission_rejected' | 
          'report_new' | 'report_unhandled' | 'certificate_issued';
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    relatedId: number | null;
    createdAt: string;
};

export type RealtimeNotification = {
    id: number;
    title: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type(type: any): "success" | "warning" | "critical";
    isRead: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt(createdAt: any): string;
    link: string;
    relatedId: undefined;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: NotificationPayload;
    old: NotificationPayload | null;
};