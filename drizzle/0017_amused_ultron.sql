ALTER TABLE "inbox" DROP CONSTRAINT "inbox_question_id_question_id_fk";
--> statement-breakpoint
ALTER TABLE "inbox" DROP COLUMN "question_id";