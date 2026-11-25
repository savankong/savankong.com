CREATE TABLE "home_integrations" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'starting' NOT NULL,
	"note" text,
	"device_count" integer DEFAULT 0 NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
