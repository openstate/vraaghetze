CREATE TABLE "question_follow" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_follow_question_user_key" UNIQUE("question_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "question_follow" ADD CONSTRAINT "question_follow_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_follow" ADD CONSTRAINT "question_follow_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "question_follow_user_id_idx" ON "question_follow" USING btree ("user_id");