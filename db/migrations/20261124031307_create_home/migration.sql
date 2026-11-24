CREATE TABLE "home_clips" (
	"id" serial PRIMARY KEY,
	"device_id" text NOT NULL,
	"trigger" text NOT NULL,
	"detail" text,
	"source_event_id" text UNIQUE,
	"status" text DEFAULT 'recording' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_seconds" integer,
	"video_key" text,
	"thumb_key" text,
	"size_bytes" bigint,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "home_commands" (
	"id" serial PRIMARY KEY,
	"device_id" text NOT NULL,
	"action" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "home_devices" (
	"id" text PRIMARY KEY,
	"provider" text NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"model" text,
	"online" boolean DEFAULT true NOT NULL,
	"battery" integer,
	"capabilities" jsonb DEFAULT '[]' NOT NULL,
	"meta" jsonb DEFAULT '{}' NOT NULL,
	"last_event_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_kv" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "home_clips_device_started_idx" ON "home_clips" ("device_id","started_at");--> statement-breakpoint
CREATE INDEX "home_clips_started_idx" ON "home_clips" ("started_at");--> statement-breakpoint
ALTER TABLE "home_clips" ADD CONSTRAINT "home_clips_device_id_home_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "home_devices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "home_commands" ADD CONSTRAINT "home_commands_device_id_home_devices_id_fkey" FOREIGN KEY ("device_id") REFERENCES "home_devices"("id") ON DELETE CASCADE;