ALTER TABLE "question" ADD COLUMN "reminded_at" timestamp;--> statement-breakpoint
CREATE INDEX "moderation_action_created_at_idx" ON "moderation_action" USING btree ("created_at");