-- added by hand: drizzle-kit does not manage extensions, and search's `<%` operator needs it
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
ALTER TABLE "answer" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('dutch', "body"), 'B')) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('dutch', "title"), 'A') || setweight(to_tsvector('dutch', "body"), 'C')) STORED NOT NULL;--> statement-breakpoint
CREATE INDEX "answer_search_idx" ON "answer" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "answer_question_id_idx" ON "answer" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "question_search_idx" ON "question" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "question_created_at_idx" ON "question" USING btree ("created_at");