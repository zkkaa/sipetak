ALTER TABLE "users" RENAME COLUMN "nama_pemilik" TO "nama";--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "admin_handler_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "admin_handler_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "umkm_location_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "umkm_locations" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "umkm_locations" ALTER COLUMN "master_location_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "umkm_locations" ADD COLUMN "business_type" varchar(100);