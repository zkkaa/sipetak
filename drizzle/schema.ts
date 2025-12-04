import { pgTable, index, foreignKey, pgPolicy, check, serial, integer, text, timestamp, doublePrecision, varchar, unique, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const deletionStatus = pgEnum("deletion_status", ['Pending', 'Approved', 'Rejected'])
export const izinStatus = pgEnum("izin_status", ['Diajukan', 'Diterima', 'Ditolak', 'Pengajuan Penghapusan'])
export const masterStatus = pgEnum("master_status", ['Tersedia', 'Terisi', 'Terlarang'])
export const notificationType = pgEnum("notification_type", ['submission_new', 'submission_approved', 'submission_rejected', 'report_new', 'report_unhandled', 'certificate_issued', 'deletion_requested', 'deletion_approved', 'deletion_rejected'])
export const reportStatus = pgEnum("report_status", ['Belum Diperiksa', 'Sedang Diproses', 'Selesai'])
export const userRole = pgEnum("user_role", ['Admin', 'UMKM'])


export const deletionRequests = pgTable("deletion_requests", {
	id: serial().primaryKey().notNull(),
	umkmLocationId: integer("umkm_location_id").notNull(),
	userId: integer("user_id").notNull(),
	reason: text().notNull(),
	status: deletionStatus().default('Pending').notNull(),
	requestedAt: timestamp("requested_at", { mode: 'string' }).defaultNow(),
	reviewedBy: integer("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
}, (table) => [
	index("idx_deletion_requests_requested_at").using("btree", table.requestedAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_deletion_requests_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_deletion_requests_umkm_location_id").using("btree", table.umkmLocationId.asc().nullsLast().op("int4_ops")),
	index("idx_deletion_requests_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "deletion_requests_reviewed_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.umkmLocationId],
			foreignColumns: [umkmLocations.id],
			name: "deletion_requests_umkm_location_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "deletion_requests_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("Admin can update deletion requests", { as: "permissive", for: "update", to: ["public"], using: sql`(EXISTS ( SELECT 1
   FROM users
  WHERE (((users.id)::text = (auth.uid())::text) AND (users.role = 'Admin'::user_role))))` }),
	pgPolicy("Admin can view all deletion requests", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("UMKM can create deletion requests", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("UMKM can view own deletion requests", { as: "permissive", for: "select", to: ["public"] }),
	check("check_reason_length", sql`char_length(reason) >= 30`),
]);

export const masterLocations = pgTable("master_locations", {
	id: serial().primaryKey().notNull(),
	latitude: doublePrecision().notNull(),
	longitude: doublePrecision().notNull(),
	status: masterStatus().default('Tersedia').notNull(),
	reasonRestriction: text("reason_restriction"),
	penandaName: varchar("penanda_name", { length: 256 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const reports = pgTable("reports", {
	id: serial().primaryKey().notNull(),
	reportType: varchar("report_type", { length: 100 }).notNull(),
	description: text(),
	latitude: doublePrecision().notNull(),
	longitude: doublePrecision().notNull(),
	buktiFotoUrl: text("bukti_foto_url"),
	status: reportStatus().default('Belum Diperiksa').notNull(),
	adminHandlerId: integer("admin_handler_id"),
	dateReported: timestamp("date_reported", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.adminHandlerId],
			foreignColumns: [users.id],
			name: "reports_admin_handler_id_users_id_fk"
		}),
]);

export const umkmLocations = pgTable("umkm_locations", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	masterLocationId: integer("master_location_id").notNull(),
	namaLapak: varchar("nama_lapak", { length: 256 }).notNull(),
	businessType: varchar("business_type", { length: 100 }),
	izinStatus: izinStatus("izin_status").default('Diajukan').notNull(),
	dateApplied: timestamp("date_applied", { mode: 'string' }).defaultNow(),
	dateExpired: timestamp("date_expired", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.masterLocationId],
			foreignColumns: [masterLocations.id],
			name: "umkm_locations_master_location_id_master_locations_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "umkm_locations_user_id_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 256 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	role: userRole().default('UMKM').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	nama: varchar({ length: 256 }).notNull(),
	nik: varchar({ length: 16 }),
	phone: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_nik_unique").on(table.nik),
]);

export const submissions = pgTable("submissions", {
	id: serial().primaryKey().notNull(),
	umkmLocationId: integer("umkm_location_id").notNull(),
	ktpFileUrl: text("ktp_file_url").notNull(),
	suratLainnyaUrl: text("surat_lainnya_url"),
	description: text(),
	dateSubmitted: timestamp("date_submitted", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.umkmLocationId],
			foreignColumns: [umkmLocations.id],
			name: "submissions_umkm_location_id_umkm_locations_id_fk"
		}),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: notificationType().notNull(),
	title: varchar({ length: 256 }).notNull(),
	message: text().notNull(),
	link: varchar({ length: 512 }),
	isRead: boolean("is_read").default(false).notNull(),
	relatedId: integer("related_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);
