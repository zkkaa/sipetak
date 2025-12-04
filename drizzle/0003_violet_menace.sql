CREATE TYPE "public"."deletion_status" AS ENUM('Pending', 'Approved', 'Rejected');--> statement-breakpoint
ALTER TYPE "public"."izin_status" ADD VALUE 'Pengajuan Penghapusan';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'deletion_requested';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'deletion_approved';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'deletion_rejected';--> statement-breakpoint
CREATE TABLE "deletion_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"umkm_location_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reason" text NOT NULL,
	"status" "deletion_status" DEFAULT 'Pending' NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"rejection_reason" text
);
--> statement-breakpoint
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_umkm_location_id_umkm_locations_id_fk" FOREIGN KEY ("umkm_location_id") REFERENCES "public"."umkm_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deletion_requests" ADD CONSTRAINT "deletion_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;