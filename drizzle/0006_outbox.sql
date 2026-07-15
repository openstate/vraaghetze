CREATE TABLE "outbox" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"question_id" text,
	"recipient" text NOT NULL,
	"reply_to" text,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"expires_at" timestamp,
	"next_attempt_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "email_token" text;--> statement-breakpoint
ALTER TABLE "outbox" ADD CONSTRAINT "outbox_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "outbox_sweep_idx" ON "outbox" USING btree ("status","next_attempt_at");--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_emailToken_unique" UNIQUE("email_token");