CREATE TABLE "tower_building_sessions" (
	"session_id" text PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"session_name" text DEFAULT 'Building Session' NOT NULL,
	"blocks_data" jsonb NOT NULL,
	"is_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tower_calendar_events" (
	"event_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tower_calendar_events_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"profile_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"quest_id" bigint,
	"quest_title" text,
	"blocks_added" integer DEFAULT 0 NOT NULL,
	"colors_used" jsonb,
	"total_height" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tower_history" (
	"history_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tower_history_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"profile_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"blocks_changed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tower_premium_features" (
	"feature_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tower_premium_features_feature_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"profile_id" uuid NOT NULL,
	"feature_type" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tower_blocks" ADD COLUMN "quest_id" bigint;--> statement-breakpoint
ALTER TABLE "tower_blocks" ADD COLUMN "build_session_id" text;--> statement-breakpoint
ALTER TABLE "tower_blocks" ADD COLUMN "is_confirmed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tower_stats" ADD COLUMN "confirmed_blocks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tower_stats" ADD COLUMN "total_sessions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tower_building_sessions" ADD CONSTRAINT "tower_building_sessions_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tower_calendar_events" ADD CONSTRAINT "tower_calendar_events_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tower_history" ADD CONSTRAINT "tower_history_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tower_premium_features" ADD CONSTRAINT "tower_premium_features_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;