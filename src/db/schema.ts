import { pgTable, serial, integer, text, varchar, timestamp, boolean, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['Admin', 'UMKM']);
export const izinStatusEnum = pgEnum('izin_status', [
    'Diajukan', 
    'Diterima', 
    'Ditolak', 
    'Pengajuan Penghapusan' 
]);
export const masterStatusEnum = pgEnum('master_status', ['Tersedia', 'Terisi', 'Terlarang']);
export const reportStatusEnum = pgEnum('report_status', ['Belum Diperiksa', 'Sedang Diproses', 'Selesai']);
export const notificationTypeEnum = pgEnum('notification_type', [
    'submission_new',
    'submission_approved',
    'submission_rejected',
    'report_new',
    'report_unhandled',
    'certificate_issued',
    'deletion_requested',   
    'deletion_approved',    
    'deletion_rejected'     
]);
export const deletionStatusEnum = pgEnum('deletion_status', [
    'Pending',
    'Approved', 
    'Rejected'
]);

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

export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    message: text('message').notNull(),
    link: varchar('link', { length: 512 }),
    isRead: boolean('is_read').notNull().default(false),
    relatedId: integer('related_id'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const deletionRequests = pgTable('deletion_requests', {
    id: serial('id').primaryKey(),
    umkmLocationId: integer('umkm_location_id').references(() => umkmLocations.id).notNull(),
    userId: integer('user_id').references(() => users.id).notNull(),
    reason: text('reason').notNull(), 
    status: deletionStatusEnum('status').notNull().default('Pending'),
    requestedAt: timestamp('requested_at').defaultNow(),
    reviewedBy: integer('reviewed_by').references(() => users.id), 
    reviewedAt: timestamp('reviewed_at'),
    rejectionReason: text('rejection_reason'), 
});