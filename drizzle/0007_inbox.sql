CREATE TABLE "inbox" (
	"id" text PRIMARY KEY NOT NULL,
	"dedup_key" text,
	"from_address" text NOT NULL,
	"token" text,
	"subject" text,
	"dkim_verified" boolean DEFAULT false NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"reason" text,
	"answer_id" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	CONSTRAINT "inbox_dedupKey_unique" UNIQUE("dedup_key")
);
--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_answer_id_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "public"."answer"("id") ON DELETE no action ON UPDATE no action;