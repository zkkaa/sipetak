// File: src/db/schema.ts (FINAL REVISI)

import { pgTable, serial, integer, text, varchar, timestamp, boolean, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

// --- ENUMS (Sama) ---
export const userRoleEnum = pgEnum('user_role', ['Admin', 'UMKM']);
export const izinStatusEnum = pgEnum('izin_status', ['Diajukan', 'Diterima', 'Ditolak']);
export const masterStatusEnum = pgEnum('master_status', ['Tersedia', 'Terisi', 'Terlarang']);
export const reportStatusEnum = pgEnum('report_status', ['Belum Diperiksa', 'Sedang Diproses', 'Selesai']);

// --- USERS ---
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    // 💡 PERBAIKAN KRITIS: Ganti nama kolom untuk hash
    passwordHash: text('password_hash').notNull(), 
    role: userRoleEnum('role').notNull().default('UMKM'),
    isActive: boolean('is_active').notNull().default(true),

    // Data Pribadi
    nama: varchar('nama', { length: 256 }).notNull(), 
    nik: varchar('nik', { length: 16 }).unique(),
    phone: varchar('phone', { length: 20 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// --- MASTER LOCATIONS (Sama) ---
export const masterLocations = pgTable('master_locations', {
    id: serial('id').primaryKey(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    status: masterStatusEnum('status').notNull().default('Tersedia'),
    reasonRestriction: text('reason_restriction'),
    penandaName: varchar('penanda_name', { length: 256 }),
    createdAt: timestamp('created_at').defaultNow(),
});

// --- UMKM LOCATIONS ---
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

// --- SUBMISSIONS ---
export const submissions = pgTable('submissions', {
    id: serial('id').primaryKey(),
    umkmLocationId: integer('umkm_location_id').references(() => umkmLocations.id).notNull(), 
    ktpFileUrl: text('ktp_file_url').notNull(),
    suratLainnyaUrl: text('surat_lainnya_url'),
    description: text('description'),
    dateSubmitted: timestamp('date_submitted').defaultNow(),
});

// --- REPORTS ---
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