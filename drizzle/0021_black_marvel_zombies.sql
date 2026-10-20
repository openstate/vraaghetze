ALTER TABLE "question" ADD COLUMN "reference_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "question_reference_date_idx" ON "question" USING btree ("reference_date");