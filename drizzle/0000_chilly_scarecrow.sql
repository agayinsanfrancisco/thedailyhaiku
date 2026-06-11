CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#6366f1',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" integer NOT NULL,
	"day" integer NOT NULL,
	"year" integer,
	"title" text NOT NULL,
	"description" text,
	"category_id" integer,
	"source" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "haikus" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"year" integer NOT NULL,
	"line1" text NOT NULL,
	"line2" text NOT NULL,
	"line3" text NOT NULL,
	"title" text,
	"category_id" integer,
	"event_id" integer,
	"is_filler" text DEFAULT 'false',
	"validation_link" text,
	"event_headline" text,
	"event_description" text,
	"event_sources" text,
	"season_word" text,
	"season_color" text,
	"manage_token_hash" text,
	"author_name" text,
	"author_email" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"daily_word" boolean DEFAULT true,
	"unsubscribed_at" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haikus" ADD CONSTRAINT "haikus_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "haikus" ADD CONSTRAINT "haikus_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_month_day_title_unique" ON "events" USING btree ("month","day","title");