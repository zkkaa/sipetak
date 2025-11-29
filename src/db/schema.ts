// File: src/db/schema.ts

import { pgTable, serial, integer, text, varchar, timestamp, boolean, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

// ========== EXISTING ENUMS (JANGAN DIUBAH) ==========
export const userRoleEnum = pgEnum('user_role', ['Admin', 'UMKM']);
export const izinStatusEnum = pgEnum('izin_status', ['Diajukan', 'Diterima', 'Ditolak']);
export const masterStatusEnum = pgEnum('master_status', ['Tersedia', 'Terisi', 'Terlarang']);
export const reportStatusEnum = pgEnum('report_status', ['Belum Diperiksa', 'Sedang Diproses', 'Selesai']);

// ========== 🆕 NEW ENUM FOR NOTIFICATIONS ==========
export const notificationTypeEnum = pgEnum('notification_type', [
    'submission_new',      // Pengajuan baru masuk (untuk Admin)
    'submission_approved', // Pengajuan diterima (untuk UMKM)
    'submission_rejected', // Pengajuan ditolak (untuk UMKM)
    'report_new',          // Laporan baru masuk (untuk Admin)
    'report_unhandled',    // Laporan 3 hari belum ditindak (untuk Admin)
    'certificate_issued'   // Sertifikat diterbitkan (untuk UMKM)
]);

// ========== EXISTING TABLES (JANGAN DIUBAH) ==========
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(), 
    role: userRoleEnum('role').notNull().default('UMKM'),
    isActive: boolean('is_active').notNull().default(true),
    nama: varchar('nama', { length: 256 }).notNull(), 
    nik: varchar('nik', { length: 16 }).unique(),
    phone: varchar('phone', { length: 20 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const masterLocations = pgTable('master_locations', {
    id: serial('id').primaryKey(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    status: masterStatusEnum('status').notNull().default('Tersedia'),
    reasonRestriction: text('reason_restriction'),
    penandaName: varchar('penanda_name', { length: 256 }),
    createdAt: timestamp('created_at').defaultNow(),
});

export const umkmLocations = pgTable('umkm_locations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(), 
    masterLocationId: integer('master_location_id').references(() => masterLocations.id).notNull(), 
    namaLapak: varchar('nama_lapak', { length: 256 }).notNull(),
    businessType: varchar('business_type', { length: 100 }), 
    izinStatus: izinStatusEnum('izin_status').notNull().default('Diajukan'),
    dateApplied: timestamp('date_applied').defaultNow(),
    dateExpired: timestamp('date_expired'),
});

export const submissions = pgTable('submissions', {
    id: serial('id').primaryKey(),
    umkmLocationId: integer('umkm_location_id').references(() => umkmLocations.id).notNull(), 
    ktpFileUrl: text('ktp_file_url').notNull(),
    suratLainnyaUrl: text('surat_lainnya_url'),
    description: text('description'),
    dateSubmitted: timestamp('date_submitted').defaultNow(),
});

export const reports = pgTable('reports', {
    id: serial('id').primaryKey(),
    reportType: varchar('report_type', { length: 100 }).notNull(),
    description: text('description'),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    buktiFotoUrl: text('bukti_foto_url'),
    status: reportStatusEnum('status').notNull().default('Belum Diperiksa'),
    adminHandlerId: integer('admin_handler_id').references(() => users.id), 
    dateReported: timestamp('date_reported').defaultNow(),
});

// ========== 🆕 NEW TABLE: NOTIFICATIONS ==========
export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(), // User yang akan terima notifikasi
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    message: text('message').notNull(),
    link: varchar('link', { length: 512 }), // URL untuk redirect (optional)
    isRead: boolean('is_read').notNull().default(false),
    relatedId: integer('related_id'), // ID dari report/submission terkait (optional)
    createdAt: timestamp('created_at').defaultNow(),
});