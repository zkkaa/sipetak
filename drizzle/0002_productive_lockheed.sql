CREATE TYPE "public"."notification_type" AS ENUM('submission_new', 'submission_approved', 'submission_rejected', 'report_new', 'report_unhandled', 'certificate_issued');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(256) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(512),
	"is_read" boolean DEFAULT false NOT NULL,
	"related_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;