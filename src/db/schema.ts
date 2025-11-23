// File: src/db/schema.ts

import { pgTable, serial, text, varchar, timestamp, boolean, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

// --- 1. ENUMS ---
// Tipe peran pengguna (Role)
export const userRoleEnum = pgEnum('user_role', ['Admin', 'UMKM']);
// Status izin UMKM
export const izinStatusEnum = pgEnum('izin_status', ['Diajukan', 'Diterima', 'Ditolak']);
// Status Master Lokasi
export const masterStatusEnum = pgEnum('master_status', ['Tersedia', 'Terisi', 'Terlarang']);
// Status Laporan Warga
export const reportStatusEnum = pgEnum('report_status', ['Belum Diperiksa', 'Sedang Diproses', 'Selesai']);

// --- 2. USERS (Akun) ---
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    
    // Informasi Login
    email: varchar('email', { length: 256 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull().default('UMKM'), // Default: UMKM
    isActive: boolean('is_active').notNull().default(true),

    // Data Pribadi (untuk sapaan/profil)
    namaPemilik: varchar('nama_pemilik', { length: 256 }).notNull(),
    nik: varchar('nik', { length: 16 }).unique(),
    phone: varchar('phone', { length: 20 }),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// --- 3. MASTER LOCATIONS (Master Zonasi Admin) ---
export const masterLocations = pgTable('master_locations', {
    id: serial('id').primaryKey(),
    
    // Geospasial
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    
    // Status & Penanda Zonasi
    status: masterStatusEnum('status').notNull().default('Tersedia'),
    reasonRestriction: text('reason_restriction'), // Alasan jika Terlarang
    penandaName: varchar('penanda_name', { length: 256 }), // Nama Penanda Admin

    createdAt: timestamp('created_at').defaultNow(),
});

// --- 4. UMKM LOCATIONS (Lapak yang Diajukan oleh UMKM) ---
export const umkmLocations = pgTable('umkm_locations', {
    id: serial('id').primaryKey(),
    userId: serial('user_id').references(() => users.id).notNull(), // FK ke User Pemilik
    
    // Link ke Master Titik (untuk Pengajuan)
    masterLocationId: serial('master_location_id').references(() => masterLocations.id).notNull(),
    
    // Detail Lapak
    namaLapak: varchar('nama_lapak', { length: 256 }).notNull(),
    izinStatus: izinStatusEnum('izin_status').notNull().default('Diajukan'),
    
    // Tanggal
    dateApplied: timestamp('date_applied').defaultNow(),
    dateExpired: timestamp('date_expired'), 
});

// --- 5. REPORTS (Laporan Warga) ---
export const reports = pgTable('reports', {
    id: serial('id').primaryKey(),
    
    // Detail Laporan
    reportType: varchar('report_type', { length: 100 }).notNull(),
    description: text('description'),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    buktiFotoUrl: text('bukti_foto_url'),

    // Administrasi
    status: reportStatusEnum('status').notNull().default('Belum Diperiksa'),
    adminHandlerId: serial('admin_handler_id').references(() => users.id), // Admin yang menangani
    dateReported: timestamp('date_reported').defaultNow(),
});