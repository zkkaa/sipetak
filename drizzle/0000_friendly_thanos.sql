CREATE TYPE "public"."izin_status" AS ENUM('Diajukan', 'Diterima', 'Ditolak');--> statement-breakpoint
CREATE TYPE "public"."master_status" AS ENUM('Tersedia', 'Terisi', 'Terlarang');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('Belum Diperiksa', 'Sedang Diproses', 'Selesai');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Admin', 'UMKM');--> statement-breakpoint
CREATE TABLE "master_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"status" "master_status" DEFAULT 'Tersedia' NOT NULL,
	"reason_restriction" text,
	"penanda_name" varchar(256),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" varchar(100) NOT NULL,
	"description" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"bukti_foto_url" text,
	"status" "report_status" DEFAULT 'Belum Diperiksa' NOT NULL,
	"admin_handler_id" serial NOT NULL,
	"date_reported" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"umkm_location_id" serial NOT NULL,
	"ktp_file_url" text NOT NULL,
	"surat_lainnya_url" text,
	"description" text,
	"date_submitted" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "umkm_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"master_location_id" serial NOT NULL,
	"nama_lapak" varchar(256) NOT NULL,
	"izin_status" "izin_status" DEFAULT 'Diajukan' NOT NULL,
	"date_applied" timestamp DEFAULT now(),
	"date_expired" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'UMKM' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"nama_pemilik" varchar(256) NOT NULL,
	"nik" varchar(16),
	"phone" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_admin_handler_id_users_id_fk" FOREIGN KEY ("admin_handler_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_umkm_location_id_umkm_locations_id_fk" FOREIGN KEY ("umkm_location_id") REFERENCES "public"."umkm_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_locations" ADD CONSTRAINT "umkm_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "umkm_locations" ADD CONSTRAINT "umkm_locations_master_location_id_master_locations_id_fk" FOREIGN KEY ("master_location_id") REFERENCES "public"."master_locations"("id") ON DELETE no action ON UPDATE no action;